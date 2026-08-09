import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('local stroke data loader', () => {
  it('loads the bundled dataset once and returns paths by character', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        characters: {
          あ: ['M10 20 L90 30'],
          ア: ['M20 10 L30 90'],
        },
      }),
    })
    vi.stubGlobal('fetch', fetchMock)
    const { loadStrokePaths } = await import('./strokeData')

    await expect(loadStrokePaths('あ')).resolves.toEqual(['M10 20 L90 30'])
    await expect(loadStrokePaths('ア')).resolves.toEqual(['M20 10 L30 90'])
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith('/stroke-data/kanjivg-kana-paths.json')
  })

  it('returns null when the local dataset is unavailable or incomplete', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline cache missing')))
    const { loadStrokePaths } = await import('./strokeData')

    await expect(loadStrokePaths('あ')).resolves.toBeNull()
    await expect(loadStrokePaths('ア')).resolves.toBeNull()
  })

  it('retries after a transient dataset loading failure', async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new Error('service worker is still installing'))
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ characters: { あ: ['M10 20 L90 30'] } }),
      })
    vi.stubGlobal('fetch', fetchMock)
    const { loadStrokePaths } = await import('./strokeData')

    await expect(loadStrokePaths('あ')).resolves.toBeNull()
    await expect(loadStrokePaths('あ')).resolves.toEqual(['M10 20 L90 30'])
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
