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

  it('returns the index of a side card whose visible box contains the click', () => {
    // base.focusIndex is 2, so card i=3 sits at offset +1 (tx = CARD_STEP).
    // A click at x = CARD_STEP lands inside card 3's box, not the focused card.
    const hit = hitTest({ ...base, localX: CARD_STEP, localY: CARD_BASELINE_Y })
    expect(hit).toBe(3)
  })
})
