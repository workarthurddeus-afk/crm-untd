'use client'
import { useMemo } from 'react'
import { DollarSign, Users, TrendingUp, ListChecks } from 'lucide-react'
import { TopMetricCard } from './top-metric-card'
import { formatBRL } from '@/lib/utils/currency'
import type { BusinessMetrics } from '@/lib/types/business-metrics'
import type { Alert } from '@/lib/services/alerts.service'
import type { Lead, Task } from '@/lib/types'
import { tasksOverdue, tasksDueToday } from '@/lib/services/tasks.service'

interface Props {
  metrics: BusinessMetrics
  leads: Lead[]
  tasks: Task[]
  alerts: Alert[]
  today: Date
}

export function TopMetricsRow({ metrics, leads, tasks, alerts, today }: Props) {
  const openLeads = useMemo(() => leads.filter(l => l.result === 'open'), [leads])
  const openValue = useMemo(() => openLeads.reduce((s, l) => s + (l.revenuePotential ?? 0), 0), [openLeads])
  const hotValue = useMemo(
    () => openLeads.filter(l => l.temperature === 'hot').reduce((s, l) => s + (l.revenuePotential ?? 0), 0),
    [openLeads]
  )
  const overdueCount = useMemo(() => tasksOverdue(tasks, today).length, [tasks, today])
  const todayCount = useMemo(() => tasksDueToday(tasks, today).length, [tasks, today])
  const totalActions = overdueCount + todayCount
  const followUpsAlert = alerts.find(a => a.type === 'follow-ups-due-today')
  const followUpsCount = followUpsAlert ? followUpsAlert.count : 0

  const newSubsLabel = metrics.newSubscribers === 0
    ? 'sem novos assinantes este mês'
    : metrics.newSubscribers === 1 ? '+1 novo assinante este mês' : `+${metrics.newSubscribers} novos assinantes este mês`
  const cancelLabel = metrics.cancellations === 0
    ? 'sem cancelamentos este mês'
    : metrics.cancellations === 1 ? '1 cancelamento este mês' : `${metrics.cancellations} cancelamentos este mês`
  const hotLabel = hotValue > 0 ? `${formatBRL(hotValue)} em leads quentes` : 'sem leads quentes'
  const actionsLabel = overdueCount > 0
    ? `${overdueCount} ${overdueCount === 1 ? 'atrasada' : 'atrasadas'} · ${followUpsCount} ${followUpsCount === 1 ? 'follow-up' : 'follow-ups'}`
    : todayCount > 0 ? `${todayCount} para fazer hoje · ${followUpsCount} ${followUpsCount === 1 ? 'follow-up' : 'follow-ups'}`
    : 'nada urgente para hoje'

  const actionsAccent = overdueCount > 0 ? 'danger' : todayCount > 0 ? 'warning' : 'success'

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <TopMetricCard label="MRR Atual" value={formatBRL(metrics.mrr)} description={newSubsLabel} Icon={DollarSign} accent="primary" />
      <TopMetricCard label="Assinantes Ativos" value={String(metrics.activeSubscribers)} description={cancelLabel} Icon={Users} accent="success" />
      <TopMetricCard label="Pipeline Aberto" value={formatBRL(openValue)} description={hotLabel} Icon={TrendingUp} accent="primary" />
      <TopMetricCard label="Ações Hoje" value={String(totalActions)} description={actionsLabel} Icon={ListChecks} accent={actionsAccent} />
    </div>
  )
}
