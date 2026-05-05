'use client'
import { cn } from '@/lib/utils/cn'
import type { ActivityPeriod } from '@/lib/utils/operation-activity'

interface Props {
  value: ActivityPeriod
  onChange: (v: ActivityPeriod) => void
}

const options: { value: ActivityPeriod; label: string }[] = [
  { value: 7, label: '7 dias' },
  { value: 30, label: '30 dias' },
  { value: 90, label: '90 dias' },
]

export function PeriodToggle({ value, onChange }: Props) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-md border border-border-subtle bg-surface p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-sm px-2.5 py-1 text-xs font-medium transition-colors duration-fast',
            value === opt.value
              ? 'bg-primary/15 text-primary'
              : 'text-text-secondary hover:text-text'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
