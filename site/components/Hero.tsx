'use client'
import type { CSSProperties } from 'react'
import { StampStack } from 'stampstack'
import { DEMO_ITEMS, demoColor } from './demo-stamps'

// Button styles mirrored 1:1 from Figma (node 1704:513).
const btnBase: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 9,
  height: 36,
  padding: '8px 16px',
  borderRadius: 11,
  fontFamily: 'var(--font-ui)',
  fontWeight: 500,
  fontSize: 14,
  letterSpacing: '-0.5px',
  lineHeight: '20px',
  whiteSpace: 'nowrap',
}
const primaryBtn: CSSProperties = { ...btnBase, background: '#171717', color: '#fafafa', border: '1px solid #171717' }
const secondaryBtn: CSSProperties = { ...btnBase, background: '#fafafa', color: '#0a0a0a', border: '1px solid #e5e5e5' }

export function Hero() {
  return (
    <header style={{ paddingTop: 36, textAlign: 'left' }}>
      {/* Live, draggable fan — the product is the hero. The library places the
          focused card at the left of its root, so we give StampStack a narrow
          width (= cardWidth) and center it in a wider clipping container; the fan
          then spreads symmetrically and clips cleanly at both edges. */}
      
      <h1 className="rise" style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.04em', margin: '36px 0 10px', animationDelay: '120ms' }}>
        stampstack
      </h1>
      <p
        className="rise"
        style={{ fontSize: 14, fontWeight: 500, color: '#464646', maxWidth: 460, margin: '0 0 48px', animationDelay: '160ms' }}
      >
        stampstack is a postage-styled 3D carousel component. Install and drop in whatever content you want on the stamps. 
        no dependencies beyond React 18.
        
      </p>
   
      
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
      <div className="rise" style={{ display: 'flex', gap: 12, justifyContent: 'flex-start', flexWrap: 'wrap', animationDelay: '240ms' }}>
        <a className="btn ss-tap" href="https://github.com/lottabydesign/stampstack" style={primaryBtn}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/github.svg" alt="" width={14} height={13.5} />
          Star on GitHub
        </a>
        <a className="btn ss-tap" href="https://github.com/lottabydesign/stampstack#readme" style={secondaryBtn}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/book-open.svg" alt="" width={14} height={14} />
          View docs
        </a>
        <a className="btn ss-tap" href="https://x.com/lottabydesign" style={secondaryBtn}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/x.svg" alt="" width={12} height={12} />
          Follow
        </a>
      </div>
    </header>
  )
}
