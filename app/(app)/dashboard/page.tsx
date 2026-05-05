'use client'

import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useLeads } from '@/lib/hooks/use-leads'
import { useTasks } from '@/lib/hooks/use-tasks'
import { usePipelineStages } from '@/lib/hooks/use-pipeline-stages'
import { useICPProfile } from '@/lib/hooks/use-icp-profile'
import { useNotes } from '@/lib/hooks/use-notes'
import { generateAlerts } from '@/lib/services/alerts.service'
import { businessMetricsMock } from '@/lib/mocks/business-metrics'
import { deriveBusinessMetrics } from '@/lib/utils/business-math'
import { operationActivitySeed } from '@/lib/mocks/operation-activity'
import { socialMediaMock, metaAdsMock } from '@/lib/mocks/growth-signals'
import { getStrategicMemory } from '@/lib/utils/strategic-memory'
import { getPipelineSummary } from '@/lib/utils/pipeline-summary'
import { getBestOpportunity } from '@/lib/utils/best-opportunity'
import { getFounderInsights } from '@/lib/utils/founder-insights'
import { tokens } from '@/lib/theme/tokens'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { TopMetricsRow } from '@/components/dashboard/top-metrics-row'
import { OperationPulseCard } from '@/components/dashboard/operation-pulse-card'
import { PriorityOfDayCard } from '@/components/dashboard/priority-of-day-card'
import { StrategicMemoryCard } from '@/components/dashboard/strategic-memory-card'
import { BusinessHealthCard } from '@/components/dashboard/business-health-card'
import { ActionCenter } from '@/components/dashboard/action-center'
import { PipelineMovementCard } from '@/components/dashboard/pipeline-movement-card'
import { FounderRadar } from '@/components/dashboard/founder-radar'
import { GrowthSignals } from '@/components/dashboard/growth-signals'
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton'

export default function DashboardPage() {
  const { leads, isLoading: leadsLoading } = useLeads()
  const { tasks, isLoading: tasksLoading } = useTasks()
  const { stages, isLoading: stagesLoading } = usePipelineStages()
  const { profile, isLoading: profileLoading } = useICPProfile()
  const { notes, isLoading: notesLoading } = useNotes()
  const reduced = useReducedMotion()

  const today = useMemo(() => new Date(), [])
  const isLoading = leadsLoading || tasksLoading || stagesLoading || profileLoading || notesLoading

  const alerts = useMemo(
    () => isLoading ? [] : generateAlerts({ leads, tasks, feedbacks: [], pipeline: stages, today }),
    [isLoading, leads, tasks, stages, today]
  )
  const derived = useMemo(() => deriveBusinessMetrics(businessMetricsMock), [])
  const memory = useMemo(() => isLoading ? null : getStrategicMemory(notes, today), [isLoading, notes, today])
  const pipelineSummary = useMemo(() => isLoading ? null : getPipelineSummary(leads, stages), [isLoading, leads, stages])
  const opportunity = useMemo(() => isLoading ? null : getBestOpportunity(leads), [isLoading, leads])
  const insights = useMemo(
    () => isLoading ? [] : getFounderInsights({ leads, tasks, notes, profile }),
    [isLoading, leads, tasks, notes, profile]
  )

  if (isLoading) return <DashboardSkeleton />

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: tokens.duration.slow / 1000, ease: tokens.easing.enter }}
      className="mx-auto max-w-[1400px] px-8 py-6 space-y-6"
    >
      <DashboardHeader today={today} />

      <TopMetricsRow metrics={businessMetricsMock} leads={leads} tasks={tasks} alerts={alerts} today={today} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr] items-start">
        <OperationPulseCard activity={operationActivitySeed} />
        <div className="space-y-6">
          <PriorityOfDayCard tasks={tasks} today={today} />
          {memory && <StrategicMemoryCard pick={memory} />}
          <BusinessHealthCard metrics={businessMetricsMock} derived={derived} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr] items-start">
        <ActionCenter alerts={alerts} />
        {pipelineSummary && <PipelineMovementCard summary={pipelineSummary} />}
      </div>

      <FounderRadar insights={insights} opportunity={opportunity} />

      <GrowthSignals social={socialMediaMock} ads={metaAdsMock} />
    </motion.div>
  )
}
