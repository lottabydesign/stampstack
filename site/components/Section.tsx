export function Section({
  label,
  children,
  marginTop = 72,
}: {
  label: string
  children: React.ReactNode
  marginTop?: number
}) {
  return (
    <section style={{ marginTop }}>
      <p className="section-label">{label}</p>
      {children}
    </section>
  )
}
