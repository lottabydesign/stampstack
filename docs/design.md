# stampstack — Design Spec

**Date:** 2026-06-08
**Status:** Approved design, pre-implementation
**Author:** Lota (with Claude)

## 1. Summary

`stampstack` is a standalone, publishable React component library: a 3D
coverflow carousel of scalloped postage-stamp cards that the user drags, flicks,
or arrow-keys through. It is extracted from the hand-rolled carousel currently
living in `CityGalleryStamp.tsx` in the tennis-directory project.

The design philosophy follows [cobe](https://github.com/shuding/cobe): **the
engine ships and just works; the visible content and styling are the
consumer's.** The library owns the fixed scalloped stamp *frame* and the fan
*mechanics*. The consumer renders whatever content they want *inside* each stamp
via a render function — their text, their font, their layout. The library imposes
no content styling and no font.

The package is framework-agnostic: no router, no Next.js, no Tailwind. It depends
only on React.

## 2. Goals

- A drop-in `<StampStack>` component anyone can `npm install` and use; it renders
  working, fanned, interactive stamps on install (cobe-style "just works").
- Preserve the original's tactile feel: 3D fan, finger-following drag, flick /
  long-drag release rules, edge rubber-banding, keyboard navigation.
- Zero imposed styling on content; no imposed font. The consumer styles to taste.
- Distinctive by design: the scalloped stamp silhouette is the fixed signature.
- Clean internal seams so a headless hook *could* be exposed later without a
  breaking change.

## 3. Non-Goals (v1)

- No router integration, no tap-to-open, no `onSelect`. The carousel is a
  drag-only browse/display widget; cards are not buttons. If opening a card is
  needed, the consumer renders their own interactive element (e.g. a link) inside
  `renderStamp` content.
- No customizable frame vector — the stamp silhouette is hard-coded.
- No library-rendered text/labels — content (and therefore typography/font) is
  the consumer's, supplied via `renderStamp`.
- No per-item colorway palette in core (single themeable frame color only; see
  §10 for v2).
- No public headless-hook export (the hook exists internally but is not part of
  the public API in v1).
- No tennis-ball / court-pattern motif.
- No autoplay (see §10, documented for v2).
- No vertical orientation.

## 4. Public API

The entire public surface:

```tsx
import { StampStack } from 'stampstack'
import 'stampstack/styles.css'   // frame styling only — no content styling, no font

// The library requires only an `id` on each item; every other field is yours,
// read by your own renderStamp. The library neither knows nor renders them.
type StampItem = { id: string } & Record<string, unknown>

// State the engine hands to your content each render, so you can react to focus/depth.
interface StampState {
  focused: boolean   // is this the front, centered card?
  index: number      // this card's index in `items`
  offset: number     // fractional distance from focus (0 = focused; +/- = right/left)
}

interface StampStackProps<T extends { id: string }> {
  items: T[]
  renderStamp: (item: T, state: StampState) => React.ReactNode  // your content
  onFocusChange?: (index: number) => void   // fires when the focused card changes
  frameColor?: (item: T, state: StampState) => string  // per-stamp frame color (see §8)
  initialIndex?: number                      // default 0
  cardWidth?: number                         // default 260 (px)
  className?: string                         // passthrough on the scene element
  style?: React.CSSProperties                // passthrough on the scene element
}

<StampStack
  items={cities}
  renderStamp={(city, state) => <CityContent city={city} dim={!state.focused} />}
/>
```

- `renderStamp` is the core "bring-your-own content" hook (cobe's philosophy):
  the library renders the frame + content slot and positions it; the consumer
  fills the slot with any DOM.
- `state` lets the consumer adapt content to focus/depth (e.g. dim or hide
  detail on non-focused cards) — the role the original's opacity logic played,
  now handed to the consumer.
- `onFocusChange` replaces the original's hardcoded `router.prefetch` — the
  consumer decides what "focus" means (prefetch, analytics, nothing).
- The carousel is drag-only: there is no tap-to-open and no `onSelect`. To make a
  stamp openable, put an interactive element (link/button) in `renderStamp` content.

## 5. Card Anatomy

Every stamp is two layers:

1. **Frame layer (library-owned):** the fixed scalloped SVG silhouette (the
   signature) plus a white inner "paper" card inset inside it (the stamp's paper
   center), positioned and clipped for the consumer. Frame color is a themeable
   CSS variable (`--stampstack-frame`, per-stamp via the `frameColor` prop); the
   paper color is `--stampstack-card-bg` (default white).
2. **Content layer (consumer-owned):** the output of `renderStamp`, placed inside
   the inner area. The consumer owns its text, font, colors, and layout.

The fan engine applies the 3D transform and opacity to the whole card wrapper, so
consumer content fans and fades along with the frame automatically.

## 6. Internal Structure

One package, split into focused units:

```
src/
  StampStack.tsx     // the component: scene, render loop, pointer/keyboard wiring
  useStampFan.ts     // mechanics hook: focusIndex, dragDx, drag handlers
  fan-stops.ts       // FAN_STOPS table, posFromOffset(), CARD_STEP, CARD_BASELINE_Y
  StampFrame.tsx     // the scalloped frame SVG + inner content slot
  stamp.ts           // STAMP_FRAME_PATH, STAMP_VIEWBOX (ported from src/lib/stamp.ts)
  styles.css         // frame styling + CSS variables (no content styling, no font)
  index.ts           // exports StampStack and the StampItem/StampState types
```

`useStampFan` isolates the genuinely reusable "logic" (the math + gesture state).
Keeping it a clean internal unit means promoting it to a public headless hook in
a future version is additive, not breaking.

Note: the original's colorway/`pickColorway` logic is intentionally **not** ported
to v1 core — the frame is a single themeable color. (See §10 for the v2 colorway
option.)

## 7. Mechanics (ported from the original, decoupled)

These behaviors are preserved verbatim in spirit; the port only removes the
app-specific coupling (router, `CityInfo`, Tailwind, rendered labels):

- **Fan positioning:** `FAN_STOPS` lookup table of integer "stops"; `posFromOffset`
  linearly interpolates between adjacent stops so a fractional offset produces a
  smoothly-morphed transform (tx, tz, ry, sc, op).
- **Drag:** live finger-following via `dragDx` (transitions off during drag, on at
  release); 6px dead-zone before a drag is recognized (protects taps); edge
  rubber-banding at 40% resistance past the first/last card.
- **Release rules (from Swiper):** flick (<300ms and >20px → advance 1) or
  long-drag (>50% of card step → advance by rounded step count), else snap back.
- **Keyboard:** ArrowLeft/Right move focus; ignores events from form fields
  (INPUT/TEXTAREA/contentEditable). No Enter-to-open — the carousel is drag-only.

## 8. Styling & Theming

- The library ships a small **pure-CSS** stylesheet for the **frame only** —
  stable class names (`.stampstack`, `.stampstack-scene`, `.stampstack-card`,
  `.stampstack-frame`, `.stampstack-content`) and a minimal set of CSS variables.
- Themeable knobs (CSS custom properties on the root):
  - `--stampstack-frame` — the frame color (single default, restyle to taste)
  - `--stampstack-radius` — inner content-area corner radius
  - `--stampstack-ease` — the transition timing function
  - `--stampstack-perspective` — the 3D perspective depth
- **No font is set by the library** — it renders no text. The consumer's
  `renderStamp` content brings its own typography.
- **Live per-card transforms stay inline** (JS-computed every frame: tx/tz/ry/sc/op,
  opacity, z-index). Not themeable, intentionally.
- The stamp vector (`STAMP_FRAME_PATH`) is hard-coded — the fixed signature.
  Recoloring the frame is allowed (`--stampstack-frame`); reshaping it is not.
- Per-stamp frame colors: use the `frameColor?: (item, state) => string` prop.
  The returned value is applied as `--stampstack-frame` on the card *wrapper*
  (the common ancestor of the frame SVG and the content slot), so it cascades to
  the frame's `fill`. Note: setting the variable from inside `renderStamp` content
  does NOT work — content is a *sibling* of the frame, and CSS variables only
  inherit downward, never sideways. No imposed palette in v1 (see §10 for v2).
- Consumers import `styles.css` via the package's `exports` map
  (`import 'stampstack/styles.css'`) — the standard CSS-from-package pattern; it
  requires the consumer to have a bundler (Vite/webpack/Next), which is the norm.

## 9. Testing

- **Framework:** Vitest + React Testing Library (mirrors tennis-directory).
- **Unit tests (high value — the real "logic"):**
  - `posFromOffset` interpolation correctness (integer stops + fractional blends).
  - Release math: flick vs long-drag vs snap-back, including edge clamping.
- **Component tests:**
  - `renderStamp` is called with the correct item and `state` (focused/index/offset).
  - Arrow keys move focus (reported via `onFocusChange`).
  - `frameColor` is applied to the card wrapper as the `--stampstack-frame` variable.

## 10. Future (v2)

- **Colorway preset (opt-in).** Reintroduce the original's per-item palette as an
  opt-in: the engine hashes each item to a colorway slot, and the slot *colors*
  live as overridable CSS variables (`--stampstack-colorway-1…N`) so consumers can
  repaint or flatten the palette in CSS. Default off in favor of the single
  `--stampstack-frame` color; opt in for variety out of the box.
- **Autoplay (opt-in).** Add `autoPlay` (default off), `interval`, and
  `pauseOnInteraction` props. Core timer is small; pause-on-interaction (hover /
  drag / keyboard focus) and `prefers-reduced-motion` support are required for
  quality. End-of-list behavior: **bounce** (ping-pong) is cheap and natural for a
  linear fan and is the planned approach. True infinite-loop wrapping is
  explicitly out of scope — a linear fan has no seamless wrap, so it would require
  item virtualization/duplication and is a separate, larger effort.
- **Batteries-included content preset.** Optionally ship an example stamp-card
  content component (title + pill, the original look) as a separate import for
  people who want a pre-built default rather than writing `renderStamp` from
  scratch.
- **Public headless hook.** Promote `useStampFan` to a documented export for
  consumers who want to build a fully custom card on the mechanics. Additive,
  non-breaking.

## 11. Tooling & Packaging

- **Build:** `tsup` — emits ESM + CJS + `.d.ts` types from one config.
- **Peer dependencies:** `react` and `react-dom` (>= 18). Not bundled.
- **Exports map:** `"."` → the component entry; `"./styles.css"` → the frame theme.
- **Language:** TypeScript throughout. `interface` for object shapes (props,
  state), `type` for unions and the generic item.
- **Demo/docs:** a minimal Vite playground in the repo that builds the tennis
  stamp content (title + pill) on top of the library — proving the
  `renderStamp` model and serving as the copy-paste example. A `.dev` docs site
  later (`stampstack.dev` / `stampstack.io` are available; `.com` is taken —
  acceptable, matching reference libraries like cobe.vercel.app and
  haptics.lochie.me).
- **Repo:** a fresh standalone git repository (not a folder in tennis-directory).
- **Consumer validation:** the tennis-directory app itself becomes a consumer —
  it installs `stampstack` and supplies its own `renderStamp` (title + pill +
  its colorways), confirming the decoupling is real.

## 12. Open Decisions (defaults chosen, flag to change)

- Build tool `tsup`, test runner Vitest — chosen to match conventions.
- React 18+ peer range.
- Single themeable frame color (`--stampstack-frame`) in v1; colorway palette
  deferred to v2.
