'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { DemoItem } from './demo-stamps'

// A Sonner-style stacked toaster, handrolled (no dependency) to match the
// site's zero-dep ethos. Each tap pushes a toast; the newest sits in front and
// older ones scale back + peek behind. Hovering expands the stack into a list;
// the front toast can be swiped down to dismiss; each auto-dismisses after 4s
// (paused while hovered). Motion uses Sonner's springy ease.

export type ToastData = { key: number; item: DemoItem; color: string }

const MAX_VISIBLE = 3 // toasts rendered in the collapsed stack
const COLLAPSE_GAP = 16 // px each older toast rises behind the front
const SCALE_STEP = 0.06 // scale lost per step back
const TOAST_H = 80 // approx uniform toast height (content is fixed)
const EXPAND_GAP = 12 // gap between toasts when the stack is expanded
const ENTER_FROM = 28 // px below resting spot a new toast slides up from
const AUTO_MS = 4000
const EXIT_MS = 200
const SWIPE_DISMISS = 45 // px of downward drag that commits a dismiss
const EASE = 'cubic-bezier(0.21, 1.02, 0.73, 1)' // Sonner's slight-overshoot spring

export function StampToaster({
  toasts,
  onDismiss,
}: {
  toasts: ToastData[]
  onDismiss: (key: number) => void
}) {
  // Expanded while the pointer is over any toast. Debounced on leave so sliding
  // between stacked toasts (leave A → enter B) doesn't collapse for a frame.
  const [expanded, setExpanded] = useState(false)
  const leaveTimer = useRef<number | undefined>(undefined)
  const onEnter = useCallback(() => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
    setExpanded(true)
  }, [])
  const onLeave = useCallback(() => {
    leaveTimer.current = window.setTimeout(() => setExpanded(false), 60)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(380px, calc(100vw - 32px))',
        zIndex: 200, // above the rainbow wash (z-index 100)
        pointerEvents: 'none', // empty area never blocks page clicks; toasts re-enable
      }}
    >
      {toasts.map((t, i) => (
        <ToastItem
          key={t.key}
          data={t}
          pos={toasts.length - 1 - i} // 0 = newest/front
          expanded={expanded}
          onEnter={onEnter}
          onLeave={onLeave}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  )
}

function ToastItem({
  data,
  pos,
  expanded,
  onEnter,
  onLeave,
  onDismiss,
}: {
  data: ToastData
  pos: number
  expanded: boolean
  onEnter: () => void
  onLeave: () => void
  onDismiss: (key: number) => void
}) {
  const [phase, setPhase] = useState<'enter' | 'rest' | 'exit'>('enter')
  const [dragging, setDragging] = useState(false)
  const [dragY, setDragY] = useState(0)
  const startY = useRef(0)
  const isFront = pos === 0

  // Enter on the next frame (so the from-state paints first → transition runs).
  useEffect(() => {
    const r = requestAnimationFrame(() => setPhase('rest'))
    return () => cancelAnimationFrame(r)
  }, [])

  // Animate out, then let the parent drop us from the list.
  const dismiss = useCallback(() => {
    setPhase('exit')
    const t = setTimeout(() => onDismiss(data.key), EXIT_MS)
    return () => clearTimeout(t)
  }, [onDismiss, data.key])

  // Auto-dismiss — paused while the stack is hovered (expanded) or being dragged.
  useEffect(() => {
    if (phase !== 'rest' || expanded || dragging) return
    const t = setTimeout(dismiss, AUTO_MS)
    return () => clearTimeout(t)
  }, [phase, expanded, dragging, dismiss])

  // Swipe-to-dismiss — front toast only.
  const onPointerDown = (e: React.PointerEvent) => {
    if (!isFront) return
    startY.current = e.clientY
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return
    // Follow downward freely; resist upward (this stack dismisses downward).
    const dy = e.clientY - startY.current
    setDragY(dy > 0 ? dy : dy * 0.3)
  }
  const onPointerUp = () => {
    if (!dragging) return
    setDragging(false)
    if (dragY > SWIPE_DISMISS) dismiss()
    else setDragY(0) // snap back
  }

  // Resting position from depth: rise + shrink (collapsed) or full list (expanded).
  const baseY = expanded ? -pos * (TOAST_H + EXPAND_GAP) : -pos * COLLAPSE_GAP
  const baseScale = expanded ? 1 : 1 - pos * SCALE_STEP

  let transform: string
  let opacity: number
  if (phase === 'enter') {
    transform = `translateY(${baseY + ENTER_FROM}px) scale(0.96)`
    opacity = 0
  } else if (phase === 'exit') {
    transform = `translateY(${baseY + dragY + 48}px) scale(0.96)`
    opacity = 0
  } else {
    transform = `translateY(${baseY + dragY}px) scale(${baseScale})`
    // Beyond the visible count, fade out behind the stack; fade while swiping.
    const swipeFade = dragY > 0 ? Math.max(0, 1 - dragY / (TOAST_H * 1.4)) : 1
    opacity = (pos < MAX_VISIBLE ? 1 : 0) * swipeFade
  }

  return (
    <div
      role="status"
      aria-live="polite"
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'auto',
        touchAction: 'none', // let us own the vertical drag gesture
        zIndex: 100 - pos, // newest on top
        transformOrigin: 'center bottom',
        transform,
        opacity,
        transition: dragging
          ? 'none'
          : `transform 400ms ${EASE}, opacity 300ms ease`,
        cursor: isFront ? 'grab' : 'default',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: 14,
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.22)',
        fontFamily: 'var(--font-ui)',
      }}
    >
      {/* Swatch — the stamp's frame color */}
      <div style={{ flexShrink: 0, width: 52, height: 52, borderRadius: 13, background: data.color }} />

      {/* Title + subtitle */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 650, fontSize: 17, lineHeight: '22px', letterSpacing: '-0.02em', color: '#171717' }}>
          {data.item.title}
        </div>
        <div style={{ fontWeight: 500, fontSize: 14, lineHeight: '20px', letterSpacing: '-0.01em', color: 'var(--muted)' }}>
          {data.item.subtitle}
        </div>
      </div>

      {/* Close — stopPropagation so pressing it never starts a swipe. */}
      <button
        className="ss-tap"
        onPointerDown={(e) => e.stopPropagation()}
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
