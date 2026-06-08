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
