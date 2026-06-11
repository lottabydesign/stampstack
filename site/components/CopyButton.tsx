'use client'
import { useState } from 'react'

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1400)
      }}
      style={{
        position: 'absolute',
        top: 10,
        right: 10,
        border: '1px solid var(--border)',
        background: 'var(--bg)',
        color: 'var(--muted)',
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
