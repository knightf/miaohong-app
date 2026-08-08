import { ALL_KANA, getScriptCharacters } from '../data/kana'

export const STORAGE_KEY = 'kana-mori-progress'
const validCharacters = new Set(ALL_KANA.map((item) => item.character))

export function createDefaultProgress() {
  return {
    learned: [],
    practiced: [],
    theme: 'light',
    script: 'hiragana',
    category: 'basic',
    selected: 'あ',
  }
}

export function loadProgress() {
  if (typeof localStorage === 'undefined') return createDefaultProgress()
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (!parsed || !Array.isArray(parsed.learned) || !Array.isArray(parsed.practiced)) {
      return createDefaultProgress()
    }
    const defaults = createDefaultProgress()
    const script = ['hiragana', 'katakana'].includes(parsed.script) ? parsed.script : defaults.script
    const category = ['basic', 'voiced', 'small'].includes(parsed.category) ? parsed.category : defaults.category
    const theme = ['light', 'dark'].includes(parsed.theme) ? parsed.theme : defaults.theme
    const validSelection = ALL_KANA.some((item) => (
      item.character === parsed.selected && item.script === script && item.category === category
    ))

    return {
      learned: [...new Set(parsed.learned.filter((character) => validCharacters.has(character)))],
      practiced: [...new Set(parsed.practiced.filter((character) => validCharacters.has(character)))],
      theme,
      script,
      category,
      selected: validSelection ? parsed.selected : getScriptCharacters(script, category)[0].character,
    }
  } catch {
    return createDefaultProgress()
  }
}

export function saveProgress(progress) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  }
}

export function progressPercent(learned, total) {
  if (!total) return 0
  return Math.round((new Set(learned).size / total) * 100)
}
