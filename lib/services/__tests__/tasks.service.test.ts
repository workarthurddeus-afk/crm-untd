import { describe, expect, it } from 'vitest'
import { buildDailyPlan, tasksDueToday, tasksOverdue, tasksThisWeek } from '../tasks.service'
import type { Task } from '@/lib/types'

const today = new Date('2026-05-01T12:00:00.000Z')

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-test',
    title: 'Task test',
    dueDate: '2026-05-01T09:00:00.000Z',
    importance: 'medium',
    status: 'pending',
    category: 'ops',
    tagIds: [],
    createdAt: '2026-04-20T00:00:00.000Z',
    updatedAt: '2026-04-20T00:00:00.000Z',
    ...overrides,
  }
}

describe('tasksDueToday', () => {
  it('returns open tasks due on the same UTC day', () => {
    const tasks = [
      makeTask({ id: 'today', dueDate: '2026-05-01T08:00:00.000Z' }),
      makeTask({ id: 'tomorrow', dueDate: '2026-05-02T08:00:00.000Z' }),
      makeTask({ id: 'done', status: 'done', dueDate: '2026-05-01T08:00:00.000Z' }),
    ]

    expect(tasksDueToday(tasks, today).map((task) => task.id)).toEqual(['today'])
  })
})

describe('tasksOverdue', () => {
  it('returns open tasks due before today', () => {
    const tasks = [
      makeTask({ id: 'overdue', dueDate: '2026-04-30T08:00:00.000Z' }),
      makeTask({ id: 'today', dueDate: '2026-05-01T08:00:00.000Z' }),
      makeTask({ id: 'cancelled', status: 'cancelled', dueDate: '2026-04-29T08:00:00.000Z' }),
    ]

    expect(tasksOverdue(tasks, today).map((task) => task.id)).toEqual(['overdue'])
  })
})

describe('tasksThisWeek', () => {
  it('returns open tasks in the next seven days including today', () => {
    const tasks = [
      makeTask({ id: 'today', dueDate: '2026-05-01T08:00:00.000Z' }),
      makeTask({ id: 'week', dueDate: '2026-05-07T08:00:00.000Z' }),
      makeTask({ id: 'later', dueDate: '2026-05-09T08:00:00.000Z' }),
    ]

    expect(tasksThisWeek(tasks, today).map((task) => task.id)).toEqual(['today', 'week'])
  })
})

describe('buildDailyPlan', () => {
  it('prioritizes overdue, high importance, then earlier due time', () => {
    const tasks = [
      makeTask({ id: 'normal-today', importance: 'low', dueDate: '2026-05-01T08:00:00.000Z' }),
      makeTask({ id: 'high-today-late', importance: 'high', dueDate: '2026-05-01T18:00:00.000Z' }),
      makeTask({ id: 'overdue-medium', importance: 'medium', dueDate: '2026-04-30T18:00:00.000Z' }),
      makeTask({ id: 'high-today-early', importance: 'high', dueDate: '2026-05-01T09:00:00.000Z' }),
    ]

    expect(buildDailyPlan(tasks, today).map((task) => task.id)).toEqual([
      'overdue-medium',
      'high-today-early',
      'high-today-late',
      'normal-today',
    ])
  })
})
