import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const indexHtml = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8')

describe('AdSense loader', () => {
  it('loads the configured publisher script once in the document head', () => {
    const document = new DOMParser().parseFromString(indexHtml, 'text/html')
    const scripts = document.querySelectorAll(
      'script[src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4065174331339857"]',
    )

    expect(scripts).toHaveLength(1)
    expect(document.head.contains(scripts[0])).toBe(true)
    expect(scripts[0].hasAttribute('async')).toBe(true)
    expect(scripts[0].getAttribute('crossorigin')).toBe('anonymous')
  })
})
