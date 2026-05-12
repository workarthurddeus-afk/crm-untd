'use client'

import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useLeads } from '@/lib/hooks/use-leads'
import { useTasks } from '@/lib/hooks/use-tasks'
import { usePipelineStages } from '@/lib/hooks/use-pipeline-stages'
import { useICPProfile } from '@/lib/hooks/use-icp-profile'
import { useNotes } from '@/lib/hooks/use-notes'
import { useNoteFolders } from '@/lib/hooks/use-note-folders'
import { useBusinessMetricsSettings } from '@/lib/hooks/use-settings'
import { generateAlerts } from '@/lib/services/alerts.service'
import { deriveBusinessMetrics } from '@/lib/utils/business-math'
import { getDashboardBusinessMetrics } from '@/lib/utils/dashboard-metrics'
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
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton'
import { LeadFormDialog } from '@/components/leads/lead-form-dialog'
import { TaskFormSheet } from '@/components/tasks/task-form-sheet'
import { NoteEditorSheet } from '@/components/notes/note-editor-sheet'
import type { NoteInput, TaskInput } from '@/lib/types'

export default function DashboardPage() {
  const { leads, isLoading: leadsLoading } = useLeads()
  const {
    tasks,
    isLoading: tasksLoading,
    createTask,
    createTaskWithCalendar,
    updateTask,
    updateTaskWithCalendar,
    completeTask,
    reopenTask,
    cancelTask,
    archiveTask,
    restoreTask,
    deleteTaskPermanently,
    postponeTask,
    scheduleTaskOnCalendar,
  } = useTasks()
  const { stages, isLoading: stagesLoading } = usePipelineStages()
  const { profile, isLoading: profileLoading } = useICPProfile()
  const { notes, isLoading: notesLoading, actions: noteActions } = useNotes()
  const { folders } = useNoteFolders()
  const { metrics: settingsMetrics, isLoading: settingsLoading } = useBusinessMetricsSettings()
  const [leadDialogOpen, setLeadDialogOpen] = useState(false)
  const [taskSheetOpen, setTaskSheetOpen] = useState(false)
  const [noteEditorOpen, setNoteEditorOpen] = useState(false)
  const reduced = useReducedMotion()

  const today = useMemo(() => new Date(), [])
  const isLoading = leadsLoading || tasksLoading || stagesLoading || profileLoading || notesLoading || settingsLoading

  const alerts = useMemo(
    () => isLoading ? [] : generateAlerts({ leads, tasks, feedbacks: [], pipeline: stages, today }),
    [isLoading, leads, tasks, stages, today]
  )
  const businessMetrics = useMemo(() => getDashboardBusinessMetrics(settingsMetrics), [settingsMetrics])
  const derived = useMemo(() => deriveBusinessMetrics(businessMetrics), [businessMetrics])
  const memory = useMemo(() => isLoading ? null : getStrategicMemory(notes, today), [isLoading, notes, today])
  const pipelineSummary = useMemo(() => isLoading ? null : getPipelineSummary(leads, stages), [isLoading, leads, stages])
  const opportunity = useMemo(() => isLoading ? null : getBestOpportunity(leads), [isLoading, leads])
  const insights = useMemo(
    () => isLoading ? [] : getFounderInsights({ leads, tasks, notes, profile }),
    [isLoading, leads, tasks, notes, profile]
  )

  if (isLoading) return <DashboardSkeleton />

  return (
    <>
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: tokens.duration.slow / 1000, ease: tokens.easing.enter }}
        className="mx-auto max-w-[1400px] px-4 py-6 space-y-6 sm:px-6 lg:px-8"
      >
        <DashboardHeader
          today={today}
          onCreateLead={() => setLeadDialogOpen(true)}
          onCreateTask={() => setTaskSheetOpen(true)}
          onCreateNote={() => setNoteEditorOpen(true)}
          leads={leads}
          tasks={tasks}
          notes={notes}
        />

        <TopMetricsRow metrics={businessMetrics} leads={leads} tasks={tasks} alerts={alerts} today={today} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr] items-start">
          <OperationPulseCard activity={[]} />
          <div className="space-y-6">
            <PriorityOfDayCard tasks={tasks} today={today} />
            {memory && (
              <StrategicMemoryCard
                pick={memory}
                onTransformToTask={noteActions.createTaskFromNote}
              />
            )}
            <BusinessHealthCard metrics={businessMetrics} derived={derived} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr] items-start">
          <ActionCenter alerts={alerts} />
          {pipelineSummary && <PipelineMovementCard summary={pipelineSummary} />}
        </div>

        <FounderRadar insights={insights} opportunity={opportunity} />

      </motion.div>

      <LeadFormDialog open={leadDialogOpen} onClose={() => setLeadDialogOpen(false)} />

      <TaskFormSheet
        open={taskSheetOpen}
        task={null}
        leads={leads}
        notes={notes}
        onOpenChange={setTaskSheetOpen}
        onCreate={(input: TaskInput, options?: { addToCalendar?: boolean }) =>
          options?.addToCalendar ? createTaskWithCalendar(input, options).then((result) => result.task) : createTask(input)
        }
        onUpdate={(id: string, input: Partial<TaskInput>, options?: { addToCalendar?: boolean }) =>
          options?.addToCalendar ? updateTaskWithCalendar(id, input, options).then((result) => result.task) : updateTask(id, input)
        }
        onComplete={completeTask}
        onReopen={reopenTask}
        onCancelTask={cancelTask}
        onArchiveTask={archiveTask}
        onRestoreTask={restoreTask}
        onDeleteTask={deleteTaskPermanently}
        onPostpone={postponeTask}
        onScheduleOnCalendar={scheduleTaskOnCalendar}
      />

      <NoteEditorSheet
        open={noteEditorOpen}
        note={null}
        folders={folders}
        onOpenChange={setNoteEditorOpen}
        onCreate={(input: NoteInput) => noteActions.create(input)}
        onUpdate={(id: string, input: Partial<NoteInput>) => noteActions.update(id, input)}
        onArchive={async (id: string) => {
          await noteActions.archive(id)
        }}
        onRestore={async (id: string) => {
          await noteActions.restore(id)
        }}
        onTransformToTask={async (id: string) => {
          await noteActions.createTaskFromNote(id)
        }}
      />
    </>
  )
}
