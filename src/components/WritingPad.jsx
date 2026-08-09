import { useEffect, useRef, useState } from 'react'
import { Check, Eye, EyeOff, RotateCcw, Sparkles } from 'lucide-react'
import { normalizePoint, sampleSvgPath, traceMatchesStroke } from '../lib/stroke'
import { loadStrokePaths } from '../lib/strokeData'

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
  const [startPoint, setStartPoint] = useState(null)
  const [dataMode, setDataMode] = useState('loading')
  const [loadedCharacter, setLoadedCharacter] = useState(null)
  const [demoIndex, setDemoIndex] = useState(-1)

  const isComplete = dataMode === 'guided' && loadedCharacter === kana.character && paths.length > 0 && strokeIndex >= paths.length
  const isPlaying = demoIndex >= 0 && demoIndex < paths.length
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
    setDemoIndex(-1)
    setMessage('正在准备笔顺…')

    loadStrokePaths(kana.character)
      .then((nextPaths) => {
        if (cancelled) return
        if (!nextPaths?.length) throw new Error('stroke paths missing')
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
  }, [currentPath])

  const pointerPoint = (event) => {
    const rect = boardRef.current.getBoundingClientRect()
    return normalizePoint({ x: event.clientX, y: event.clientY }, rect)
  }

  const handlePointerDown = (event) => {
    if (loading || isComplete || isPlaying) return
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
    setDemoIndex(-1)
    setMessage(dataMode === 'free' ? '笔顺数据暂不可用，可自由临摹' : '从红点起笔，沿虚线书写')
  }

  const togglePlayback = () => {
    if (isPlaying) {
      setDemoIndex(-1)
      setMessage('笔顺演示已停止')
      return
    }
    if (dataMode !== 'guided' || !paths.length) return
    setShowHint(true)
    setDemoIndex(0)
    setMessage(`正在演示第 1 / ${paths.length} 笔`)
  }

  const advancePlayback = () => {
    const nextIndex = demoIndex + 1
    if (nextIndex >= paths.length) {
      setDemoIndex(paths.length)
      setMessage('笔顺演示完成，可以开始临摹')
      return
    }
    setDemoIndex(nextIndex)
    setMessage(`正在演示第 ${nextIndex + 1} / ${paths.length} 笔`)
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
        className={`practice-board ${isComplete ? 'complete' : ''} ${isPlaying ? 'playing' : ''}`}
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
                key={`${kana.character}-${index}`}
                ref={index === strokeIndex ? activePathRef : undefined}
                d={path}
                className={index < strokeIndex ? 'reference-stroke done' : index === strokeIndex ? 'reference-stroke active' : 'reference-stroke pending'}
                style={index === strokeIndex ? { opacity: showHint ? 1 : 0 } : undefined}
              />
            ))}
          </g>
          {demoIndex >= 0 && (
            <g transform="scale(.91743)" className="demo-layer">
              {paths.map((path, index) => {
                if (index > demoIndex) return null
                const playing = index === demoIndex && isPlaying
                return (
                  <path
                    key={`demo-${kana.character}-${index}-${demoIndex}`}
                    data-testid={`demo-stroke-${index}`}
                    d={path}
                    pathLength="1"
                    className={`demo-stroke ${playing ? 'playing' : 'done'}`}
                    onAnimationEnd={playing ? advancePlayback : undefined}
                  />
                )
              })}
            </g>
          )}
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
        <button onClick={() => setShowHint((value) => !value)} disabled={dataMode !== 'guided' || isPlaying}>
          {showHint ? <EyeOff size={17} /> : <Eye size={17} />}
          {showHint ? '隐藏提示' : '显示提示'}
        </button>
        <button onClick={togglePlayback} disabled={dataMode !== 'guided'} aria-label={isPlaying ? '停止播放' : '逐笔播放'}>
          <Sparkles size={17} /> {isPlaying ? '停止播放' : '逐笔播放'}
        </button>
        <button
          onClick={confirmStrokeByKeyboard}
          disabled={dataMode !== 'guided' || isComplete || isPlaying}
          aria-label={`确认第 ${Math.min(strokeIndex + 1, paths.length || 1)} 笔`}
        >
          <Check size={17} /> 逐笔确认
        </button>
        <button onClick={reset}>
          <RotateCcw size={17} /> 重写
        </button>
      </div>
      <p className="data-credit">
        笔顺数据由 <a href="/third-party/kanjivg/NOTICE.txt">KanjiVG</a> 提供 · CC BY-SA 3.0
      </p>
    </section>
  )
}
