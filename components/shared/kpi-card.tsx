import { Card, CardContent } from '@/components/ui/card'
import { AnimatedNumber } from './animated-number'
import { cn } from '@/lib/utils/cn'
import { TrendingDown, TrendingUp, Minus, type LucideIcon } from 'lucide-react'

type Accent = 'primary' | 'success' | 'warning' | 'danger'

interface Props {
  label: string
  value: number
  description?: string
  format?: (n: number) => string
  trend?: { value: number; direction: 'up' | 'down' | 'flat' }
  icon?: LucideIcon
  accent?: Accent
  className?: string
}

const accentChip: Record<Accent, string> = {
  primary: 'bg-primary-muted text-primary',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/15 text-danger',
}

export function KPICard({
  label,
  value,
  description,
  format,
  trend,
  icon: Icon,
  accent = 'primary',
  className,
}: Props) {
  const TrendIcon =
    trend?.direction === 'up'
      ? TrendingUp
      : trend?.direction === 'down'
        ? TrendingDown
        : Minus
  const trendColor =
    trend?.direction === 'up'
      ? 'text-success'
      : trend?.direction === 'down'
        ? 'text-danger'
        : 'text-text-muted'

  return (
    <Card
      interactive={false}
      className={cn('relative overflow-hidden', className)}
    >
      {accent === 'primary' && (
        <div
          aria-hidden
          className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full opacity-40"
          style={{
            background:
              'radial-gradient(closest-side, rgba(83,50,234,0.35), transparent 70%)',
          }}
        />
      )}
      <CardContent className="relative p-5 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              {label}
            </p>
            <AnimatedNumber
              as="div"
              value={value}
              format={format}
              className="mt-2 font-display text-3xl font-bold leading-none text-text"
            />
            {description && (
              <p className="mt-2 text-xs text-text-muted">{description}</p>
            )}
            {trend && (
              <div
                className={cn(
                  'mt-2 flex items-center gap-1 text-xs font-medium tabular-nums',
                  trendColor
                )}
              >
                <TrendIcon className="h-3 w-3" strokeWidth={1.75} />
                <span>
                  {trend.value > 0 ? '+' : ''}
                  {trend.value}%
                </span>
              </div>
            )}
          </div>
          {Icon && (
            <div
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-md',
                accentChip[accent]
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
