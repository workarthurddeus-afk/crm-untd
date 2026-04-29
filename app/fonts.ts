import { Inter, JetBrains_Mono } from 'next/font/google'
import localFont from 'next/font/local'

export const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

// Activate once public/fonts/satoshi/*.woff2 files are present.
// Download from: https://www.fontshare.com/fonts/satoshi
// Files needed: Satoshi-Regular.woff2, Satoshi-Medium.woff2, Satoshi-Bold.woff2, Satoshi-Black.woff2
export const fontDisplay = localFont({
  variable: '--font-display',
  display: 'swap',
  src: [
    { path: '../public/fonts/satoshi/Satoshi-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/satoshi/Satoshi-Medium.woff2',  weight: '500', style: 'normal' },
    { path: '../public/fonts/satoshi/Satoshi-Bold.woff2',    weight: '700', style: 'normal' },
    { path: '../public/fonts/satoshi/Satoshi-Black.woff2',   weight: '900', style: 'normal' },
  ],
})
