import type {
  Task,
  TaskCategory,
  TaskColor,
  TaskImportance,
  TaskInput,
  TaskSource,
  TaskStatus,
} from '@/lib/types/task'

const DEFAULT_WORKSPACE_ID = 'default'
const DEFAULT_STATUS: TaskStatus = 'pending'
const DEFAULT_IMPORTANCE: TaskImportance = 'medium'
const DEFAULT_CATEGORY: TaskCategory = 'ops'
const DEFAULT_SOURCE: TaskSource = 'manual'
const DEFAULT_COLOR: TaskColor = 'default'

const taskStatuses = new Set<TaskStatus>(['pending', 'in-progress', 'done', 'cancelled'])
const taskImportance = new Set<TaskImportance>(['low', 'medium', 'high'])
const taskCategories = new Set<TaskCategory>([
  'prospecting',
  'follow-up',
  'meeting',
  'product',
  'design',
  'content',
  'social',
  'meta-ads',
  'strategy',
  'study',
  'ops',
  'other',
])
const taskSources = new Set<TaskSource>([
  'manual',
  'lead',
  'note',
  'calendar',
  'feedback',
  'ai',
  'import',
  'dashboard',
  'crm',
])
const taskColors = new Set<TaskColor>([
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

export interface SupabaseTaskRow {
  id: string
  user_id?: string | null
  workspace_id?: string | null
  title: string
  description?: string | null
  status?: string | null
  importance?: string | null
  category?: string | null
  source?: string | null
  color?: string | null
  tags?: string[] | null
  due_at?: string | null
  completed_at?: string | null
  cancelled_at?: string | null
  archived_at?: string | null
  related_lead_id?: string | null
  related_note_id?: string | null
  related_calendar_event_id?: string | null
  related_feedback_id?: string | null
  created_at: string
  updated_at: string
}

export type SupabaseTaskInsert = Omit<SupabaseTaskRow, 'id' | 'created_at' | 'updated_at'>
export type SupabaseTaskUpdate = Partial<SupabaseTaskInsert>

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
  return [...new Set((tags ?? []).map((tag) => tag.trim()).filter(Boolean))]
}

function normalizeStatus(value: string | null | undefined): TaskStatus {
  return taskStatuses.has(value as TaskStatus) ? (value as TaskStatus) : DEFAULT_STATUS
}

function normalizeImportance(value: string | null | undefined): TaskImportance {
  return taskImportance.has(value as TaskImportance) ? (value as TaskImportance) : DEFAULT_IMPORTANCE
}

function normalizeCategory(value: string | null | undefined): TaskCategory {
  return taskCategories.has(value as TaskCategory) ? (value as TaskCategory) : DEFAULT_CATEGORY
}

function normalizeSource(value: string | null | undefined): TaskSource {
  return taskSources.has(value as TaskSource) ? (value as TaskSource) : DEFAULT_SOURCE
}

function normalizeColor(value: string | null | undefined): TaskColor {
  return taskColors.has(value as TaskColor) ? (value as TaskColor) : DEFAULT_COLOR
}

function uuidOrNull(value: string | null | undefined): string | null {
  const clean = cleanString(value)
  if (!clean) return null
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(clean)
    ? clean
    : null
}

export function fromSupabaseTaskRow(row: SupabaseTaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: optionalString(row.description),
    dueDate: optionalString(row.due_at),
    importance: normalizeImportance(row.importance),
    status: normalizeStatus(row.status),
    category: normalizeCategory(row.category),
    relatedLeadId: optionalString(row.related_lead_id),
    relatedNoteId: optionalString(row.related_note_id),
    relatedCalendarEventId: optionalString(row.related_calendar_event_id),
    relatedFeedbackId: optionalString(row.related_feedback_id),
    source: normalizeSource(row.source),
    color: normalizeColor(row.color),
    completedAt: optionalString(row.completed_at),
    cancelledAt: optionalString(row.cancelled_at),
    archivedAt: optionalString(row.archived_at),
    tagIds: normalizeTags(row.tags),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function toSupabaseTaskInsert(input: TaskInput, userId?: string): SupabaseTaskInsert {
  return {
    user_id: userId,
    workspace_id: DEFAULT_WORKSPACE_ID,
    title: requiredString(input.title, 'Titulo obrigatorio para criar tarefa.'),
    description: nullableString(input.description),
    status: input.status ?? DEFAULT_STATUS,
    importance: input.importance ?? DEFAULT_IMPORTANCE,
    category: input.category ?? DEFAULT_CATEGORY,
    source: input.source ?? DEFAULT_SOURCE,
    color: input.color ?? DEFAULT_COLOR,
    tags: normalizeTags(input.tagIds),
    due_at: input.dueDate ?? null,
    completed_at: input.completedAt ?? null,
    cancelled_at: input.cancelledAt ?? null,
    archived_at: input.archivedAt ?? null,
    related_lead_id: uuidOrNull(input.relatedLeadId),
    related_note_id: uuidOrNull(input.relatedNoteId),
    related_calendar_event_id: nullableString(input.relatedCalendarEventId),
    related_feedback_id: uuidOrNull(input.relatedFeedbackId),
  }
}

export function toSupabaseTaskUpdate(input: Partial<Task>, userId?: string): SupabaseTaskUpdate {
  const status = input.status
  const completedAt = status === 'pending' || status === 'in-progress' ? null : input.completedAt
  const cancelledAt = status === 'pending' || status === 'in-progress' ? null : input.cancelledAt

  return removeUndefined({
    user_id: userId,
    title: input.title === undefined ? undefined : requiredString(input.title, 'Titulo obrigatorio para atualizar tarefa.'),
    description: input.description === undefined ? undefined : nullableString(input.description),
    status,
    importance: input.importance,
    category: input.category,
    source: input.source,
    color: input.color,
    tags: input.tagIds === undefined ? undefined : normalizeTags(input.tagIds),
    due_at: input.dueDate === undefined ? undefined : input.dueDate ?? null,
    completed_at: completedAt,
    cancelled_at: cancelledAt,
    archived_at: input.archivedAt === undefined ? undefined : input.archivedAt ?? null,
    related_lead_id: input.relatedLeadId === undefined ? undefined : uuidOrNull(input.relatedLeadId),
    related_note_id: input.relatedNoteId === undefined ? undefined : uuidOrNull(input.relatedNoteId),
    related_calendar_event_id:
      input.relatedCalendarEventId === undefined ? undefined : nullableString(input.relatedCalendarEventId),
    related_feedback_id: input.relatedFeedbackId === undefined ? undefined : uuidOrNull(input.relatedFeedbackId),
  }) as SupabaseTaskUpdate
}
