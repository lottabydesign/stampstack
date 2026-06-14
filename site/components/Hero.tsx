'use client'
import { useEffect, useRef, useState } from 'react'
import { StampStack } from 'stampstack'
import { DEMO_ITEMS, demoColor } from './demo-stamps'
import { StampToaster, type ToastData } from './StampToast'

export function Hero() {
  // The stack of tapped stamps, newest last. Capped to the visible depth so the
  // stack stays tidy; each toast self-dismisses (see StampToaster).
  const [toasts, setToasts] = useState<ToastData[]>([])

  // One-time intro flourish: once the hero settles, riffle the fan quickly out to
  // the last stamp and back to the first, then stop. The library listens for arrow
  // keys on window, so we synthesize a fast burst of ArrowRight then ArrowLeft
  // keydowns — its own 0.45s card transition smooths the rapid steps into one
  // continuous sweep (no library control API needed). Skipped under reduced motion;
  // aborts the moment the user takes over (real keys / pointer set pausedRef).
  const pausedRef = useRef(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Real (user) arrow/enter keys abort the flourish. Our synthetic keys carry
    // isTrusted=false, so they slip past this guard.
    const onUserKey = (e: KeyboardEvent) => {
      if (e.isTrusted && (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Enter')) {
        pausedRef.current = true
      }
    }
    window.addEventListener('keydown', onUserKey)

    const last = DEMO_ITEMS.length - 1
    const STEP_MS = 70 // gap per step — far under the 0.45s card transition, so it flows
    const START_MS = 700 // let the hero's entrance rise finish before the sweep

    // Out to the last stamp, then back to the first — a single rapid pass.
    const keys: ('ArrowRight' | 'ArrowLeft')[] = [
      ...Array(last).fill('ArrowRight'),
      ...Array(last).fill('ArrowLeft'),
    ]
    const timers = keys.map((key, i) =>
      window.setTimeout(() => {
        if (pausedRef.current || document.hidden) return
        window.dispatchEvent(new KeyboardEvent('keydown', { key }))
      }, START_MS + i * STEP_MS),
    )

    return () => {
      timers.forEach((t) => window.clearTimeout(t))
      window.removeEventListener('keydown', onUserKey)
    }
  }, [])

  return (
    <header style={{ paddingTop: 36, textAlign: 'left' }}>
     
      <div style={{ marginBottom: 48 }}>
        {/* Logo → (wordmark + GitHub badge) → description */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 11 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="rise"
            src="/icons/stampstack-logo.svg"
            alt="stampstack"
            width={30}
            height={51.8}
            style={{ display: 'block', animationDelay: '120ms' }}
          />

          {/* Wordmark + GitHub badge share one full-width row: align-items:center
              vertically centers the badge on the wordmark, and marginLeft:auto
              pins it to the content's right edge. */}
          <div
            className="rise"
            style={{ display: 'flex', alignItems: 'center', alignSelf: 'stretch', whiteSpace: 'nowrap', marginTop: -10, animationDelay: '160ms' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#252525', fontWeight: 500 }}>
              <span style={{ fontSize: 18, fontWeight: 700, lineHeight: '44px', letterSpacing: '-0.8px', opacity: 0.92 }}>stampstack</span>
              <span style={{ fontSize: 14, lineHeight: '24px', letterSpacing: '-0.1px', opacity: 0.22 }}>v0.2.0</span>
            </span>
            <a
              className="ss-tap"
              href="https://github.com/lottabydesign/stampstack"
              aria-label="stampstack on GitHub"
              style={{ marginLeft: 'auto', display: 'inline-flex' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/github-badge.svg" alt="" width={24.949} height={24.949} style={{ display: 'block' }} />
            </a>
          </div>

          <p
            className="rise"
            style={{ margin: 0, maxWidth: 486, color: '#252525', fontWeight: 500, fontSize: 14, letterSpacing: '-0.1px', lineHeight: '23px', fontFeatureSettings: '"swsh" 1', animationDelay: '200ms' }}
          >
            stampstack is a postage-styled 3D carousel component. install and drop in whatever content you want on the stamps. no deps beyond react 18
          
          </p>
        
        </div>
      </div>

      {/* Live, draggable fan — the product is the hero. The library places the
          focused card at the left of its root, so we give StampStack a narrow
          width (= cardWidth) and center it in a wider clipping container; the fan
          then spreads symmetrically and clips cleanly at both edges. */}
      <div
        className="rise"
        onPointerDown={() => { pausedRef.current = true }}
        style={{
          position: 'relative',
          overflow: 'visible',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <StampStack
          items={DEMO_ITEMS}
          cardWidth={240}
          style={{ width: 240, height: 340 }}
          frameColor={(item) => demoColor(item.id)}
          renderStamp={(item, state) => (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                fontFamily: 'var(--font-ui)',
                fontWeight: 600,
                fontSize: 22,
                color: '#404040',
                opacity: state.focused ? 1 : 0.85,
              }}
            >
              {item.title}
            </div>
          )}
        />
      </div>

      {/* Tap a stamp → a Sonner-style toast joins the stack (swatch + title +
          subtitle). Newest sits in front; hover expands, swipe-down dismisses. */}
      <StampToaster
        toasts={toasts}
        onDismiss={(key) => setToasts((t) => t.filter((x) => x.key !== key))}
      />
    </header>
  )
}
