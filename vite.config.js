import { cloudflare } from '@cloudflare/vite-plugin'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const pwaPlugins = VitePWA({
  registerType: 'prompt',
  injectRegister: false,
  manifest: {
    id: '/',
    name: '描红 · 日语假名描红练习',
    short_name: '描红',
    description: '在线练习平假名与片假名，跟随笔顺描红、听读并记录学习进度。',
    lang: 'zh-CN',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    theme_color: '#f3efe7',
    background_color: '#f3efe7',
    categories: ['education'],
    icons: [
      { src: '/icons/miaohong-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/miaohong-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/miaohong-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,png,svg,ico,json,txt}'],
    cleanupOutdatedCaches: true,
    navigateFallback: '/index.html',
  },
})

const clientPwaPlugins = pwaPlugins.map((plugin) => ({
  ...plugin,
  applyToEnvironment: (environment) => environment.name === 'client',
}))

export default defineConfig(() => ({
  plugins: [
    react(),
    ...clientPwaPlugins,
    ...(!process.env.VITEST ? [cloudflare({ viteEnvironment: { name: 'server' } })] : []),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
}))
