import { execFile } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { ALL_KANA } from '../src/data/kana.js'

const execFileAsync = promisify(execFile)
const KANJIVG_COMMIT = 'bd13ffbcc9d85cb86ae98bbbf001d9069220b901'
const SOURCE_ROOT = `https://raw.githubusercontent.com/KanjiVG/kanjivg/${KANJIVG_COMMIT}/kanji`
const OUTPUT_PATH = resolve(dirname(fileURLToPath(import.meta.url)), '../public/stroke-data/kanjivg-kana-paths.json')

function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}=(['"])(.*?)\\1`))?.[2]
}

export function extractStrokePaths(svgText, character) {
  const viewBox = svgText.match(/\bviewBox=(['"])(.*?)\1/)?.[2]?.trim().split(/\s+/).map(Number)
  if (viewBox?.length !== 4 || viewBox.some((value, index) => value !== [0, 0, 109, 109][index])) {
    throw new Error(`${character}: expected KanjiVG viewBox 0 0 109 109`)
  }

  const strokes = [...svgText.matchAll(/<path\b[^>]*>/g)]
    .map(([tag]) => {
      const id = attribute(tag, 'id')
      const sequence = id?.match(/-s(\d+)$/)?.[1]
      return sequence ? { sequence: Number(sequence), path: attribute(tag, 'd') } : null
    })
    .filter(Boolean)
    .sort((left, right) => left.sequence - right.sequence)

  if (!strokes.length || strokes.some(({ path }, index) => !path || strokes[index].sequence !== index + 1)) {
    throw new Error(`${character}: invalid or discontinuous stroke sequence`)
  }
  return strokes.map(({ path }) => path)
}

export function validateStrokeDataset(dataset, expectedCharacters) {
  const actualCharacters = Object.keys(dataset?.characters || {}).sort()
  const expected = [...new Set(expectedCharacters)].sort()
  if (actualCharacters.length !== expected.length || actualCharacters.some((character, index) => character !== expected[index])) {
    throw new Error('KanjiVG character set does not match ALL_KANA')
  }

  const strokeCount = actualCharacters.reduce((total, character) => {
    const paths = dataset.characters[character]
    if (!Array.isArray(paths) || !paths.length || paths.some((path) => typeof path !== 'string' || !path)) {
      throw new Error(`${character}: stroke paths are missing`)
    }
    return total + paths.length
  }, 0)

  if (dataset?._meta?.characterCount !== expected.length || dataset?._meta?.strokeCount !== strokeCount) {
    throw new Error('KanjiVG metadata totals do not match generated data')
  }
  if (JSON.stringify(dataset?._meta?.viewBox) !== JSON.stringify([0, 0, 109, 109])) {
    throw new Error('KanjiVG metadata viewBox is invalid')
  }
}

async function downloadText(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.text()
  } catch (fetchError) {
    try {
      const { stdout } = await execFileAsync('curl', ['--fail', '--silent', '--show-error', '--location', url], {
        maxBuffer: 1024 * 1024,
      })
      return stdout
    } catch {
      throw fetchError
    }
  }
}

async function generateStrokeDataset() {
  const characters = [...new Set(ALL_KANA.map(({ character }) => character))]
  const records = {}

  for (let offset = 0; offset < characters.length; offset += 12) {
    const batch = characters.slice(offset, offset + 12)
    const results = await Promise.all(batch.map(async (character) => {
      const codePoint = character.codePointAt(0).toString(16).padStart(5, '0')
      const svgText = await downloadText(`${SOURCE_ROOT}/${codePoint}.svg`)
      return [character, extractStrokePaths(svgText, character)]
    }))
    results.forEach(([character, paths]) => { records[character] = paths })
  }

  const strokeCount = Object.values(records).reduce((total, paths) => total + paths.length, 0)
  const dataset = {
    _meta: {
      title: 'KanjiVG kana stroke paths',
      author: 'Ulrich Apel',
      source: `https://github.com/KanjiVG/kanjivg/tree/${KANJIVG_COMMIT}`,
      commit: KANJIVG_COMMIT,
      license: 'CC BY-SA 3.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
      modifications: 'Extracted ordered SVG path d values for the 162 kana used by 描红 (miaohong.app); removed other SVG metadata.',
      characterCount: characters.length,
      strokeCount,
      viewBox: [0, 0, 109, 109],
    },
    characters: records,
  }

  validateStrokeDataset(dataset, characters)
  if (characters.length !== 162 || strokeCount !== 466) {
    throw new Error(`Expected 162 characters and 466 strokes, received ${characters.length} and ${strokeCount}`)
  }

  await mkdir(dirname(OUTPUT_PATH), { recursive: true })
  await writeFile(OUTPUT_PATH, `${JSON.stringify(dataset, null, 2)}\n`)
  console.log(`Wrote ${characters.length} characters and ${strokeCount} strokes to ${OUTPUT_PATH}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  generateStrokeDataset().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
