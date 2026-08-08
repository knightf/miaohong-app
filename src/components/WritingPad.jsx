import { useEffect, useRef, useState } from 'react'
import { Check, Eye, EyeOff, RotateCcw, Sparkles } from 'lucide-react'
import { kanjiVgUrl, normalizePoint, sampleSvgPath, traceMatchesStroke } from '../lib/stroke'

export default function WritingPad({ kana, onComplete }) {
  const boardRef = useRef(null)
  const activePathRef = useRef(null)
  const [paths, setPaths] = useState([])
  const [strokeIndex, setStrokeIndex] = useState(0)
  const [finishedTraces, setFinishedTraces] = useState([])
  const [currentTrace, setCurrentTrace] = useState([])
  const [drawing, setDrawing] = useState(false)
  const [showHint, setShowHint] = useState(true)
  const [message, setMessage] = useState('从红点起笔，沿虚线书写')
  const [loading, setLoading] = useState(true)
  const [animationKey, setAnimationKey] = useState(0)
  const [startPoint, setStartPoint] = useState(null)
  const [dataMode, setDataMode] = useState('loading')
  const [loadedCharacter, setLoadedCharacter] = useState(null)

  const isComplete = dataMode === 'guided' && loadedCharacter === kana.character && paths.length > 0 && strokeIndex >= paths.length
  const currentPath = paths[strokeIndex]

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setPaths([])
    setStrokeIndex(0)
    setFinishedTraces([])
    setCurrentTrace([])
    setDataMode('loading')
    setLoadedCharacter(null)
    setMessage('正在准备笔顺…')

    if (typeof fetch !== 'function') {
      setDataMode('free')
      setLoadedCharacter(kana.character)
      setMessage('笔顺数据暂不可用，可自由临摹')
      setLoading(false)
      return () => { cancelled = true }
    }

    fetch(kanjiVgUrl(kana.character))
      .then((response) => {
        if (!response.ok) throw new Error('stroke data unavailable')
        return response.text()
      })
      .then((svgText) => {
        if (cancelled) return
        const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml')
        const nextPaths = [...doc.querySelectorAll('path')]
          .filter((path) => /-s\d+$/.test(path.id))
          .map((path) => path.getAttribute('d'))
        if (!nextPaths.length) throw new Error('stroke paths missing')
        setPaths(nextPaths)
        setDataMode('guided')
        setLoadedCharacter(kana.character)
        setMessage('从红点起笔，沿虚线书写')
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setPaths([])
        setDataMode('free')
        setLoadedCharacter(kana.character)
        setMessage('笔顺数据暂不可用，可自由临摹')
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [kana.character])

  useEffect(() => {
    if (!isComplete) return
    setMessage('完成！笔画顺序正确')
    onComplete(loadedCharacter)
  }, [isComplete, loadedCharacter, onComplete])

  useEffect(() => {
    if (!activePathRef.current || !currentPath) {
      setStartPoint(null)
      return
    }
    try {
      const point = activePathRef.current.getPointAtLength(0)
      setStartPoint({ x: (point.x / 109) * 100, y: (point.y / 109) * 100 })
    } catch {
      setStartPoint(null)
    }
  }, [currentPath, animationKey])

  const pointerPoint = (event) => {
    const rect = boardRef.current.getBoundingClientRect()
    return normalizePoint({ x: event.clientX, y: event.clientY }, rect)
  }

  const handlePointerDown = (event) => {
    if (loading || isComplete) return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    setDrawing(true)
    setCurrentTrace([pointerPoint(event)])
    setMessage(`第 ${strokeIndex + 1} 笔 · 请按提示方向书写`)
  }

  const handlePointerMove = (event) => {
    if (!drawing) return
    const point = pointerPoint(event)
    setCurrentTrace((trace) => [...trace, point])
  }

  const finishStroke = () => {
    if (!drawing) return
    setDrawing(false)
    if (dataMode === 'free') {
      if (currentTrace.length > 3) setFinishedTraces((traces) => [...traces, currentTrace])
      setCurrentTrace([])
      setMessage('自由临摹不会计入笔顺进度')
      return
    }

    let accepted = currentTrace.length > 3
    try {
      if (activePathRef.current) {
        accepted = traceMatchesStroke(currentTrace, sampleSvgPath(activePathRef.current), 22)
      }
    } catch {
      accepted = currentTrace.length > 3
    }

    if (accepted) {
      setFinishedTraces((traces) => [...traces, currentTrace])
      setStrokeIndex((index) => index + 1)
      setMessage(strokeIndex + 1 >= paths.length ? '完成！笔画顺序正确' : '很好，继续下一笔')
    } else {
      setMessage('再试一次：注意起笔位置和方向')
    }
    setCurrentTrace([])
  }

  const reset = () => {
    setStrokeIndex(0)
    setFinishedTraces([])
    setCurrentTrace([])
    setMessage(dataMode === 'free' ? '笔顺数据暂不可用，可自由临摹' : '从红点起笔，沿虚线书写')
    setAnimationKey((key) => key + 1)
  }

  const confirmStrokeByKeyboard = () => {
    if (dataMode !== 'guided' || isComplete) return
    setStrokeIndex((index) => index + 1)
    setMessage(strokeIndex + 1 >= paths.length ? '完成！已按顺序确认全部笔画' : '已确认，继续下一笔')
  }

  const traceToPoints = (trace) => trace.map((point) => `${point.x},${point.y}`).join(' ')

  return (
    <section className="writing-panel panel" aria-labelledby="writing-title">
      <div className="panel-heading writing-heading">
        <div>
          <p className="eyebrow">STROKE PRACTICE</p>
          <h2 id="writing-title">笔顺练习</h2>
        </div>
        <div className="stroke-counter" aria-live="polite">
          <strong>{dataMode === 'free' ? '—' : Math.min(strokeIndex + 1, paths.length || 1)}</strong>
          <span>{dataMode === 'free' ? '自由临摹' : `/ ${paths.length || '—'} 笔`}</span>
        </div>
      </div>

      <div
        className={`practice-board ${isComplete ? 'complete' : ''}`}
        ref={boardRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishStroke}
        onPointerCancel={finishStroke}
        role="group"
        aria-label={`${kana.character} 的田字格书写区`}
        aria-describedby="writing-instruction"
      >
        <span className="grid-line vertical" />
        <span className="grid-line horizontal" />
        <span className="grid-line diagonal one" />
        <span className="grid-line diagonal two" />
        <svg viewBox="0 0 100 100" className="stroke-svg" aria-hidden="true">
          <g transform="scale(.91743)">
            {paths.map((path, index) => (
              <path
                key={`${kana.character}-${index}-${index === strokeIndex ? animationKey : 0}`}
                ref={index === strokeIndex ? activePathRef : undefined}
                d={path}
                className={index < strokeIndex ? 'reference-stroke done' : index === strokeIndex ? 'reference-stroke active' : 'reference-stroke pending'}
                style={index === strokeIndex ? { opacity: showHint ? 1 : 0 } : undefined}
              />
            ))}
          </g>
          {dataMode === 'free' && <text x="50" y="70" textAnchor="middle" className="fallback-glyph">{kana.character}</text>}
          {finishedTraces.map((trace, index) => (
            <polyline key={index} points={traceToPoints(trace)} className="user-stroke finished" />
          ))}
          {currentTrace.length > 1 && <polyline points={traceToPoints(currentTrace)} className="user-stroke" />}
          {showHint && startPoint && !isComplete && <circle cx={startPoint.x} cy={startPoint.y} r="2.4" className="start-dot" />}
        </svg>
        {loading && <div className="board-loading">笔顺载入中…</div>}
        {isComplete && (
          <div className="completion-badge">
            <Sparkles size={22} />
            <strong>书写完成</strong>
          </div>
        )}
      </div>

      <div id="writing-instruction" className={`writing-feedback ${isComplete ? 'success' : ''}`} aria-live="polite">
        <span className="feedback-number">{isComplete ? '✓' : strokeIndex + 1}</span>
        <span>{message}</span>
      </div>

      <div className="writing-actions">
        <button onClick={() => setShowHint((value) => !value)} disabled={dataMode !== 'guided'}>
          {showHint ? <EyeOff size={17} /> : <Eye size={17} />}
          {showHint ? '隐藏提示' : '显示提示'}
        </button>
        <button onClick={() => setAnimationKey((key) => key + 1)} disabled={dataMode !== 'guided'}>
          <Sparkles size={17} /> 演示本笔
        </button>
        <button
          onClick={confirmStrokeByKeyboard}
          disabled={dataMode !== 'guided' || isComplete}
          aria-label={`确认第 ${Math.min(strokeIndex + 1, paths.length || 1)} 笔`}
        >
          <Check size={17} /> 逐笔确认
        </button>
        <button onClick={reset}>
          <RotateCcw size={17} /> 重写
        </button>
      </div>
      <p className="data-credit">笔顺数据由 KanjiVG 提供 · CC BY-SA 3.0</p>
    </section>
  )
}
