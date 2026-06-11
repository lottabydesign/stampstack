const ROWS: { name: string; type: string; desc: string }[] = [
  { name: 'items', type: 'T[]', desc: 'Your data. Each item only needs an `id`.' },
  { name: 'renderStamp', type: '(item, state) => ReactNode', desc: 'Fill each stamp with your own DOM.' },
  { name: 'onSelect', type: '(item, index) => void', desc: 'Open a card on tap (omit = non-interactive).' },
  { name: 'frameColor', type: '(item, state) => string', desc: 'Per-stamp frame color.' },
  { name: 'onFocusChange', type: '(index) => void', desc: 'Fires when the focused card changes.' },
  { name: 'initialIndex', type: 'number', desc: 'Which card starts focused (default 0).' },
  { name: 'cardWidth', type: 'number', desc: 'Card width in px (default 260).' },
  { name: 'className', type: 'string', desc: 'Class on the root .stampstack element.' },
  { name: 'style', type: 'CSSProperties', desc: 'Inline styles on the root element.' },
]

export function PropsTable() {
  return (
    <div style={{ display: 'grid', gap: 0 }}>
      {ROWS.map((r) => (
        <div
          key={r.name}
          style={{
            display: 'grid',
            gridTemplateColumns: '160px 1fr',
            gap: 12,
            padding: '10px 0',
            borderTop: '1px solid var(--border)',
            alignItems: 'baseline',
          }}
        >
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text)' }}>{r.name}</code>
          <div>
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--accent)' }}>{r.type}</code>
            <p style={{ margin: '3px 0 0', fontSize: 13.5, color: '#555' }}>{r.desc}</p>
          </div>
        </div>
      ))}
      <p style={{ marginTop: 14, fontSize: 13, color: 'var(--muted)' }}>
        <code style={{ fontFamily: 'var(--font-mono)' }}>state</code> is{' '}
        <code style={{ fontFamily: 'var(--font-mono)' }}>{'{ focused, index, offset }'}</code>.
      </p>
    </div>
  )
}
