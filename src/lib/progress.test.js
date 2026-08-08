import { describe, expect, it } from 'vitest'
import { createDefaultProgress, loadProgress, progressPercent, saveProgress } from './progress'

describe('learning progress', () => {
  it('calculates completion without double-counting', () => {
    expect(progressPercent(['あ', 'い', 'あ'], 46)).toBe(4)
  })

  it('falls back safely when stored JSON is invalid', () => {
    localStorage.setItem('kana-mori-progress', '{bad')
    expect(loadProgress()).toEqual(createDefaultProgress())
  })

  it('round-trips learned and practiced characters', () => {
    const value = { ...createDefaultProgress(), learned: ['あ'], practiced: ['ア'] }
    saveProgress(value)
    expect(loadProgress()).toEqual(value)
  })

  it('sanitizes invalid enums, selections, and unknown characters', () => {
    localStorage.setItem('kana-mori-progress', JSON.stringify({
      learned: ['あ', 'X'],
      practiced: ['ア', '坏'],
      theme: 'neon',
      script: 'emoji',
      category: 'all',
      selected: 'X',
    }))

    expect(loadProgress()).toEqual({
      ...createDefaultProgress(),
      learned: ['あ'],
      practiced: ['ア'],
    })
  })
})
