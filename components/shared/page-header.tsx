import { cn } from '@/lib/utils/cn'

interface Props {
  title: string
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, actions, className }: Props) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 border-b border-border px-8 py-6',
        className
      )}
    >
      <div>
        <h1 className="font-display text-xl font-bold tracking-tight text-text">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-text-muted">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
