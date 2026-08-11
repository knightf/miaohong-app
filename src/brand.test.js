import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const root = process.cwd()
const indexHtml = readFileSync(resolve(root, 'index.html'), 'utf8')
const viteConfig = readFileSync(resolve(root, 'vite.config.js'), 'utf8')
const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))

describe('描红 brand metadata', () => {
  it('uses the 描红 name and tracing description in document metadata', () => {
    const document = new DOMParser().parseFromString(indexHtml, 'text/html')

    expect(document.title).toBe('描红 · 日语假名描红练习')
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      '在线练习平假名与片假名，跟随笔顺描红、听读并记录学习进度。',
    )
    expect(document.querySelector('meta[name="apple-mobile-web-app-title"]')?.getAttribute('content')).toBe('描红')
    expect(indexHtml).not.toMatch(/Kana Mori/i)
  })

  it('uses the 描红 name and new icon paths in the PWA manifest', () => {
    expect(viteConfig).toContain("name: '描红 · 日语假名描红练习'")
    expect(viteConfig).toContain("short_name: '描红'")
    expect(viteConfig).toContain("src: '/icons/miaohong-192x192.png'")
    expect(viteConfig).toContain("src: '/icons/miaohong-512x512.png'")
    expect(viteConfig).toContain("src: '/icons/miaohong-maskable-512x512.png'")
    expect(viteConfig).not.toMatch(/Kana Mori/i)
  })

  it('publishes cache-busting 描红 icon assets', () => {
    const newAssets = [
      'public/miaohong-favicon.svg',
      'public/miaohong-apple-touch-icon.png',
      'public/icons/miaohong.svg',
      'public/icons/miaohong-192x192.png',
      'public/icons/miaohong-512x512.png',
      'public/icons/miaohong-maskable-512x512.png',
    ]

    expect(newAssets.every((path) => existsSync(resolve(root, path)))).toBe(true)
    expect(indexHtml).toContain('href="/miaohong-favicon.svg"')
    expect(indexHtml).toContain('href="/miaohong-apple-touch-icon.png"')
  })

  it('uses the new private package name', () => {
    expect(packageJson.name).toBe('miaohong-japanese-tracing')
  })
})
