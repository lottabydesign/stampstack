'use client'
import { StampStack } from 'stampstack'
import { DEMO_ITEMS, demoColor } from './demo-stamps'

export function Hero() {
  return (
    <header style={{ paddingTop: 56, textAlign: 'center' }}>
      {/* Live, draggable fan — the product is the hero. */}
      <div style={{ position: 'relative' }}>
        <StampStack
          items={DEMO_ITEMS}
          frameColor={(item) => demoColor(item.id)}
          onSelect={(item) => window.alert(`Tapped ${item.label}`)}
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
              {item.label}
            </div>
          )}
        />
        <span style={{ display: 'block', marginTop: -8, fontSize: 13, color: 'var(--muted)' }}>
          ← drag the fan →
        </span>
      </div>

      <h1 style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.02em', margin: '28px 0 10px' }}>
        stampstack
      </h1>
      <p style={{ fontSize: 17, color: '#555', margin: '0 0 8px' }}>
        A draggable 3D coverflow of postage-stamp cards. Bring your own content.
      </p>
      <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 16px' }}>
        Zero deps · ~5KB · React 18+
      </p>
      <p style={{ fontSize: 14, display: 'flex', gap: 14, justifyContent: 'center' }}>
        <a href="https://github.com/lottabydesign/stampstack">GitHub</a>
        <a href="https://www.npmjs.com/package/stampstack">npm</a>
        <a href="https://github.com/lottabydesign">@lottabydesign</a>
      </p>
    </header>
  )
}
