'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { tokens } from '@/lib/theme/tokens'

interface Props {
  score: number
  size?: number
  strokeWidth?: number
  className?: string
  showLabel?: boolean
  pulse?: boolean
}

function colorFor(score: number): string {
  if (score >= 80) return 'var(--primary)'
  if (score >= 60) return 'var(--info)'
  if (score >= 40) return 'var(--warning)'
  if (score >= 25) return 'var(--text-secondary)'
  return 'var(--text-muted)'
}

export function ICPScoreRing({
  score,
  size = 56,
  strokeWidth = 4,
  className,
  showLabel = true,
  pulse = false,
}: Props) {
  const reduced = useReducedMotion()
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const safeScore = Math.max(0, Math.min(100, Math.round(score)))
  const progress = safeScore / 100
  const offset = circumference * (1 - progress)
  const color = colorFor(safeScore)
  const labelColor = safeScore < 25 ? 'var(--text-muted)' : color
  const shouldPulse = pulse && safeScore >= 80 && !reduced

  const ring = (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
      aria-hidden
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="var(--border)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={circumference}
        initial={
          reduced
            ? { strokeDashoffset: offset, stroke: color }
            : { strokeDashoffset: circumference, stroke: color }
        }
        animate={{ strokeDashoffset: offset, stroke: color }}
        transition={{
          duration: tokens.duration.enter / 1000,
          ease: tokens.easing.enter,
        }}
      />
    </svg>
  )

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center',
        className
      )}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`ICP ${safeScore} de 100`}
    >
      {shouldPulse ? (
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              '0 0 8px rgba(83,50,234,0.2)',
              '0 0 24px rgba(83,50,234,0.35)',
              '0 0 8px rgba(83,50,234,0.2)',
            ],
          }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {ring}
        </motion.div>
      ) : (
        ring
      )}
      {showLabel && (
        <motion.span
          className="absolute inline-flex w-10 justify-center font-mono text-xs font-semibold tabular-nums leading-none"
          initial={false}
          animate={{ color: labelColor }}
          transition={{
            duration: tokens.duration.base / 1000,
            ease: tokens.easing.enter,
          }}
        >
          {safeScore}
        </motion.span>
      )}
    </div>
  )
}
