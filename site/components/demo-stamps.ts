export interface DemoItem {
  id: string
  label: string
}

// Generic, domain-neutral stamps for the hero/demo fan.
export const DEMO_ITEMS: DemoItem[] = [
  { id: 'one', label: 'One' },
  { id: 'two', label: 'Two' },
  { id: 'three', label: 'Three' },
  { id: 'four', label: 'Four' },
  { id: 'five', label: 'Five' },
  { id: 'six', label: 'Six' },
  { id: 'seven', label: 'Seven' },
  { id: 'eight', label: 'Eight' },
]

const PALETTE = ['#295df6', '#c6a0fd', '#5cd500', '#ff7a45', '#ff3e8c', '#00c9a7']

// Deterministic id → color, so each stamp keeps a stable frame color.
export function demoColor(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length]
}
