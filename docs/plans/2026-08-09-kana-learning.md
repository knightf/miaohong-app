# Kana Mori Japanese Learning Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a responsive Vite + React kana learning page with pronunciation, local progress, theming, and guided stroke-order practice.

**Architecture:** Keep kana metadata in a pure data module, persistent learning state in a reusable hook, and stroke validation in testable geometry helpers. Compose the experience from a character browser, focused study card, and a pointer-enabled practice canvas.

**Tech Stack:** Vite, React, Vitest, Testing Library, Web Speech API, Canvas/SVG, localStorage.

### Task 1: Kana inventory and progress utilities

**Files:**
- Create: `src/data/kana.js`
- Create: `src/lib/progress.js`
- Test: `src/data/kana.test.js`
- Test: `src/lib/progress.test.js`

1. Write tests for complete basic inventories, related-script lookup, progress calculation, and invalid stored data.
2. Run `npm test` and confirm missing-module failures.
3. Implement the smallest data and persistence helpers that pass.
4. Run `npm test` and confirm green.

### Task 2: Stroke guidance

**Files:**
- Create: `src/data/strokes.js`
- Create: `src/lib/stroke.js`
- Test: `src/lib/stroke.test.js`

1. Write tests for guided stroke lookup and trace matching.
2. Run the focused test and confirm failure.
3. Implement normalized stroke data and tolerant geometric matching.
4. Run the focused test and confirm green.

### Task 3: Product interface

**Files:**
- Create: `index.html`
- Create: `src/main.jsx`
- Create: `src/App.jsx`
- Create: `src/styles.css`
- Create: `src/components/CharacterBrowser.jsx`
- Create: `src/components/StudyCard.jsx`
- Create: `src/components/WritingPad.jsx`
- Test: `src/App.test.jsx`

1. Write interaction tests for selection, theme, and learned-state behavior.
2. Run tests and confirm component-import failure.
3. Build the responsive learning interface and Web Speech integration.
4. Run all tests and confirm green.

### Task 4: Final verification

1. Run `npm test`.
2. Run `npm run build`.
3. Start the Vite preview and open it in Codex.
4. Verify the generated production assets and provide the runnable project.
