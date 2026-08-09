import { cloudflare } from '@cloudflare/vite-plugin'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const pwaPlugins = VitePWA({
  registerType: 'prompt',
  injectRegister: false,
  manifest: {
    id: '/',
    name: 'Kana Mori · 日文字符练习',
    short_name: 'Kana Mori',
    description: '学习平假名与片假名的读音、笔顺与书写。',
    lang: 'zh-CN',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    theme_color: '#f3efe7',
    background_color: '#f3efe7',
    categories: ['education'],
    icons: [
      { src: '/icons/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
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
