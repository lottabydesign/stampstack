'use client'
import { StampStack } from 'stampstack'
import { DEMO_ITEMS, demoColor } from './demo-stamps'

export function Hero() {
  return (
    <header style={{ paddingTop: 56, textAlign: 'center' }}>
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
      </div>
      <span className="rise" style={{ display: 'block', marginTop: 8, fontSize: 13, color: 'var(--muted)', animationDelay: '80ms' }}>
        ← drag the fan →
      </span>

      <h1 className="rise" style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.04em', margin: '28px 0 10px', animationDelay: '120ms' }}>
        stampstack
      </h1>
      <p className="rise" style={{ fontSize: 17, color: '#555', margin: '0 0 8px', animationDelay: '160ms' }}>
        A draggable 3D coverflow of postage-stamp cards. Bring your own content.
      </p>
      <p className="rise" style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 16px', animationDelay: '200ms' }}>
        Zero deps · ~5KB · React 18+
      </p>
      <p className="rise" style={{ fontSize: 14, display: 'flex', gap: 14, justifyContent: 'center', animationDelay: '240ms' }}>
        <a href="https://github.com/lottabydesign/stampstack">GitHub</a>
        <a href="https://www.npmjs.com/package/stampstack">npm</a>
        <a href="https://github.com/lottabydesign">@lottabydesign</a>
      </p>
    </header>
  )
}
