import { Snowflake, Flame } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import type { LeadTemperature } from '@/lib/types'

interface Config {
  label: string
  variant: 'info' | 'warning' | 'danger'
  dotClass?: string
}

const map: Record<LeadTemperature, Config> = {
  cold: { label: 'Frio', variant: 'info' },
  warm: { label: 'Morno', variant: 'warning', dotClass: 'bg-warning' },
  hot: { label: 'Quente', variant: 'danger' },
}

export function TemperatureBadge({ value }: { value: LeadTemperature }) {
  const config = map[value]
  return (
    <Badge variant={config.variant} className="gap-1">
      {value === 'cold' && (
        <Snowflake className="h-2.5 w-2.5" strokeWidth={2} aria-hidden />
      )}
      {value === 'warm' && (
        <span
          aria-hidden
          className={cn('h-1.5 w-1.5 rounded-full', config.dotClass)}
        />
      )}
      {value === 'hot' && (
        <Flame className="h-2.5 w-2.5" strokeWidth={2} aria-hidden />
      )}
      {config.label}
    </Badge>
  )
}
