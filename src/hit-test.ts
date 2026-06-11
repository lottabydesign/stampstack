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
    const withinY = Math.abs(localY - baselineY) <= halfH  // all cards share the same Y center (baselineY); only X/Z/rotation vary

    if (withinX && withinY && absOff < hitAbs) {
      hitAbs = absOff
      hitIndex = i
    }
  }

  return hitIndex
}
