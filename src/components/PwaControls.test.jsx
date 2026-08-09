import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PwaControls from './PwaControls'

const registrationState = vi.hoisted(() => ({
  offlineReady: false,
  needRefresh: false,
  setOfflineReady: vi.fn(),
  setNeedRefresh: vi.fn(),
  updateServiceWorker: vi.fn(),
}))

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    offlineReady: [registrationState.offlineReady, registrationState.setOfflineReady],
    needRefresh: [registrationState.needRefresh, registrationState.setNeedRefresh],
    updateServiceWorker: registrationState.updateServiceWorker,
  }),
}))

function stubDisplayMode(matches = false) {
  const listeners = new Set()
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    matches,
    media: '(display-mode: standalone)',
    addEventListener: (_event, listener) => listeners.add(listener),
    removeEventListener: (_event, listener) => listeners.delete(listener),
  })))
}

describe('PWA controls', () => {
  beforeEach(() => {
    stubDisplayMode(false)
    Object.assign(registrationState, {
      offlineReady: false,
      needRefresh: false,
      setOfflineReady: vi.fn(),
      setNeedRefresh: vi.fn(),
      updateServiceWorker: vi.fn(),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('uses the Chromium install prompt and hides after installation', async () => {
    const prompt = vi.fn().mockResolvedValue(undefined)
    const installEvent = new Event('beforeinstallprompt', { cancelable: true })
    Object.defineProperties(installEvent, {
      prompt: { value: prompt },
      userChoice: { value: Promise.resolve({ outcome: 'accepted' }) },
    })
    render(<PwaControls />)

    window.dispatchEvent(installEvent)
    const installButton = await screen.findByRole('button', { name: '安装应用' })
    fireEvent.click(installButton)
    await waitFor(() => expect(prompt).toHaveBeenCalledTimes(1))

    window.dispatchEvent(new Event('appinstalled'))
    await waitFor(() => expect(screen.queryByRole('button', { name: '安装应用' })).not.toBeInTheDocument())
  })

  it('shows iOS home-screen instructions and the local progress warning', () => {
    vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)')
    render(<PwaControls />)

    fireEvent.click(screen.getByRole('button', { name: '安装应用' }))
    expect(screen.getByRole('dialog', { name: '安装 Kana Mori' })).toBeInTheDocument()
    expect(screen.getByText(/分享.*添加到主屏幕/)).toBeInTheDocument()
    expect(screen.getByText(/Safari 里的既有学习进度不会自动迁移/)).toBeInTheDocument()
  })

  it('does not offer installation inside standalone mode', () => {
    stubDisplayMode(true)
    vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (iPhone)')
    render(<PwaControls />)

    expect(screen.queryByRole('button', { name: '安装应用' })).not.toBeInTheDocument()
  })

  it('shows offline readiness and lets the user accept an update', () => {
    registrationState.offlineReady = true
    registrationState.needRefresh = true
    render(<PwaControls />)

    expect(screen.getByText('已可离线使用')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '知道了' }))
    expect(registrationState.setOfflineReady).toHaveBeenCalledWith(false)

    expect(screen.getByText('新版本已准备好')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '立即更新' }))
    expect(registrationState.updateServiceWorker).toHaveBeenCalledWith(true)
  })
})
