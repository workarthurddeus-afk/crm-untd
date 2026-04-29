'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { tokens } from '@/lib/theme/tokens'

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const reduced = useReducedMotion()

  if (reduced) {
    return <>{children}</>
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{
          duration: tokens.duration.slow / 1000, // 350ms
          ease: tokens.easing.enter,             // [0, 0, 0.2, 1]
        }}
        className="h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
