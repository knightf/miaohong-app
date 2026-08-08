const BASIC_ROWS = [
  { id: 'vowels', label: '元音', romaji: ['a', 'i', 'u', 'e', 'o'], hiragana: 'あいうえお', katakana: 'アイウエオ' },
  { id: 'k', label: 'K 行', romaji: ['ka', 'ki', 'ku', 'ke', 'ko'], hiragana: 'かきくけこ', katakana: 'カキクケコ' },
  { id: 's', label: 'S 行', romaji: ['sa', 'shi', 'su', 'se', 'so'], hiragana: 'さしすせそ', katakana: 'サシスセソ' },
  { id: 't', label: 'T 行', romaji: ['ta', 'chi', 'tsu', 'te', 'to'], hiragana: 'たちつてと', katakana: 'タチツテト' },
  { id: 'n', label: 'N 行', romaji: ['na', 'ni', 'nu', 'ne', 'no'], hiragana: 'なにぬねの', katakana: 'ナニヌネノ' },
  { id: 'h', label: 'H 行', romaji: ['ha', 'hi', 'fu', 'he', 'ho'], hiragana: 'はひふへほ', katakana: 'ハヒフヘホ' },
  { id: 'm', label: 'M 行', romaji: ['ma', 'mi', 'mu', 'me', 'mo'], hiragana: 'まみむめも', katakana: 'マミムメモ' },
  { id: 'y', label: 'Y 行', romaji: ['ya', 'yu', 'yo'], hiragana: 'やゆよ', katakana: 'ヤユヨ' },
  { id: 'r', label: 'R 行', romaji: ['ra', 'ri', 'ru', 're', 'ro'], hiragana: 'らりるれろ', katakana: 'ラリルレロ' },
  { id: 'w', label: 'W 行', romaji: ['wa', 'wo', 'n'], hiragana: 'わをん', katakana: 'ワヲン' },
]

const VOICED_ROWS = [
  { id: 'g', label: 'G 行', romaji: ['ga', 'gi', 'gu', 'ge', 'go'], hiragana: 'がぎぐげご', katakana: 'ガギグゲゴ' },
  { id: 'z', label: 'Z 行', romaji: ['za', 'ji', 'zu', 'ze', 'zo'], hiragana: 'ざじずぜぞ', katakana: 'ザジズゼゾ' },
  { id: 'd', label: 'D 行', romaji: ['da', 'ji', 'zu', 'de', 'do'], hiragana: 'だぢづでど', katakana: 'ダヂヅデド' },
  { id: 'b', label: 'B 行', romaji: ['ba', 'bi', 'bu', 'be', 'bo'], hiragana: 'ばびぶべぼ', katakana: 'バビブベボ' },
  { id: 'p', label: 'P 行', romaji: ['pa', 'pi', 'pu', 'pe', 'po'], hiragana: 'ぱぴぷぺぽ', katakana: 'パピプペポ' },
]

const SMALL_ROWS = [
  { id: 'small-vowels', label: '小元音', romaji: ['xa', 'xi', 'xu', 'xe', 'xo'], hiragana: 'ぁぃぅぇぉ', katakana: 'ァィゥェォ' },
  { id: 'small-y', label: '小 Y 行', romaji: ['xya', 'xyu', 'xyo'], hiragana: 'ゃゅょ', katakana: 'ャュョ' },
  { id: 'small-tsu', label: '促音', romaji: ['xtsu'], hiragana: 'っ', katakana: 'ッ' },
  { id: 'small-wa', label: '小 W 行', romaji: ['xwa'], hiragana: 'ゎ', katakana: 'ヮ' },
]

export const KANA_GROUPS = {
  basic: BASIC_ROWS,
  voiced: VOICED_ROWS,
  small: SMALL_ROWS,
}

function expandRows(rows, script) {
  return rows.flatMap((row) => [...row[script]].map((character, index) => ({
    character,
    script,
    category: rows === BASIC_ROWS ? 'basic' : rows === VOICED_ROWS ? 'voiced' : 'small',
    row: row.id,
    rowLabel: row.label,
    romaji: row.romaji[index],
  })))
}

const hiragana = Object.values(KANA_GROUPS).flatMap((rows) => expandRows(rows, 'hiragana'))
const katakana = Object.values(KANA_GROUPS).flatMap((rows) => expandRows(rows, 'katakana'))

export const BASIC_KANA = [
  ...expandRows(BASIC_ROWS, 'hiragana'),
  ...expandRows(BASIC_ROWS, 'katakana'),
]

export const ALL_KANA = [...hiragana, ...katakana].map((item) => {
  const otherScript = item.script === 'hiragana' ? 'katakana' : 'hiragana'
  const pair = [...KANA_GROUPS[item.category].find((row) => row.id === item.row)[otherScript]][
    KANA_GROUPS[item.category].find((row) => row.id === item.row).romaji.indexOf(item.romaji)
  ]
  return { ...item, pair }
})

export function getScriptCharacters(script, category = 'all') {
  return ALL_KANA.filter((item) => item.script === script && (category === 'all' || item.category === category))
}

export function findKana(character) {
  return ALL_KANA.find((item) => item.character === character)
}

export function getRows(script, category) {
  return KANA_GROUPS[category].map((row) => ({
    ...row,
    characters: [...row[script]].map((character) => findKana(character)),
  }))
}

