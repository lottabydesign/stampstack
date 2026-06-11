export function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 72 }}>
      <p className="section-label">{label}</p>
      {children}
    </section>
  )
}
