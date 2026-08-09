import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import WritingPad from './WritingPad'
import { findKana } from '../data/kana'
import { loadStrokePaths } from '../lib/strokeData'

vi.mock('../lib/strokeData', () => ({ loadStrokePaths: vi.fn() }))

const strokePaths = ['M10 20 L90 30']
const twoStrokePaths = ['M10 20 L90 30', 'M20 10 L30 90']

describe('WritingPad', () => {
  beforeEach(() => {
    loadStrokePaths.mockReset().mockResolvedValue(strokePaths)
    vi.stubGlobal('fetch', vi.fn(() => {
      throw new Error('WritingPad must not request third-party stroke data')
    }))
  })

  afterEach(() => vi.unstubAllGlobals())

  it('loads guided paths from bundled data without a third-party request', async () => {
    render(<WritingPad kana={findKana('あ')} onComplete={vi.fn()} />)

    await waitFor(() => expect(screen.getByText('/ 1 笔')).toBeInTheDocument())
    expect(loadStrokePaths).toHaveBeenCalledWith('あ')
    expect(fetch).not.toHaveBeenCalled()
    expect(screen.getByRole('link', { name: 'KanjiVG' })).toHaveAttribute(
      'href',
      '/third-party/kanjivg/NOTICE.txt',
    )
  })

  it('does not carry completion over when the character changes', async () => {
    const onComplete = vi.fn()
    const view = render(<WritingPad kana={findKana('あ')} onComplete={onComplete} />)
    const board = screen.getByLabelText('あ 的田字格书写区')

    await waitFor(() => expect(screen.getByText('/ 1 笔')).toBeInTheDocument())
    fireEvent.pointerDown(board, { clientX: 10, clientY: 10, pointerId: 1 })
    fireEvent.pointerMove(board, { clientX: 20, clientY: 20, pointerId: 1 })
    fireEvent.pointerMove(board, { clientX: 30, clientY: 25, pointerId: 1 })
    fireEvent.pointerMove(board, { clientX: 40, clientY: 30, pointerId: 1 })
    fireEvent.pointerMove(board, { clientX: 50, clientY: 35, pointerId: 1 })
    fireEvent.pointerUp(board, { clientX: 50, clientY: 35, pointerId: 1 })
    await waitFor(() => expect(onComplete).toHaveBeenCalledWith('あ'))

    view.rerender(<WritingPad kana={findKana('い')} onComplete={onComplete} />)
    await Promise.resolve()
    expect(onComplete).not.toHaveBeenCalledWith('い')
  })

  it('does not award practice progress when stroke data is unavailable', async () => {
    loadStrokePaths.mockResolvedValue(null)
    const onComplete = vi.fn()
    render(<WritingPad kana={findKana('あ')} onComplete={onComplete} />)

    await waitFor(() => expect(screen.getByText('笔顺数据暂不可用，可自由临摹')).toBeInTheDocument())
    expect(onComplete).not.toHaveBeenCalled()
    expect(screen.queryByText('笔画顺序正确')).not.toBeInTheDocument()
  })

  it('offers a keyboard-operable way to confirm each guided stroke', async () => {
    const onComplete = vi.fn()
    render(<WritingPad kana={findKana('あ')} onComplete={onComplete} />)

    const confirmStroke = await screen.findByRole('button', { name: '确认第 1 笔' })
    fireEvent.click(confirmStroke)
    await waitFor(() => expect(onComplete).toHaveBeenCalledWith('あ'))
  })

  it('plays every stroke in order without marking practice complete', async () => {
    loadStrokePaths.mockResolvedValue(twoStrokePaths)
    const onComplete = vi.fn()
    render(<WritingPad kana={findKana('あ')} onComplete={onComplete} />)

    const play = await screen.findByRole('button', { name: '逐笔播放' })
    await waitFor(() => expect(play).toBeEnabled())
    fireEvent.click(play)
    expect(screen.getByText('正在演示第 1 / 2 笔')).toBeInTheDocument()

    fireEvent.animationEnd(screen.getByTestId('demo-stroke-0'))
    expect(screen.getByText('正在演示第 2 / 2 笔')).toBeInTheDocument()
    fireEvent.animationEnd(screen.getByTestId('demo-stroke-1'))

    await waitFor(() => expect(screen.getByText('笔顺演示完成，可以开始临摹')).toBeInTheDocument())
    expect(onComplete).not.toHaveBeenCalled()
  })
})
