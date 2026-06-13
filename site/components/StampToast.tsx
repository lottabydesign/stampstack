'use client'
import { useCallback, useEffect, useState } from 'react'
import type { DemoItem } from './demo-stamps'

// A toast shown when a stamp is tapped: a swatch in the stamp's frame color,
// the stamp title, and a muted subtitle, with a close button. Styled with the
// site's tokens (var(--card)/--border/--muted/--font-ui) so it matches the page.
//
// Lifecycle: mounts hidden → rises + fades in on the next frame → auto-dismisses
// after 4s (or on close), fading out before the parent unmounts it via onRemove.
const ENTER_MS = 240
const EXIT_MS = 180
const AUTO_DISMISS_MS = 4000

export function StampToast({
  item,
  color,
  onRemove,
}: {
  item: DemoItem
  color: string
  onRemove: () => void
}) {
  const [show, setShow] = useState(false)

  // Fade out, then let the parent unmount us after the exit transition.
  const dismiss = useCallback(() => {
    setShow(false)
    const t = setTimeout(onRemove, EXIT_MS)
    return () => clearTimeout(t)
  }, [onRemove])

  // Enter on the next frame (so the from-state paints first → transition runs).
  useEffect(() => {
    const r = requestAnimationFrame(() => setShow(true))
    return () => cancelAnimationFrame(r)
  }, [])

  // Auto-dismiss.
  useEffect(() => {
    const t = setTimeout(dismiss, AUTO_DISMISS_MS)
    return () => clearTimeout(t)
  }, [dismiss])

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 24,
        zIndex: 200, // above the rainbow wash (z-index 100)
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        width: 'min(380px, calc(100vw - 32px))',
        padding: 14,
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.22)',
        fontFamily: 'var(--font-ui)',
        // Centered horizontally; the show state adds the rise + fade.
        transform: `translateX(-50%) translateY(${show ? '0' : '12px'})`,
        opacity: show ? 1 : 0,
        transition: `opacity ${show ? ENTER_MS : EXIT_MS}ms var(--ease-out), transform ${
          show ? ENTER_MS : EXIT_MS
        }ms var(--ease-out)`,
      }}
    >
      {/* Swatch — the stamp's frame color */}
      <div
        style={{
          flexShrink: 0,
          width: 52,
          height: 52,
          borderRadius: 13,
          background: color,
        }}
      />

      {/* Title + subtitle */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 650,
            fontSize: 17,
            lineHeight: '22px',
            letterSpacing: '-0.02em',
            color: '#171717',
          }}
        >
          {item.title}
        </div>
        <div
          style={{
            fontWeight: 500,
            fontSize: 14,
            lineHeight: '20px',
            letterSpacing: '-0.01em',
            color: 'var(--muted)',
          }}
        >
          {item.subtitle}
        </div>
      </div>

      {/* Close */}
      <button
        className="ss-tap"
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32,
          border: 'none',
          borderRadius: 9,
          background: '#f4f4f3',
          color: '#333',
          fontSize: 15,
          lineHeight: 1,
          cursor: 'pointer',
        }}
      >
        {/* multiplication sign — a true × glyph, not the letter x */}
        ×
      </button>
    </div>
  )
}
