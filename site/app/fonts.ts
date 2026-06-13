import localFont from 'next/font/local'

export const openRunde = localFont({
  src: [
    { path: './fonts/OpenRunde-Regular.woff', weight: '400', style: 'normal' },
    { path: './fonts/OpenRunde-Medium.woff', weight: '500', style: 'normal' },
    { path: './fonts/OpenRunde-Semibold.woff', weight: '600', style: 'normal' },
    { path: './fonts/OpenRunde-Bold.woff', weight: '700', style: 'normal' },
  ],
  variable: '--font-open-runde',
  display: 'swap',
})
