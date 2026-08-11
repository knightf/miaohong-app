import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const styles = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8')

describe('theme-aware active controls', () => {
  it('defines contrasting active-control colors for light and dark themes', () => {
    expect(styles).toContain('--control-active-bg: #242521;')
    expect(styles).toContain('--control-active-fg: #fff;')
    expect(styles).toContain('--control-active-bg: #eeece5;')
    expect(styles).toContain('--control-active-fg: #1f211e;')
  })

  it('uses the shared colors for every ink-style active control', () => {
    const activeRule = 'color: var(--control-active-fg); background: var(--control-active-bg);'

    expect(styles).toContain(`.script-switcher button.active { ${activeRule} }`)
    expect(styles).toContain(`.pwa-dialog-confirm { width: 100%; padding: 11px 16px; border: 0; ${activeRule}`)
    expect(styles).toContain(`.listen-button { width: 100%; padding: 11px 14px; display: grid; grid-template-columns: 42px 1fr auto; align-items: center; gap: 11px; border: 0; ${activeRule}`)
    expect(styles).toContain(`.mobile-script-tabs button.active { ${activeRule} }`)
    expect(styles).not.toMatch(/color:\s*#fff;\s*background:\s*var\(--ink\)/)
  })
})
