export function Footer() {
  return (
    <footer style={{ marginTop: 96, textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>
      <p style={{ margin: '0 0 6px' }}>
        Crafted by <a href="https://github.com/lottabydesign">Lota</a>
      </p>
      <p style={{ margin: 0, display: 'flex', gap: 12, justifyContent: 'center' }}>
        <span>stampstack v0.2.0</span>
        <a href="https://github.com/lottabydesign/stampstack">GitHub</a>
        <a href="https://www.npmjs.com/package/stampstack">npm</a>
      </p>
    </footer>
  )
}
