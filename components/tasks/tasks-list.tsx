'use client'

import { useMemo } from 'react'
import {
  CheckCircle2,
  Sun,
  Calendar,
  Flag,
  Link2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
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
  onToggle: (task: Task) => void
  onOpenTask: (task: Task) => void
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
    description: '',
    Icon: CheckCircle2,
    iconClass: 'text-success',
  },
  atrasadas: {
    title: 'Nenhuma tarefa atrasada. Bom trabalho.',
    description: '',
    Icon: CheckCircle2,
    iconClass: 'text-success',
  },
  hoje: {
    title: 'Nada para hoje.',
    description: '',
    Icon: Sun,
    iconClass: 'text-warning',
  },
  'esta-semana': {
    title: 'Semana limpa.',
    description: '',
    Icon: Calendar,
    iconClass: 'text-info',
  },
  alta: {
    title: 'Sem tarefas de alta prioridade.',
    description: '',
    Icon: Flag,
    iconClass: 'text-text-muted',
  },
  'com-lead': {
    title: 'Nenhuma tarefa vinculada a leads.',
    description: '',
    Icon: Link2,
    iconClass: 'text-text-muted',
  },
}

export function TasksList({
  tasks,
  filter,
  today,
  leadById,
  pendingIds,
  onToggle,
  onOpenTask,
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
    const msg = filterEmptyMessages[filter]
    return (
      <EmptyState
        icon={msg.Icon}
        title={msg.title}
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
