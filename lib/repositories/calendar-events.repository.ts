import { calendarEventsSeed } from '@/lib/mocks/seeds/calendar-events.seed'
import type { CalendarEvent, CalendarEventInput, CalendarFilters } from '@/lib/types'
import {
  filterEvents as applyEventFilters,
  getDefaultEndAt,
  normalizeCalendarEvent,
  normalizeCalendarTag,
  sortEventsForAgenda,
  type CalendarSort,
} from '@/lib/utils/calendar'
import {
  getEndOfDay,
  getEndOfMonth,
  getEndOfWeek,
  getStartOfDay,
  getStartOfMonth,
  getStartOfWeek,
  parseDate,
} from '@/lib/utils/date-range'
import { createMockRepository } from './mock-storage'

const storageRepo = createMockRepository<CalendarEvent>(
  'untd-calendar-events',
  calendarEventsSeed.map(normalizeCalendarEvent)
)

type CreateCalendarEventInput = Partial<CalendarEventInput> &
  Pick<
    CalendarEventInput,
    'title' | 'startAt' | 'allDay' | 'type' | 'status' | 'priority' | 'importance' | 'color' | 'attendees' | 'tags' | 'source' | 'isReminder'
  >

async function allEvents(): Promise<CalendarEvent[]> {
  return (await storageRepo.list()).map(normalizeCalendarEvent)
}

function completeForCreate(input: CreateCalendarEventInput): Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'> {
  const status = input.status ?? 'scheduled'
  const completedAt = status === 'completed' ? input.completedAt ?? new Date().toISOString() : input.completedAt ?? null

  return {
    title: input.title,
    description: input.description,
    startAt: input.startAt,
    endAt: input.allDay ? input.endAt : input.endAt ?? getDefaultEndAt(input.startAt),
    allDay: input.allDay,
    type: input.type,
    status,
    priority: input.priority,
    importance: input.importance,
    color: input.color,
    location: input.location,
    meetingUrl: input.meetingUrl,
    attendees: input.attendees ?? [],
    tags: [...new Set((input.tags ?? []).map(normalizeCalendarTag).filter(Boolean))],
    relatedLeadId: input.relatedLeadId ?? null,
    relatedTaskId: input.relatedTaskId ?? null,
    relatedNoteId: input.relatedNoteId ?? null,
    relatedFeedbackId: input.relatedFeedbackId ?? null,
    relatedProjectId: input.relatedProjectId ?? null,
    source: input.source,
    isReminder: input.isReminder,
    reminderAt: input.reminderAt ?? null,
    completedAt,
  }
}

function completeForUpdate(current: CalendarEvent, patch: Partial<CalendarEvent>): Partial<CalendarEvent> {
  const next = normalizeCalendarEvent({ ...current, ...patch })
  const status = patch.status ?? next.status
  const completedAt =
    status === 'completed'
      ? patch.completedAt ?? next.completedAt ?? new Date().toISOString()
      : patch.completedAt === undefined
        ? next.completedAt
        : patch.completedAt

  return {
    ...patch,
    tags: patch.tags ? [...new Set(patch.tags.map(normalizeCalendarTag).filter(Boolean))] : next.tags,
    endAt: patch.allDay ?? next.allDay ? patch.endAt ?? next.endAt : patch.endAt ?? next.endAt ?? getDefaultEndAt(next.startAt),
    status,
    completedAt,
  }
}

export const calendarEventsRepo = {
  async list(filters?: Partial<CalendarEvent>): Promise<CalendarEvent[]> {
    return this.listEvents(filters as CalendarFilters)
  },
  async listEvents(filters?: CalendarFilters, sort: CalendarSort = 'agenda-asc'): Promise<CalendarEvent[]> {
    return sortEventsForAgenda(applyEventFilters(await allEvents(), filters), sort)
  },
  async listAllEvents(sort: CalendarSort = 'agenda-asc'): Promise<CalendarEvent[]> {
    return sortEventsForAgenda(await allEvents(), sort)
  },
  async getById(id: string): Promise<CalendarEvent | null> {
    return this.getEventById(id)
  },
  async getEventById(id: string): Promise<CalendarEvent | null> {
    const event = await storageRepo.getById(id)
    return event ? normalizeCalendarEvent(event) : null
  },
  async create(data: CreateCalendarEventInput): Promise<CalendarEvent> {
    return this.createEvent(data)
  },
  async createEvent(data: CreateCalendarEventInput): Promise<CalendarEvent> {
    return normalizeCalendarEvent(await storageRepo.create(completeForCreate(data)))
  },
  async update(id: string, data: Partial<CalendarEvent>): Promise<CalendarEvent> {
    return this.updateEvent(id, data)
  },
  async updateEvent(id: string, data: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const current = await storageRepo.getById(id)
    if (!current) throw new Error(`Calendar event ${id} not found`)
    return normalizeCalendarEvent(await storageRepo.update(id, completeForUpdate(current, data)))
  },
  async delete(id: string): Promise<void> {
    await storageRepo.delete(id)
  },
  async deleteEvent(id: string): Promise<void> {
    await storageRepo.delete(id)
  },
  async cancelEvent(id: string): Promise<CalendarEvent> {
    return this.updateEvent(id, { status: 'cancelled' })
  },
  async completeEvent(id: string, currentDate = new Date()): Promise<CalendarEvent> {
    return this.updateEvent(id, { status: 'completed', completedAt: currentDate.toISOString() })
  },
  async uncompleteEvent(id: string): Promise<CalendarEvent> {
    return this.updateEvent(id, { status: 'scheduled', completedAt: null })
  },
  async postponeEvent(id: string, newStartAt: string | Date, newEndAt?: string | Date): Promise<CalendarEvent> {
    const startAt = parseDate(newStartAt).toISOString()
    return this.updateEvent(id, {
      startAt,
      endAt: newEndAt ? parseDate(newEndAt).toISOString() : getDefaultEndAt(startAt),
      status: 'postponed',
    })
  },
  async getEventsByRange(
    start: string | Date,
    end: string | Date,
    filters?: CalendarFilters
  ): Promise<CalendarEvent[]> {
    return this.listEvents({
      ...filters,
      startFrom: parseDate(start).toISOString(),
      startTo: parseDate(end).toISOString(),
    })
  },
  async getEventsByDay(date: string | Date, filters?: CalendarFilters): Promise<CalendarEvent[]> {
    return this.getEventsByRange(getStartOfDay(date), getEndOfDay(date), filters)
  },
  async getEventsByWeek(date: string | Date, filters?: CalendarFilters): Promise<CalendarEvent[]> {
    return this.getEventsByRange(getStartOfWeek(date), getEndOfWeek(date), filters)
  },
  async getEventsByMonth(date: string | Date, filters?: CalendarFilters): Promise<CalendarEvent[]> {
    return this.getEventsByRange(getStartOfMonth(date), getEndOfMonth(date), filters)
  },
  async getUpcomingEvents(limit = 8, currentDate = new Date()): Promise<CalendarEvent[]> {
    return (await this.listEvents({ startFrom: currentDate.toISOString(), includeCompleted: false })).slice(0, limit)
  },
  async getPastEvents(limit = 8, currentDate = new Date()): Promise<CalendarEvent[]> {
    return (await this.listEvents({ startTo: currentDate.toISOString(), includeCancelled: true }, 'history-desc')).slice(0, limit)
  },
  async getOverdueEvents(currentDate = new Date()): Promise<CalendarEvent[]> {
    return (await this.listEvents({ startTo: currentDate.toISOString(), includeCompleted: false })).filter((event) =>
      ['scheduled', 'confirmed', 'in_progress', 'missed', 'postponed'].includes(event.status)
    )
  },
  async getEventsByLeadId(leadId: string): Promise<CalendarEvent[]> {
    return this.filterEvents({ relatedLeadId: leadId })
  },
  async getEventsByTaskId(taskId: string): Promise<CalendarEvent[]> {
    return this.filterEvents({ relatedTaskId: taskId })
  },
  async getEventsByNoteId(noteId: string): Promise<CalendarEvent[]> {
    return this.filterEvents({ relatedNoteId: noteId })
  },
  async searchEvents(query: string): Promise<CalendarEvent[]> {
    return this.filterEvents({ query })
  },
  async filterEvents(filters: CalendarFilters): Promise<CalendarEvent[]> {
    return this.listEvents(filters)
  },
  async reset(): Promise<void> {
    await storageRepo.reset()
  },
  subscribe(listener: () => void): () => void {
    return storageRepo.subscribe(listener)
  },
}
