import type { Metadata } from 'next'
import { fontSans, fontMono, fontDisplay } from './fonts'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
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
      <body>
        <TooltipProvider delayDuration={150}>{children}</TooltipProvider>
        <Toaster />
      </body>
    </html>
  )
}
