import type { CSSProperties } from 'react'

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
const secondaryBtn: CSSProperties = { ...btnBase, background: 'transparent', color: '#0a0a0a', border: '1px solid #e5e5e5' }

export function ActionButtons() {
  return (
    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-start', flexWrap: 'wrap', marginTop: 20 }}>
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
  )
}
