import { beforeEach, describe, expect, it } from 'vitest'
import type { CalendarEvent, Lead, Note, Task } from '@/lib/types'
import { calendarEventsRepo } from '@/lib/repositories/calendar-events.repository'
import { tasksRepo } from '@/lib/repositories/tasks.repository'
import {
  cancelCalendarEvent,
  deleteCalendarEvent,
  detectConflict,
  getDashboardCalendarSummary,
  getEventsGroupedByDay,
  getMonthAgenda,
  getOverdueReminders,
  getTodaySchedule,
  getWeekAgenda,
  markEventCompleted,
  markEventUncompleted,
  transformLeadFollowUpToCalendarEventPayload,
  transformNoteToCalendarEventPayload,
  transformTaskToCalendarEventPayload,
} from '../calendar.service'

const currentDate = new Date('2026-05-05T12:00:00.000Z')

function makeEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: 'event-test',
    title: 'Evento teste',
    description: 'Teste',
    startAt: '2026-05-05T14:00:00.000Z',
    endAt: '2026-05-05T15:00:00.000Z',
    allDay: false,
    type: 'meeting',
    status: 'scheduled',
    priority: 'medium',
    importance: 'medium',
    color: 'blue',
    attendees: [],
    tags: [],
    relatedLeadId: null,
    relatedTaskId: null,
    relatedNoteId: null,
    relatedFeedbackId: null,
    relatedProjectId: null,
    source: 'manual',
    isReminder: false,
    reminderAt: null,
    completedAt: null,
    createdAt: '2026-05-01T00:00:00.000Z',
    updatedAt: '2026-05-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('calendar.service', () => {
  beforeEach(async () => {
    window.localStorage.clear()
    await calendarEventsRepo.seedDemoData()
    await tasksRepo.seedDemoData()
  })

  it('getTodaySchedule returns today events ordered for the dashboard', async () => {
    const schedule = await getTodaySchedule({ currentDate })

    expect(schedule.length).toBeGreaterThan(0)
    expect(schedule.map((event) => event.id)).toContain('cal-001')
    expect(schedule.every((event) => event.status !== 'cancelled')).toBe(true)
    expect(schedule[0]?.allDay).toBe(true)
  })

  it('getWeekAgenda and getMonthAgenda return scoped active events', async () => {
    const week = await getWeekAgenda(currentDate)
    const month = await getMonthAgenda(currentDate)

    expect(week.length).toBeGreaterThan(0)
    expect(month.length).toBeGreaterThanOrEqual(week.length)
    expect(week.every((event) => event.status !== 'cancelled')).toBe(true)
  })

  it('detectConflict detects real time overlap', () => {
    const existing = [
      makeEvent({ id: 'existing', startAt: '2026-05-05T14:00:00.000Z', endAt: '2026-05-05T15:00:00.000Z' }),
    ]
    const incoming = makeEvent({ id: 'incoming', startAt: '2026-05-05T14:30:00.000Z', endAt: '2026-05-05T15:30:00.000Z' })

    expect(detectConflict(incoming, existing)).toBe(true)
  })

  it('detectConflict ignores cancelled events and all-day events when appropriate', () => {
    const cancelled = makeEvent({ id: 'cancelled', status: 'cancelled' })
    const allDay = makeEvent({ id: 'all-day', allDay: true, startAt: '2026-05-05T00:00:00.000Z', endAt: undefined })
    const incoming = makeEvent({ id: 'incoming', startAt: '2026-05-05T14:30:00.000Z', endAt: '2026-05-05T15:30:00.000Z' })

    expect(detectConflict(incoming, [cancelled, allDay])).toBe(false)
  })

  it('getOverdueReminders returns due reminders that are not completed', async () => {
    const reminders = await getOverdueReminders({ currentDate })

    expect(reminders.length).toBeGreaterThan(0)
    expect(reminders.every((event) => event.isReminder && event.status !== 'completed')).toBe(true)
    expect(reminders.map((event) => event.id)).toContain('cal-018')
  })

  it('getDashboardCalendarSummary calculates key schedule counters', async () => {
    const summary = await getDashboardCalendarSummary({ currentDate })

    expect(summary.todayCount).toBeGreaterThan(0)
    expect(summary.upcoming.length).toBeGreaterThan(0)
    expect(summary.overdue.length).toBeGreaterThan(0)
    expect(summary.completedToday).toBeGreaterThan(0)
    expect(summary.highImportanceToday.length).toBeGreaterThan(0)
  })

  it('markEventCompleted and markEventUncompleted keep completion fields consistent', async () => {
    const completed = await markEventCompleted('cal-005', { currentDate })
    expect(completed.status).toBe('completed')
    expect(completed.completedAt).toBe(currentDate.toISOString())

    const uncompleted = await markEventUncompleted('cal-005')
    expect(uncompleted.status).toBe('scheduled')
    expect(uncompleted.completedAt).toBeNull()
  })

  it('cancelCalendarEvent removes events from active schedules', async () => {
    await cancelCalendarEvent('cal-003')

    const today = await getTodaySchedule({ currentDate })
    expect(today.map((event) => event.id)).not.toContain('cal-003')
  })

  it('deleteCalendarEvent removes the event and clears the linked task pointer', async () => {
    const linked = (await calendarEventsRepo.getEventsByTaskId('task-004'))[0]
    expect(linked).toBeDefined()
    await tasksRepo.update('task-004', { relatedCalendarEventId: linked!.id })

    await deleteCalendarEvent(linked!.id)

    await expect(calendarEventsRepo.getEventById(linked!.id)).resolves.toBeNull()
    await expect(tasksRepo.getById('task-004')).resolves.toMatchObject({
      relatedCalendarEventId: null,
    })
  })

  it('getEventsGroupedByDay groups active events by date key', async () => {
    const grouped = await getEventsGroupedByDay('2026-05-05T00:00:00.000Z', '2026-05-08T23:59:59.999Z')

    expect(Object.keys(grouped)).toContain('2026-05-05')
    expect(grouped['2026-05-05']?.some((event) => event.id === 'cal-001')).toBe(true)
  })

  it('transforms task, note and lead payloads into calendar event drafts', () => {
    const task = {
      id: 'task-001',
      title: 'Enviar proposta',
      dueDate: '2026-05-06T12:00:00.000Z',
      importance: 'high',
      status: 'pending',
      category: 'follow-up',
      relatedLeadId: 'lead-001',
      tagIds: ['vendas'],
      createdAt: '2026-05-01T00:00:00.000Z',
      updatedAt: '2026-05-01T00:00:00.000Z',
    } satisfies Task
    const note = {
      id: 'note-001',
      title: 'Insight comercial',
      content: 'Transformar insight em acao.',
      type: 'sales',
      status: 'active',
      priority: 'high',
      impact: 'high',
      effort: 'low',
      color: 'green',
      tags: ['vendas'],
      isPinned: false,
      isFavorite: false,
      isArchived: false,
      tagIds: ['vendas'],
      relatedTo: 'sales',
      pinned: false,
      favorited: false,
      createdAt: '2026-05-01T00:00:00.000Z',
      updatedAt: '2026-05-01T00:00:00.000Z',
    } satisfies Note
    const lead = {
      id: 'lead-001',
      name: 'Juliana Mendes',
      company: 'Pixel & Code Agencia',
      role: 'Socia',
      niche: 'Agencia',
      origin: 'cold-dm',
      pipelineStageId: 'stage-replied',
      temperature: 'warm',
      icpScore: 80,
      pain: 'Criativos lentos.',
      revenuePotential: 4500,
      firstContactAt: '2026-05-01T00:00:00.000Z',
      lastContactAt: '2026-05-03T00:00:00.000Z',
      nextFollowUpAt: '2026-05-06T12:00:00.000Z',
      ownerId: 'arthur',
      tagIds: [],
      result: 'open',
      createdAt: '2026-05-01T00:00:00.000Z',
      updatedAt: '2026-05-01T00:00:00.000Z',
    } satisfies Lead

    expect(transformTaskToCalendarEventPayload(task)).toMatchObject({
      title: 'Enviar proposta',
      relatedTaskId: 'task-001',
      relatedLeadId: 'lead-001',
      source: 'task',
    })
    expect(transformNoteToCalendarEventPayload(note).relatedNoteId).toBe('note-001')
    expect(transformLeadFollowUpToCalendarEventPayload(lead)).toMatchObject({
      relatedLeadId: 'lead-001',
      type: 'follow_up',
      source: 'lead',
    })
  })
})
