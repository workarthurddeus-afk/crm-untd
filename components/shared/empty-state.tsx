import { cn } from '@/lib/utils/cn'
import type { LucideIcon } from 'lucide-react'

interface Props {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: Props) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border',
        'bg-gradient-to-b from-surface/40 to-transparent',
        'shadow-sm-token',
        'px-6 py-12 text-center',
        className
      )}
    >
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-muted text-primary">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </div>
      )}
      <h3 className="font-display text-lg font-semibold tracking-tight text-text">
        {title}
      </h3>
      {description && (
        <p className="max-w-sm text-sm leading-relaxed text-text-muted">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
