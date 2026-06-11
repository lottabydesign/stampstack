// src/useStampFan.ts
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react'
import { posFromOffset, CARD_STEP, CARD_BASELINE_Y } from './fan-stops'
import { computeReleaseFocus } from './release'
import { hitTest } from './hit-test'
import type { StampState } from './types'

export interface UseStampFanOptions {
  itemCount: number
  initialIndex?: number
  cardWidth?: number
  onFocusChange?: (index: number) => void
  /** Called with the tapped card's index. Omit to make stamps non-interactive. */
  onSelect?: (index: number) => void
}

export interface UseStampFanResult {
  focusIndex: number
  sceneRef: RefObject<HTMLDivElement>
  getCardStyle: (index: number) => CSSProperties
  getCardState: (index: number) => StampState
  isInteractive: (index: number) => boolean
  onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void
  /** Scene-level click delegation: accurate front-most-card hit-test → onSelect. */
  onSceneClick: (e: ReactMouseEvent<HTMLDivElement>) => void
  /** Per-card Enter/Space activation (keyboard equivalent of a tap). */
  handleCardKeyDown: (index: number, e: ReactKeyboardEvent) => void
}

export function useStampFan({
  itemCount,
  initialIndex = 0,
  cardWidth = 260,
  onFocusChange,
  onSelect,
}: UseStampFanOptions): UseStampFanResult {
  const sceneRef = useRef<HTMLDivElement>(null)
  const [focusIndex, setFocusIndex] = useState(initialIndex)
  // Live pixel offset during a drag; non-zero only while dragging.
  const [dragDx, setDragDx] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragState = useRef<{ startX: number; startFocus: number; startTime: number; moved: boolean } | null>(null)
  // Set true when a drag (not a tap) is released, so the click the browser fires
  // afterward is ignored by onSceneClick — dragging the fan never opens a card.
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

  // Shared activation gate for tap (onSceneClick) and keyboard (handleCardKeyDown).
  // Skips a click synthesized right after a drag; otherwise opens the card.
  const activate = useCallback(
    (index: number) => {
      if (suppressClickRef.current) {
        suppressClickRef.current = false
        return
      }
      onSelect?.(index)
    },
    [onSelect],
  )

  // Window keyboard nav: arrows move focus; Enter opens the focused card (unless a
  // specific card is tab-focused, in which case its own onKeyDown handles it).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return
      if (e.key === 'ArrowLeft') return navLeft()
      if (e.key === 'ArrowRight') return navRight()
      if (e.key === 'Enter') {
        const active = document.activeElement as HTMLElement | null
        if (active && sceneRef.current?.contains(active)) return
        activate(focusIndex)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navLeft, navRight, activate, focusIndex])

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
      // open a card. A tap (never moved) leaves it false.
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

  // Scene-level click delegation. We do NOT trust the browser's 3D hit-test (it
  // picks the card closest in z-depth, not the one the user sees on top). Instead
  // we compute each visible card's on-screen box ourselves and pick the front-most
  // card under the pointer — accurate even for rotated, overlapping fanned cards.
  const onSceneClick = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (suppressClickRef.current) {
        suppressClickRef.current = false
        return
      }
      const scene = sceneRef.current
      if (!scene) return
      const rect = scene.getBoundingClientRect()
      const localX = e.clientX - (rect.left + rect.width / 2)
      const localY = e.clientY - (rect.top + rect.height / 2)
      const hit = hitTest({
        localX,
        localY,
        focusIndex,
        dragDx,
        itemCount,
        cardWidth,
        cardStep: CARD_STEP,
        baselineY: CARD_BASELINE_Y,
      })
      if (hit === -1) return
      activate(hit)
    },
    [focusIndex, dragDx, itemCount, cardWidth, activate],
  )

  const handleCardKeyDown = useCallback(
    (index: number, e: ReactKeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        activate(index)
      }
    },
    [activate],
  )

  const getCardState = useCallback(
    (index: number): StampState => {
      const offset = index - focusIndex + dragDx / CARD_STEP
      return { focused: Math.round(offset) === 0, index, offset }
    },
    [focusIndex, dragDx],
  )

  const isInteractive = useCallback(
    (index: number) => posFromOffset(index - focusIndex + dragDx / CARD_STEP).op > 0.1,
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
    isInteractive,
    onPointerDown,
    onSceneClick,
    handleCardKeyDown,
  }
}
