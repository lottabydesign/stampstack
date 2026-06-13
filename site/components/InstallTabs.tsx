'use client'
import { useState } from 'react'
import { CopyButton } from './CopyButton'

const COMMANDS: Record<string, string> = {
  npm: 'npm i stampstack',
  pnpm: 'pnpm add stampstack',
  yarn: 'yarn add stampstack',
  bun: 'bun add stampstack',
}

// Copy-this-to-your-agent prompt (react-grab style). Written to handle any
// starting point — empty directory, fresh scaffold, or existing React project.
const PROMPT = `Set up stampstack — handle whichever case applies to this directory.

1. Install:
   - Existing React project: install with the project's package manager. Detect it
     from the lockfile (package-lock.json → npm, pnpm-lock.yaml → pnpm, yarn.lock → yarn,
     bun.lockb → bun); if there's no lockfile, use npm. e.g. npm i stampstack
   - Empty directory (no package.json): scaffold a React app first, then install —
     npm create vite@latest . -- --template react-ts && npm install && npm i stampstack
2. Import the component and its styles where you use it:
   import { StampStack } from 'stampstack'
   import 'stampstack/styles.css'
3. Render it with your data — each item only needs an id:
   <StampStack items={items} renderStamp={(item, state) => <div>{item.title}</div>} />
4. Optional: frameColor={(item) => '#...'} for a per-stamp frame color, and
   onSelect={(item) => ...} to open a card on tap.

Works in any React 18+ app (Vite, Next.js, CRA). It renders real DOM (not a canvas),
so any content — text, images, links — works inside renderStamp.`

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
            className={`ss-tab${tab === key ? ' is-active' : ''}`}
            onClick={() => setTab(key)}
            style={{
              border: 'none',
              background: 'none',
              padding: 0,
              cursor: 'pointer',
              fontFamily: 'var(--font-ui)',
              fontSize: 13,
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
