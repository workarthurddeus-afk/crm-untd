import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { CalendarEvent, CalendarEventInput, CalendarFilters } from '@/lib/types/calendar'
import {
  filterEvents as applyEventFilters,
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
import {
  fromSupabaseCalendarEventRow,
  toSupabaseCalendarEventInsert,
  toSupabaseCalendarEventUpdate,
  type SupabaseCalendarEventRow,
} from './supabase/calendar-events.mapper'

type SupabaseError = { message: string } | null

interface CalendarEventsSupabaseClient {
  auth?: {
    getUser(): PromiseLike<{
      data: { user: { id: string } | null }
      error: SupabaseError
    }>
  }
  from(table: 'calendar_events'): {
    select(columns?: string): {
      order(
        column: string,
        options?: { ascending?: boolean; nullsFirst?: boolean }
      ): PromiseLike<{ data: SupabaseCalendarEventRow[] | null; error: SupabaseError }>
      eq(column: string, value: string): {
        maybeSingle(): PromiseLike<{ data: SupabaseCalendarEventRow | null; error: SupabaseError }>
      }
    }
    insert(payload: unknown): {
      select(columns?: string): {
        single(): PromiseLike<{ data: SupabaseCalendarEventRow | null; error: SupabaseError }>
      }
    }
    update(payload: unknown): {
      eq(column: string, value: string): {
        select(columns?: string): {
          single(): PromiseLike<{ data: SupabaseCalendarEventRow | null; error: SupabaseError }>
        }
      }
    }
    delete(): {
      eq(column: string, value: string): PromiseLike<{ error: SupabaseError }>
    }
  }
}

export type CreateCalendarEventInput = Partial<CalendarEventInput> &
  Pick<
    CalendarEventInput,
    'title' | 'startAt' | 'allDay' | 'type' | 'status' | 'priority' | 'importance' | 'color' | 'attendees' | 'tags' | 'source' | 'isReminder'
  >

export type CalendarEventsRepository = {
  list(filters?: Partial<CalendarEvent>): Promise<CalendarEvent[]>
  listEvents(filters?: CalendarFilters, sort?: CalendarSort): Promise<CalendarEvent[]>
  listAllEvents(sort?: CalendarSort): Promise<CalendarEvent[]>
  getById(id: string): Promise<CalendarEvent | null>
  getEventById(id: string): Promise<CalendarEvent | null>
  create(data: CreateCalendarEventInput): Promise<CalendarEvent>
  createEvent(data: CreateCalendarEventInput): Promise<CalendarEvent>
  update(id: string, data: Partial<CalendarEvent>): Promise<CalendarEvent>
  updateEvent(id: string, data: Partial<CalendarEvent>): Promise<CalendarEvent>
  delete(id: string): Promise<void>
  deleteEvent(id: string): Promise<void>
  cancelEvent(id: string): Promise<CalendarEvent>
  completeEvent(id: string, currentDate?: Date): Promise<CalendarEvent>
  uncompleteEvent(id: string): Promise<CalendarEvent>
  postponeEvent(id: string, newStartAt: string | Date, newEndAt?: string | Date): Promise<CalendarEvent>
  getEventsByRange(start: string | Date, end: string | Date, filters?: CalendarFilters): Promise<CalendarEvent[]>
  getEventsByDay(date: string | Date, filters?: CalendarFilters): Promise<CalendarEvent[]>
  getEventsByWeek(date: string | Date, filters?: CalendarFilters): Promise<CalendarEvent[]>
  getEventsByMonth(date: string | Date, filters?: CalendarFilters): Promise<CalendarEvent[]>
  getUpcomingEvents(limit?: number, currentDate?: Date): Promise<CalendarEvent[]>
  getPastEvents(limit?: number, currentDate?: Date): Promise<CalendarEvent[]>
  getOverdueEvents(currentDate?: Date): Promise<CalendarEvent[]>
  getEventsByLeadId(leadId: string): Promise<CalendarEvent[]>
  getEventsByTaskId(taskId: string): Promise<CalendarEvent[]>
  getEventsByNoteId(noteId: string): Promise<CalendarEvent[]>
  searchEvents(query: string): Promise<CalendarEvent[]>
  filterEvents(filters: CalendarFilters): Promise<CalendarEvent[]>
  reset(): Promise<void>
  clear(): Promise<void>
  seedDemoData(): Promise<void>
  subscribe(listener: () => void): () => void
}

function raise(error: SupabaseError): void {
  if (error) throw new Error(error.message)
}

async function getAuthenticatedUserId(client: CalendarEventsSupabaseClient): Promise<string> {
  const { data, error } = (await client.auth?.getUser()) ?? {
    data: { user: null },
    error: null,
  }
  if (error) throw new Error(error.message)
  if (!data.user?.id) throw new Error('Sessao expirada. Faca login novamente.')
  return data.user.id
}

function activePendingEvent(event: CalendarEvent): boolean {
  return event.status !== 'cancelled' && event.status !== 'completed'
}

export function createCalendarEventsSupabaseRepository(
  client: CalendarEventsSupabaseClient = getSupabaseBrowserClient() as unknown as CalendarEventsSupabaseClient
): CalendarEventsRepository {
  const listeners = new Set<() => void>()
  const notify = () => listeners.forEach((listener) => listener())

  async function allEvents(): Promise<CalendarEvent[]> {
    const { data, error } = await client.from('calendar_events').select('*').order('start_at', { ascending: true })
    raise(error)
    return (data ?? []).map(fromSupabaseCalendarEventRow)
  }

  return {
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
      const { data, error } = await client.from('calendar_events').select('*').eq('id', id).maybeSingle()
      raise(error)
      return data ? fromSupabaseCalendarEventRow(data) : null
    },
    async create(data: CreateCalendarEventInput): Promise<CalendarEvent> {
      return this.createEvent(data)
    },
    async createEvent(data: CreateCalendarEventInput): Promise<CalendarEvent> {
      const userId = await getAuthenticatedUserId(client)
      const { data: row, error } = await client
        .from('calendar_events')
        .insert(toSupabaseCalendarEventInsert(data, userId))
        .select('*')
        .single()
      raise(error)
      if (!row) throw new Error('Supabase did not return created calendar event')
      notify()
      return fromSupabaseCalendarEventRow(row)
    },
    async update(id: string, data: Partial<CalendarEvent>): Promise<CalendarEvent> {
      return this.updateEvent(id, data)
    },
    async updateEvent(id: string, data: Partial<CalendarEvent>): Promise<CalendarEvent> {
      const userId = await getAuthenticatedUserId(client)
      const { data: row, error } = await client
        .from('calendar_events')
        .update(toSupabaseCalendarEventUpdate(data, userId))
        .eq('id', id)
        .select('*')
        .single()
      raise(error)
      if (!row) throw new Error(`Calendar event ${id} not found`)
      notify()
      return fromSupabaseCalendarEventRow(row)
    },
    async delete(id: string): Promise<void> {
      await getAuthenticatedUserId(client)
      const { error } = await client.from('calendar_events').delete().eq('id', id)
      raise(error)
      notify()
    },
    async deleteEvent(id: string): Promise<void> {
      return this.delete(id)
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
        endAt: newEndAt ? parseDate(newEndAt).toISOString() : undefined,
        status: 'postponed',
      })
    },
    async getEventsByRange(start: string | Date, end: string | Date, filters?: CalendarFilters): Promise<CalendarEvent[]> {
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
      return (await this.listEvents({ startTo: currentDate.toISOString(), includeCompleted: false })).filter(activePendingEvent)
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
      notify()
    },
    async clear(): Promise<void> {
      notify()
    },
    async seedDemoData(): Promise<void> {
      notify()
    },
    subscribe(listener: () => void): () => void {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
