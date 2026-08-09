import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { extractStrokePaths, validateStrokeDataset } from '../../scripts/update-kana-strokes.mjs'
import { ALL_KANA } from './kana'

describe('KanjiVG stroke dataset generation', () => {
  it('extracts ordered stroke paths from a 109 × 109 KanjiVG SVG', () => {
    const svg = `
      <svg viewBox="0 0 109 109">
        <path id="kvg:03042-s2" d="M20 10 L30 90" />
        <path id="kvg:03042-s1" d="M10 20 L90 30" />
        <path id="kvg:03042-g1" d="M0 0" />
      </svg>
    `

    expect(extractStrokePaths(svg, 'あ')).toEqual([
      'M10 20 L90 30',
      'M20 10 L30 90',
    ])
  })

  it('rejects malformed coordinates or discontinuous stroke ids', () => {
    expect(() => extractStrokePaths(
      '<svg viewBox="0 0 100 100"><path id="x-s1" d="M0 0" /></svg>',
      'あ',
    )).toThrow(/viewBox/)

    expect(() => extractStrokePaths(
      '<svg viewBox="0 0 109 109"><path id="x-s2" d="M0 0" /></svg>',
      'あ',
    )).toThrow(/stroke sequence/)
  })

  it('validates the exact character set and metadata totals', () => {
    const dataset = {
      _meta: { characterCount: 2, strokeCount: 3, viewBox: [0, 0, 109, 109] },
      characters: {
        あ: ['M10 20 L90 30'],
        ア: ['M10 20', 'M20 30'],
      },
    }

    expect(() => validateStrokeDataset(dataset, ['あ', 'ア'])).not.toThrow()
    expect(() => validateStrokeDataset(dataset, ['あ', 'い'])).toThrow(/character set/)
  })

  it('ships paths for every basic, voiced, small, hiragana, and katakana character', async () => {
    const datasetPath = resolve('public/stroke-data/kanjivg-kana-paths.json')
    const dataset = JSON.parse(await readFile(datasetPath, 'utf8'))
    const characters = ALL_KANA.map(({ character }) => character)

    expect(() => validateStrokeDataset(dataset, characters)).not.toThrow()
    expect(dataset._meta).toMatchObject({ characterCount: 162, strokeCount: 466 })
    for (const representative of ['あ', 'ア', 'が', 'ガ', 'ゃ', 'ャ']) {
      expect(dataset.characters[representative]?.length).toBeGreaterThan(0)
    }
  })
})
