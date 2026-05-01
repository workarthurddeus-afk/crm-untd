'use client'

import { cn } from '@/lib/utils/cn'
import { tasksOverdue, tasksDueToday, tasksThisWeek } from '@/lib/services/tasks.service'
import type { Task } from '@/lib/types'

export type FilterId =
  | 'todas'
  | 'atrasadas'
  | 'hoje'
  | 'esta-semana'
  | 'alta'
  | 'com-lead'

interface ChipDef {
  id: FilterId
  label: string
  count?: number
}

interface Props {
  tasks: Task[]
  active: FilterId
  today: Date
  onChange: (id: FilterId) => void
}

export function TasksFilterChips({ tasks, active, today, onChange }: Props) {
  const openTasks = tasks.filter(
    (t) => t.status !== 'done' && t.status !== 'cancelled',
  )
  const overdueCount = tasksOverdue(openTasks, today).length
  const todayTasks = tasksDueToday(openTasks, today)
  const todayCount = todayTasks.length
  const todayIds = new Set(todayTasks.map((t) => t.id))
  const thisWeekCount = tasksThisWeek(openTasks, today).filter(
    (t) => !todayIds.has(t.id),
  ).length

  const chips: ChipDef[] = [
    { id: 'todas', label: 'Todas' },
    { id: 'atrasadas', label: 'Atrasadas', count: overdueCount },
    { id: 'hoje', label: 'Hoje', count: todayCount },
    { id: 'esta-semana', label: 'Esta semana', count: thisWeekCount },
    { id: 'alta', label: 'Alta' },
    { id: 'com-lead', label: 'Com lead' },
  ]

  return (
    <div className="flex items-center gap-2 overflow-x-auto border-b border-border-subtle px-8 py-3">
      {chips.map((chip) => {
        const isActive = active === chip.id

        return (
          <button
            key={chip.id}
            type="button"
            onClick={() => onChange(chip.id)}
            className={cn(
              'inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border px-3',
              'text-xs font-medium',
              'transition-colors duration-fast',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
              isActive
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-surface text-text-secondary hover:border-primary/30 hover:text-text',
            )}
          >
            {chip.label}
            {chip.count !== undefined && chip.count > 0 && (
              <span className="font-mono tabular-nums text-[10px] opacity-70">
                {chip.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
