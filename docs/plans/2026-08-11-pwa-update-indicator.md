# PWA Update Indicator Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the PWA update toast with an animated header action and make the offline-ready toast dismiss itself after three seconds.

**Architecture:** Keep `useRegisterSW` as the source of truth inside `PwaControls`. Render `needRefresh` as a header button that calls the existing update callback, while a focused effect owns the `offlineReady` dismissal timer.

**Tech Stack:** React 19, Vite PWA, Lucide React, Vitest, Testing Library, CSS.

### Task 1: Specify the new PWA behavior

**Files:**
- Modify: `src/components/PwaControls.test.jsx`
- Modify: `src/themeStyles.test.js`

**Step 1:** Add fake-timer coverage proving that the offline notice remains before 3 seconds and calls `setOfflineReady(false)` at 3 seconds.

**Step 2:** Add coverage proving that `needRefresh` renders a button named “有新版本，点击更新”, omits the old update toast text/actions, and calls `updateServiceWorker(true)` when clicked.

**Step 3:** Add style assertions for the update button glow, pulse animation, reduced-motion override, and offline fade animation.

**Step 4:** Run `npm test -- src/components/PwaControls.test.jsx src/themeStyles.test.js` and confirm the new tests fail because the behavior is not implemented.

### Task 2: Implement the header update indicator

**Files:**
- Modify: `src/components/PwaControls.jsx`
- Modify: `src/styles.css`

**Step 1:** Add an effect that schedules offline dismissal at 3000 ms and clears the timer on cleanup.

**Step 2:** Render a header `RefreshCw` button only when `needRefresh` is true, with matching `aria-label` and `title`, calling `updateServiceWorker(true)`.

**Step 3:** Remove the update toast and simplify the offline toast to a status-only notification.

**Step 4:** Add theme-compatible glow/pulse styles, offline fade timing, and `prefers-reduced-motion` handling.

**Step 5:** Re-run the targeted tests and confirm they pass.

### Task 3: Verify and publish

**Files:**
- Verify: `src/components/PwaControls.jsx`
- Verify: `src/styles.css`

**Step 1:** Run `npm test`, `npm run build`, and `git diff --check`.

**Step 2:** Visually inspect the top action in mobile/desktop and light/dark modes.

**Step 3:** Commit the implementation, merge it to `main`, push, and verify the production CSS and Service Worker.
