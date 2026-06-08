# stampstack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `stampstack` — a standalone, publishable React library that renders a draggable 3D coverflow of scalloped postage-stamp cards, with bring-your-own content (cobe-style).

**Architecture:** The library owns the fixed scalloped stamp *frame* and the fan *mechanics* (3D positioning, drag/flick, keyboard, hit-testing). The consumer supplies a `renderStamp(item, state)` function to fill each stamp with their own DOM. The genuinely reusable math (`posFromOffset`, release decision, hit-test) is extracted into **pure functions** so it can be unit-tested without a DOM, then composed by a `useStampFan` hook and the `<StampStack>` component.

**Tech Stack:** React 18+ (peer dep), TypeScript, tsup (build → ESM + CJS + d.ts + CSS), Vitest + React Testing Library + jsdom (tests), Vite (demo playground). Pure CSS for the frame (no Tailwind, no font).

**Repo location:** `/Users/lotaanidi/Documents/Projects/stampstack` (fresh standalone git repo, sibling to the tennis app). All `git` commands below run inside that repo unless stated otherwise.

**Source of truth for ported code:** `tennis-directory/src/components/CityGalleryStamp.tsx` and `tennis-directory/src/lib/stamp.ts`. The plan inlines the exact values needed, so the engineer does not need the tennis repo open.

---

## File Structure

```
stampstack/
  package.json
  tsconfig.json
  tsup.config.ts
  vitest.config.ts
  vitest.setup.ts
  .gitignore
  README.md
  src/
    fan-stops.ts        # FAN_STOPS table, posFromOffset(), CARD_STEP, CARD_BASELINE_Y, FanPos
    release.ts          # computeReleaseFocus() — pure flick/long-drag/snap + clamp
    hit-test.ts         # hitTest() — pure "which card is under this point"
    stamp.ts            # STAMP_FRAME_PATH, STAMP_VIEWBOX, STAMP_ASPECT (ported verbatim)
    StampFrame.tsx      # the scalloped frame SVG + inner content slot
    useStampFan.ts      # mechanics hook: state, handlers, getCardStyle/getCardState
    StampStack.tsx      # the component: scene, render loop, event wiring
    types.ts            # StampItem, StampState, StampStackProps
    styles.css          # frame styling + CSS variables (no content styling, no font)
    index.ts            # public exports
  src/__tests__/
    fan-stops.test.ts
    release.test.ts
    hit-test.test.ts
    StampStack.test.tsx
  demo/
    index.html
    main.tsx            # Vite playground: builds tennis-style content on the library
```

**Type & symbol contract (used consistently across all tasks):**

```ts
// fan-stops.ts
interface FanPos { tx: number; tz: number; ry: number; sc: number; op: number }
const FAN_STOPS: readonly FanPos[]
const CARD_STEP: number          // = FAN_STOPS[1].tx (270)
const CARD_BASELINE_Y: number    // = -28
function posFromOffset(off: number): FanPos

// release.ts
interface ReleaseInput { delta: number; duration: number; cardStep: number; startFocus: number; itemCount: number; moved: boolean }
function computeReleaseFocus(input: ReleaseInput): number   // clamped next focusIndex

// hit-test.ts
interface HitTestInput { localX: number; localY: number; focusIndex: number; dragDx: number; itemCount: number; cardWidth: number; cardStep: number; baselineY: number }
function hitTest(input: HitTestInput): number               // index, or -1 for empty space

// types.ts
type StampItem = { id: string } & Record<string, unknown>
interface StampState { focused: boolean; index: number; offset: number }
interface StampStackProps<T extends { id: string }> {
  items: T[]
  renderStamp: (item: T, state: StampState) => React.ReactNode
  onSelect?: (item: T, index: number) => void
  onFocusChange?: (index: number) => void
  initialIndex?: number
  cardWidth?: number
  className?: string
  style?: React.CSSProperties
}

// useStampFan.ts
interface UseStampFanOptions { itemCount: number; initialIndex?: number; cardWidth?: number; onSelect?: (index: number) => void; onFocusChange?: (index: number) => void }
interface UseStampFanResult {
  focusIndex: number
  sceneRef: React.RefObject<HTMLDivElement | null>
  getCardStyle: (index: number) => React.CSSProperties
  getCardState: (index: number) => StampState
  isInteractive: (index: number) => boolean
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void
  onSceneClick: (e: React.MouseEvent<HTMLDivElement>) => void
  handleCardKeyDown: (index: number, e: React.KeyboardEvent) => void
}
```

---

## Phase 0 — Repo scaffold

### Task 1: Initialise the repo and package.json

**Files:**
- Create: `/Users/lotaanidi/Documents/Projects/stampstack/package.json`
- Create: `/Users/lotaanidi/Documents/Projects/stampstack/.gitignore`

- [ ] **Step 1: Create the directory and init git**

```bash
mkdir -p /Users/lotaanidi/Documents/Projects/stampstack
cd /Users/lotaanidi/Documents/Projects/stampstack
git init
```

- [ ] **Step 2: Write `.gitignore`**

```
node_modules
dist
*.log
.DS_Store
```

- [ ] **Step 3: Write `package.json`**

```json
{
  "name": "stampstack",
  "version": "0.0.0",
  "description": "A draggable 3D coverflow of scalloped postage-stamp cards. Bring your own content.",
  "type": "module",
  "license": "MIT",
  "sideEffects": ["**/*.css"],
  "files": ["dist"],
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./styles.css": "./dist/styles.css"
  },
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "test:watch": "vitest",
    "dev": "vite",
    "typecheck": "tsc --noEmit"
  },
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/react": "^16.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "jsdom": "^24.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "tsup": "^8.3.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 4: Install dependencies**

Run: `cd /Users/lotaanidi/Documents/Projects/stampstack && npm install`
Expected: `node_modules` created, no peer-dependency errors (react is also a devDep so it resolves).

- [ ] **Step 5: Commit**

```bash
git add package.json .gitignore package-lock.json
git commit -m "chore: scaffold stampstack package"
```

### Task 2: Add TypeScript, tsup, and Vitest config

**Files:**
- Create: `/Users/lotaanidi/Documents/Projects/stampstack/tsconfig.json`
- Create: `/Users/lotaanidi/Documents/Projects/stampstack/tsup.config.ts`
- Create: `/Users/lotaanidi/Documents/Projects/stampstack/vitest.config.ts`
- Create: `/Users/lotaanidi/Documents/Projects/stampstack/vitest.setup.ts`

- [ ] **Step 1: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "declaration": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["src", "demo", "tsup.config.ts", "vitest.config.ts"]
}
```

- [ ] **Step 2: Write `tsup.config.ts`**

```ts
import { defineConfig } from 'tsup'

export default defineConfig({
  // Two entry points: the JS/TS library, and the standalone CSS theme.
  // esbuild emits dist/styles.css for the .css entry.
  entry: ['src/index.ts', 'src/styles.css'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  // React must NOT be bundled — it's a peer dependency the consumer provides.
  external: ['react', 'react-dom'],
})
```

- [ ] **Step 3: Write `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
})
```

- [ ] **Step 4: Write `vitest.setup.ts`**

```ts
// Adds jest-dom matchers (toBeInTheDocument, etc.) to Vitest's expect.
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 5: Verify typecheck runs (no source files yet, should pass trivially)**

Run: `cd /Users/lotaanidi/Documents/Projects/stampstack && npx tsc --noEmit`
Expected: exits 0 (no errors; `include` dirs may be empty, which is fine).

- [ ] **Step 6: Commit**

```bash
git add tsconfig.json tsup.config.ts vitest.config.ts vitest.setup.ts
git commit -m "chore: add typescript, tsup, and vitest config"
```

---

## Phase 1 — Pure mechanics (TDD)

### Task 3: Fan positioning math (`fan-stops.ts`)

**Files:**
- Create: `/Users/lotaanidi/Documents/Projects/stampstack/src/fan-stops.ts`
- Test: `/Users/lotaanidi/Documents/Projects/stampstack/src/__tests__/fan-stops.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/__tests__/fan-stops.test.ts
import { describe, it, expect } from 'vitest'
import { posFromOffset, FAN_STOPS, CARD_STEP } from '../fan-stops'

describe('posFromOffset', () => {
  it('returns the focused stop exactly at offset 0', () => {
    expect(posFromOffset(0)).toEqual(FAN_STOPS[0])
  })

  it('mirrors horizontal values for negative offsets', () => {
    const right = posFromOffset(1)
    const left = posFromOffset(-1)
    expect(left.tx).toBe(-right.tx)   // tx flips sign
    expect(left.ry).toBe(-right.ry)   // rotation flips sign
    expect(left.tz).toBe(right.tz)    // depth does not flip
    expect(left.sc).toBe(right.sc)    // scale does not flip
  })

  it('linearly interpolates between adjacent stops at a fractional offset', () => {
    const a = FAN_STOPS[0]
    const b = FAN_STOPS[1]
    const mid = posFromOffset(0.5)
    expect(mid.tx).toBeCloseTo((a.tx + b.tx) / 2)
    expect(mid.tz).toBeCloseTo((a.tz + b.tz) / 2)
    expect(mid.op).toBeCloseTo((a.op + b.op) / 2)
  })

  it('clamps offsets beyond the last stop to the last stop values', () => {
    const last = FAN_STOPS[FAN_STOPS.length - 1]
    const far = posFromOffset(50)
    expect(far.tx).toBe(last.tx)
    expect(far.op).toBe(last.op)
  })

  it('exposes CARD_STEP equal to the first non-zero stop tx', () => {
    expect(CARD_STEP).toBe(FAN_STOPS[1].tx)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/lotaanidi/Documents/Projects/stampstack && npx vitest run src/__tests__/fan-stops.test.ts`
Expected: FAIL — "Cannot find module '../fan-stops'".

- [ ] **Step 3: Write the implementation (ported verbatim from CityGalleryStamp.tsx lines 52–91)**

```ts
// src/fan-stops.ts

/** One row of the 3D fan: the transform applied at a given |offset| from focus. */
export interface FanPos {
  tx: number  // horizontal spread (px) — compresses with distance
  tz: number  // depth (px) — focused card comes forward
  ry: number  // Y-axis rotation (deg) — fans outward
  sc: number  // scale — shrinks further out
  op: number  // opacity — fades into the background
}

/**
 * Integer "stops" for the 3D fan. Each row is the transform at |offset| = index.
 * Hand-tuned keyframes; a fractional offset is interpolated between two rows.
 */
export const FAN_STOPS: readonly FanPos[] = [
  { tx: 0,   tz: 60,   ry: 0,   sc: 1,    op: 1    },
  { tx: 270, tz: 0,    ry: -30, sc: 0.9,  op: 1    },
  { tx: 460, tz: -40,  ry: -48, sc: 0.78, op: 0.7  },
  { tx: 580, tz: -80,  ry: -58, sc: 0.68, op: 0.45 },
  { tx: 660, tz: -110, ry: -64, sc: 0.58, op: 0.25 },
  { tx: 720, tz: -130, ry: -68, sc: 0.5,  op: 0.12 },
  { tx: 760, tz: -145, ry: -71, sc: 0.44, op: 0.06 },
  { tx: 790, tz: -155, ry: -73, sc: 0.4,  op: 0.03 },
  { tx: 810, tz: -160, ry: -75, sc: 0.38, op: 0    },
] as const

/** Horizontal distance between adjacent card centers at offset 0 → 1.
 *  Used to convert a pixel drag delta into a fractional focus offset. */
export const CARD_STEP = FAN_STOPS[1].tx

/** Vertical baseline offset applied to every card, pulling the fan upward. */
export const CARD_BASELINE_Y = -28

/** Linear interpolation between adjacent FAN_STOPS, so a fractional offset
 *  produces a smoothly-morphed transform — the key to the coverflow feel. */
export function posFromOffset(off: number): FanPos {
  const abs = Math.abs(off)
  const sign = off < 0 ? -1 : off > 0 ? 1 : 0
  const lo = Math.floor(abs)
  const hi = Math.min(lo + 1, FAN_STOPS.length - 1)
  const t = Math.min(1, abs - lo)
  const a = FAN_STOPS[Math.min(lo, FAN_STOPS.length - 1)]
  const b = FAN_STOPS[hi]
  const lerp = (x: number, y: number) => x + (y - x) * t
  return {
    tx: sign * lerp(a.tx, b.tx),
    tz: lerp(a.tz, b.tz),
    ry: sign * lerp(a.ry, b.ry),
    sc: lerp(a.sc, b.sc),
    op: lerp(a.op, b.op),
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/lotaanidi/Documents/Projects/stampstack && npx vitest run src/__tests__/fan-stops.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/fan-stops.ts src/__tests__/fan-stops.test.ts
git commit -m "feat: fan positioning math (posFromOffset, FAN_STOPS)"
```

### Task 4: Release decision math (`release.ts`)

**Files:**
- Create: `/Users/lotaanidi/Documents/Projects/stampstack/src/release.ts`
- Test: `/Users/lotaanidi/Documents/Projects/stampstack/src/__tests__/release.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/__tests__/release.test.ts
import { describe, it, expect } from 'vitest'
import { computeReleaseFocus } from '../release'

const base = { cardStep: 270, startFocus: 3, itemCount: 10, moved: true }

describe('computeReleaseFocus', () => {
  it('does not move when the gesture never crossed the dead zone', () => {
    expect(computeReleaseFocus({ ...base, delta: 200, duration: 100, moved: false })).toBe(3)
  })

  it('advances one card on a fast flick to the left (negative delta)', () => {
    // <300ms and >20px dragged left → focus moves forward by 1
    expect(computeReleaseFocus({ ...base, delta: -40, duration: 150 })).toBe(4)
  })

  it('advances one card on a fast flick to the right (positive delta)', () => {
    expect(computeReleaseFocus({ ...base, delta: 40, duration: 150 })).toBe(2)
  })

  it('moves by rounded step count on a slow long drag', () => {
    // 600px left over 800ms, step 270 → round(600/270)=2 → focus 3+2=5
    expect(computeReleaseFocus({ ...base, delta: -600, duration: 800 })).toBe(5)
  })

  it('snaps back when neither a flick nor a half-step drag', () => {
    // slow (>=300ms) and only 30px (< 135 = half step) → no move
    expect(computeReleaseFocus({ ...base, delta: -30, duration: 800 })).toBe(3)
  })

  it('clamps at the start edge', () => {
    expect(computeReleaseFocus({ ...base, startFocus: 0, delta: 40, duration: 150 })).toBe(0)
  })

  it('clamps at the end edge', () => {
    expect(computeReleaseFocus({ ...base, startFocus: 9, delta: -40, duration: 150 })).toBe(9)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/lotaanidi/Documents/Projects/stampstack && npx vitest run src/__tests__/release.test.ts`
Expected: FAIL — "Cannot find module '../release'".

- [ ] **Step 3: Write the implementation (ported from CityGalleryStamp.tsx lines 286–307)**

```ts
// src/release.ts

export interface ReleaseInput {
  delta: number      // clientX - startX (px). Negative = dragged left.
  duration: number   // ms the pointer was down
  cardStep: number   // px between adjacent card centers (CARD_STEP)
  startFocus: number // focusIndex when the drag began
  itemCount: number  // total number of cards
  moved: boolean     // did the drag cross the 6px dead zone?
}

/**
 * Decide the new focus index after a drag is released. Ported from Swiper's
 * short-swipe / long-swipe rules:
 *   - flick:     <300ms AND >20px → advance exactly 1 in the drag direction
 *   - long drag: >=50% of a card step → advance by the rounded step count
 *   - otherwise: snap back to the starting focus
 * The result is always clamped to [0, itemCount - 1].
 */
export function computeReleaseFocus({
  delta,
  duration,
  cardStep,
  startFocus,
  itemCount,
  moved,
}: ReleaseInput): number {
  const absDelta = Math.abs(delta)
  let shift = 0

  if (moved) {
    if (duration < 300 && absDelta > 20) {
      // Dragging left (negative delta) advances focus forward (+1).
      shift = delta < 0 ? 1 : -1
    } else if (absDelta > cardStep * 0.5) {
      shift = Math.round(-delta / cardStep)
    }
  }

  const next = startFocus + shift
  return Math.max(0, Math.min(itemCount - 1, next))
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/lotaanidi/Documents/Projects/stampstack && npx vitest run src/__tests__/release.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/release.ts src/__tests__/release.test.ts
git commit -m "feat: pure release decision math (flick/long-drag/snap + clamp)"
```

### Task 5: Click hit-testing math (`hit-test.ts`)

**Files:**
- Create: `/Users/lotaanidi/Documents/Projects/stampstack/src/hit-test.ts`
- Test: `/Users/lotaanidi/Documents/Projects/stampstack/src/__tests__/hit-test.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/__tests__/hit-test.test.ts
import { describe, it, expect } from 'vitest'
import { hitTest } from '../hit-test'
import { CARD_STEP, CARD_BASELINE_Y } from '../fan-stops'

const base = {
  focusIndex: 2,
  dragDx: 0,
  itemCount: 6,
  cardWidth: 260,
  cardStep: CARD_STEP,
  baselineY: CARD_BASELINE_Y,
}

describe('hitTest', () => {
  it('returns the focused card index for a click at the center (0,0)', () => {
    expect(hitTest({ ...base, localX: 0, localY: CARD_BASELINE_Y })).toBe(2)
  })

  it('returns -1 for a click far above every card (empty space)', () => {
    expect(hitTest({ ...base, localX: 0, localY: -1000 })).toBe(-1)
  })

  it('returns -1 for a click far to the right of the fan', () => {
    expect(hitTest({ ...base, localX: 5000, localY: CARD_BASELINE_Y })).toBe(-1)
  })

  it('prefers the front-most card when boxes overlap near the focused card', () => {
    // A click just right of center still lands on the focused card (front-most),
    // not the card behind it.
    const hit = hitTest({ ...base, localX: 30, localY: CARD_BASELINE_Y })
    expect(hit).toBe(2)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/lotaanidi/Documents/Projects/stampstack && npx vitest run src/__tests__/hit-test.test.ts`
Expected: FAIL — "Cannot find module '../hit-test'".

- [ ] **Step 3: Write the implementation (ported from CityGalleryStamp.tsx lines 155–208, with STAMP_ASPECT)**

```ts
// src/hit-test.ts
import { posFromOffset } from './fan-stops'

/** Stamp outline aspect ratio (width / height), from the Figma-authored path. */
const STAMP_ASPECT = 277.508 / 316.88

export interface HitTestInput {
  localX: number      // click X relative to scene center
  localY: number      // click Y relative to scene center
  focusIndex: number
  dragDx: number      // live drag pixel offset (0 when not dragging)
  itemCount: number
  cardWidth: number
  cardStep: number    // CARD_STEP
  baselineY: number   // CARD_BASELINE_Y
}

/**
 * Compute which card sits under a scene-local click. We do NOT trust the
 * browser's 3D hit-test (it picks the card closest in z-depth, not the one the
 * user sees on top). Instead we recompute each visible card's on-screen box and
 * return the front-most (smallest |offset|) card whose box contains the click,
 * or -1 for empty space.
 */
export function hitTest({
  localX,
  localY,
  focusIndex,
  dragDx,
  itemCount,
  cardWidth,
  cardStep,
  baselineY,
}: HitTestInput): number {
  const cardHeight = cardWidth / STAMP_ASPECT

  let hitIndex = -1
  let hitAbs = Infinity

  for (let i = 0; i < itemCount; i++) {
    const off = i - focusIndex + dragDx / cardStep
    const absOff = Math.abs(off)
    if (absOff > 5) continue // far-back cards are invisible/non-interactive

    const p = posFromOffset(off)

    // A rotated card looks NARROWER than its true width — narrow the hit box by
    // |cos(rotateY)| so adjacent rotated cards' boxes don't overlap visually.
    const rotationCos = Math.abs(Math.cos((p.ry * Math.PI) / 180))
    const halfW = (cardWidth * p.sc * rotationCos) / 2
    // rotateY spins around the vertical axis, so on-screen height is unchanged.
    const halfH = (cardHeight * p.sc) / 2

    const withinX = Math.abs(localX - p.tx) <= halfW
    const withinY = Math.abs(localY - baselineY) <= halfH

    if (withinX && withinY && absOff < hitAbs) {
      hitAbs = absOff
      hitIndex = i
    }
  }

  return hitIndex
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/lotaanidi/Documents/Projects/stampstack && npx vitest run src/__tests__/hit-test.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/hit-test.ts src/__tests__/hit-test.test.ts
git commit -m "feat: pure click hit-testing math with rotation correction"
```

---

## Phase 2 — Frame and types

### Task 6: Stamp vector tokens (`stamp.ts`)

**Files:**
- Create: `/Users/lotaanidi/Documents/Projects/stampstack/src/stamp.ts`

- [ ] **Step 1: Write the file (port `STAMP_VIEWBOX`, `STAMP_ASPECT`, and `STAMP_FRAME_PATH` verbatim from tennis-directory/src/lib/stamp.ts lines 38–45)**

> NOTE: `STAMP_FRAME_PATH` is a long single-line SVG path string. Copy it **exactly** from `tennis-directory/src/lib/stamp.ts` line 45 — do not retype or reformat it. The colorway exports from that file are intentionally NOT ported (deferred to v2).

```ts
// src/stamp.ts

/** Native viewBox of the Figma-authored stamp outline. */
export const STAMP_VIEWBOX = '0 0 277.508 316.88'

/** Aspect ratio (width / height) of the stamp outline — portrait. */
export const STAMP_ASPECT = 277.508 / 316.88

/** The scalloped postage-stamp outline, as a single fillable SVG path.
 *  Copied verbatim from tennis-directory/src/lib/stamp.ts (do not edit). */
export const STAMP_FRAME_PATH =
  "M14.9835 0.624149C14.9839 5.46953 ... Z" // <-- PASTE THE FULL PATH STRING HERE
```

- [ ] **Step 2: Typecheck**

Run: `cd /Users/lotaanidi/Documents/Projects/stampstack && npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/stamp.ts
git commit -m "feat: port scalloped stamp SVG vector tokens"
```

### Task 7: Public types (`types.ts`)

**Files:**
- Create: `/Users/lotaanidi/Documents/Projects/stampstack/src/types.ts`

- [ ] **Step 1: Write the file**

```ts
// src/types.ts
import type { ReactNode, CSSProperties } from 'react'

/** A carousel item. The library only requires `id`; every other field is yours,
 *  read by your own renderStamp. The library does not render item fields. */
export type StampItem = { id: string } & Record<string, unknown>

/** State the engine hands to your content each render so it can react to focus/depth. */
export interface StampState {
  focused: boolean   // is this the front, centered card?
  index: number      // this card's index in `items`
  offset: number     // fractional distance from focus (0 = focused; +/- = right/left)
}

export interface StampStackProps<T extends { id: string }> {
  items: T[]
  /** Fill each stamp with your own DOM. Library positions/animates the result. */
  renderStamp: (item: T, state: StampState) => ReactNode
  /** Fires on a genuine tap of a visible card (never at the end of a drag). */
  onSelect?: (item: T, index: number) => void
  /** Fires when the focused card changes (mount + each change). */
  onFocusChange?: (index: number) => void
  initialIndex?: number      // default 0
  cardWidth?: number         // default 260 (px)
  className?: string         // passthrough on the scene element
  style?: CSSProperties      // passthrough on the scene element
}
```

- [ ] **Step 2: Typecheck**

Run: `cd /Users/lotaanidi/Documents/Projects/stampstack && npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/types.ts
git commit -m "feat: public types (StampItem, StampState, StampStackProps)"
```

### Task 8: Frame component (`StampFrame.tsx`)

**Files:**
- Create: `/Users/lotaanidi/Documents/Projects/stampstack/src/StampFrame.tsx`

- [ ] **Step 1: Write the file (adapted from CityGalleryStamp.tsx StampFrame + inner card, lines 20–31 & 435–441)**

```tsx
// src/StampFrame.tsx
import type { ReactNode } from 'react'
import { STAMP_VIEWBOX, STAMP_FRAME_PATH } from './stamp'

/**
 * The library-owned card: the fixed scalloped frame (the signature) plus an
 * inner content slot. Consumer content is rendered into `.stampstack-content`.
 * Frame color comes from the CSS variable --stampstack-frame (see styles.css).
 */
export function StampFrame({ children }: { children?: ReactNode }) {
  return (
    <div className="stampstack-card">
      <svg
        className="stampstack-frame"
        viewBox={STAMP_VIEWBOX}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path d={STAMP_FRAME_PATH} fill="var(--stampstack-frame, #295df6)" />
      </svg>
      <div className="stampstack-content">{children}</div>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `cd /Users/lotaanidi/Documents/Projects/stampstack && npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/StampFrame.tsx
git commit -m "feat: stamp frame component with content slot"
```

---

## Phase 3 — Hook, styles, component

### Task 9: Mechanics hook (`useStampFan.ts`)

**Files:**
- Create: `/Users/lotaanidi/Documents/Projects/stampstack/src/useStampFan.ts`

- [ ] **Step 1: Write the file (composes the pure helpers; ported from CityGalleryStamp.tsx lines 93–338)**

```tsx
// src/useStampFan.ts
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react'
import { posFromOffset, CARD_STEP, CARD_BASELINE_Y } from './fan-stops'
import { computeReleaseFocus } from './release'
import { hitTest } from './hit-test'
import type { StampState } from './types'

export interface UseStampFanOptions {
  itemCount: number
  initialIndex?: number
  cardWidth?: number
  onSelect?: (index: number) => void
  onFocusChange?: (index: number) => void
}

export interface UseStampFanResult {
  focusIndex: number
  sceneRef: RefObject<HTMLDivElement | null>
  getCardStyle: (index: number) => CSSProperties
  getCardState: (index: number) => StampState
  isInteractive: (index: number) => boolean
  onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void
  onSceneClick: (e: ReactMouseEvent<HTMLDivElement>) => void
  handleCardKeyDown: (index: number, e: ReactKeyboardEvent) => void
}

export function useStampFan({
  itemCount,
  initialIndex = 0,
  cardWidth = 260,
  onSelect,
  onFocusChange,
}: UseStampFanOptions): UseStampFanResult {
  const sceneRef = useRef<HTMLDivElement | null>(null)
  const [focusIndex, setFocusIndex] = useState(initialIndex)
  // Live pixel offset during a drag; non-zero only while dragging.
  const [dragDx, setDragDx] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragState = useRef<{ startX: number; startFocus: number; startTime: number; moved: boolean } | null>(null)
  // Set on pointerup when a drag moved, so the follow-up click is suppressed.
  const suppressNextClick = useRef(false)

  // Tell the consumer when focus changes (replaces the original's router.prefetch).
  useEffect(() => {
    onFocusChange?.(focusIndex)
  }, [focusIndex, onFocusChange])

  const navLeft = useCallback(() => setFocusIndex((i) => Math.max(0, i - 1)), [])
  const navRight = useCallback(() => setFocusIndex((i) => Math.min(itemCount - 1, i + 1)), [itemCount])

  const activate = useCallback(
    (index: number) => {
      if (suppressNextClick.current) {
        suppressNextClick.current = false
        return
      }
      onSelect?.(index)
    },
    [onSelect],
  )

  const onSceneClick = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (suppressNextClick.current) {
        suppressNextClick.current = false
        return
      }
      const scene = sceneRef.current
      if (!scene) return
      const rect = scene.getBoundingClientRect()
      const localX = e.clientX - (rect.left + rect.width / 2)
      const localY = e.clientY - (rect.top + rect.height / 2)
      const hit = hitTest({
        localX,
        localY,
        focusIndex,
        dragDx,
        itemCount,
        cardWidth,
        cardStep: CARD_STEP,
        baselineY: CARD_BASELINE_Y,
      })
      if (hit === -1) return
      activate(hit)
    },
    [focusIndex, dragDx, itemCount, cardWidth, activate],
  )

  const handleCardKeyDown = useCallback(
    (index: number, e: ReactKeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        activate(index)
      }
    },
    [activate],
  )

  // Window keyboard nav: arrows move focus, Enter opens the focused card.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return
      if (e.key === 'ArrowLeft') return navLeft()
      if (e.key === 'ArrowRight') return navRight()
      if (e.key === 'Enter') {
        const active = document.activeElement as HTMLElement | null
        // If a specific card is tab-focused, its own onKeyDown handles Enter.
        if (active && sceneRef.current?.contains(active)) return
        activate(focusIndex)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navLeft, navRight, focusIndex, activate])

  // Pointer drag: live finger-following + Swiper-style release.
  useEffect(() => {
    function onMove(e: PointerEvent) {
      const state = dragState.current
      if (!state) return
      const raw = e.clientX - state.startX
      // Stay inert below the 6px dead zone so taps stay stable.
      if (!state.moved) {
        if (Math.abs(raw) <= 6) return
        state.moved = true
        setIsDragging(true)
      }
      // Edge rubber-banding: damp movement past the first/last card.
      let damped = raw
      const atStart = state.startFocus === 0
      const atEnd = state.startFocus === itemCount - 1
      if ((atStart && raw > 0) || (atEnd && raw < 0)) damped = raw * 0.4
      setDragDx(damped)
    }
    function onUp(e: PointerEvent) {
      const state = dragState.current
      if (!state) return
      dragState.current = null
      if (sceneRef.current) sceneRef.current.style.cursor = 'grab'

      const delta = e.clientX - state.startX
      const next = computeReleaseFocus({
        delta,
        duration: Date.now() - state.startTime,
        cardStep: CARD_STEP,
        startFocus: state.startFocus,
        itemCount,
        moved: state.moved,
      })
      // Suppress the follow-up click only if focus actually changed.
      if (next !== state.startFocus) suppressNextClick.current = true
      setFocusIndex(next)
      setIsDragging(false)
      setDragDx(0)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [itemCount])

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      dragState.current = { startX: e.clientX, startFocus: focusIndex, startTime: Date.now(), moved: false }
      // Reset stale suppression so the next real tap is never eaten.
      suppressNextClick.current = false
      setIsDragging(true)
      if (sceneRef.current) sceneRef.current.style.cursor = 'grabbing'
    },
    [focusIndex],
  )

  const getCardState = useCallback(
    (index: number): StampState => {
      const offset = index - focusIndex + dragDx / CARD_STEP
      return { focused: Math.round(offset) === 0, index, offset }
    },
    [focusIndex, dragDx],
  )

  const getCardStyle = useCallback(
    (index: number): CSSProperties => {
      const off = index - focusIndex + dragDx / CARD_STEP
      const abs = Math.abs(off)
      const p = posFromOffset(off)
      const interactive = p.op > 0.1
      return {
        width: `${cardWidth}px`,
        transition: isDragging
          ? 'none'
          : 'transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.45s cubic-bezier(0.25,0.46,0.45,0.94)',
        transform: `translateY(${CARD_BASELINE_Y}px) translateX(${p.tx}px) translateZ(${p.tz}px) rotateY(${p.ry}deg) scale(${p.sc})`,
        opacity: p.op,
        zIndex: itemCount - Math.round(abs),
        pointerEvents: interactive ? 'auto' : 'none',
      }
    },
    [focusIndex, dragDx, isDragging, cardWidth, itemCount],
  )

  const isInteractive = useCallback(
    (index: number) => posFromOffset(index - focusIndex + dragDx / CARD_STEP).op > 0.1,
    [focusIndex, dragDx],
  )

  return {
    focusIndex,
    sceneRef,
    getCardStyle,
    getCardState,
    isInteractive,
    onPointerDown,
    onSceneClick,
    handleCardKeyDown,
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `cd /Users/lotaanidi/Documents/Projects/stampstack && npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/useStampFan.ts
git commit -m "feat: useStampFan mechanics hook composing the pure helpers"
```

### Task 10: Frame stylesheet (`styles.css`)

**Files:**
- Create: `/Users/lotaanidi/Documents/Projects/stampstack/src/styles.css`

- [ ] **Step 1: Write the file (frame-only; CSS variables; no font; inner content inset from CityGalleryStamp.tsx line 437)**

```css
/* stampstack — frame theme. The library imposes NO content styling and NO font;
   your renderStamp content brings its own. Override any variable to retheme. */

.stampstack {
  --stampstack-frame: #295df6;          /* frame fill color */
  --stampstack-radius: 21px;            /* inner content-area corner radius */
  --stampstack-ease: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --stampstack-perspective: 1200px;

  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24rem;
  overflow: hidden;
}

.stampstack-scene {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  cursor: grab;
  user-select: none;
  touch-action: pan-y;                  /* page scrolls vertically; we own horizontal drag */
  perspective: var(--stampstack-perspective);
}

.stampstack-track {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

/* Each positioned card wrapper gets its transform inline from getCardStyle. */
.stampstack-card {
  position: relative;
  width: 100%;
  aspect-ratio: 277.508 / 316.88;       /* the stamp outline's native ratio */
}

.stampstack-frame {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  user-select: none;
}

/* The slot your content renders into — inset to sit inside the scalloped edge. */
.stampstack-content {
  position: absolute;
  inset: 7.85% 6.35%;
  overflow: clip;
  border-radius: var(--stampstack-radius);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles.css
git commit -m "feat: frame-only stylesheet with CSS-variable theming"
```

### Task 11: The component + barrel export (`StampStack.tsx`, `index.ts`)

**Files:**
- Create: `/Users/lotaanidi/Documents/Projects/stampstack/src/StampStack.tsx`
- Create: `/Users/lotaanidi/Documents/Projects/stampstack/src/index.ts`
- Test: `/Users/lotaanidi/Documents/Projects/stampstack/src/__tests__/StampStack.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/__tests__/StampStack.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StampStack } from '../StampStack'

const items = [
  { id: 'lagos', title: 'Lagos' },
  { id: 'abuja', title: 'Abuja' },
  { id: 'kano', title: 'Kano' },
]

function renderStamp(item: { id: string; title: string }) {
  return <span>{item.title}</span>
}

describe('StampStack', () => {
  it('calls renderStamp for every item and renders its content', () => {
    render(<StampStack items={items} renderStamp={renderStamp} />)
    expect(screen.getByText('Lagos')).toBeInTheDocument()
    expect(screen.getByText('Abuja')).toBeInTheDocument()
    expect(screen.getByText('Kano')).toBeInTheDocument()
  })

  it('marks the focused card with state.focused = true via renderStamp', () => {
    const spy = vi.fn((item: { id: string; title: string }) => <span>{item.title}</span>)
    render(<StampStack items={items} renderStamp={spy} initialIndex={1} />)
    // The item at initialIndex 1 (Abuja) should have been called with focused=true.
    const abujaCall = spy.mock.calls.find(([item]) => item.id === 'abuja')
    expect(abujaCall?.[1]).toMatchObject({ focused: true, index: 1 })
  })

  it('fires onFocusChange on mount with the initial index', () => {
    const onFocusChange = vi.fn()
    render(<StampStack items={items} renderStamp={renderStamp} initialIndex={2} onFocusChange={onFocusChange} />)
    expect(onFocusChange).toHaveBeenCalledWith(2)
  })

  it('moves focus right on ArrowRight and reports it', () => {
    const onFocusChange = vi.fn()
    render(<StampStack items={items} renderStamp={renderStamp} initialIndex={0} onFocusChange={onFocusChange} />)
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(onFocusChange).toHaveBeenLastCalledWith(1)
  })

  it('opens the focused card via window Enter', () => {
    const onSelect = vi.fn()
    render(<StampStack items={items} renderStamp={renderStamp} initialIndex={1} onSelect={onSelect} />)
    fireEvent.keyDown(window, { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledWith(items[1], 1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/lotaanidi/Documents/Projects/stampstack && npx vitest run src/__tests__/StampStack.test.tsx`
Expected: FAIL — "Cannot find module '../StampStack'".

- [ ] **Step 3: Write `StampStack.tsx` (ported render loop from CityGalleryStamp.tsx lines 340–407)**

```tsx
// src/StampStack.tsx
import { useStampFan } from './useStampFan'
import { StampFrame } from './StampFrame'
import type { StampStackProps } from './types'

export function StampStack<T extends { id: string }>({
  items,
  renderStamp,
  onSelect,
  onFocusChange,
  initialIndex = 0,
  cardWidth = 260,
  className,
  style,
}: StampStackProps<T>) {
  const fan = useStampFan({
    itemCount: items.length,
    initialIndex,
    cardWidth,
    onSelect: onSelect ? (i) => onSelect(items[i], i) : undefined,
    onFocusChange,
  })

  return (
    <div className={className ? `stampstack ${className}` : 'stampstack'} style={style}>
      <div
        ref={fan.sceneRef}
        onPointerDown={fan.onPointerDown}
        onClick={fan.onSceneClick}
        className="stampstack-scene"
      >
        <div className="stampstack-track">
          {items.map((item, index) => {
            const state = fan.getCardState(index)
            const interactive = fan.isInteractive(index)
            return (
              <div
                key={item.id}
                role="button"
                tabIndex={interactive ? 0 : -1}
                aria-current={state.focused ? 'true' : undefined}
                onKeyDown={(e) => fan.handleCardKeyDown(index, e)}
                className="stampstack-card-wrapper"
                style={{ position: 'absolute', willChange: 'transform', ...fan.getCardStyle(index) }}
              >
                <StampFrame>{renderStamp(item, state)}</StampFrame>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Write `index.ts`**

```ts
// src/index.ts
export { StampStack } from './StampStack'
export type { StampItem, StampState, StampStackProps } from './types'
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd /Users/lotaanidi/Documents/Projects/stampstack && npx vitest run src/__tests__/StampStack.test.tsx`
Expected: PASS (5 tests).

- [ ] **Step 6: Run the full suite + typecheck**

Run: `cd /Users/lotaanidi/Documents/Projects/stampstack && npx vitest run && npx tsc --noEmit`
Expected: all tests pass (5 files), typecheck exits 0.

- [ ] **Step 7: Commit**

```bash
git add src/StampStack.tsx src/index.ts src/__tests__/StampStack.test.tsx
git commit -m "feat: StampStack component + public exports"
```

---

## Phase 4 — Build, demo, docs

### Task 12: Build the package and verify output

**Files:**
- (No source changes — verifies the build emits correct artifacts.)

- [ ] **Step 1: Run the build**

Run: `cd /Users/lotaanidi/Documents/Projects/stampstack && npm run build`
Expected: build succeeds, `dist/` contains `index.js`, `index.cjs`, `index.d.ts`, and `styles.css`.

- [ ] **Step 2: Verify the artifacts exist**

Run: `ls /Users/lotaanidi/Documents/Projects/stampstack/dist`
Expected output includes: `index.js  index.cjs  index.d.ts  styles.css`

- [ ] **Step 3: Verify the type entry exports the public API**

Run: `grep -c "StampStack" /Users/lotaanidi/Documents/Projects/stampstack/dist/index.d.ts`
Expected: a count of 1 or more (the `StampStack` export is present in the type declarations).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: verify build output (dist artifacts)" --allow-empty
```

### Task 13: Demo playground (Vite) — proves the bring-your-own-content model

**Files:**
- Create: `/Users/lotaanidi/Documents/Projects/stampstack/demo/index.html`
- Create: `/Users/lotaanidi/Documents/Projects/stampstack/demo/main.tsx`

- [ ] **Step 1: Write `demo/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>stampstack demo</title>
    <style>
      body { margin: 0; font-family: system-ui, sans-serif; background: #fafafa; }
      #root { max-width: 900px; margin: 4rem auto; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Write `demo/main.tsx` (the consumer supplies tennis-style content + its own colorway)**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { StampStack } from '../src/index'
import '../src/styles.css'

// A consumer-defined palette — proving colors live in consumer-land, not the library.
const PALETTE = ['#295df6', '#c6a0fd', '#5cd500', '#ff7a45', '#ff3e8c', '#00c9a7']
function colorFor(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length]
}

const cities = [
  { id: 'lagos', name: 'Lagos', courts: 12 },
  { id: 'abuja', name: 'Abuja', courts: 7 },
  { id: 'kano', name: 'Kano', courts: 3 },
  { id: 'ibadan', name: 'Ibadan', courts: 5 },
  { id: 'phc', name: 'Port Harcourt', courts: 4 },
]

function App() {
  return (
    <StampStack
      items={cities}
      onSelect={(c) => alert(`Open ${c.name}`)}
      renderStamp={(city, state) => (
        <div
          style={{
            // The consumer styles the FRAME color per-stamp from its own data:
            ['--stampstack-frame' as string]: colorFor(city.id),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            opacity: state.focused ? 1 : 0.85,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <strong style={{ fontSize: 20, color: '#404040' }}>{city.name}</strong>
          <span style={{ fontSize: 12, color: '#888' }}>{city.courts} Courts</span>
        </div>
      )}
    />
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

> NOTE on per-stamp frame color: setting `--stampstack-frame` on the content wrapper re-colors that card's frame because the frame's `fill` reads the variable via inheritance through the card subtree. If a future change scopes the variable differently, set it on `.stampstack-card-wrapper` via a consumer class instead.

- [ ] **Step 3: Run the demo and verify by eye**

Run: `cd /Users/lotaanidi/Documents/Projects/stampstack && npm run dev`
Expected: Vite serves at `http://localhost:5173`; the fan renders, drag/flick works, arrow keys move focus, clicking a visible card alerts its name, and each stamp's frame shows a different color.

- [ ] **Step 4: Commit**

```bash
git add demo/index.html demo/main.tsx
git commit -m "docs: Vite demo proving bring-your-own-content model"
```

### Task 14: README

**Files:**
- Create: `/Users/lotaanidi/Documents/Projects/stampstack/README.md`

- [ ] **Step 1: Write `README.md`**

````markdown
# stampstack

A draggable 3D coverflow of scalloped postage-stamp cards. The library owns the
stamp frame and the fan mechanics; **you bring the content.**

## Install

```bash
npm install stampstack
```

## Usage

```tsx
import { StampStack } from 'stampstack'
import 'stampstack/styles.css'

const items = [
  { id: 'lagos', name: 'Lagos' },
  { id: 'abuja', name: 'Abuja' },
]

<StampStack
  items={items}
  renderStamp={(item, state) => (
    <div style={{ opacity: state.focused ? 1 : 0.8 }}>{item.name}</div>
  )}
  onSelect={(item) => console.log('open', item.id)}
/>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `T[]` (each needs `id`) | — | Your data. Only `id` is required. |
| `renderStamp` | `(item, state) => ReactNode` | — | Fills each stamp with your DOM. |
| `onSelect` | `(item, index) => void` | — | Fires on a genuine tap of a visible card. |
| `onFocusChange` | `(index) => void` | — | Fires when the focused card changes. |
| `initialIndex` | `number` | `0` | Which card starts focused. |
| `cardWidth` | `number` | `260` | Card width in px. |

`state` is `{ focused, index, offset }` — use it to dim or change content on
non-focused cards.

## Theming

Import `stampstack/styles.css` for the frame, then override CSS variables:

```css
.stampstack {
  --stampstack-frame: hotpink;
  --stampstack-radius: 16px;
}
```

The library sets **no font** — your `renderStamp` content brings its own.

## Controls

- **Drag / flick** to move through the fan
- **Arrow keys** move focus; **Enter** opens the focused card
- **Click** a visible card to open it
````

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README"
```

---

## Phase 5 — Consumer validation (optional, separate repo)

### Task 15: Wire the tennis app to consume stampstack

> This task modifies the **tennis-directory** repo, not the stampstack repo. Do it
> only after stampstack builds and its demo works. It is the real proof of
> decoupling: the original app re-consumes the extracted library with its own
> `renderStamp`.

**Files (in tennis-directory):**
- Modify: `tennis-directory/src/components/CityGalleryStamp.tsx`
- Modify: `tennis-directory/package.json`

- [ ] **Step 1: Add stampstack as a local dependency**

Run (in tennis-directory):
`npm install /Users/lotaanidi/Documents/Projects/stampstack`
Expected: `package.json` gains `"stampstack": "file:../stampstack"` (or the absolute path), `node_modules/stampstack` is linked.

- [ ] **Step 2: Replace the hand-rolled fan with the library**

Rewrite `CityGalleryStamp.tsx` to delegate to `StampStack`, supplying the tennis content (title + court-count pill + colorway) through `renderStamp`, and mapping `onSelect`/`onFocusChange` to `router.push`/`router.prefetch`:

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { StampStack } from 'stampstack'
import 'stampstack/styles.css'
import type { CityInfo } from '@/lib/types'
import { pickColorway } from '@/lib/stamp'

export default function CityGalleryStamp({ cities }: { cities: CityInfo[] }) {
  const router = useRouter()
  return (
    <StampStack
      items={cities.map((c) => ({ ...c, id: c.slug }))}
      onSelect={(city) => router.push(`/city/${city.slug}`)}
      onFocusChange={(i) => {
        for (const idx of [i - 1, i, i + 1]) {
          const c = cities[idx]
          if (c) router.prefetch(`/city/${c.slug}`)
        }
      }}
      renderStamp={(city) => {
        const colors = pickColorway(city.slug)
        return (
          <div
            style={{ ['--stampstack-frame' as string]: colors.border, height: '100%' }}
            className="flex flex-col items-center justify-center"
          >
            <h3 className="font-[family-name:var(--font-open-runde)] font-semibold text-[#404040]">
              {city.name}
            </h3>
            <span style={{ backgroundColor: colors.pillBg, color: colors.pillText }} className="rounded-full px-2 text-xs font-semibold">
              {city.count} {city.count === 1 ? 'Court' : 'Courts'}
            </span>
          </div>
        )
      }}
    />
  )
}
```

- [ ] **Step 3: Verify the homepage still renders the gallery**

Run (in tennis-directory): `npm run dev`, open `http://localhost:3000`, toggle to Gallery.
Expected: the stamp fan renders and behaves as before (drag, flick, keyboard, tap-to-open), now powered by the published library.

- [ ] **Step 4: Run the tennis app's existing tests**

Run (in tennis-directory): `npx vitest run`
Expected: existing suite passes.

- [ ] **Step 5: Commit (in tennis-directory, on a feature branch)**

```bash
git add src/components/CityGalleryStamp.tsx package.json package-lock.json
git commit -m "refactor: consume stampstack library for the homepage gallery"
```

---

## Self-Review (completed by plan author)

**Spec coverage:**
- §1/§2 philosophy (engine ships, content is consumer's) → Tasks 8, 9, 11 (frame + renderStamp).
- §3 non-goals (no router, fixed vector, no font, no colorway, no autoplay) → honored: no router import; `STAMP_FRAME_PATH` hard-coded (Task 6); no font in `styles.css` (Task 10); colorway absent (noted Task 6).
- §4 public API → Task 7 (types) + Task 11 (component); `onSelect`/`onFocusChange`/`renderStamp`/`state` all present.
- §5 card anatomy → Task 8 (`StampFrame` = frame + content slot) + Task 10 (inset CSS).
- §6 internal structure → file map matches (Tasks 3–11); `useStampFan` isolated (Task 9).
- §7 mechanics → Tasks 3, 4, 5 (pure math) composed in Task 9.
- §8 styling/CSS-var theming + CSS-from-package import → Task 10 + Task 1 (`exports` map).
- §9 testing → Tasks 3, 4, 5 (math units), Task 11 (component: renderStamp/keyboard/focus/select). Note: pointer-drag DOM simulation is intentionally NOT tested in jsdom (PointerEvent + getBoundingClientRect are unreliable there); the drag *decision* logic is fully covered by the pure `computeReleaseFocus`/`hitTest` tests, and the live drag is verified by eye in the Task 13 demo.
- §11 tooling/packaging (tsup, Vitest, exports, demo, tennis consumer) → Tasks 1, 2, 12, 13, 15.

**Placeholder scan:** One deliberate copy-marker — the `STAMP_FRAME_PATH` string in Task 6 is too long to inline and must be copied verbatim from the named source file/line. This is an explicit copy instruction, not a vague placeholder.

**Type consistency:** `FanPos`, `posFromOffset`, `CARD_STEP`, `CARD_BASELINE_Y`, `computeReleaseFocus`/`ReleaseInput`, `hitTest`/`HitTestInput`, `StampState`, `StampItem`, `StampStackProps`, `UseStampFanResult` are defined once (file-structure contract) and used with identical signatures in every task that references them. `useStampFan`'s internal `onSelect: (index) => void` is correctly adapted by `StampStack` to the public `onSelect: (item, index) => void`.
