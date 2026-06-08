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
