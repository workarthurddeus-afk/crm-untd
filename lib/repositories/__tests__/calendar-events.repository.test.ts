import { beforeEach, describe, expect, it } from 'vitest'
import { calendarEventsRepo } from '../calendar-events.repository'

const currentDate = new Date('2026-05-05T12:00:00.000Z')

describe('calendarEventsRepo', () => {
  beforeEach(async () => {
    window.localStorage.clear()
    await calendarEventsRepo.reset()
  })

  it('lists active events by default', async () => {
    const events = await calendarEventsRepo.listEvents()

    expect(events.length).toBeGreaterThanOrEqual(23)
    expect(events.every((event) => event.status !== 'cancelled')).toBe(true)
  })

  it('gets events by range, day, week and month', async () => {
    const day = await calendarEventsRepo.getEventsByDay(currentDate)
    const week = await calendarEventsRepo.getEventsByWeek(currentDate)
    const month = await calendarEventsRepo.getEventsByMonth(currentDate)
    const range = await calendarEventsRepo.getEventsByRange(
      '2026-05-05T00:00:00.000Z',
      '2026-05-06T00:00:00.000Z'
    )

    expect(day.some((event) => event.id === 'cal-001')).toBe(true)
    expect(week.length).toBeGreaterThanOrEqual(day.length)
    expect(month.length).toBeGreaterThanOrEqual(week.length)
    expect(range.map((event) => event.id)).toContain('cal-001')
  })

  it('creates and updates events preserving calendar metadata', async () => {
    const created = await calendarEventsRepo.createEvent({
      title: 'Revisar agenda comercial',
      description: 'Ajustar proximos follow-ups da semana.',
      startAt: '2026-05-05T19:00:00.000Z',
      allDay: false,
      type: 'strategy',
      status: 'scheduled',
      priority: 'high',
      importance: 'high',
      color: 'purple',
      attendees: [],
      tags: ['agenda', 'vendas'],
      source: 'manual',
      isReminder: false,
    })

    expect(created.id).toBeTruthy()
    expect(created.endAt).toBe('2026-05-05T20:00:00.000Z')
    expect(created.tags).toEqual(['agenda', 'vendas'])

    const updated = await calendarEventsRepo.updateEvent(created.id, { title: 'Agenda comercial revisada' })
    expect(updated.title).toBe('Agenda comercial revisada')
  })

  it('complete and uncomplete keep status and completedAt consistent', async () => {
    const completed = await calendarEventsRepo.completeEvent('cal-004', currentDate)
    expect(completed.status).toBe('completed')
    expect(completed.completedAt).toBe(currentDate.toISOString())

    const reopened = await calendarEventsRepo.uncompleteEvent('cal-004')
    expect(reopened.status).toBe('scheduled')
    expect(reopened.completedAt).toBeNull()
  })

  it('cancelEvent removes an event from default active agenda', async () => {
    await calendarEventsRepo.cancelEvent('cal-002')

    const active = await calendarEventsRepo.listEvents()
    expect(active.map((event) => event.id)).not.toContain('cal-002')

    const cancelled = await calendarEventsRepo.listEvents({ includeCancelled: true, status: 'cancelled' })
    expect(cancelled.map((event) => event.id)).toContain('cal-002')
  })

  it('filters by type, status, priority and tags', async () => {
    const followUps = await calendarEventsRepo.filterEvents({ type: 'follow_up' })
    const highPriority = await calendarEventsRepo.filterEvents({ priority: 'high' })
    const salesTags = await calendarEventsRepo.filterEvents({ tags: ['vendas'] })
    const completed = await calendarEventsRepo.filterEvents({ status: 'completed', includeCompleted: true })

    expect(followUps.every((event) => event.type === 'follow_up')).toBe(true)
    expect(highPriority.every((event) => event.priority === 'high')).toBe(true)
    expect(salesTags.every((event) => event.tags.includes('vendas'))).toBe(true)
    expect(completed.every((event) => event.status === 'completed')).toBe(true)
  })

  it('searches events by title and description', async () => {
    const byTitle = await calendarEventsRepo.searchEvents('BrandKit')
    const byDescription = await calendarEventsRepo.searchEvents('proposta')

    expect(byTitle.some((event) => event.title.includes('BrandKit'))).toBe(true)
    expect(byDescription.length).toBeGreaterThan(0)
  })
})
