import { calendarEventsRepo } from '@/lib/repositories/calendar-events.repository'
import type { CalendarEvent, CalendarEventInput, CalendarFilters, Lead, Note, Task } from '@/lib/types'
import {
  eventsOverlap,
  getDefaultEndAt,
  getEventImportanceWeight,
  groupEventsByDay,
  sortEventsForAgenda,
} from '@/lib/utils/calendar'
import {
  getDateKey,
  getEndOfDay,
  getEndOfMonth,
  getEndOfWeek,
  getStartOfDay,
  getStartOfMonth,
  getStartOfWeek,
  isSameDay,
  parseDate,
} from '@/lib/utils/date-range'

export interface CalendarDateOptions {
  currentDate?: Date
}

export interface DashboardCalendarSummary {
  today: CalendarEvent[]
  todayCount: number
  upcoming: CalendarEvent[]
  overdue: CalendarEvent[]
  remindersDue: CalendarEvent[]
  completedToday: number
  highImportanceToday: CalendarEvent[]
}

export interface CalendarStats {
  total: number
  scheduled: number
  completed: number
  cancelled: number
  reminders: number
  overdue: number
  byType: Record<string, number>
  byDay: Record<string, number>
}

function activePendingEvent(event: CalendarEvent): boolean {
  return event.status !== 'cancelled' && event.status !== 'completed'
}

function statusForUncompleted(event: CalendarEvent): CalendarEvent['status'] {
  if (event.status === 'completed') return 'scheduled'
  return event.status
}

function toEventPriority(task: Task): CalendarEvent['priority'] {
  return task.importance === 'high' ? 'high' : task.importance === 'low' ? 'low' : 'medium'
}

function toEventImportance(task: Task): CalendarEvent['importance'] {
  return task.importance === 'high' ? 'high' : task.importance
}

function taskType(task: Task): CalendarEvent['type'] {
  const map: Partial<Record<Task['category'], CalendarEvent['type']>> = {
    prospecting: 'prospecting',
    'follow-up': 'follow_up',
    meeting: 'meeting',
    product: 'product',
    design: 'design',
    content: 'content',
    social: 'social_media',
    'meta-ads': 'meta_ads',
    strategy: 'strategy',
  }
  return map[task.category] ?? 'task'
}

export async function getCalendarRange(
  start: string | Date,
  end: string | Date,
  filters?: CalendarFilters
): Promise<CalendarEvent[]> {
  return calendarEventsRepo.getEventsByRange(start, end, filters)
}

export async function getDayAgenda(date: string | Date, filters?: CalendarFilters): Promise<CalendarEvent[]> {
  return calendarEventsRepo.getEventsByDay(date, filters)
}

export async function getWeekAgenda(date: string | Date, filters?: CalendarFilters): Promise<CalendarEvent[]> {
  return calendarEventsRepo.getEventsByWeek(date, filters)
}

export async function getMonthAgenda(date: string | Date, filters?: CalendarFilters): Promise<CalendarEvent[]> {
  return calendarEventsRepo.getEventsByMonth(date, filters)
}

export async function getTodaySchedule(options: CalendarDateOptions = {}): Promise<CalendarEvent[]> {
  return getDayAgenda(options.currentDate ?? new Date())
}

export async function getTomorrowSchedule(options: CalendarDateOptions = {}): Promise<CalendarEvent[]> {
  const date = options.currentDate ?? new Date()
  return getDayAgenda(new Date(getStartOfDay(date).getTime() + 86_400_000))
}

export async function getUpcomingSchedule(daysAhead = 7, options: CalendarDateOptions = {}): Promise<CalendarEvent[]> {
  const start = options.currentDate ?? new Date()
  const end = new Date(getEndOfDay(start).getTime() + daysAhead * 86_400_000)
  return getCalendarRange(start, end, { includeCompleted: false })
}

export async function getDashboardCalendarSummary(
  options: CalendarDateOptions = {}
): Promise<DashboardCalendarSummary> {
  const currentDate = options.currentDate ?? new Date()
  const [today, upcoming, overdue, remindersDue, allEvents] = await Promise.all([
    getTodaySchedule({ currentDate }),
    calendarEventsRepo.getUpcomingEvents(6, currentDate),
    getOverdueReminders({ currentDate }),
    getRemindersDue({ currentDate }),
    calendarEventsRepo.listAllEvents(),
  ])

  return {
    today,
    todayCount: today.length,
    upcoming,
    overdue,
    remindersDue,
    completedToday: allEvents.filter(
      (event) => event.completedAt && isSameDay(event.completedAt, currentDate)
    ).length,
    highImportanceToday: today.filter((event) => ['high', 'critical'].includes(event.importance)),
  }
}

export async function getCalendarStats(
  range?: { start: string | Date; end: string | Date },
  options: CalendarDateOptions = {}
): Promise<CalendarStats> {
  const events = range
    ? await calendarEventsRepo.getEventsByRange(range.start, range.end, { includeCancelled: true })
    : await calendarEventsRepo.listAllEvents()
  const overdue = await getOverdueReminders(options)

  return {
    total: events.length,
    scheduled: events.filter((event) => event.status === 'scheduled' || event.status === 'confirmed').length,
    completed: events.filter((event) => event.status === 'completed').length,
    cancelled: events.filter((event) => event.status === 'cancelled').length,
    reminders: events.filter((event) => event.isReminder).length,
    overdue: overdue.length,
    byType: events.reduce<Record<string, number>>((acc, event) => {
      acc[event.type] = (acc[event.type] ?? 0) + 1
      return acc
    }, {}),
    byDay: Object.fromEntries(
      Object.entries(groupEventsByDay(events)).map(([day, group]) => [day, group.length])
    ),
  }
}

export function detectConflict(newEvent: CalendarEvent, existingEvents: CalendarEvent[] = []): boolean {
  return existingEvents.some((event) => event.id !== newEvent.id && eventsOverlap(newEvent, event))
}

export async function getConflictingEvents(newEvent: CalendarEvent): Promise<CalendarEvent[]> {
  const events = await calendarEventsRepo.getEventsByDay(newEvent.startAt, { includeCancelled: true })
  return events.filter((event) => event.id !== newEvent.id && eventsOverlap(newEvent, event))
}

export async function createCalendarEvent(input: CalendarEventInput): Promise<CalendarEvent> {
  return calendarEventsRepo.createEvent(input)
}

export async function updateCalendarEvent(id: string, input: Partial<CalendarEvent>): Promise<CalendarEvent> {
  return calendarEventsRepo.updateEvent(id, input)
}

export async function markEventCompleted(
  id: string,
  options: CalendarDateOptions = {}
): Promise<CalendarEvent> {
  return calendarEventsRepo.completeEvent(id, options.currentDate ?? new Date())
}

export async function markEventUncompleted(id: string): Promise<CalendarEvent> {
  const event = await calendarEventsRepo.getEventById(id)
  if (!event) throw new Error(`Calendar event ${id} not found`)
  return calendarEventsRepo.updateEvent(id, { status: statusForUncompleted(event), completedAt: null })
}

export async function cancelCalendarEvent(id: string): Promise<CalendarEvent> {
  return calendarEventsRepo.cancelEvent(id)
}

export async function postponeCalendarEvent(
  id: string,
  newStartAt: string | Date,
  newEndAt?: string | Date
): Promise<CalendarEvent> {
  return calendarEventsRepo.postponeEvent(id, newStartAt, newEndAt)
}

export async function getRemindersDue(options: CalendarDateOptions = {}): Promise<CalendarEvent[]> {
  const currentDate = options.currentDate ?? new Date()
  const events = await calendarEventsRepo.listEvents({ isReminder: true, includeCompleted: false })
  return events.filter((event) => {
    const dueAt = event.reminderAt ?? event.startAt
    return parseDate(dueAt).getTime() <= currentDate.getTime() && activePendingEvent(event)
  })
}

export async function getOverdueReminders(options: CalendarDateOptions = {}): Promise<CalendarEvent[]> {
  const currentDate = options.currentDate ?? new Date()
  return (await getRemindersDue({ currentDate })).filter((event) => {
    const dueAt = event.reminderAt ?? event.startAt
    return parseDate(dueAt).getTime() < currentDate.getTime()
  })
}

export async function getEventsGroupedByDay(
  start: string | Date,
  end: string | Date,
  filters?: CalendarFilters
): Promise<Record<string, CalendarEvent[]>> {
  return groupEventsByDay(await getCalendarRange(start, end, filters))
}

export function transformTaskToCalendarEventPayload(task: Task): CalendarEventInput {
  const startAt = task.dueDate ?? new Date().toISOString()
  return {
    title: task.title,
    description: task.description,
    startAt,
    endAt: getDefaultEndAt(startAt),
    allDay: false,
    type: taskType(task),
    status: task.status === 'done' ? 'completed' : task.status === 'cancelled' ? 'cancelled' : 'scheduled',
    priority: toEventPriority(task),
    importance: toEventImportance(task),
    color: task.importance === 'high' ? 'orange' : 'blue',
    attendees: [],
    tags: task.tagIds,
    relatedLeadId: task.relatedLeadId ?? null,
    relatedTaskId: task.id,
    relatedNoteId: task.relatedNoteId ?? null,
    relatedFeedbackId: null,
    relatedProjectId: null,
    source: 'task',
    isReminder: task.category === 'follow-up',
    reminderAt: task.dueDate ?? null,
    completedAt: task.status === 'done' ? task.updatedAt : null,
  }
}

export function transformNoteToCalendarEventPayload(note: Note, startAt = new Date().toISOString()): CalendarEventInput {
  const importance: CalendarEvent['importance'] = note.impact === 'high' ? 'high' : note.impact
  return {
    title: note.title,
    description: note.excerpt ?? note.content,
    startAt,
    endAt: getDefaultEndAt(startAt),
    allDay: false,
    type: ['sales', 'pricing', 'offer'].includes(note.type) ? 'strategy' : note.type === 'ui' ? 'design' : 'task',
    status: 'scheduled',
    priority: note.priority,
    importance,
    color: note.color,
    attendees: [],
    tags: note.tags,
    relatedLeadId: note.relatedLeadId ?? null,
    relatedTaskId: note.relatedTaskId ?? null,
    relatedNoteId: note.id,
    relatedFeedbackId: note.relatedFeedbackId ?? null,
    relatedProjectId: note.relatedProjectId ?? null,
    source: 'note',
    isReminder: false,
    reminderAt: null,
    completedAt: null,
  }
}

export function transformLeadFollowUpToCalendarEventPayload(lead: Lead): CalendarEventInput {
  const startAt = lead.nextFollowUpAt ?? new Date().toISOString()
  return {
    title: `Follow-up com ${lead.name}`,
    description: lead.pain ?? `Retomar conversa com ${lead.company}.`,
    startAt,
    endAt: getDefaultEndAt(startAt, 30),
    allDay: false,
    type: 'follow_up',
    status: 'scheduled',
    priority: lead.temperature === 'hot' ? 'high' : lead.temperature === 'cold' ? 'low' : 'medium',
    importance: lead.temperature === 'hot' ? 'high' : 'medium',
    color: lead.temperature === 'hot' ? 'red' : 'green',
    attendees: [{ name: lead.name, email: lead.email, leadId: lead.id, status: 'unknown' }],
    tags: ['follow-up', lead.origin, lead.niche],
    relatedLeadId: lead.id,
    relatedTaskId: null,
    relatedNoteId: null,
    relatedFeedbackId: null,
    relatedProjectId: null,
    source: 'lead',
    isReminder: true,
    reminderAt: startAt,
    completedAt: null,
  }
}

export function getEventsForDashboardOrdering(events: CalendarEvent[]): CalendarEvent[] {
  return sortEventsForAgenda(events).sort((a, b) => {
    const importanceDelta = getEventImportanceWeight(b.importance) - getEventImportanceWeight(a.importance)
    if (importanceDelta !== 0 && getDateKey(a.startAt) === getDateKey(b.startAt)) return importanceDelta
    return 0
  })
}

export function getRangeForView(view: 'day' | 'week' | 'month', date: string | Date): { start: string; end: string } {
  if (view === 'week') return { start: getStartOfWeek(date).toISOString(), end: getEndOfWeek(date).toISOString() }
  if (view === 'month') return { start: getStartOfMonth(date).toISOString(), end: getEndOfMonth(date).toISOString() }
  return { start: getStartOfDay(date).toISOString(), end: getEndOfDay(date).toISOString() }
}
