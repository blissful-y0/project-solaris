# Landing Header Review Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove review-blocking regressions in PR #6 (hero hydration mismatch and fixed-header anchor overlap).

**Architecture:** Extract hero skip decision into a testable helper and initialize skip mode on client mount. Preserve existing custom event contract. Add CSS anchor offset at root and section levels.

**Tech Stack:** Astro 5, React 19, TypeScript, Node test runner, global CSS

---

### Task 1: Test skip decision helper (TDD)

**Files:**
- Create: `apps/landing/tests/hero-skip-state.test.mjs`
- Create: `apps/landing/src/components/hero/skipState.js`

**Step 1: Write the failing test**
- Add tests for dev skip, valid returning timestamp, expired timestamp, invalid timestamp.

**Step 2: Run test to verify it fails**
- Run: `node --test apps/landing/tests/hero-skip-state.test.mjs`
- Expected: FAIL (helper module/function not implemented).

**Step 3: Write minimal implementation**
- Implement pure helper returning `none|dev|returning`.

**Step 4: Run test to verify it passes**
- Run: `node --test apps/landing/tests/hero-skip-state.test.mjs`
- Expected: PASS.

### Task 2: Apply helper in Hero initialization

**Files:**
- Modify: `apps/landing/src/components/hero/Hero.tsx`

**Step 1: Replace render-time skip decision**
- Compute skip mode in mount effect and update phase/choice state.

**Step 2: Keep event contract stable**
- Ensure `solaris:hero-selected`, `solaris:hero-done`, `solaris:hero-skipped` dispatches remain behaviorally consistent.

**Step 3: Verify build**
- Run: `pnpm --filter @solaris/landing build`
- Expected: exit code 0.

### Task 3: Anchor offset for fixed header

**Files:**
- Modify: `apps/landing/src/styles/global.css`

**Step 1: Add root scroll padding + per-section scroll margin**
- Add top offset variables and apply to section anchor IDs.

**Step 2: Verify build**
- Run: `pnpm --filter @solaris/landing build`
- Expected: exit code 0.

### Task 4: Commit

**Step 1: Stage changed files**
- `git add` modified hero/css/test/docs files.

**Step 2: Commit**
- `git commit -m "fix: resolve PR review issues for hero hydration and anchor offset"`
