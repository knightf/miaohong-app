# Local Learning Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix stroke-order playback, use the system font for page text and kana, and replace percentage progress bars with explicit learned counts.

**Architecture:** Keep stroke playback as presentation-only state inside `WritingPad`, separate from practice completion. Derive absolute learned counts directly from the sanitized local progress arrays in `App` and simplify the existing CSS without adding dependencies.

**Tech Stack:** React, Vite, Vitest, Testing Library, SVG/CSS animation.

### Task 1: Reproduce playback and progress behavior

**Files:**
- Modify: `src/components/WritingPad.test.jsx`
- Modify: `src/App.test.jsx`

1. Add a failing test that starts a two-stroke demo and advances on each SVG animation end.
2. Add a failing test that displays `0 / 162`, becomes `1 / 162`, and has no progress tracks.
3. Run the focused tests and confirm the failures describe the missing behavior.

### Task 2: Implement playback and count display

**Files:**
- Modify: `src/components/WritingPad.jsx`
- Modify: `src/App.jsx`
- Modify: `src/styles.css`

1. Add isolated demo state and draw each SVG stroke in sequence without awarding practice progress.
2. Replace percentage and bar markup with learned/total counts in the header and current-group counts in the footer.
3. Remove external/custom font declarations and use the system font stack throughout.
4. Run focused tests until green.

### Task 3: Verify locally

1. Run the complete test suite.
2. Run the production build.
3. Confirm the local Vite preview remains available at its existing URL.
