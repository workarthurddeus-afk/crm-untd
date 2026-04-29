import type { Metadata } from 'next'
import { fontSans, fontMono, fontDisplay } from './fonts'
import './globals.css'

export const metadata: Metadata = {
  title: 'UNTD OS',
  description: 'Centro de comando da UNTD',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${fontSans.variable} ${fontMono.variable} ${fontDisplay.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
