'use client'

import { Info } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils/cn'
import { formatBRL, formatBRLCompact, formatPercent } from '@/lib/utils/currency'
import type { BusinessMetrics } from '@/lib/types/business-metrics'
import type { DerivedMetrics } from '@/lib/utils/business-math'

const MONTH_LABELS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']

function monthLabel(monthIso: string): string {
  const parts = monthIso.split('-')
  const yearStr = parts[0] ?? ''
  const monthStr = parts[1] ?? '01'
  const monthIndex = parseInt(monthStr, 10) - 1
  const yearShort = yearStr.slice(2)
  return `${MONTH_LABELS[monthIndex] ?? '???'}/${yearShort}`
}

interface RowProps {
  label: string
  value: string
  valueClass?: string
  highlight?: boolean
}

function Row({ label, value, valueClass, highlight }: RowProps) {
  return (
    <div className={cn('flex items-baseline justify-between gap-3', highlight && 'pt-1')}>
      <dt className={cn('text-xs', highlight ? 'text-text-secondary font-medium' : 'text-text-muted')}>
        {label}
      </dt>
      <dd className={cn(
        'font-mono tabular-nums',
        highlight ? 'text-base font-semibold' : 'text-sm',
        valueClass ?? 'text-text',
      )}>
        {value}
      </dd>
    </div>
  )
}

interface Props {
  metrics: BusinessMetrics
  derived: DerivedMetrics
}

export function BusinessHealthCard({ metrics, derived }: Props) {
  const label = monthLabel(metrics.monthIso)
  const balancePrefix = derived.netBalance > 0 ? '+' : ''

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Saúde do Negócio
        </h2>
        <span className="text-[10px] font-mono tabular-nums text-text-muted">
          {label}
        </span>
      </div>

      <dl className="space-y-2.5">
        <Row label="Receita recebida" value={formatBRL(metrics.revenueReceived)} />
        <Row label="Investimento" value={formatBRL(metrics.investment)} />
        <Row
          label="Saldo"
          value={`${balancePrefix}${formatBRL(derived.netBalance)}`}
          valueClass={derived.isPositive ? 'text-success' : 'text-danger'}
          highlight
        />
      </dl>

      <Separator className="my-4" />

      <dl className="space-y-2.5">
        <Row
          label="Novos assinantes"
          value={`+${metrics.newSubscribers}`}
          valueClass={metrics.newSubscribers > 0 ? 'text-success' : 'text-text-secondary'}
        />
        <Row
          label="Cancelamentos"
          value={String(metrics.cancellations)}
          valueClass={metrics.cancellations > 0 ? 'text-danger' : 'text-text-secondary'}
        />
        <Row label="Churn" value={formatPercent(derived.churnRate)} />
      </dl>

      <Separator className="my-4" />

      <Row label="ARR" value={formatBRLCompact(derived.arr)} />

      <p className="mt-4 flex items-center gap-1.5 text-[11px] text-text-muted">
        <Info className="h-3 w-3" strokeWidth={1.5} aria-hidden />
        Dados manuais por enquanto.
      </p>
    </Card>
  )
}
