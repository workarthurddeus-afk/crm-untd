'use client'

import { useState, useMemo, useCallback } from 'react'
import { Plus, ListChecks } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import { useTasks } from '@/lib/hooks/use-tasks'
import { useLeads } from '@/lib/hooks/use-leads'
import { useNotes } from '@/lib/hooks/use-notes'
import { tasksOverdue } from '@/lib/services/tasks.service'
import { TasksFilterChips, type FilterId } from '@/components/tasks/tasks-filter-chips'
import { TasksList } from '@/components/tasks/tasks-list'
import { TasksPageSkeleton } from '@/components/tasks/tasks-page-skeleton'
import { TaskFormSheet } from '@/components/tasks/task-form-sheet'
import type { Task, TaskInput, TaskStatus } from '@/lib/types'

export default function TasksPage() {
  const {
    tasks,
    isLoading: tasksLoading,
    createTask,
    updateTask,
    completeTask,
    reopenTask,
    cancelTask,
    postponeTask,
  } = useTasks()
  const { leads, isLoading: leadsLoading } = useLeads()
  const { notes } = useNotes()
  const [filter, setFilter] = useState<FilterId>('todas')
  const [overrides, setOverrides] = useState<Map<string, TaskStatus>>(new Map())
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
  const [taskSheetOpen, setTaskSheetOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const today = useMemo(() => new Date(), [])

  const effectiveTasks = useMemo(() => {
    if (overrides.size === 0) return tasks
    return tasks.map((t) => {
      const ov = overrides.get(t.id)
      return ov ? { ...t, status: ov } : t
    })
  }, [tasks, overrides])

  const leadById = useMemo(
    () => new Map(leads.map((l) => [l.id, l])),
    [leads],
  )

  const openCount = effectiveTasks.filter(
    (t) => t.status !== 'done' && t.status !== 'cancelled',
  ).length
  const overdueCount = tasksOverdue(effectiveTasks, today).length
  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? null,
    [tasks, selectedTaskId],
  )

  const description = (
    <span>
      <span className="font-display font-semibold tabular-nums text-text">
        {openCount}
      </span>
      <span className="text-text-muted"> abertas</span>
      {overdueCount > 0 && (
        <>
          <span className="text-text-muted"> · </span>
          <span className="font-display font-semibold tabular-nums text-danger">
            {overdueCount}
          </span>
          <span className="text-text-muted"> atrasadas</span>
        </>
      )}
    </span>
  )

  const handleToggle = useCallback(
    async (task: Task) => {
      if (pendingIds.has(task.id)) return

      const effectiveStatus = overrides.get(task.id) ?? task.status
      const next: TaskStatus =
        effectiveStatus === 'done' || effectiveStatus === 'cancelled'
          ? 'pending'
          : 'done'

      setOverrides((prev) => {
        const m = new Map(prev)
        m.set(task.id, next)
        return m
      })
      setPendingIds((prev) => {
        const s = new Set(prev)
        s.add(task.id)
        return s
      })

      try {
        await (next === 'done' ? completeTask(task.id) : reopenTask(task.id))
        toast.success(
          next === 'done' ? 'Tarefa concluída' : 'Tarefa reaberta',
          { description: task.title },
        )
      } catch (err) {
        setOverrides((prev) => {
          const m = new Map(prev)
          m.delete(task.id)
          return m
        })
        toast.error('Falha ao atualizar', {
          description: err instanceof Error ? err.message : String(err),
        })
      } finally {
        setPendingIds((prev) => {
          const s = new Set(prev)
          s.delete(task.id)
          return s
        })
        setOverrides((prev) => {
          const m = new Map(prev)
          m.delete(task.id)
          return m
        })
      }
    },
    [completeTask, overrides, pendingIds, reopenTask],
  )

  const openNewTask = useCallback(() => {
    setSelectedTaskId(null)
    setTaskSheetOpen(true)
  }, [])

  const openTask = useCallback((task: Task) => {
    setSelectedTaskId(task.id)
    setTaskSheetOpen(true)
  }, [])

  const handleCreateTask = useCallback(
    async (input: TaskInput) => createTask(input),
    [createTask],
  )

  const handleUpdateTask = useCallback(
    async (id: string, input: Partial<TaskInput>) => updateTask(id, input),
    [updateTask],
  )

  const isLoading = tasksLoading || leadsLoading

  return (
    <div>
      <PageHeader
        title="Tarefas"
        description={isLoading ? undefined : description}
        actions={
          <Button
            variant="primary"
            onClick={openNewTask}
          >
            <Plus aria-hidden />
            Nova tarefa
          </Button>
        }
      />

      {isLoading ? (
        <TasksPageSkeleton />
      ) : tasks.length === 0 ? (
        <div className="px-8 py-6">
          <EmptyState
            icon={ListChecks}
            title="Sem tarefas. Sem stress."
            description="Crie sua primeira tarefa para começar a organizar o dia."
            action={
              <Button
                variant="primary"
                onClick={openNewTask}
              >
                <Plus aria-hidden />
                Nova tarefa
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className="sticky top-0 z-10 bg-background">
            <TasksFilterChips
              tasks={effectiveTasks}
              active={filter}
              today={today}
              onChange={setFilter}
            />
          </div>
          <div className="px-8 py-4 pb-12">
            <TasksList
              tasks={effectiveTasks}
              filter={filter}
              today={today}
              leadById={leadById}
              pendingIds={pendingIds}
              onToggle={handleToggle}
              onOpenTask={openTask}
            />
          </div>
        </>
      )}

      <TaskFormSheet
        open={taskSheetOpen}
        task={selectedTask}
        leads={leads}
        notes={notes}
        onOpenChange={setTaskSheetOpen}
        onCreate={handleCreateTask}
        onUpdate={handleUpdateTask}
        onComplete={completeTask}
        onReopen={reopenTask}
        onCancelTask={cancelTask}
        onPostpone={postponeTask}
      />
    </div>
  )
}
