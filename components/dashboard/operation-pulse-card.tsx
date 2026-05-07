'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { Card } from '@/components/ui/card'
import { PeriodToggle } from './period-toggle'
import { dashboardChartTokens } from './dashboard-chart-tokens'
import { activityForPeriod, totalInteractions, totalsByCategory, type ActivityPeriod } from '@/lib/utils/operation-activity'
import type { OperationActivityPoint } from '@/lib/types/operation-activity'

interface Props { activity: OperationActivityPoint[] }

interface ChartPoint {
  date: string
  total: number
  label: string
}

interface RechartsTooltipProps {
  active?: boolean
  payload?: Array<{ payload: ChartPoint }>
}

function CustomTooltip({ active, payload }: RechartsTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  const p = payload[0]?.payload
  if (!p) return null
  return (
    <div className="rounded-md border border-border-subtle bg-surface-elevated px-3 py-2 shadow-md-token">
      <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted">{p.label}</p>
      <p className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-text">
        {p.total} {p.total === 1 ? 'interação' : 'interações'}
      </p>
    </div>
  )
}

export function OperationPulseCard({ activity }: Props) {
  const [period, setPeriod] = useState<ActivityPeriod>(30)
  const periodData = useMemo(() => activityForPeriod(activity, period), [activity, period])
  const total = useMemo(() => totalInteractions(periodData), [periodData])
  const totals = useMemo(() => totalsByCategory(periodData), [periodData])

  const chartData = useMemo<ChartPoint[]>(
    () =>
      periodData.map((p) => ({
        date: p.date,
        total: p.leads + p.followUps + p.meetings + p.pipelineMoves,
        label: format(parseISO(p.date), "dd 'de' MMM", { locale: ptBR }),
      })),
    [periodData]
  )

  const tickInterval = period === 7 ? 0 : period === 30 ? 6 : 14

  return (
    <Card className="overflow-hidden p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Pulso da Operação</h2>
          <p className="mt-1 text-sm text-text-secondary">Leads, follow-ups, tarefas e movimentos do funil</p>
        </div>
        <div className="shrink-0">
          <PeriodToggle value={period} onChange={setPeriod} />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="font-display text-4xl font-bold leading-none text-text tabular-nums font-mono">
          {total.toLocaleString('pt-BR')}
        </span>
        <span className="text-sm text-text-muted">interações no período</span>
      </div>

      <div className="mt-6 h-[260px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="pulseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={dashboardChartTokens.primary} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={dashboardChartTokens.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={dashboardChartTokens.border} vertical={false} />
              <XAxis
                dataKey="label"
                interval={tickInterval}
                tick={{ fill: dashboardChartTokens.textMuted, fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: dashboardChartTokens.border }}
              />
              <YAxis
                tick={{ fill: dashboardChartTokens.textMuted, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={32}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: dashboardChartTokens.primary, strokeOpacity: 0.4, strokeDasharray: '3 3' }} />
              <Area
                type="monotone"
                dataKey="total"
                stroke={dashboardChartTokens.primary}
                strokeWidth={2}
                fill="url(#pulseGradient)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-border-subtle bg-background/30 px-6 text-center">
            <p className="font-display text-base font-semibold text-text">Operacao limpa</p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-text-secondary">
              Cadastre o primeiro lead ou tarefa para o pulso operacional comecar a registrar atividade real.
            </p>
            <Link
              href="/leads"
              className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md border border-primary/25 bg-primary-muted px-4 text-sm font-medium text-primary transition-colors duration-fast hover:border-primary/45"
            >
              Criar primeiro lead
            </Link>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-border-subtle pt-4">
        <MiniStat label="Leads novos" value={totals.leads} />
        <MiniStat label="Follow-ups" value={totals.followUps} />
        <MiniStat label="Reuniões" value={totals.meetings} />
        <MiniStat label="Movimentos" value={totals.pipelineMoves} />
      </div>
    </Card>
  )
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted">{label}</span>
      <span className="font-mono text-base font-semibold tabular-nums text-text">{value.toLocaleString('pt-BR')}</span>
    </div>
  )
}
