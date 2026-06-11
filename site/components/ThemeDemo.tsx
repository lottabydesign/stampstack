'use client'
import { useState } from 'react'
import { StampStack } from 'stampstack'
import { DEMO_ITEMS, demoColor } from './demo-stamps'

export function ThemeDemo() {
  const [dark, setDark] = useState(false)
  return (
    <div
      data-theme={dark ? 'dark' : undefined}
      style={{
        background: dark ? '#0d0d12' : 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 12,
        overflow: 'hidden',
        transition: 'background 0.25s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
        <button
          onClick={() => setDark((d) => !d)}
          style={{
            border: '1px solid var(--border)',
            background: 'var(--bg)',
            color: 'var(--muted)',
            borderRadius: 7,
            padding: '4px 10px',
            fontSize: 12,
            fontFamily: 'var(--font-ui)',
            cursor: 'pointer',
          }}
        >
          {dark ? 'Light' : 'Dark'}
        </button>
      </div>
      <StampStack
        items={DEMO_ITEMS.slice(0, 5)}
        cardWidth={150}
        frameColor={(item) => demoColor(item.id)}
        renderStamp={(item) => (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              fontFamily: 'var(--font-ui)',
              fontWeight: 600,
              fontSize: 16,
            }}
          >
            {item.label}
          </div>
        )}
      />
    </div>
  )
}
