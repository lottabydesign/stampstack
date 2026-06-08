// src/useStampFan.ts
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type KeyboardEvent as ReactKeyboardEvent,
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
  onSelect?: (index: number) => void
  onFocusChange?: (index: number) => void
}

export interface UseStampFanResult {
  focusIndex: number
  sceneRef: RefObject<HTMLDivElement | null>
  getCardStyle: (index: number) => CSSProperties
  getCardState: (index: number) => StampState
  isInteractive: (index: number) => boolean
  onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void
  onSceneClick: (e: ReactMouseEvent<HTMLDivElement>) => void
  handleCardKeyDown: (index: number, e: ReactKeyboardEvent) => void
}

export function useStampFan({
  itemCount,
  initialIndex = 0,
  cardWidth = 260,
  onSelect,
  onFocusChange,
}: UseStampFanOptions): UseStampFanResult {
  const sceneRef = useRef<HTMLDivElement | null>(null)
  const [focusIndex, setFocusIndex] = useState(initialIndex)
  // Live pixel offset during a drag; non-zero only while dragging.
  const [dragDx, setDragDx] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragState = useRef<{ startX: number; startFocus: number; startTime: number; moved: boolean } | null>(null)
  // Set on pointerup when a drag moved, so the follow-up click is suppressed.
  const suppressNextClick = useRef(false)

  // Tell the consumer when focus changes (replaces the original's router.prefetch).
  useEffect(() => {
    onFocusChange?.(focusIndex)
  }, [focusIndex, onFocusChange])

  const navLeft = useCallback(() => setFocusIndex((i) => Math.max(0, i - 1)), [])
  const navRight = useCallback(() => setFocusIndex((i) => Math.min(itemCount - 1, i + 1)), [itemCount])

  const activate = useCallback(
    (index: number) => {
      if (suppressNextClick.current) {
        suppressNextClick.current = false
        return
      }
      onSelect?.(index)
    },
    [onSelect],
  )

  const onSceneClick = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (suppressNextClick.current) {
        suppressNextClick.current = false
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

  // Window keyboard nav: arrows move focus, Enter opens the focused card.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return
      if (e.key === 'ArrowLeft') return navLeft()
      if (e.key === 'ArrowRight') return navRight()
      if (e.key === 'Enter') {
        const active = document.activeElement as HTMLElement | null
        // If a specific card is tab-focused, its own onKeyDown handles Enter.
        if (active && sceneRef.current?.contains(active)) return
        activate(focusIndex)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navLeft, navRight, focusIndex, activate])

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
      // Suppress the follow-up click only if focus actually changed.
      if (next !== state.startFocus) suppressNextClick.current = true
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
      // Reset stale suppression so the next real tap is never eaten.
      suppressNextClick.current = false
      setIsDragging(true)
      if (sceneRef.current) sceneRef.current.style.cursor = 'grabbing'
    },
    [focusIndex],
  )

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

  const isInteractive = useCallback(
    (index: number) => posFromOffset(index - focusIndex + dragDx / CARD_STEP).op > 0.1,
    [focusIndex, dragDx],
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
