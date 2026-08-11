# 描红 Design

描红 is a single-page, device-local Japanese kana tracing desk. The first viewport centers the currently selected character and gives the learner three immediate actions: hear it, mark it learned, and practice writing it. A compact header carries overall progress, script switching, and theme control. Character browsing is grouped by the traditional gojūon rows so learners see structure instead of an undifferentiated grid.

The interface uses a calm, editorial visual system inspired by Japanese stationery: warm paper in light mode, ink-black surfaces in dark mode, vermilion accents, subtle grid rules, and generous negative space. It avoids ornamental imagery so attention stays on the glyph. On desktop the browser, study card, and writing panel form three columns; on mobile they become a focused vertical sequence with a horizontally scrollable row selector.

All learning state lives in localStorage: learned characters, practiced characters, theme, selected script, and selected character. Pronunciation uses the browser Speech Synthesis API with a Japanese voice when available and a visible fallback message otherwise. The core kana inventory includes basic hiragana and katakana, voiced/semi-voiced sounds, and small kana.

Writing practice uses per-character ordered stroke paths. The current stroke is shown as a dashed hint in a four-quadrant practice grid. The learner draws with mouse, pen, or touch; the trace is accepted when its start/end and shape coverage are close enough to the expected stroke, then the next hint appears. For characters without a curated path, the app provides a font-outline trace mode so every character remains practiceable while the main gojūon set receives true sequential guidance.
