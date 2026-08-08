import { Check, Headphones, Volume2 } from 'lucide-react'

export default function StudyCard({ kana, isLearned, onToggleLearned, onSpeak, speechStatus }) {
  return (
    <section className="study-card panel" aria-labelledby="study-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">TODAY'S SOUND</p>
          <h2 id="study-title">听音记忆</h2>
        </div>
        <div className="lesson-number">{kana.rowLabel}</div>
      </div>

      <div className="focus-character-wrap">
        <span className="corner-mark top-left" />
        <span className="corner-mark top-right" />
        <span className="corner-mark bottom-left" />
        <span className="corner-mark bottom-right" />
        <div className="focus-character" data-testid="focus-character">{kana.character}</div>
      </div>

      <div className="reading-block">
        <p className="romaji-reading">{kana.romaji.toUpperCase()}</p>
        <p className="reading-note">
          对应{kana.script === 'hiragana' ? '片假名' : '平假名'} <strong>{kana.pair}</strong>
        </p>
      </div>

      <button className="listen-button" onClick={onSpeak} aria-label={`播放 ${kana.character} 的发音`}>
        <span className="listen-icon"><Volume2 size={22} fill="currentColor" /></span>
        <span>
          <strong>播放发音</strong>
          <small>{speechStatus || '日语标准读音'}</small>
        </span>
        <Headphones size={20} />
      </button>

      <button
        className={`learned-button ${isLearned ? 'active' : ''}`}
        onClick={onToggleLearned}
        aria-label={isLearned ? '取消已掌握' : '标记为已掌握'}
      >
        <span className="check-ring"><Check size={15} strokeWidth={3} /></span>
        {isLearned ? '已掌握这个字符' : '标记为已掌握'}
      </button>
    </section>
  )
}
