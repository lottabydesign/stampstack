'use client'
import { useState } from 'react'

export function CopyButton({ text, center = false }: { text: string; center?: boolean }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      className={center ? 'ss-tap copy-center' : 'ss-tap'}
      onClick={async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1400)
      }}
      style={{
        position: 'absolute',
        right: 10,
        // `center` (single-line boxes like Install) vertically centers via the
        // .copy-center class; otherwise pin to the top (multi-line code blocks).
        ...(center ? {} : { top: 10 }),
        border: '1px solid var(--border)',
        background: 'var(--bg)',
        color: copied ? 'var(--accent)' : 'var(--muted)',
        borderRadius: 7,
        padding: '4px 9px',
        fontSize: 12,
        fontFamily: 'var(--font-ui)',
        cursor: 'pointer',
      }}
      aria-label="Copy to clipboard"
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}
