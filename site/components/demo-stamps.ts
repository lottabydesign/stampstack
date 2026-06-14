export interface DemoItem {
  id: string
  title: string
  subtitle: string
}

// Postage-themed demo stamps for the hero/demo fan — a name + "subject · year",
// echoing a real stamp collection. Shown on the stamp face (title) and in the
// tap toast (title + subtitle).
export const DEMO_ITEMS: DemoItem[] = [
  { id: 'meridian', title: 'Meridian', subtitle: 'Brass compass · 1972' },
  { id: 'aurora', title: 'Aurora', subtitle: 'Northern lights · 1965' },
  { id: 'tidewater', title: 'Tidewater', subtitle: 'Coastal survey · 1958' },
  { id: 'lumen', title: 'Lumen', subtitle: 'Lighthouse · 1981' },
  { id: 'verdant', title: 'Verdant', subtitle: 'Fern study · 1969' },
  { id: 'cinder', title: 'Cinder', subtitle: 'Steam engine · 1954' },
  { id: 'halcyon', title: 'Halcyon', subtitle: 'Kingfisher · 1977' },
  { id: 'zephyr', title: 'Zephyr', subtitle: 'Hot-air balloon · 1963' },
]

const PALETTE = ['#295df6', '#c6a0fd', '#5cd500', '#ff7a45', '#ff3e8c', '#00c9a7']

// Deterministic id → color, so each stamp keeps a stable frame color.
export function demoColor(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length]
}
