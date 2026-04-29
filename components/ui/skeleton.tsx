'use client'

import * as React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

/**
 * Shimmer is opacity-only, not a moving gradient — cheaper, and matches
 * the editorial calm of the rest of the system. Reduced motion is honored
 * globally via tokens.css transition-duration override.
 */
export function Skeleton({
  className,
  ...props
}: Omit<HTMLMotionProps<'div'>, 'animate' | 'transition'>) {
  return (
    <motion.div
      className={cn('rounded-md bg-surface-elevated', className)}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      {...props}
    />
  )
}
