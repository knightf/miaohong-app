import { describe, expect, it } from 'vitest'
import { normalizePoint, traceMatchesStroke } from './stroke'

describe('stroke matching', () => {
  it('normalizes pointer positions to a 100 point grid', () => {
    expect(normalizePoint({ x: 60, y: 45 }, { left: 10, top: 20, width: 100, height: 50 })).toEqual({ x: 50, y: 50 })
  })

  it('accepts a trace following the intended direction', () => {
    const expected = [[10, 20], [50, 35], [90, 30]]
    const actual = [{ x: 12, y: 21 }, { x: 52, y: 34 }, { x: 88, y: 31 }]
    expect(traceMatchesStroke(actual, expected)).toBe(true)
  })

  it('rejects reversed or distant traces', () => {
    const expected = [[10, 20], [50, 35], [90, 30]]
    expect(traceMatchesStroke([{ x: 90, y: 30 }, { x: 10, y: 20 }], expected)).toBe(false)
    expect(traceMatchesStroke([{ x: 10, y: 90 }, { x: 90, y: 90 }], expected)).toBe(false)
  })
})
