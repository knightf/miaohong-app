import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import WritingPad from './WritingPad'
import { findKana } from '../data/kana'

const strokeSvg = '<svg xmlns="http://www.w3.org/2000/svg"><path id="kvg:03042-s1" d="M10 20 L90 30" /></svg>'

describe('WritingPad', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true, text: () => Promise.resolve(strokeSvg) })))
  })

  afterEach(() => vi.unstubAllGlobals())

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
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('offline'))))
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
})
