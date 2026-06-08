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
