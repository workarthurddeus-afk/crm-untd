import type {
  Feedback,
  FeedbackFrequency,
  FeedbackImpact,
  FeedbackInput,
  FeedbackPriority,
  FeedbackSentiment,
  FeedbackSource,
  FeedbackStatus,
  FeedbackType,
} from '@/lib/types/feedback'
import { normalizeFeedback, normalizeFeedbackTag } from '@/lib/utils/feedbacks'

const DEFAULT_WORKSPACE_ID = 'default'
const DEFAULT_TYPE: FeedbackType = 'other'
const DEFAULT_SOURCE: FeedbackSource = 'manual'
const DEFAULT_STATUS: FeedbackStatus = 'new'
const DEFAULT_IMPACT: FeedbackImpact = 'medium'
const DEFAULT_FREQUENCY: FeedbackFrequency = 'one_off'
const DEFAULT_SENTIMENT: FeedbackSentiment = 'neutral'
const DEFAULT_PRIORITY: FeedbackPriority = 'medium'

const feedbackTypes = new Set<FeedbackType>([
  'pain',
  'objection',
  'feature_request',
  'complaint',
  'compliment',
  'bug',
  'improvement',
  'sales_insight',
  'product_insight',
  'pricing',
  'onboarding',
  'support',
  'churn_risk',
  'other',
])
const feedbackSources = new Set<FeedbackSource>([
  'lead',
  'customer',
  'call',
  'meeting',
  'dm',
  'email',
  'social',
  'support',
  'internal',
  'ai',
  'manual',
])
const feedbackStatuses = new Set<FeedbackStatus>([
  'new',
  'reviewing',
  'planned',
  'converted_to_task',
  'converted_to_note',
  'resolved',
  'archived',
])
const impacts = new Set<FeedbackImpact>(['low', 'medium', 'high', 'critical'])
const frequencies = new Set<FeedbackFrequency>(['one_off', 'recurring', 'very_recurring'])
const sentiments = new Set<FeedbackSentiment>(['negative', 'neutral', 'positive', 'mixed'])
const priorities = new Set<FeedbackPriority>(['low', 'medium', 'high', 'urgent'])

export interface SupabaseFeedbackRow {
  id: string
  user_id?: string | null
  workspace_id?: string | null
  title: string
  content?: string | null
  type?: string | null
  source?: string | null
  status?: string | null
  impact?: string | null
  frequency?: string | null
  sentiment?: string | null
  priority?: string | null
  tags?: string[] | null
  related_lead_id?: string | null
  related_note_id?: string | null
  related_task_id?: string | null
  related_calendar_event_id?: string | null
  related_project_id?: string | null
  is_archived?: boolean | null
  is_pinned?: boolean | null
  captured_at?: string | null
  resolved_at?: string | null
  created_at: string
  updated_at: string
}

export type SupabaseFeedbackInsert = Omit<SupabaseFeedbackRow, 'id' | 'created_at' | 'updated_at'>
export type SupabaseFeedbackUpdate = Partial<SupabaseFeedbackInsert>

function cleanString(value: string | null | undefined): string | undefined {
  const clean = value?.trim()
  return clean ? clean : undefined
}

function nullableString(value: string | null | undefined): string | null {
  return cleanString(value) ?? null
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
  return [...new Set((tags ?? []).map(normalizeFeedbackTag).filter(Boolean))]
}

function normalizeType(value: string | null | undefined): FeedbackType {
  return feedbackTypes.has(value as FeedbackType) ? (value as FeedbackType) : DEFAULT_TYPE
}

function normalizeSource(value: string | null | undefined): FeedbackSource {
  return feedbackSources.has(value as FeedbackSource) ? (value as FeedbackSource) : DEFAULT_SOURCE
}

function normalizeStatus(value: string | null | undefined): FeedbackStatus {
  return feedbackStatuses.has(value as FeedbackStatus) ? (value as FeedbackStatus) : DEFAULT_STATUS
}

function normalizeImpact(value: string | null | undefined): FeedbackImpact {
  return impacts.has(value as FeedbackImpact) ? (value as FeedbackImpact) : DEFAULT_IMPACT
}

function normalizeFrequency(value: string | null | undefined): FeedbackFrequency {
  return frequencies.has(value as FeedbackFrequency) ? (value as FeedbackFrequency) : DEFAULT_FREQUENCY
}

function normalizeSentiment(value: string | null | undefined): FeedbackSentiment {
  return sentiments.has(value as FeedbackSentiment) ? (value as FeedbackSentiment) : DEFAULT_SENTIMENT
}

function normalizePriority(value: string | null | undefined): FeedbackPriority {
  return priorities.has(value as FeedbackPriority) ? (value as FeedbackPriority) : DEFAULT_PRIORITY
}

function uuidOrNull(value: string | null | undefined): string | null {
  const clean = cleanString(value)
  if (!clean) return null
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(clean)
    ? clean
    : null
}

export function fromSupabaseFeedbackRow(row: SupabaseFeedbackRow): Feedback {
  const isArchived = row.is_archived ?? row.status === 'archived'
  return normalizeFeedback({
    id: row.id,
    title: row.title,
    content: row.content ?? '',
    type: normalizeType(row.type),
    source: normalizeSource(row.source),
    status: isArchived ? 'archived' : normalizeStatus(row.status),
    impact: normalizeImpact(row.impact),
    frequency: normalizeFrequency(row.frequency),
    sentiment: normalizeSentiment(row.sentiment),
    priority: normalizePriority(row.priority),
    tags: normalizeTags(row.tags),
    relatedLeadId: row.related_lead_id ?? null,
    relatedNoteId: row.related_note_id ?? null,
    relatedTaskId: row.related_task_id ?? null,
    relatedCalendarEventId: row.related_calendar_event_id ?? null,
    relatedProjectId: row.related_project_id ?? null,
    isArchived,
    isPinned: row.is_pinned ?? false,
    capturedAt: row.captured_at ?? row.created_at,
    resolvedAt: row.resolved_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  })
}

type CreateFeedbackInput = Partial<FeedbackInput> &
  Pick<FeedbackInput, 'title' | 'content' | 'type' | 'source' | 'capturedAt'>

export function toSupabaseFeedbackInsert(input: CreateFeedbackInput, userId?: string): SupabaseFeedbackInsert {
  const isArchived = input.isArchived ?? input.status === 'archived'
  const status = isArchived ? 'archived' : input.status ?? DEFAULT_STATUS
  return {
    user_id: userId,
    workspace_id: DEFAULT_WORKSPACE_ID,
    title: requiredString(input.title, 'Titulo obrigatorio para criar feedback.'),
    content: requiredString(input.content, 'Conteudo obrigatorio para criar feedback.'),
    type: input.type ?? DEFAULT_TYPE,
    source: input.source ?? DEFAULT_SOURCE,
    status,
    impact: input.impact ?? DEFAULT_IMPACT,
    frequency: input.frequency ?? DEFAULT_FREQUENCY,
    sentiment: input.sentiment ?? DEFAULT_SENTIMENT,
    priority: input.priority ?? DEFAULT_PRIORITY,
    tags: normalizeTags(input.tags),
    related_lead_id: uuidOrNull(input.relatedLeadId),
    related_note_id: uuidOrNull(input.relatedNoteId),
    related_task_id: uuidOrNull(input.relatedTaskId),
    related_calendar_event_id: uuidOrNull(input.relatedCalendarEventId),
    related_project_id: nullableString(input.relatedProjectId),
    is_archived: isArchived,
    is_pinned: input.isPinned ?? false,
    captured_at: input.capturedAt,
    resolved_at: status === 'resolved' ? input.capturedAt : null,
  }
}

export function toSupabaseFeedbackUpdate(input: Partial<Feedback>, userId?: string): SupabaseFeedbackUpdate {
  const isArchived = input.isArchived ?? (input.status === 'archived' ? true : undefined)
  const status = isArchived ? 'archived' : input.status
  return removeUndefined({
    user_id: userId,
    title: input.title === undefined ? undefined : requiredString(input.title, 'Titulo obrigatorio para atualizar feedback.'),
    content:
      input.content === undefined ? undefined : requiredString(input.content, 'Conteudo obrigatorio para atualizar feedback.'),
    type: input.type,
    source: input.source,
    status,
    impact: input.impact,
    frequency: input.frequency,
    sentiment: input.sentiment,
    priority: input.priority,
    tags: input.tags === undefined ? undefined : normalizeTags(input.tags),
    related_lead_id: input.relatedLeadId === undefined ? undefined : uuidOrNull(input.relatedLeadId),
    related_note_id: input.relatedNoteId === undefined ? undefined : uuidOrNull(input.relatedNoteId),
    related_task_id: input.relatedTaskId === undefined ? undefined : uuidOrNull(input.relatedTaskId),
    related_calendar_event_id:
      input.relatedCalendarEventId === undefined ? undefined : uuidOrNull(input.relatedCalendarEventId),
    related_project_id: input.relatedProjectId === undefined ? undefined : nullableString(input.relatedProjectId),
    is_archived: isArchived,
    is_pinned: input.isPinned,
    captured_at: input.capturedAt,
    resolved_at: input.resolvedAt === undefined ? undefined : input.resolvedAt ?? null,
  }) as SupabaseFeedbackUpdate
}
