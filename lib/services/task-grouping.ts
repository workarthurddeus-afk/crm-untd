import type { Task, TaskImportance } from '@/lib/types'
import {
  tasksOverdue,
  tasksDueToday,
  tasksThisWeek,
} from '@/lib/services/tasks.service'

export interface TaskGroup {
  id: 'overdue' | 'today' | 'this-week' | 'future' | 'completed'
  label: string
  tone?: 'danger'
  tasks: Task[]
}

const importanceRank: Record<TaskImportance, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

function sortByImportanceThenDue(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const importanceDelta = importanceRank[a.importance] - importanceRank[b.importance]
    if (importanceDelta !== 0) return importanceDelta

    const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
    const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
    if (aTime !== bTime) return aTime - bTime

    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })
}

export function groupTasksForList(tasks: Task[], today: Date): TaskGroup[] {
  const overdue = tasksOverdue(tasks, today)
  const overdueIds = new Set(overdue.map((t) => t.id))

  const dueToday = tasksDueToday(tasks, today)
  const dueTodayIds = new Set(dueToday.map((t) => t.id))

  const thisWeek = tasksThisWeek(tasks, today).filter(
    (t) => !dueTodayIds.has(t.id) && !overdueIds.has(t.id)
  )
  const thisWeekIds = new Set(thisWeek.map((t) => t.id))

  const completed = tasks
    .filter((t) => t.status === 'done' || t.status === 'cancelled')
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )

  const future = tasks.filter(
    (t) =>
      t.status !== 'done' &&
      t.status !== 'cancelled' &&
      !overdueIds.has(t.id) &&
      !dueTodayIds.has(t.id) &&
      !thisWeekIds.has(t.id)
  )

  const groups: TaskGroup[] = []

  if (overdue.length > 0) {
    groups.push({
      id: 'overdue',
      label: 'Atrasadas',
      tone: 'danger',
      tasks: sortByImportanceThenDue(overdue),
    })
  }

  if (dueToday.length > 0) {
    groups.push({
      id: 'today',
      label: 'Hoje',
      tasks: sortByImportanceThenDue(dueToday),
    })
  }

  if (thisWeek.length > 0) {
    groups.push({
      id: 'this-week',
      label: 'Esta semana',
      tasks: sortByImportanceThenDue(thisWeek),
    })
  }

  if (future.length > 0) {
    groups.push({
      id: 'future',
      label: 'Futuras',
      tasks: sortByImportanceThenDue(future),
    })
  }

  if (completed.length > 0) {
    groups.push({
      id: 'completed',
      label: 'Concluídas',
      tasks: completed,
    })
  }

  return groups
}
