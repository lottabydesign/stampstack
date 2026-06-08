// src/release.ts

export interface ReleaseInput {
  delta: number      // clientX - startX (px). Negative = dragged left.
  duration: number   // ms the pointer was down
  cardStep: number   // px between adjacent card centers (CARD_STEP)
  startFocus: number // focusIndex when the drag began
  itemCount: number  // total number of cards
  moved: boolean     // did the drag cross the dead zone? (threshold set by the caller)
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
