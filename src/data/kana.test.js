import { describe, expect, it } from 'vitest'
import { BASIC_KANA, KANA_GROUPS, findKana, getScriptCharacters } from './kana'

describe('kana inventory', () => {
  it('contains the 46 basic characters for each script', () => {
    expect(getScriptCharacters('hiragana', 'basic')).toHaveLength(46)
    expect(getScriptCharacters('katakana', 'basic')).toHaveLength(46)
    expect(BASIC_KANA).toHaveLength(92)
  })

  it('keeps the traditional gojuon rows available', () => {
    expect(KANA_GROUPS.basic.map((row) => row.label)).toEqual([
      '元音', 'K 行', 'S 行', 'T 行', 'N 行', 'H 行', 'M 行', 'Y 行', 'R 行', 'W 行',
    ])
  })

  it('finds a character and its counterpart', () => {
    expect(findKana('あ')).toMatchObject({ romaji: 'a', pair: 'ア' })
    expect(findKana('ツ')).toMatchObject({ romaji: 'tsu', pair: 'つ' })
  })
})
