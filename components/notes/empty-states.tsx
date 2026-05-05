import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Props {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function NoteEmptyState({ icon: Icon, title, description, action, className }: Props) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-border-subtle',
        'bg-gradient-to-b from-surface/30 to-transparent px-6 py-10 text-center',
        className
      )}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
      </div>
      <h3 className="mt-3 font-display text-base font-semibold text-text">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-text-muted">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
