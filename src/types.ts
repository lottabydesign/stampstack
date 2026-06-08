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
