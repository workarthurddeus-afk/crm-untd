'use client'

import { useState, useMemo, useCallback } from 'react'
import { Plus, ListChecks } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import { useTasks } from '@/lib/hooks/use-tasks'
import { useLeads } from '@/lib/hooks/use-leads'
import { tasksRepo } from '@/lib/repositories/tasks.repository'
import { tasksOverdue } from '@/lib/services/tasks.service'
import { TasksFilterChips, type FilterId } from '@/components/tasks/tasks-filter-chips'
import { TasksList } from '@/components/tasks/tasks-list'
import { TasksPageSkeleton } from '@/components/tasks/tasks-page-skeleton'
import type { Task, TaskStatus } from '@/lib/types'

export default function TasksPage() {
  const { tasks, isLoading: tasksLoading } = useTasks()
  const { leads, isLoading: leadsLoading } = useLeads()
  const [filter, setFilter] = useState<FilterId>('todas')
  const [overrides, setOverrides] = useState<Map<string, TaskStatus>>(new Map())
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())

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
      const next: TaskStatus = effectiveStatus === 'done' ? 'pending' : 'done'

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
        await tasksRepo.update(task.id, { status: next })
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
    [overrides, pendingIds],
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
            onClick={() => toast.info('Criação chega na próxima task.')}
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
                onClick={() => toast.info('Criação chega na próxima task.')}
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
            />
          </div>
        </>
      )}
    </div>
  )
}
