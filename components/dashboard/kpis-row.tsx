'use client'

import { DollarSign, Users, TrendingUp, ListChecks } from 'lucide-react'
import { KPICard } from '@/components/shared/kpi-card'
import { formatBRL } from '@/lib/utils/currency'
import type { BusinessMetrics } from '@/lib/types/business-metrics'
import type { Lead } from '@/lib/types'
import type { Alert } from '@/lib/services/alerts.service'

interface Props {
  metrics: BusinessMetrics
  leads: Lead[]
  overdueCount: number
  todayCount: number
  alerts: Alert[]
}

function mrrDescription(newSubscribers: number): string {
  if (newSubscribers === 1) return '+1 novo assinante este mês'
  if (newSubscribers > 1) return `+${newSubscribers} novos assinantes este mês`
  return 'sem novos assinantes este mês'
}

function subscribersDescription(cancellations: number): string {
  if (cancellations === 0) return 'sem cancelamentos este mês'
  if (cancellations === 1) return '1 cancelamento este mês'
  return `${cancellations} cancelamentos este mês`
}

function followUpsDescription(count: number): string {
  if (count === 0) return 'sem follow-ups hoje'
  if (count === 1) return '1 follow-up hoje'
  return `${count} follow-ups hoje`
}

export function KpisRow({ metrics, leads, overdueCount, todayCount, alerts }: Props) {
  const openLeads = leads.filter((l) => l.result === 'open')
  const pipelineValue = openLeads.reduce((sum, l) => sum + (l.revenuePotential ?? 0), 0)

  const hotLeadsValue = openLeads
    .filter((l) => l.temperature === 'hot')
    .reduce((sum, l) => sum + (l.revenuePotential ?? 0), 0)

  const pipelineDescription = hotLeadsValue > 0
    ? `${formatBRL(hotLeadsValue)} quente`
    : 'sem leads quentes'

  const tasksTotal = overdueCount + todayCount

  const tasksAccent =
    overdueCount > 0 ? 'danger' : todayCount > 0 ? 'warning' : 'success'

  const followUpsAlert = alerts.find((a) => a.type === 'follow-ups-due-today')
  const followUpsCount = followUpsAlert?.count ?? 0

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KPICard
        label="MRR Atual"
        value={metrics.mrr}
        format={formatBRL}
        icon={DollarSign}
        accent="primary"
        description={mrrDescription(metrics.newSubscribers)}
      />
      <KPICard
        label="Assinantes Ativos"
        value={metrics.activeSubscribers}
        icon={Users}
        accent="success"
        description={subscribersDescription(metrics.cancellations)}
      />
      <KPICard
        label="Pipeline Aberto"
        value={pipelineValue}
        format={formatBRL}
        icon={TrendingUp}
        accent="primary"
        description={pipelineDescription}
      />
      <KPICard
        label="Ações Hoje"
        value={tasksTotal}
        icon={ListChecks}
        accent={tasksAccent}
        description={followUpsDescription(followUpsCount)}
      />
    </div>
  )
}
