import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import 'stampstack/styles.css'
import { openRunde } from './fonts'

export const metadata: Metadata = {
  title: 'stampstack — a draggable 3D coverflow of postage-stamp cards',
  description:
    'A draggable 3D coverflow of scalloped postage-stamp cards. Bring your own content. Zero deps, ~5KB, React 18+.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={openRunde.variable}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
