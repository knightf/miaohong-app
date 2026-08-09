import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

vi.mock('./components/PwaControls', () => ({
  default: () => <button aria-label="安装应用">安装</button>,
}))

beforeEach(() => {
  localStorage.clear()
  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    value: { cancel: vi.fn(), speak: vi.fn(), getVoices: () => [] },
  })
})

describe('Kana Mori app', () => {
  it('renders the PWA install controls in the page header', () => {
    render(<App />)
    expect(screen.getByRole('navigation', { name: '页面设置' })).toContainElement(
      screen.getByRole('button', { name: '安装应用' }),
    )
  })

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
    expect(screen.getByLabelText('总学习进度 已掌握 0 / 162')).toBeInTheDocument()
    expect(screen.getByText('0 / 162')).toBeInTheDocument()
    expect(document.querySelector('.progress-track')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '标记为已掌握' }))
    expect(screen.getByRole('button', { name: '取消已掌握' })).toBeInTheDocument()
    expect(screen.getByText('1 / 162')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('kana-mori-progress')).learned).toContain('あ')
  })

  it('toggles dark mode accessibly', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '切换到暗色模式' }))
    expect(document.documentElement.dataset.theme).toBe('dark')
  })
})
