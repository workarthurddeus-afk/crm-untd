'use client'
import type { LucideIcon } from 'lucide-react'
import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type Accent = 'primary' | 'success' | 'warning' | 'danger'

interface Props {
  label: string
  value: string
  description?: string
  Icon: LucideIcon
  accent?: Accent
  trend?: { value: number; direction: 'up' | 'down' | 'flat' }
}

const accentBubble: Record<Accent, string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
}

export function TopMetricCard({ label, value, description, Icon, accent = 'primary', trend }: Props) {
  const TrendIcon = trend?.direction === 'up' ? TrendingUp : trend?.direction === 'down' ? TrendingDown : Minus
  const trendColor = trend?.direction === 'up' ? 'text-success' : trend?.direction === 'down' ? 'text-danger' : 'text-text-muted'

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-lg border border-border-subtle p-5',
        'bg-gradient-to-br from-surface-elevated to-surface',
        'transition-colors duration-fast hover:border-border'
      )}
    >
      {accent === 'primary' && (
        <div
          aria-hidden
          className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full opacity-50 transition-opacity duration-fast group-hover:opacity-70"
          style={{ background: 'radial-gradient(closest-side, rgba(83,50,234,0.28), transparent 70%)' }}
        />
      )}

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-text-muted">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold leading-none text-text tabular-nums font-mono">
            {value}
          </p>
          {description && <p className="mt-2 text-xs text-text-muted leading-snug">{description}</p>}
          {trend && (
            <div className={cn('mt-2 flex items-center gap-1 text-xs font-medium tabular-nums', trendColor)}>
              <TrendIcon className="h-3 w-3" strokeWidth={1.75} aria-hidden />
              <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
            </div>
          )}
        </div>
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-md', accentBubble[accent])}>
          <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </div>
      </div>
    </div>
  )
}
