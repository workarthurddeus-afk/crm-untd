'use client'

import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { TaskStatus } from '@/lib/types'

interface Props {
  status: TaskStatus
  title: string
  isPending?: boolean
  onToggle: () => void
}

export function TaskCheckbox({ status, title, isPending, onToggle }: Props) {
  const shouldReduceMotion = useReducedMotion()

  const ariaLabel =
    status === 'done'
      ? `Reabrir '${title}'`
      : `Marcar '${title}' como concluída`

  const containerClass = cn(
    'relative flex h-11 w-11 shrink-0 items-center justify-center rounded-md cursor-pointer',
    'transition-[background-color] duration-base hover:bg-surface-elevated/45',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    isPending && 'opacity-50 cursor-not-allowed',
  )

  const visualClass = cn(
    'relative flex h-5 w-5 items-center justify-center rounded-full border-2',
    'transition-[border-color,background-color] duration-base',
    status === 'pending' &&
      'border-border hover:border-primary bg-transparent',
    status === 'in-progress' &&
      'border-info bg-transparent',
    status === 'done' &&
      'border-success bg-success',
    status === 'cancelled' &&
      'border-text-muted bg-text-muted/20',
  )

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={isPending}
      onClick={(e) => {
        e.stopPropagation()
        if (!isPending) onToggle()
      }}
      className={containerClass}
    >
      <span className={visualClass}>
        {status === 'in-progress' && (
          <span className="h-2 w-2 rounded-full bg-info" />
        )}

        <AnimatePresence>
          {status === 'done' && (
            <motion.div
              key="check"
              initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 500, damping: 25 }
              }
              className="absolute inset-0 flex items-center justify-center"
            >
              <Check className="h-3 w-3 text-white" strokeWidth={3} />
            </motion.div>
          )}
          {status === 'cancelled' && (
            <motion.div
              key="x"
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={
                shouldReduceMotion ? { duration: 0 } : { duration: 0.15 }
              }
              className="absolute inset-0 flex items-center justify-center"
            >
              <X className="h-3 w-3 text-text-secondary" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </span>
    </button>
  )
}
