'use client'

import { useEffect, useRef, useState } from 'react'
import { animate, useReducedMotion } from 'framer-motion'
import { tokens } from '@/lib/theme/tokens'
import { cn } from '@/lib/utils/cn'

type AsTag = 'span' | 'div'

interface Props {
  value: number
  duration?: number
  format?: (n: number) => string
  className?: string
  as?: AsTag
}

const defaultFormat = (n: number): string =>
  Math.round(n).toLocaleString('pt-BR')

export function AnimatedNumber({
  value,
  duration = tokens.duration.slow / 1000,
  format,
  className,
  as = 'span',
}: Props) {
  const [display, setDisplay] = useState(value)
  const reduced = useReducedMotion()
  const prevRef = useRef(value)

  useEffect(() => {
    if (reduced) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplay(value)
      prevRef.current = value
      return
    }
    const controls = animate(prevRef.current, value, {
      duration,
      ease: tokens.easing.enter,
      onUpdate: (v) => setDisplay(v),
      onComplete: () => {
        prevRef.current = value
      },
    })
    return () => controls.stop()
  }, [value, duration, reduced])

  const formatted = (format ?? defaultFormat)(display)
  const Tag = as
  return (
    <Tag className={cn('tabular-nums', className)}>{formatted}</Tag>
  )
}
