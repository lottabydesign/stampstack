'use client'
import { useState } from 'react'
import { StampStack } from 'stampstack'
import { DEMO_ITEMS, demoColor, type DemoItem } from './demo-stamps'
import { StampToast } from './StampToast'

export function Hero() {
  // The stamp tapped most recently — drives the toast (null = no toast shown).
  const [toast, setToast] = useState<DemoItem | null>(null)
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
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#484747', fontWeight: 500 }}>
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
           stampstack is a postage-styled 3D carousel component. 
           drag or flick the fan · arrow keys move focus · tap a stamp to open 
          </p>
        </div>
      </div>

      {/* Live, draggable fan — the product is the hero. The library places the
          focused card at the left of its root, so we give StampStack a narrow
          width (= cardWidth) and center it in a wider clipping container; the fan
          then spreads symmetrically and clips cleanly at both edges. */}
      <div
        className="rise"
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
          onSelect={(item) => setToast(item)}
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

      {/* Tap a stamp → toast with its swatch color + title + subtitle. Keyed by id
          so tapping a different stamp re-mounts and replays the enter animation. */}
      {toast && (
        <StampToast
          key={toast.id}
          item={toast}
          color={demoColor(toast.id)}
          onRemove={() => setToast(null)}
        />
      )}
    </header>
  )
}
