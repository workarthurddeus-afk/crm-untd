import type {
  CalendarAttendee,
  CalendarColor,
  CalendarEvent,
  CalendarEventInput,
  CalendarEventStatus,
  CalendarEventType,
  CalendarImportance,
  CalendarPriority,
  CalendarSource,
} from '@/lib/types/calendar'
import { getDefaultEndAt, normalizeCalendarEvent, normalizeCalendarTag } from '@/lib/utils/calendar'

const DEFAULT_WORKSPACE_ID = 'default'
const DEFAULT_TYPE: CalendarEventType = 'internal'
const DEFAULT_STATUS: CalendarEventStatus = 'scheduled'
const DEFAULT_PRIORITY: CalendarPriority = 'medium'
const DEFAULT_IMPORTANCE: CalendarImportance = 'medium'
const DEFAULT_COLOR: CalendarColor = 'default'
const DEFAULT_SOURCE: CalendarSource = 'manual'

const eventTypes = new Set<CalendarEventType>([
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
])
const eventStatuses = new Set<CalendarEventStatus>([
  'scheduled',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'missed',
  'postponed',
])
const priorities = new Set<CalendarPriority>(['low', 'medium', 'high'])
const importances = new Set<CalendarImportance>(['low', 'medium', 'high', 'critical'])
const colors = new Set<CalendarColor>([
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
])
const sources = new Set<CalendarSource>(['manual', 'lead', 'task', 'note', 'feedback', 'ai', 'import', 'dashboard', 'crm'])

export interface SupabaseCalendarEventRow {
  id: string
  user_id?: string | null
  workspace_id?: string | null
  title: string
  description?: string | null
  type?: string | null
  status?: string | null
  priority?: string | null
  importance?: string | null
  color?: string | null
  location?: string | null
  meeting_url?: string | null
  start_at: string
  end_at?: string | null
  all_day?: boolean | null
  attendees?: CalendarAttendee[] | null
  tags?: string[] | null
  related_lead_id?: string | null
  related_task_id?: string | null
  related_note_id?: string | null
  related_feedback_id?: string | null
  related_project_id?: string | null
  source?: string | null
  is_reminder?: boolean | null
  reminder_at?: string | null
  completed_at?: string | null
  created_at: string
  updated_at: string
}

export type SupabaseCalendarEventInsert = Omit<SupabaseCalendarEventRow, 'id' | 'created_at' | 'updated_at'>
export type SupabaseCalendarEventUpdate = Partial<SupabaseCalendarEventInsert>

function cleanString(value: string | null | undefined): string | undefined {
  const clean = value?.trim()
  return clean ? clean : undefined
}

function nullableString(value: string | null | undefined): string | null {
  return cleanString(value) ?? null
}

function optionalString(value: string | null | undefined): string | undefined {
  return cleanString(value)
}

function requiredString(value: string | null | undefined, message: string): string {
  const clean = cleanString(value)
  if (!clean) throw new Error(message)
  return clean
}

function removeUndefined<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as Partial<T>
}

function normalizeTags(tags: string[] | null | undefined): string[] {
  return [...new Set((tags ?? []).map(normalizeCalendarTag).filter(Boolean))]
}

function normalizeType(value: string | null | undefined): CalendarEventType {
  return eventTypes.has(value as CalendarEventType) ? (value as CalendarEventType) : DEFAULT_TYPE
}

function normalizeStatus(value: string | null | undefined): CalendarEventStatus {
  return eventStatuses.has(value as CalendarEventStatus) ? (value as CalendarEventStatus) : DEFAULT_STATUS
}

function normalizePriority(value: string | null | undefined): CalendarPriority {
  return priorities.has(value as CalendarPriority) ? (value as CalendarPriority) : DEFAULT_PRIORITY
}

function normalizeImportance(value: string | null | undefined): CalendarImportance {
  return importances.has(value as CalendarImportance) ? (value as CalendarImportance) : DEFAULT_IMPORTANCE
}

function normalizeColor(value: string | null | undefined): CalendarColor {
  return colors.has(value as CalendarColor) ? (value as CalendarColor) : DEFAULT_COLOR
}

function normalizeSource(value: string | null | undefined): CalendarSource {
  return sources.has(value as CalendarSource) ? (value as CalendarSource) : DEFAULT_SOURCE
}

function uuidOrNull(value: string | null | undefined): string | null {
  const clean = cleanString(value)
  if (!clean) return null
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(clean)
    ? clean
    : null
}

export function fromSupabaseCalendarEventRow(row: SupabaseCalendarEventRow): CalendarEvent {
  return normalizeCalendarEvent({
    id: row.id,
    title: row.title,
    description: optionalString(row.description),
    startAt: row.start_at,
    endAt: optionalString(row.end_at),
    allDay: row.all_day ?? false,
    type: normalizeType(row.type),
    status: normalizeStatus(row.status),
    priority: normalizePriority(row.priority),
    importance: normalizeImportance(row.importance),
    color: normalizeColor(row.color),
    location: optionalString(row.location),
    meetingUrl: optionalString(row.meeting_url),
    attendees: row.attendees ?? [],
    tags: normalizeTags(row.tags),
    relatedLeadId: row.related_lead_id ?? null,
    relatedTaskId: row.related_task_id ?? null,
    relatedNoteId: row.related_note_id ?? null,
    relatedFeedbackId: row.related_feedback_id ?? null,
    relatedProjectId: row.related_project_id ?? null,
    source: normalizeSource(row.source),
    isReminder: row.is_reminder ?? false,
    reminderAt: row.reminder_at ?? null,
    completedAt: row.completed_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  })
}

export function toSupabaseCalendarEventInsert(
  input: CalendarEventInput,
  userId?: string
): SupabaseCalendarEventInsert {
  const status = input.status ?? DEFAULT_STATUS
  return {
    user_id: userId,
    workspace_id: DEFAULT_WORKSPACE_ID,
    title: requiredString(input.title, 'Titulo obrigatorio para criar evento.'),
    description: nullableString(input.description),
    type: input.type ?? DEFAULT_TYPE,
    status,
    priority: input.priority ?? DEFAULT_PRIORITY,
    importance: input.importance ?? DEFAULT_IMPORTANCE,
    color: input.color ?? DEFAULT_COLOR,
    location: nullableString(input.location),
    meeting_url: nullableString(input.meetingUrl),
    start_at: input.startAt,
    end_at: input.allDay ? input.endAt ?? input.startAt : input.endAt ?? getDefaultEndAt(input.startAt),
    all_day: input.allDay ?? false,
    attendees: input.attendees ?? [],
    tags: normalizeTags(input.tags),
    related_lead_id: uuidOrNull(input.relatedLeadId),
    related_task_id: uuidOrNull(input.relatedTaskId),
    related_note_id: uuidOrNull(input.relatedNoteId),
    related_feedback_id: uuidOrNull(input.relatedFeedbackId),
    related_project_id: nullableString(input.relatedProjectId),
    source: input.source ?? DEFAULT_SOURCE,
    is_reminder: input.isReminder ?? false,
    reminder_at: input.reminderAt ?? null,
    completed_at: status === 'completed' ? input.completedAt ?? new Date().toISOString() : input.completedAt ?? null,
  }
}

export function toSupabaseCalendarEventUpdate(
  input: Partial<CalendarEvent>,
  userId?: string
): SupabaseCalendarEventUpdate {
  const status = input.status
  const completedAt =
    status && status !== 'completed'
      ? input.completedAt === undefined
        ? undefined
        : input.completedAt
      : input.completedAt

  return removeUndefined({
    user_id: userId,
    title: input.title === undefined ? undefined : requiredString(input.title, 'Titulo obrigatorio para atualizar evento.'),
    description: input.description === undefined ? undefined : nullableString(input.description),
    type: input.type,
    status,
    priority: input.priority,
    importance: input.importance,
    color: input.color,
    location: input.location === undefined ? undefined : nullableString(input.location),
    meeting_url: input.meetingUrl === undefined ? undefined : nullableString(input.meetingUrl),
    start_at: input.startAt,
    end_at: input.endAt === undefined ? undefined : input.endAt ?? null,
    all_day: input.allDay,
    attendees: input.attendees,
    tags: input.tags === undefined ? undefined : normalizeTags(input.tags),
    related_lead_id: input.relatedLeadId === undefined ? undefined : uuidOrNull(input.relatedLeadId),
    related_task_id: input.relatedTaskId === undefined ? undefined : uuidOrNull(input.relatedTaskId),
    related_note_id: input.relatedNoteId === undefined ? undefined : uuidOrNull(input.relatedNoteId),
    related_feedback_id: input.relatedFeedbackId === undefined ? undefined : uuidOrNull(input.relatedFeedbackId),
    related_project_id: input.relatedProjectId === undefined ? undefined : nullableString(input.relatedProjectId),
    source: input.source,
    is_reminder: input.isReminder,
    reminder_at: input.reminderAt === undefined ? undefined : input.reminderAt ?? null,
    completed_at: completedAt,
  }) as SupabaseCalendarEventUpdate
}
