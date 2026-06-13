'use client'
import { useState } from 'react'
import { CopyButton } from './CopyButton'

const COMMANDS: Record<string, string> = {
  npm: 'npm i stampstack',
  pnpm: 'pnpm add stampstack',
  yarn: 'yarn add stampstack',
  bun: 'bun add stampstack',
}

// Copy-this-to-your-agent prompt (react-grab style).
const PROMPT = `Set up stampstack in this React project.

1. Detect the package manager from the lockfile and install stampstack (e.g. npm i stampstack).
2. Where you use it, import the component and its styles:
   import { StampStack } from 'stampstack'
   import 'stampstack/styles.css'
3. Render it with your data — each item only needs an id:
   <StampStack items={items} renderStamp={(item, state) => <div>{item.title}</div>} />
4. Optional: frameColor={(item) => '#...'} for a per-stamp frame color, and
   onSelect={(item) => ...} to open a card on tap.

It renders real DOM (not a canvas), so any content — text, images, links — works inside renderStamp.`

const TABS = ['npm', 'pnpm', 'yarn', 'bun', 'Prompt'] as const

export function InstallTabs() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('npm')
  const isPrompt = tab === 'Prompt'

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
        {TABS.map((key) => (
          <button
            key={key}
            className="ss-tab"
            onClick={() => setTab(key)}
            style={{
              border: 'none',
              background: 'none',
              padding: 0,
              cursor: 'pointer',
              fontFamily: 'var(--font-ui)',
              fontSize: 13,
              color: tab === key ? 'var(--text)' : 'var(--muted)',
              fontWeight: tab === key ? 600 : 500,
            }}
          >
            {key}
          </button>
        ))}
      </div>

      {isPrompt ? (
        <div className="code-card" style={{ padding: '16px 44px 16px 18px' }}>
          <p
            style={{
              margin: 0,
              fontFamily: 'var(--font-ui)',
              fontSize: 13.5,
              lineHeight: 1.7,
              letterSpacing: '-0.01em',
              color: 'var(--text)',
              whiteSpace: 'pre-wrap',
            }}
          >
            {PROMPT}
          </p>
          <CopyButton text={PROMPT} />
        </div>
      ) : (
        <div className="code-card">
          <pre>
            <code style={{ color: 'var(--text)' }}>$ {COMMANDS[tab]}</code>
          </pre>
          <CopyButton text={COMMANDS[tab]} center />
        </div>
      )}
    </div>
  )
}
