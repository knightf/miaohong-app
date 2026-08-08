export const STORAGE_KEY = 'kana-mori-progress'

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
    return { ...createDefaultProgress(), ...parsed }
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

