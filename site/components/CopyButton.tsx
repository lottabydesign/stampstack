'use client'
import { useState } from 'react'

export function CopyButton({ text, center = false }: { text: string; center?: boolean }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      className={`copy-btn${copied ? ' is-copied' : ''}${center ? ' copy-center' : ''}`}
      onClick={async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1400)
      }}
      style={{
        position: 'absolute',
        // Match the code's 18px horizontal padding so left/right inset reads even.
        right: 18,
        // `center` (single-line boxes like Install) vertically centers via the
        // .copy-center class; otherwise pin to the top (multi-line code blocks).
        ...(center ? {} : { top: 14 }),
        // Text-only: no box (border/background/radius/padding stripped).
        border: 'none',
        background: 'none',
        padding: 0,
        // Match the inactive Install tabs: 13px / weight 500 / muted (color via .copy-btn).
        fontSize: 13,
        fontWeight: 500,
        fontFamily: 'var(--font-ui)',
        cursor: 'pointer',
      }}
      aria-label="Copy to clipboard"
    >
      {/* keyed so the label remounts and the ease-in animation replays on toggle */}
      <span key={copied ? 'copied' : 'copy'} className="copy-label">
        {copied ? 'Copied' : 'Copy'}
      </span>
    </button>
  )
}
