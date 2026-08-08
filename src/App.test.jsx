import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

beforeEach(() => {
  localStorage.clear()
  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    value: { cancel: vi.fn(), speak: vi.fn(), getVoices: () => [] },
  })
})

describe('Kana Mori app', () => {
  it('selects a kana from the character browser', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '选择 か ka' }))
    expect(screen.getByTestId('focus-character')).toHaveTextContent('か')
    expect(screen.getByText('KA', { selector: '.romaji-reading' })).toBeInTheDocument()
  })

  it('switches script while keeping the matching sound', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '选择 き ki' }))
    fireEvent.click(screen.getByRole('button', { name: '片假名' }))
    expect(screen.getByTestId('focus-character')).toHaveTextContent('キ')
  })

  it('stores learned state and updates progress', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '标记为已掌握' }))
    expect(screen.getByRole('button', { name: '取消已掌握' })).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('kana-mori-progress')).learned).toContain('あ')
  })

  it('toggles dark mode accessibly', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '切换到暗色模式' }))
    expect(document.documentElement.dataset.theme).toBe('dark')
  })
})
