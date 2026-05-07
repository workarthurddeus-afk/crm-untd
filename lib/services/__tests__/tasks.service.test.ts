import { beforeEach, describe, expect, it } from 'vitest'
import {
  buildDailyPlan,
  cancelTask,
  completeTask,
  createTask,
  getDashboardTasksSummary,
  getOverdueTasks,
  getTasksForLead,
  getTasksForNote,
  getTodayTasks,
  getUpcomingTasks,
  reopenTask,
  scheduleTaskOnCalendar,
  postponeTask,
  tasksDueToday,
  tasksOverdue,
  tasksThisWeek,
  transformCalendarEventToTaskPayload,
  transformLeadToFollowUpTaskPayload,
  transformNoteToTaskPayload,
} from '../tasks.service'
import { calendarEventsRepo } from '@/lib/repositories/calendar-events.repository'
import { tasksSeed } from '@/lib/mocks/seeds/tasks.seed'
import { tasksRepo } from '@/lib/repositories/tasks.repository'
import type { CalendarEvent, Lead, Note, Task } from '@/lib/types'

const today = new Date('2026-05-01T12:00:00.000Z')
const seededToday = new Date(
  tasksSeed.find((task) => task.id === 'task-002')?.dueDate ?? today,
)

function seededTodayAt(hour: number): string {
  const date = new Date(seededToday)
  date.setUTCHours(hour, 0, 0, 0)
  return date.toISOString()
}

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

beforeEach(async () => {
  window.localStorage.clear()
  await tasksRepo.seedDemoData()
  await calendarEventsRepo.seedDemoData()
})

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

describe('task service actions', () => {
  it('completeTask marks a task as done and stamps completedAt', async () => {
    const completed = await completeTask('task-001', '2026-05-01T10:00:00.000Z')

    expect(completed.status).toBe('done')
    expect(completed.completedAt).toBe('2026-05-01T10:00:00.000Z')
  })

  it('reopenTask returns a completed task to pending and clears completion metadata', async () => {
    await completeTask('task-001', '2026-05-01T10:00:00.000Z')

    const reopened = await reopenTask('task-001')

    expect(reopened.status).toBe('pending')
    expect(reopened.completedAt).toBeUndefined()
  })

  it('cancelTask marks a task as cancelled and removes it from active overdue results', async () => {
    const cancelled = await cancelTask('task-001', '2026-05-01T10:00:00.000Z')
    const overdue = await getOverdueTasks(new Date('2026-05-05T12:00:00.000Z'))

    expect(cancelled.status).toBe('cancelled')
    expect(cancelled.cancelledAt).toBe('2026-05-01T10:00:00.000Z')
    expect(overdue.some((task) => task.id === 'task-001')).toBe(false)
  })

  it('postponeTask updates the due date without changing the current status', async () => {
    const postponed = await postponeTask('task-002', '2026-05-08T09:00:00.000Z')

    expect(postponed.dueDate).toBe('2026-05-08T09:00:00.000Z')
    expect(postponed.status).toBe('pending')
  })

  it('createTask validates and persists an operational task', async () => {
    const created = await createTask({
      title: 'Transformar insight em follow-up',
      description: 'Criar acao de acompanhamento para lead quente.',
      dueDate: '2026-05-06T12:00:00.000Z',
      importance: 'high',
      status: 'pending',
      category: 'follow-up',
      source: 'note',
      relatedNoteId: 'note-001',
      tagIds: ['follow-up', 'sales'],
    })

    expect(created.id).toBeTruthy()
    expect(created.source).toBe('note')
    expect(await tasksRepo.getById(created.id)).toMatchObject({
      title: 'Transformar insight em follow-up',
    })
  })

  it('scheduleTaskOnCalendar creates a linked calendar event and stores the event id on the task', async () => {
    const task = await createTask({
      title: 'Bloquear foco para revisar proposta',
      description: 'Transformar a pendencia em compromisso no calendario.',
      dueDate: '2026-05-09T13:00:00.000Z',
      importance: 'high',
      status: 'pending',
      category: 'strategy',
      tagIds: ['agenda', 'proposta'],
    })

    const result = await scheduleTaskOnCalendar(task.id)

    expect(result.created).toBe(true)
    expect(result.event).toMatchObject({
      title: 'Bloquear foco para revisar proposta',
      relatedTaskId: task.id,
      source: 'task',
    })
    expect(result.task.relatedCalendarEventId).toBe(result.event.id)
    await expect(calendarEventsRepo.getEventById(result.event.id)).resolves.toMatchObject({
      relatedTaskId: task.id,
    })
    await expect(tasksRepo.getById(task.id)).resolves.toMatchObject({
      relatedCalendarEventId: result.event.id,
    })
  })

  it('scheduleTaskOnCalendar reuses the existing linked event instead of duplicating', async () => {
    const first = await scheduleTaskOnCalendar('task-004')
    const second = await scheduleTaskOnCalendar('task-004')
    const linkedEvents = await calendarEventsRepo.getEventsByTaskId('task-004')

    expect(first.created).toBe(false)
    expect(second.created).toBe(false)
    expect(second.event.id).toBe(first.event.id)
    expect(linkedEvents).toHaveLength(1)
    await expect(tasksRepo.getById('task-004')).resolves.toMatchObject({
      relatedCalendarEventId: first.event.id,
    })
  })
})

describe('task operational queries', () => {
  it('getTodayTasks returns only open tasks due today', async () => {
    const tasks = await getTodayTasks(seededToday)

    expect(tasks.map((task) => task.id)).toEqual(['task-002', 'task-003'])
    expect(tasks.every((task) => task.status !== 'done' && task.status !== 'cancelled')).toBe(true)
  })

  it('getOverdueTasks returns only open overdue tasks', async () => {
    const tasks = await getOverdueTasks(seededToday)

    expect(tasks.map((task) => task.id)).toEqual(['task-001', 'task-009'])
  })

  it('getUpcomingTasks returns future open tasks within the requested window', async () => {
    const tasks = await getUpcomingTasks(3, seededToday)

    expect(tasks.map((task) => task.id)).toEqual(['task-004', 'task-005', 'task-006'])
    expect(tasks.every((task) => task.status !== 'done' && task.status !== 'cancelled')).toBe(true)
  })

  it('getDashboardTasksSummary calculates operational counters', async () => {
    await completeTask('task-002', seededTodayAt(15))

    const summary = await getDashboardTasksSummary(seededToday)

    expect(summary.open).toBe(9)
    expect(summary.today).toBe(1)
    expect(summary.overdue).toBe(2)
    expect(summary.highImportance).toBe(2)
    expect(summary.completedToday).toBe(1)
  })

  it('filters tasks by lead and note relationships', async () => {
    await createTask({
      title: 'Criar tarefa ligada a nota',
      dueDate: '2026-05-06T12:00:00.000Z',
      importance: 'medium',
      status: 'pending',
      category: 'strategy',
      relatedNoteId: 'note-001',
      tagIds: [],
    })

    await expect(getTasksForLead('lead-001')).resolves.toEqual([
      expect.objectContaining({ id: 'task-002' }),
    ])
    await expect(getTasksForNote('note-001')).resolves.toEqual([
      expect.objectContaining({ title: 'Criar tarefa ligada a nota' }),
    ])
  })
})

describe('task payload transforms', () => {
  it('creates a follow-up task payload from a lead', () => {
    const lead = {
      id: 'lead-001',
      name: 'Juliana Prado',
      company: 'Norte Social',
      niche: 'social media',
      origin: 'cold-dm',
      pipelineStageId: 'stage-001',
      temperature: 'hot',
      icpScore: 86,
      ownerId: 'arthur',
      tagIds: ['agency'],
      result: 'open',
      nextFollowUpAt: '2026-05-06T12:00:00.000Z',
      createdAt: '2026-05-01T00:00:00.000Z',
      updatedAt: '2026-05-01T00:00:00.000Z',
    } satisfies Lead

    expect(transformLeadToFollowUpTaskPayload(lead)).toMatchObject({
      title: 'Follow-up com Juliana Prado',
      dueDate: '2026-05-06T12:00:00.000Z',
      importance: 'high',
      category: 'follow-up',
      relatedLeadId: 'lead-001',
      source: 'lead',
    })
  })

  it('creates a task payload from a strategic note', () => {
    const note = {
      id: 'note-001',
      title: 'Ideia de oferta para social medias',
      content: 'Transformar objeções em oferta simples.',
      type: 'idea',
      status: 'active',
      priority: 'high',
      impact: 'high',
      effort: 'low',
      color: 'purple',
      tags: ['oferta'],
      isPinned: false,
      isFavorite: true,
      isArchived: false,
      source: 'manual',
      createdAt: '2026-05-01T00:00:00.000Z',
      updatedAt: '2026-05-01T00:00:00.000Z',
      tagIds: ['oferta'],
      relatedTo: 'sales',
      pinned: false,
      favorited: true,
    } satisfies Note

    expect(transformNoteToTaskPayload(note)).toMatchObject({
      title: 'Executar: Ideia de oferta para social medias',
      importance: 'high',
      category: 'strategy',
      relatedNoteId: 'note-001',
      source: 'note',
    })
  })

  it('creates a task payload from a calendar event', () => {
    const event = {
      id: 'event-001',
      title: 'Reuniao com lead quente',
      startAt: '2026-05-06T13:00:00.000Z',
      allDay: false,
      type: 'meeting',
      status: 'scheduled',
      priority: 'high',
      importance: 'critical',
      color: 'purple',
      attendees: [],
      tags: ['meeting'],
      relatedLeadId: 'lead-001',
      source: 'manual',
      isReminder: false,
      createdAt: '2026-05-01T00:00:00.000Z',
      updatedAt: '2026-05-01T00:00:00.000Z',
    } satisfies CalendarEvent

    expect(transformCalendarEventToTaskPayload(event)).toMatchObject({
      title: 'Preparar: Reuniao com lead quente',
      dueDate: '2026-05-06T13:00:00.000Z',
      importance: 'high',
      category: 'meeting',
      relatedCalendarEventId: 'event-001',
      relatedLeadId: 'lead-001',
      source: 'calendar',
    })
  })
})
