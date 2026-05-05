'use client'

import { AlertTriangle, CalendarClock, CalendarDays, Flame } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Skeleton } from '@/components/ui/skeleton'
import type { LucideIcon } from 'lucide-react'

interface Props {
  todayCount: number
  upcomingCount: number
  overdueCount: number
  highImportanceCount: number
  isLoading?: boolean
}

type Accent = 'primary' | 'info' | 'danger' | 'warning'

interface CardProps {
  label: string
  value: number
  hint?: string
  icon: LucideIcon
  accent: Accent
}

const accentBubble: Record<Accent, string> = {
  primary: 'bg-primary/12 text-primary',
  info: 'bg-info/12 text-info',
  danger: 'bg-danger/15 text-danger',
  warning: 'bg-warning/15 text-warning',
}

const accentValue: Record<Accent, string> = {
  primary: 'text-text',
  info: 'text-text',
  danger: 'text-danger',
  warning: 'text-warning',
}

function StatCard({ label, value, hint, icon: Icon, accent }: CardProps) {
  return (
    <div
      className={cn(
        'group relative min-h-[102px] overflow-hidden rounded-lg border border-border-subtle p-3',
        'bg-gradient-to-br from-surface-elevated to-surface',
        'transition-colors duration-fast hover:border-border'
      )}
    >
      {accent === 'primary' && (
        <div
          aria-hidden
          className="pointer-events-none absolute -top-14 -right-14 h-28 w-28 rounded-full opacity-45 transition-opacity duration-fast group-hover:opacity-65"
          style={{ background: 'radial-gradient(closest-side, rgba(83,50,234,0.24), transparent 70%)' }}
        />
      )}
      <div className="relative flex h-full flex-col justify-between gap-3">
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 text-[10px] font-medium uppercase tracking-[0.13em] text-text-muted">
            {label}
          </p>
          <div
            className={cn(
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
              accentBubble[accent]
            )}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'font-display text-[1.6rem] font-bold leading-none tabular-nums font-mono',
              accentValue[accent]
            )}
          >
            {value}
          </p>
          {hint && <p className="mt-1.5 line-clamp-2 text-[10.5px] leading-snug text-text-muted">{hint}</p>}
        </div>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="min-h-[102px] rounded-lg border border-border-subtle bg-surface/40 p-3">
      <Skeleton className="h-2.5 w-16" />
      <Skeleton className="mt-2 h-7 w-12" />
      <Skeleton className="mt-2 h-2.5 w-24" />
    </div>
  )
}

export function CalendarStatsRow({
  todayCount,
  upcomingCount,
  overdueCount,
  highImportanceCount,
  isLoading,
}: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2.5 px-4 py-3 sm:grid-cols-4 lg:px-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2.5 px-4 py-3 sm:grid-cols-4 lg:px-6">
      <StatCard
        label="Hoje"
        value={todayCount}
        hint={todayCount === 0 ? 'Sem eventos hoje' : 'Eventos e ações de hoje'}
        icon={CalendarDays}
        accent="primary"
      />
      <StatCard
        label="Próximos 7 dias"
        value={upcomingCount}
        hint="Agendados nos próximos sete dias"
        icon={CalendarClock}
        accent="info"
      />
      <StatCard
        label="Atrasados"
        value={overdueCount}
        hint={overdueCount === 0 ? 'Tudo em dia' : 'Lembretes ou eventos vencidos'}
        icon={AlertTriangle}
        accent={overdueCount > 0 ? 'danger' : 'primary'}
      />
      <StatCard
        label="Alta importância"
        value={highImportanceCount}
        hint="Itens críticos ou de alto impacto"
        icon={Flame}
        accent={highImportanceCount > 0 ? 'warning' : 'primary'}
      />
    </div>
  )
}
