import { Check, PenLine } from 'lucide-react'
import { getRows } from '../data/kana'

const CATEGORY_LABELS = {
  basic: ['清音', '46'],
  voiced: ['浊音', '25'],
  small: ['小字', '10'],
}

export default function CharacterBrowser({
  script,
  category,
  selected,
  learned,
  practiced,
  onCategoryChange,
  onSelect,
}) {
  const rows = getRows(script, category)

  return (
    <section className="browser-panel panel" aria-labelledby="browser-title">
      <div className="panel-heading browser-heading">
        <div>
          <p className="eyebrow">CHARACTER INDEX</p>
          <h2 id="browser-title">字符表</h2>
        </div>
        <span className="character-total">81 音</span>
      </div>

      <div className="category-tabs" role="tablist" aria-label="字符类别">
        {Object.entries(CATEGORY_LABELS).map(([key, [label, count]]) => (
          <button
            key={key}
            className={category === key ? 'category-tab active' : 'category-tab'}
            onClick={() => onCategoryChange(key)}
            role="tab"
            aria-selected={category === key}
          >
            {label}<span>{count}</span>
          </button>
        ))}
      </div>

      <div className="kana-rows">
        {rows.map((row) => (
          <div className="kana-row" key={row.id}>
            <p className="row-label">{row.label}</p>
            <div className="character-grid">
              {row.characters.map((item) => {
                const isLearned = learned.includes(item.character)
                const isPracticed = practiced.includes(item.character)
                return (
                  <button
                    key={item.character}
                    className={`character-button ${selected === item.character ? 'selected' : ''}`}
                    onClick={() => onSelect(item.character)}
                    aria-label={`选择 ${item.character} ${item.romaji}`}
                    aria-current={selected === item.character ? 'true' : undefined}
                  >
                    <span className="kana-glyph">{item.character}</span>
                    <span className="kana-romaji">{item.romaji}</span>
                    {(isLearned || isPracticed) && (
                      <span className="status-dot" aria-hidden="true">
                        {isLearned ? <Check size={9} strokeWidth={3} /> : <PenLine size={8} />}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
