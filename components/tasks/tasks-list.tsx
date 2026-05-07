'use client'

import { useMemo } from 'react'
import {
  CheckCircle2,
  Sun,
  Calendar,
  Flag,
  Link2,
  SlidersHorizontal,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { TasksGroupHeader } from './tasks-group-header'
import { TaskRow } from './task-row'
import { TasksCompletedGroup } from './tasks-completed-group'
import { groupTasksForList } from '@/lib/services/task-grouping'
import {
  tasksOverdue,
  tasksDueToday,
  tasksThisWeek,
} from '@/lib/services/tasks.service'
import type { Task, Lead } from '@/lib/types'
import type { FilterId } from './tasks-filter-chips'

interface Props {
  tasks: Task[]
  filter: FilterId
  today: Date
  leadById: Map<string, Lead>
  pendingIds: Set<string>
  hasAdvancedFilters?: boolean
  onToggle: (task: Task) => void
  onOpenTask: (task: Task) => void
  onClearAdvancedFilters?: () => void
}

function filterTasks(allTasks: Task[], filterId: FilterId, today: Date): Task[] {
  switch (filterId) {
    case 'todas':
      return allTasks
    case 'atrasadas':
      return tasksOverdue(allTasks, today)
    case 'hoje':
      return tasksDueToday(allTasks, today)
    case 'esta-semana':
      return tasksThisWeek(allTasks, today)
    case 'alta':
      return allTasks.filter(
        (t) =>
          t.importance === 'high' &&
          t.status !== 'done' &&
          t.status !== 'cancelled',
      )
    case 'com-lead':
      return allTasks.filter(
        (t) =>
          t.relatedLeadId !== undefined &&
          t.status !== 'done' &&
          t.status !== 'cancelled',
      )
  }
}

const filterEmptyMessages: Record<
  FilterId,
  { title: string; description: string; Icon: LucideIcon; iconClass: string }
> = {
  todas: {
    title: 'Sem tarefas.',
    description: 'Crie uma acao clara para tirar o plano da cabeca e colocar em movimento.',
    Icon: CheckCircle2,
    iconClass: 'text-success',
  },
  atrasadas: {
    title: 'Nenhuma tarefa atrasada. Bom trabalho.',
    description: 'O operacional esta sem pendencias vencidas neste recorte.',
    Icon: CheckCircle2,
    iconClass: 'text-success',
  },
  hoje: {
    title: 'Nada para hoje.',
    description: 'Use esse espaco para puxar uma prioridade ou manter o dia limpo.',
    Icon: Sun,
    iconClass: 'text-warning',
  },
  'esta-semana': {
    title: 'Semana limpa.',
    description: 'Nenhuma tarefa aberta aparece nos proximos dias deste filtro.',
    Icon: Calendar,
    iconClass: 'text-info',
  },
  alta: {
    title: 'Sem tarefas de alta prioridade.',
    description: 'As acoes criticas estao sob controle no recorte atual.',
    Icon: Flag,
    iconClass: 'text-text-secondary',
  },
  'com-lead': {
    title: 'Nenhuma tarefa vinculada a leads.',
    description: 'Quando houver follow-ups ou propostas, elas aparecem aqui com o lead conectado.',
    Icon: Link2,
    iconClass: 'text-text-secondary',
  },
}

export function TasksList({
  tasks,
  filter,
  today,
  leadById,
  pendingIds,
  hasAdvancedFilters = false,
  onToggle,
  onOpenTask,
  onClearAdvancedFilters,
}: Props) {
  const filtered = useMemo(
    () => filterTasks(tasks, filter, today),
    [tasks, filter, today],
  )

  const groups = useMemo(
    () => groupTasksForList(filtered, today),
    [filtered, today],
  )

  const openGroups = groups.filter((g) => g.id !== 'completed')
  const completedGroup = groups.find((g) => g.id === 'completed')

  if (filtered.length === 0 || (openGroups.length === 0 && !completedGroup)) {
    if (hasAdvancedFilters) {
      return (
        <EmptyState
          icon={SlidersHorizontal}
          title="Nenhuma tarefa nesse recorte."
          description="Ajuste os filtros para ampliar a lista operacional."
          action={
            onClearAdvancedFilters ? (
              <Button variant="secondary" onClick={onClearAdvancedFilters}>
                Limpar filtros
              </Button>
            ) : null
          }
          className="mt-8"
        />
      )
    }

    const msg = filterEmptyMessages[filter]
    return (
      <EmptyState
        icon={msg.Icon}
        title={msg.title}
        description={msg.description}
        className="mt-8"
      />
    )
  }

  return (
    <div>
      {openGroups.map((group) => (
        <div key={group.id}>
          <TasksGroupHeader
            label={group.label}
            count={group.tasks.length}
            tone={group.tone}
          />
          <div>
            {group.tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                now={today}
                leadById={leadById}
                isPending={pendingIds.has(task.id)}
                onToggle={onToggle}
                onOpen={onOpenTask}
              />
            ))}
          </div>
        </div>
      ))}

      {completedGroup && (
        <TasksCompletedGroup
          tasks={completedGroup.tasks}
          now={today}
          leadById={leadById}
          onToggle={onToggle}
          onOpenTask={onOpenTask}
        />
      )}
    </div>
  )
}
