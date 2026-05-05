import type {
  CalendarColor,
  CalendarEvent,
  CalendarEventStatus,
  CalendarEventType,
  CalendarFilters,
  CalendarImportance,
  CalendarPriority,
} from '@/lib/types'
import {
  getDateKey,
  getEndOfDay,
  getStartOfDay,
  isSameDay,
  parseDate,
} from '@/lib/utils/date-range'

export type CalendarSort = 'agenda-asc' | 'history-desc' | 'importance-desc' | 'priority-desc'

const importanceRank: Record<CalendarImportance, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
}

const priorityRank: Record<CalendarPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
}

export function normalizeCalendarTag(tag: string): string {
  return tag
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getDefaultEndAt(startAt: string | Date, minutes = 60): string {
  return new Date(parseDate(startAt).getTime() + minutes * 60_000).toISOString()
}

export function normalizeCalendarEvent(event: CalendarEvent): CalendarEvent {
  const tags = [...new Set(event.tags.map(normalizeCalendarTag).filter(Boolean))]
  const completedAt =
    event.status === 'completed' ? event.completedAt ?? event.updatedAt ?? event.startAt : event.completedAt ?? null

  return {
    ...event,
    tags,
    attendees: event.attendees ?? [],
    relatedLeadId: event.relatedLeadId ?? null,
    relatedTaskId: event.relatedTaskId ?? null,
    relatedNoteId: event.relatedNoteId ?? null,
    relatedFeedbackId: event.relatedFeedbackId ?? null,
    relatedProjectId: event.relatedProjectId ?? null,
    reminderAt: event.reminderAt ?? null,
    completedAt,
    endAt: event.allDay ? event.endAt : event.endAt ?? getDefaultEndAt(event.startAt),
  }
}

export function getEventImportanceWeight(importance: CalendarImportance): number {
  return importanceRank[importance]
}

export function getEventPriorityWeight(priority: CalendarPriority): number {
  return priorityRank[priority]
}

export function getEventColorToken(color: CalendarColor): string {
  return `calendar-${color}`
}

export function getEventStatusLabel(status: CalendarEventStatus): string {
  const labels: Record<CalendarEventStatus, string> = {
    scheduled: 'Agendado',
    confirmed: 'Confirmado',
    in_progress: 'Em andamento',
    completed: 'Concluido',
    cancelled: 'Cancelado',
    missed: 'Perdido',
    postponed: 'Adiado',
  }
  return labels[status]
}

export function getEventTypeLabel(type: CalendarEventType): string {
  const labels: Record<CalendarEventType, string> = {
    call: 'Call',
    meeting: 'Reuniao',
    presentation: 'Apresentacao',
    follow_up: 'Follow-up',
    prospecting: 'Prospeccao',
    task: 'Tarefa',
    reminder: 'Lembrete',
    internal: 'Interno',
    strategy: 'Estrategia',
    product: 'Produto',
    design: 'Design',
    content: 'Conteudo',
    social_media: 'Social media',
    meta_ads: 'Meta Ads',
    review: 'Review',
    personal: 'Pessoal',
    other: 'Outro',
  }
  return labels[type]
}

export function getEventEndDate(event: CalendarEvent): Date {
  if (event.endAt) return parseDate(event.endAt)
  return parseDate(getDefaultEndAt(event.startAt))
}

export function eventsOverlap(a: CalendarEvent, b: CalendarEvent): boolean {
  if (a.status === 'cancelled' || b.status === 'cancelled') return false
  if (a.allDay || b.allDay) return a.allDay && b.allDay && isSameDay(a.startAt, b.startAt)

  const aStart = parseDate(a.startAt).getTime()
  const aEnd = getEventEndDate(a).getTime()
  const bStart = parseDate(b.startAt).getTime()
  const bEnd = getEventEndDate(b).getTime()

  return aStart < bEnd && aEnd > bStart
}

export function filterEvents(events: CalendarEvent[], filters: CalendarFilters = {}): CalendarEvent[] {
  const query = filters.query?.trim().toLowerCase()
  const normalizedTags = filters.tags?.map(normalizeCalendarTag)

  return events.map(normalizeCalendarEvent).filter((event) => {
    if (!filters.includeCancelled && event.status === 'cancelled') return false
    if (filters.includeCompleted === false && event.status === 'completed') return false
    if (query) {
      const haystack = [
        event.title,
        event.description ?? '',
        event.location ?? '',
        event.meetingUrl ?? '',
        ...event.tags,
        ...event.attendees.map((attendee) => `${attendee.name} ${attendee.email ?? ''}`),
      ]
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(query)) return false
    }
    if (filters.type && event.type !== filters.type) return false
    if (filters.status && event.status !== filters.status) return false
    if (filters.priority && event.priority !== filters.priority) return false
    if (filters.importance && event.importance !== filters.importance) return false
    if (filters.color && event.color !== filters.color) return false
    if (normalizedTags?.length && !normalizedTags.every((tag) => event.tags.includes(tag))) return false
    if (filters.relatedLeadId !== undefined && event.relatedLeadId !== filters.relatedLeadId) return false
    if (filters.relatedTaskId !== undefined && event.relatedTaskId !== filters.relatedTaskId) return false
    if (filters.relatedNoteId !== undefined && event.relatedNoteId !== filters.relatedNoteId) return false
    if (filters.isReminder !== undefined && event.isReminder !== filters.isReminder) return false
    if (filters.allDay !== undefined && event.allDay !== filters.allDay) return false
    if (filters.startFrom && parseDate(event.startAt).getTime() < parseDate(filters.startFrom).getTime()) return false
    if (filters.startTo && parseDate(event.startAt).getTime() > parseDate(filters.startTo).getTime()) return false
    return true
  })
}

export function sortEventsForAgenda(events: CalendarEvent[], sort: CalendarSort = 'agenda-asc'): CalendarEvent[] {
  return [...events].map(normalizeCalendarEvent).sort((a, b) => {
    if (sort === 'history-desc') return parseDate(b.startAt).getTime() - parseDate(a.startAt).getTime()
    if (sort === 'importance-desc') {
      return getEventImportanceWeight(b.importance) - getEventImportanceWeight(a.importance)
    }
    if (sort === 'priority-desc') return getEventPriorityWeight(b.priority) - getEventPriorityWeight(a.priority)

    const dayDelta = getStartOfDay(a.startAt).getTime() - getStartOfDay(b.startAt).getTime()
    if (dayDelta !== 0) return dayDelta
    const allDayDelta = Number(b.allDay) - Number(a.allDay)
    if (allDayDelta !== 0) return allDayDelta
    const startDelta = parseDate(a.startAt).getTime() - parseDate(b.startAt).getTime()
    if (startDelta !== 0) return startDelta
    const importanceDelta = getEventImportanceWeight(b.importance) - getEventImportanceWeight(a.importance)
    if (importanceDelta !== 0) return importanceDelta
    return getEventPriorityWeight(b.priority) - getEventPriorityWeight(a.priority)
  })
}

export function groupEventsByDay(events: CalendarEvent[]): Record<string, CalendarEvent[]> {
  return sortEventsForAgenda(events).reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    const key = getDateKey(event.startAt)
    acc[key] = [...(acc[key] ?? []), event]
    return acc
  }, {})
}

export function formatEventTimeRange(event: CalendarEvent): string {
  if (event.allDay) return 'Dia inteiro'
  const start = parseDate(event.startAt)
  const end = getEventEndDate(event)
  const format = (date: Date) => date.toISOString().slice(11, 16)
  return `${format(start)}-${format(end)}`
}

export function getDayRange(date: string | Date): { start: string; end: string } {
  return { start: getStartOfDay(date).toISOString(), end: getEndOfDay(date).toISOString() }
}

export { getDateKey, getEndOfDay, getStartOfDay, isSameDay, parseDate }
