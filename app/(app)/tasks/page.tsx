'use client'

import { useState, useMemo, useCallback } from 'react'
import { AlertTriangle, CalendarCheck2, Filter, Flag, ListChecks, Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/shared/empty-state'
import { useTasks } from '@/lib/hooks/use-tasks'
import { useLeads } from '@/lib/hooks/use-leads'
import { useNotes } from '@/lib/hooks/use-notes'
import { tasksDueToday, tasksOverdue } from '@/lib/services/tasks.service'
import { TasksFilterChips, type FilterId } from '@/components/tasks/tasks-filter-chips'
import { TasksList } from '@/components/tasks/tasks-list'
import { TasksPageSkeleton } from '@/components/tasks/tasks-page-skeleton'
import { TaskFormSheet } from '@/components/tasks/task-form-sheet'
import {
  TaskActiveFilterChips,
  TasksFilterSheet,
  defaultTaskAdvancedFilters,
  getActiveTaskFiltersCount,
} from '@/components/tasks/tasks-filter-sheet'
import {
  filterTasksAdvanced,
  removeTaskFilterById,
  type TaskAdvancedFilters,
} from '@/components/tasks/task-filter-utils'
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
    scheduleTaskOnCalendar,
  } = useTasks()
  const { leads, isLoading: leadsLoading } = useLeads()
  const { notes } = useNotes()
  const [filter, setFilter] = useState<FilterId>('todas')
  const [overrides, setOverrides] = useState<Map<string, TaskStatus>>(new Map())
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
  const [taskSheetOpen, setTaskSheetOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [filtersSheetOpen, setFiltersSheetOpen] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState<TaskAdvancedFilters>(
    defaultTaskAdvancedFilters,
  )

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
  const advancedFilteredTasks = useMemo(
    () => filterTasksAdvanced(effectiveTasks, advancedFilters, today),
    [advancedFilters, effectiveTasks, today],
  )
  const activeFiltersCount = getActiveTaskFiltersCount(advancedFilters)

  const openCount = advancedFilteredTasks.filter(
    (t) => t.status !== 'done' && t.status !== 'cancelled',
  ).length
  const activeTasks = advancedFilteredTasks.filter(
    (t) => t.status !== 'done' && t.status !== 'cancelled',
  )
  const overdueTasks = tasksOverdue(activeTasks, today)
  const overdueCount = overdueTasks.length
  const todayCount = tasksDueToday(activeTasks, today).length
  const pressureCount = new Set([
    ...overdueTasks.map((task) => task.id),
    ...activeTasks.filter((task) => task.importance === 'high').map((task) => task.id),
  ]).size
  const executionFocus =
    overdueCount > 0
      ? 'Recuperar pendencias'
      : todayCount > 0
        ? 'Fechar o plano de hoje'
        : 'Preparar proximas acoes'
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

  const resetAdvancedFilters = useCallback(() => {
    setAdvancedFilters(defaultTaskAdvancedFilters)
  }, [])

  const removeAdvancedFilter = useCallback((id: string) => {
    setAdvancedFilters((current) => removeTaskFilterById(current, id))
  }, [])

  const isLoading = tasksLoading || leadsLoading

  return (
    <div>
      <PageHeader
        title="Tarefas"
        description={isLoading ? undefined : description}
        className="flex-col px-4 sm:flex-row sm:px-6 lg:px-8"
        actions={
          <Button
            variant="primary"
            onClick={openNewTask}
            className="w-full sm:w-auto"
          >
            <Plus aria-hidden />
            Nova tarefa
          </Button>
        }
      />

      {isLoading ? (
        <TasksPageSkeleton />
      ) : tasks.length === 0 ? (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
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
          <section className="px-4 py-4 sm:px-6 lg:px-8">
            <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr]">
              <div className="rounded-xl border border-primary/20 bg-primary-muted/35 p-4 shadow-sm-token">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                      Foco de execucao
                    </p>
                    <p className="mt-2 font-display text-lg font-semibold leading-tight text-text">
                      {executionFocus}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                      {openCount} abertas no recorte atual
                    </p>
                  </div>
                  <Flag className="h-5 w-5 shrink-0 text-primary" strokeWidth={1.75} aria-hidden />
                </div>
              </div>
              <div className="rounded-xl border border-border bg-surface/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                      Hoje
                    </p>
                    <p className="mt-2 font-display text-2xl font-bold tabular-nums text-text">
                      {todayCount}
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">acoes com prazo no dia</p>
                  </div>
                  <CalendarCheck2 className="h-5 w-5 text-info" strokeWidth={1.75} aria-hidden />
                </div>
              </div>
              <div className="rounded-xl border border-border bg-surface/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                      Pressao
                    </p>
                    <p className="mt-2 font-display text-2xl font-bold tabular-nums text-text">
                      {pressureCount}
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">
                      atrasadas ou de alta importancia
                    </p>
                  </div>
                  <AlertTriangle
                    className={overdueCount > 0 ? 'h-5 w-5 text-danger' : 'h-5 w-5 text-warning'}
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </div>
              </div>
            </div>
          </section>
          <div className="sticky top-0 z-10 bg-background">
            <div className="flex flex-col gap-3 border-b border-border-subtle px-4 py-3 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
              <div className="relative min-w-0 flex-1 xl:max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <Input
                  value={advancedFilters.query}
                  onChange={(event) =>
                    setAdvancedFilters((current) => ({
                      ...current,
                      query: event.target.value,
                    }))
                  }
                  placeholder="Buscar tarefa, tag ou contexto..."
                  aria-label="Buscar tarefas"
                  className="h-9 pl-9"
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button
                  variant="secondary"
                  onClick={() => setFiltersSheetOpen(true)}
                  className="relative w-full justify-center sm:w-auto"
                >
                  <Filter aria-hidden />
                  Filtros
                  {activeFiltersCount > 0 && (
                    <span className="ml-0.5 rounded-full bg-primary px-1.5 py-0.5 font-mono text-[10px] leading-none text-white">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    onClick={resetAdvancedFilters}
                    className="w-full justify-center sm:w-auto"
                  >
                    Limpar
                  </Button>
                )}
              </div>
            </div>
            <TasksFilterChips
              tasks={advancedFilteredTasks}
              active={filter}
              today={today}
              onChange={setFilter}
            />
            <TaskActiveFilterChips
              filters={advancedFilters}
              onRemove={removeAdvancedFilter}
              onReset={resetAdvancedFilters}
            />
          </div>
          <div className="px-4 py-4 pb-12 sm:px-6 lg:px-8">
            <TasksList
              tasks={advancedFilteredTasks}
              filter={filter}
              today={today}
              leadById={leadById}
              pendingIds={pendingIds}
              onToggle={handleToggle}
              onOpenTask={openTask}
              hasAdvancedFilters={activeFiltersCount > 0}
              onClearAdvancedFilters={resetAdvancedFilters}
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
        onScheduleOnCalendar={scheduleTaskOnCalendar}
      />
      <TasksFilterSheet
        open={filtersSheetOpen}
        filters={advancedFilters}
        leads={leads}
        notes={notes}
        onOpenChange={setFiltersSheetOpen}
        onChange={setAdvancedFilters}
        onReset={resetAdvancedFilters}
      />
    </div>
  )
}
