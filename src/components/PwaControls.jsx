import { useEffect, useMemo, useState } from 'react'
import { Download, RefreshCw, Share2, WifiOff, X } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'

function isIosDevice() {
  const userAgent = navigator.userAgent || ''
  return /iPad|iPhone|iPod/i.test(userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

function isMobileBrowser() {
  return isIosDevice()
    || /Android|Mobile/i.test(navigator.userAgent || '')
    || window.matchMedia?.('(pointer: coarse)').matches === true
}

function isStandaloneMode() {
  return window.matchMedia?.('(display-mode: standalone)').matches === true
    || navigator.standalone === true
}

export default function PwaControls() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [standalone, setStandalone] = useState(isStandaloneMode)
  const [guideOpen, setGuideOpen] = useState(false)
  const ios = useMemo(isIosDevice, [])
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  useEffect(() => {
    const displayMode = window.matchMedia?.('(display-mode: standalone)')
    const handleDisplayMode = (event) => setStandalone(event.matches)
    const handleInstallPrompt = (event) => {
      event.preventDefault()
      setInstallPrompt(event)
    }
    const handleInstalled = () => {
      setInstallPrompt(null)
      setGuideOpen(false)
      setStandalone(true)
    }

    displayMode?.addEventListener?.('change', handleDisplayMode)
    window.addEventListener('beforeinstallprompt', handleInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)
    return () => {
      displayMode?.removeEventListener?.('change', handleDisplayMode)
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  useEffect(() => {
    if (!guideOpen) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setGuideOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [guideOpen])

  useEffect(() => {
    if (!offlineReady) return undefined
    const timeout = window.setTimeout(() => setOfflineReady(false), 3000)
    return () => window.clearTimeout(timeout)
  }, [offlineReady, setOfflineReady])

  const install = async () => {
    if (!installPrompt) {
      setGuideOpen(true)
      return
    }
    try {
      await installPrompt.prompt()
      await installPrompt.userChoice
    } finally {
      setInstallPrompt(null)
    }
  }

  const showInstall = !standalone && Boolean(installPrompt || isMobileBrowser())

  return (
    <>
      {showInstall && (
        <button className="icon-button install-button" onClick={install} aria-label="安装应用">
          <Download size={19} />
        </button>
      )}

      {needRefresh && (
        <button
          className="icon-button pwa-update-button"
          onClick={() => updateServiceWorker(true)}
          aria-label="有新版本，点击更新"
          data-tooltip="有新版本，点击更新"
        >
          <RefreshCw size={19} />
        </button>
      )}

      {guideOpen && (
        <div className="pwa-dialog-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setGuideOpen(false)
        }}>
          <section className="pwa-dialog" role="dialog" aria-modal="true" aria-labelledby="pwa-install-title">
            <button className="pwa-dialog-close" onClick={() => setGuideOpen(false)} aria-label="关闭安装说明">
              <X size={19} />
            </button>
            <span className="pwa-dialog-icon"><Share2 size={24} /></span>
            <p className="eyebrow">INSTALL APP</p>
            <h2 id="pwa-install-title">安装描红</h2>
            {ios ? (
              <>
                <p>在 Safari 中点按分享，然后选择添加到主屏幕。</p>
                <p className="pwa-dialog-note">Safari 里的既有学习进度不会自动迁移；安装后产生的新进度会保存在桌面应用中。</p>
              </>
            ) : (
              <p>打开浏览器菜单，选择“安装应用”或“添加到主屏幕”。</p>
            )}
            <button className="pwa-dialog-confirm" onClick={() => setGuideOpen(false)}>知道了</button>
          </section>
        </div>
      )}

      {offlineReady && (
        <div className="pwa-toast-stack" aria-live="polite">
          <div className="pwa-toast pwa-offline-toast" role="status">
            <WifiOff size={19} />
            <div><strong>已可离线使用</strong><span>页面与全部假名笔顺已缓存。</span></div>
          </div>
        </div>
      )}
    </>
  )
}
