'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { greetingFor } from '@/lib/utils/greeting'
import { cn } from '@/lib/utils/cn'

interface Props {
  today: Date
}

export function DashboardHero({ today }: Props) {
  const { label, Icon, iconClass } = greetingFor(today)

  const rawDate = format(today, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  const dateLabel = rawDate.charAt(0).toUpperCase() + rawDate.slice(1)

  return (
    <header className="flex items-center gap-2 mb-8">
      <Icon className={cn('h-5 w-5', iconClass)} strokeWidth={1.75} aria-hidden />
      <h1 className="font-display text-xl font-semibold text-text">
        {label}, Arthur
      </h1>
      <span className="text-text-muted">·</span>
      <span className="text-sm text-text-muted">{dateLabel}</span>
    </header>
  )
}
