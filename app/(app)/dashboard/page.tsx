'use client'

import { useMemo } from 'react'
import { useLeads } from '@/lib/hooks/use-leads'
import { useTasks } from '@/lib/hooks/use-tasks'
import { usePipelineStages } from '@/lib/hooks/use-pipeline-stages'
import { generateAlerts } from '@/lib/services/alerts.service'
import { tasksOverdue, tasksDueToday } from '@/lib/services/tasks.service'
import { businessMetricsMock } from '@/lib/mocks/business-metrics'
import { deriveBusinessMetrics } from '@/lib/utils/business-math'
import { DashboardHero } from '@/components/dashboard/dashboard-hero'
import { KpisRow } from '@/components/dashboard/kpis-row'
import { AlertsFeed } from '@/components/dashboard/alerts-feed'
import { BusinessHealthCard } from '@/components/dashboard/business-health-card'
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton'

export default function DashboardPage() {
  const { leads, isLoading: leadsLoading } = useLeads()
  const { tasks, isLoading: tasksLoading } = useTasks()
  const { stages, isLoading: stagesLoading } = usePipelineStages()

  const today = useMemo(() => new Date(), [])
  const isLoading = leadsLoading || tasksLoading || stagesLoading

  const alerts = useMemo(
    () => isLoading ? [] : generateAlerts({ leads, tasks, feedbacks: [], pipeline: stages, today }),
    [isLoading, leads, tasks, stages, today],
  )

  const overdue = useMemo(() => isLoading ? [] : tasksOverdue(tasks, today), [isLoading, tasks, today])
  const dueToday = useMemo(() => isLoading ? [] : tasksDueToday(tasks, today), [isLoading, tasks, today])

  const derived = useMemo(() => deriveBusinessMetrics(businessMetricsMock), [])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="mx-auto max-w-7xl px-8 py-8">
      <DashboardHero today={today} />

      <KpisRow
        metrics={businessMetricsMock}
        leads={leads}
        overdueCount={overdue.length}
        todayCount={dueToday.length}
        alerts={alerts}
      />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px] items-start">
        <div className="min-w-0">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Alertas
          </h2>
          <AlertsFeed alerts={alerts} />
        </div>
        <div className="lg:sticky lg:top-6">
          <BusinessHealthCard metrics={businessMetricsMock} derived={derived} />
        </div>
      </div>
    </div>
  )
}
