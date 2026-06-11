// src/useStampFan.ts
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react'
import { posFromOffset, CARD_STEP, CARD_BASELINE_Y } from './fan-stops'
import { computeReleaseFocus } from './release'
import type { StampState } from './types'

export interface UseStampFanOptions {
  itemCount: number
  initialIndex?: number
  cardWidth?: number
  onFocusChange?: (index: number) => void
}

export interface UseStampFanResult {
  focusIndex: number
  sceneRef: RefObject<HTMLDivElement>
  getCardStyle: (index: number) => CSSProperties
  getCardState: (index: number) => StampState
  onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void
  /** Swallows the click the browser fires after a drag, so interactive content
   *  (an <a>/<button> in renderStamp) only activates on a genuine tap. */
  onClickCapture: (e: ReactMouseEvent<HTMLDivElement>) => void
}

export function useStampFan({
  itemCount,
  initialIndex = 0,
  cardWidth = 260,
  onFocusChange,
}: UseStampFanOptions): UseStampFanResult {
  const sceneRef = useRef<HTMLDivElement>(null)
  const [focusIndex, setFocusIndex] = useState(initialIndex)
  // Live pixel offset during a drag; non-zero only while dragging.
  const [dragDx, setDragDx] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragState = useRef<{ startX: number; startFocus: number; startTime: number; moved: boolean } | null>(null)
  // Set true when a drag (not a tap) is released, so the click the browser fires
  // afterward is swallowed in the capture phase before it reaches consumer content
  // (e.g. an <a>/<button> in renderStamp). A genuine tap leaves it false.
  const suppressClickRef = useRef(false)

  // Keep the latest onFocusChange without making it an effect dependency —
  // so a consumer passing an inline arrow doesn't re-fire this on every render.
  const onFocusChangeRef = useRef(onFocusChange)
  useEffect(() => {
    onFocusChangeRef.current = onFocusChange
  })

  // Tell the consumer when focus changes (replaces the original's router.prefetch).
  // Depends only on focusIndex, not the callback, so a new inline function identity
  // on every parent render never re-triggers this.
  useEffect(() => {
    onFocusChangeRef.current?.(focusIndex)
  }, [focusIndex])

  const navLeft = useCallback(() => setFocusIndex((i) => Math.max(0, i - 1)), [])
  const navRight = useCallback(() => setFocusIndex((i) => Math.min(itemCount - 1, i + 1)), [itemCount])

  // Window keyboard nav: arrows move focus only (no Enter/open).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return
      if (e.key === 'ArrowLeft') return navLeft()
      if (e.key === 'ArrowRight') return navRight()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navLeft, navRight])

  // Pointer drag: live finger-following + Swiper-style release.
  useEffect(() => {
    function onMove(e: PointerEvent) {
      const state = dragState.current
      if (!state) return
      const raw = e.clientX - state.startX
      // Stay inert below the 6px dead zone so taps stay stable.
      if (!state.moved) {
        if (Math.abs(raw) <= 6) return
        state.moved = true
        setIsDragging(true)
      }
      // Edge rubber-banding: damp movement past the first/last card.
      let damped = raw
      const atStart = state.startFocus === 0
      const atEnd = state.startFocus === itemCount - 1
      if ((atStart && raw > 0) || (atEnd && raw < 0)) damped = raw * 0.4
      setDragDx(damped)
    }
    function onUp(e: PointerEvent) {
      const state = dragState.current
      if (!state) return
      dragState.current = null
      if (sceneRef.current) sceneRef.current.style.cursor = 'grab'

      const delta = e.clientX - state.startX
      const next = computeReleaseFocus({
        delta,
        duration: Date.now() - state.startTime,
        cardStep: CARD_STEP,
        startFocus: state.startFocus,
        itemCount,
        moved: state.moved,
      })
      // If this gesture was a drag, suppress the click that follows so it can't
      // misfire interactive content. A tap (never moved) leaves it false.
      suppressClickRef.current = state.moved
      setFocusIndex(next)
      setIsDragging(false)
      setDragDx(0)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [itemCount])

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      dragState.current = { startX: e.clientX, startFocus: focusIndex, startTime: Date.now(), moved: false }
      // Fresh gesture — clear any stale suppression from a prior drag.
      suppressClickRef.current = false
      setIsDragging(true)
      if (sceneRef.current) sceneRef.current.style.cursor = 'grabbing'
    },
    [focusIndex],
  )

  // Capture-phase click guard: if the gesture was a drag, cancel the click before
  // it reaches consumer content (prevents <a> navigation / onClick from a drag).
  const onClickCapture = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    if (suppressClickRef.current) {
      e.preventDefault()
      e.stopPropagation()
      suppressClickRef.current = false
    }
  }, [])

  const getCardState = useCallback(
    (index: number): StampState => {
      const offset = index - focusIndex + dragDx / CARD_STEP
      return { focused: Math.round(offset) === 0, index, offset }
    },
    [focusIndex, dragDx],
  )

  const getCardStyle = useCallback(
    (index: number): CSSProperties => {
      const off = index - focusIndex + dragDx / CARD_STEP
      const abs = Math.abs(off)
      const p = posFromOffset(off)
      const interactive = p.op > 0.1
      return {
        width: `${cardWidth}px`,
        transition: isDragging
          ? 'none'
          : 'transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.45s cubic-bezier(0.25,0.46,0.45,0.94)',
        transform: `translateY(${CARD_BASELINE_Y}px) translateX(${p.tx}px) translateZ(${p.tz}px) rotateY(${p.ry}deg) scale(${p.sc})`,
        opacity: p.op,
        zIndex: itemCount - Math.round(abs),
        pointerEvents: interactive ? 'auto' : 'none',
      }
    },
    [focusIndex, dragDx, isDragging, cardWidth, itemCount],
  )

  return {
    focusIndex,
    sceneRef,
    getCardStyle,
    getCardState,
    onPointerDown,
    onClickCapture,
  }
}
