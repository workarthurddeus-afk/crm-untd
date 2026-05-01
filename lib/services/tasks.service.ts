import type { Task, TaskImportance } from '@/lib/types'

const importanceRank: Record<TaskImportance, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

function isOpenTask(task: Task): boolean {
  return task.status !== 'done' && task.status !== 'cancelled'
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

function isSameUtcDay(a: Date, b: Date): boolean {
  return startOfUtcDay(a).getTime() === startOfUtcDay(b).getTime()
}

function dueDate(task: Task): Date | null {
  return task.dueDate ? new Date(task.dueDate) : null
}

export function tasksDueToday(tasks: Task[], today: Date): Task[] {
  return tasks.filter((task) => {
    const due = dueDate(task)
    return isOpenTask(task) && due !== null && isSameUtcDay(due, today)
  })
}

export function tasksOverdue(tasks: Task[], today: Date): Task[] {
  const todayStart = startOfUtcDay(today).getTime()

  return tasks.filter((task) => {
    const due = dueDate(task)
    return isOpenTask(task) && due !== null && startOfUtcDay(due).getTime() < todayStart
  })
}

export function tasksThisWeek(tasks: Task[], today: Date): Task[] {
  const todayStart = startOfUtcDay(today).getTime()
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
  const weekEnd = todayStart + sevenDaysMs

  return tasks.filter((task) => {
    const due = dueDate(task)
    if (!isOpenTask(task) || due === null) return false

    const dueTime = startOfUtcDay(due).getTime()
    return dueTime >= todayStart && dueTime < weekEnd
  })
}

export function buildDailyPlan(tasks: Task[], today: Date): Task[] {
  const taskById = new Map<string, Task>()

  for (const task of [...tasksOverdue(tasks, today), ...tasksDueToday(tasks, today)]) {
    taskById.set(task.id, task)
  }

  return [...taskById.values()].sort((a, b) => {
    const overdueDelta =
      Number(tasksOverdue([b], today).length > 0) - Number(tasksOverdue([a], today).length > 0)
    if (overdueDelta !== 0) return overdueDelta

    const importanceDelta = importanceRank[a.importance] - importanceRank[b.importance]
    if (importanceDelta !== 0) return importanceDelta

    return (dueDate(a)?.getTime() ?? 0) - (dueDate(b)?.getTime() ?? 0)
  })
}
