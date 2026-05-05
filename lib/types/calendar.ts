export const CALENDAR_EVENT_TYPES = [
  'call',
  'meeting',
  'presentation',
  'follow_up',
  'prospecting',
  'task',
  'reminder',
  'internal',
  'strategy',
  'product',
  'design',
  'content',
  'social_media',
  'meta_ads',
  'review',
  'personal',
  'other',
] as const

export const CALENDAR_EVENT_STATUSES = [
  'scheduled',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'missed',
  'postponed',
] as const

export const CALENDAR_PRIORITIES = ['low', 'medium', 'high'] as const
export const CALENDAR_IMPORTANCES = ['low', 'medium', 'high', 'critical'] as const

export const CALENDAR_COLORS = [
  'default',
  'purple',
  'violet',
  'blue',
  'cyan',
  'green',
  'yellow',
  'orange',
  'red',
  'pink',
  'slate',
] as const

export const CALENDAR_SOURCES = [
  'manual',
  'lead',
  'task',
  'note',
  'feedback',
  'ai',
  'import',
  'dashboard',
  'crm',
] as const

export const CALENDAR_ATTENDEE_STATUSES = [
  'invited',
  'accepted',
  'declined',
  'tentative',
  'unknown',
] as const

export type CalendarEventType = (typeof CALENDAR_EVENT_TYPES)[number]
export type CalendarEventStatus = (typeof CALENDAR_EVENT_STATUSES)[number]
export type CalendarPriority = (typeof CALENDAR_PRIORITIES)[number]
export type CalendarImportance = (typeof CALENDAR_IMPORTANCES)[number]
export type CalendarColor = (typeof CALENDAR_COLORS)[number]
export type CalendarSource = (typeof CALENDAR_SOURCES)[number]
export type CalendarAttendeeStatus = (typeof CALENDAR_ATTENDEE_STATUSES)[number]
export type CalendarView = 'day' | 'week' | 'month' | 'agenda'

export interface CalendarAttendee {
  name: string
  email?: string
  leadId?: string | null
  status?: CalendarAttendeeStatus
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startAt: string
  endAt?: string
  allDay: boolean
  type: CalendarEventType
  status: CalendarEventStatus
  priority: CalendarPriority
  importance: CalendarImportance
  color: CalendarColor
  location?: string
  meetingUrl?: string
  attendees: CalendarAttendee[]
  tags: string[]
  relatedLeadId?: string | null
  relatedTaskId?: string | null
  relatedNoteId?: string | null
  relatedFeedbackId?: string | null
  relatedProjectId?: string | null
  source: CalendarSource
  isReminder: boolean
  reminderAt?: string | null
  completedAt?: string | null
  createdAt: string
  updatedAt: string
}

export type CalendarEventInput = Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>

export interface CalendarFilters {
  query?: string
  type?: CalendarEventType
  status?: CalendarEventStatus
  priority?: CalendarPriority
  importance?: CalendarImportance
  color?: CalendarColor
  tags?: string[]
  relatedLeadId?: string | null
  relatedTaskId?: string | null
  relatedNoteId?: string | null
  isReminder?: boolean
  allDay?: boolean
  startFrom?: string
  startTo?: string
  includeCancelled?: boolean
  includeCompleted?: boolean
}

export interface CalendarViewConfig {
  view: CalendarView
  currentDate: string
  timezone?: string
  filters?: CalendarFilters
}
