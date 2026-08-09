import { useCallback, useEffect, useMemo, useState } from 'react'
import { BookOpen, Flame, Moon, Sun } from 'lucide-react'
import CharacterBrowser from './components/CharacterBrowser'
import PwaControls from './components/PwaControls'
import StudyCard from './components/StudyCard'
import WritingPad from './components/WritingPad'
import { ALL_KANA, findKana, getScriptCharacters } from './data/kana'
import { loadProgress, saveProgress } from './lib/progress'

export default function App() {
  const [progress, setProgress] = useState(loadProgress)
  const [speechStatus, setSpeechStatus] = useState('')

  const selectedKana = useMemo(() => {
    const selected = findKana(progress.selected)
    return selected || getScriptCharacters(progress.script, progress.category)[0]
  }, [progress.selected, progress.script, progress.category])

  const learnedCount = new Set(progress.learned).size
  const visibleCount = getScriptCharacters(progress.script, progress.category).length
  const visibleLearned = progress.learned.filter((character) => {
    const item = findKana(character)
    return item?.script === progress.script && item?.category === progress.category
  }).length

  useEffect(() => {
    saveProgress(progress)
    document.documentElement.dataset.theme = progress.theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content',
      progress.theme === 'dark' ? '#171816' : '#f3efe7',
    )
  }, [progress])

  const update = (partial) => setProgress((current) => ({ ...current, ...partial }))

  const switchScript = (script) => {
    if (script === progress.script) return
    const pair = selectedKana.pair
    update({ script, selected: pair })
  }

  const switchCategory = (category) => {
    const first = getScriptCharacters(progress.script, category)[0]
    update({ category, selected: first.character })
  }

  const toggleLearned = () => {
    const exists = progress.learned.includes(selectedKana.character)
    update({
      learned: exists
        ? progress.learned.filter((character) => character !== selectedKana.character)
        : [...progress.learned, selectedKana.character],
    })
  }

  const markPracticed = useCallback((character) => {
    setProgress((current) => current.practiced.includes(character)
      ? current
      : { ...current, practiced: [...current.practiced, character] })
  }, [])

  const speak = () => {
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      setSpeechStatus('当前浏览器暂不支持语音')
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(selectedKana.character)
    utterance.lang = 'ja-JP'
    utterance.rate = 0.72
    const japaneseVoice = window.speechSynthesis.getVoices().find((voice) => voice.lang.startsWith('ja'))
    if (japaneseVoice) utterance.voice = japaneseVoice
    utterance.onstart = () => setSpeechStatus('正在播放…')
    utterance.onend = () => setSpeechStatus('日语标准读音')
    utterance.onerror = () => setSpeechStatus('播放失败，请重试')
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a href="#main" className="brand" aria-label="Kana Mori 首页">
          <span className="brand-seal">かな</span>
          <span>
            <strong>KANA MORI</strong>
            <small>日文字符练习帖</small>
          </span>
        </a>

        <div className="header-progress" aria-label={`总学习进度 已掌握 ${learnedCount} / ${ALL_KANA.length}`}>
          <div className="progress-copy">
            <span><Flame size={14} fill="currentColor" /> 已掌握</span>
            <strong>{learnedCount} / {ALL_KANA.length}</strong>
          </div>
        </div>

        <nav className="header-actions" aria-label="页面设置">
          <div className="script-switcher">
            <button className={progress.script === 'hiragana' ? 'active' : ''} onClick={() => switchScript('hiragana')} aria-label="平假名">平</button>
            <button className={progress.script === 'katakana' ? 'active' : ''} onClick={() => switchScript('katakana')} aria-label="片假名">片</button>
          </div>
          <PwaControls />
          <button
            className="icon-button"
            onClick={() => update({ theme: progress.theme === 'light' ? 'dark' : 'light' })}
            aria-label={progress.theme === 'light' ? '切换到暗色模式' : '切换到亮色模式'}
          >
            {progress.theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
          </button>
        </nav>
      </header>

      <main id="main">
        <div className="intro-row">
          <div>
            <p className="eyebrow"><BookOpen size={14} /> GOJŪON STUDY DESK</p>
            <h1>{progress.script === 'hiragana' ? '平假名' : '片假名'}，<em>读写一起记。</em></h1>
          </div>
          <p className="intro-note">先听清声音，再顺着笔势写下来。每天十分钟，让手和耳朵一起形成记忆。</p>
        </div>

        <div className="mobile-script-tabs" role="tablist" aria-label="假名类型">
          <button className={progress.script === 'hiragana' ? 'active' : ''} onClick={() => switchScript('hiragana')}>平假名 <span>HIRAGANA</span></button>
          <button className={progress.script === 'katakana' ? 'active' : ''} onClick={() => switchScript('katakana')}>片假名 <span>KATAKANA</span></button>
        </div>

        <div className="learning-layout">
          <CharacterBrowser
            script={progress.script}
            category={progress.category}
            selected={selectedKana.character}
            learned={progress.learned}
            practiced={progress.practiced}
            onCategoryChange={switchCategory}
            onSelect={(selected) => update({ selected })}
          />
          <StudyCard
            kana={selectedKana}
            isLearned={progress.learned.includes(selectedKana.character)}
            onToggleLearned={toggleLearned}
            onSpeak={speak}
            speechStatus={speechStatus}
          />
          <WritingPad kana={selectedKana} onComplete={markPracticed} />
        </div>

        <footer className="study-footer">
          <span>本组已掌握</span>
          <strong>{visibleLearned} / {visibleCount}</strong>
          <span className="footer-encouragement">今日也一步一步来。</span>
        </footer>
      </main>
    </div>
  )
}
