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
