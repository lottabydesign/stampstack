'use client'
import { useState } from 'react'
import { CopyButton } from './CopyButton'

const COMMANDS: Record<string, string> = {
  npm: 'npm i stampstack',
  pnpm: 'pnpm add stampstack',
  yarn: 'yarn add stampstack',
  bun: 'bun add stampstack',
}

export function InstallTabs() {
  const [pm, setPm] = useState<keyof typeof COMMANDS>('npm')
  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
        {Object.keys(COMMANDS).map((key) => (
          <button
            key={key}
            className="ss-tab"
            onClick={() => setPm(key as keyof typeof COMMANDS)}
            style={{
              border: 'none',
              background: 'none',
              padding: 0,
              cursor: 'pointer',
              fontFamily: 'var(--font-ui)',
              fontSize: 13,
              color: pm === key ? 'var(--text)' : 'var(--muted)',
              fontWeight: pm === key ? 600 : 500,
            }}
          >
            {key}
          </button>
        ))}
      </div>
      <div className="code-card lift">
        <pre>
          <code style={{ color: 'var(--text)' }}>$ {COMMANDS[pm]}</code>
        </pre>
        <CopyButton text={COMMANDS[pm]} />
      </div>
    </div>
  )
}
