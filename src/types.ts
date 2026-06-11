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
  /** Open a card. Fires only on a genuine tap of the visually front-most card
   *  (accurate even for rotated/overlapping fanned cards), never after a drag.
   *  Omit to make stamps non-interactive. */
  onSelect?: (item: T, index: number) => void
  /** Fires when the focused card changes (mount + each change). */
  onFocusChange?: (index: number) => void
  /** Per-stamp frame color. Returned value is applied to the card wrapper as the
   *  `--stampstack-frame` CSS variable, so the (library-rendered) frame can differ
   *  per item. Omit for a single color set via the `--stampstack-frame` variable. */
  frameColor?: (item: T, state: StampState) => string
  initialIndex?: number      // default 0
  cardWidth?: number         // default 260 (px)
  className?: string         // passthrough on the scene element
  style?: CSSProperties      // passthrough on the scene element
}
