import type {
  Note,
  NoteColor,
  NoteEffort,
  NoteImpact,
  NoteInput,
  NotePriority,
  NoteSource,
  NoteStatus,
} from '@/lib/types'
import { generateExcerpt, normalizeNote, normalizeTag } from '@/lib/utils/notes'

const DEFAULT_WORKSPACE_ID = 'default'
const DEFAULT_COLOR: NoteColor = 'default'
const DEFAULT_TYPE = 'general'
const DEFAULT_STATUS: NoteStatus = 'active'
const DEFAULT_PRIORITY: NotePriority = 'medium'
const DEFAULT_IMPACT: NoteImpact = 'medium'
const DEFAULT_EFFORT: NoteEffort = 'medium'
const DEFAULT_SOURCE: NoteSource = 'manual'

const noteColors = new Set<NoteColor>([
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
const noteStatuses = new Set<NoteStatus>([
  'draft',
  'active',
  'in_review',
  'approved',
  'in_progress',
  'executed',
  'archived',
  'review',
  'in-progress',
])
const notePriorities = new Set<NotePriority>(['low', 'medium', 'high'])
const noteImpacts = new Set<NoteImpact>(['low', 'medium', 'high'])
const noteEfforts = new Set<NoteEffort>(['low', 'medium', 'high'])
const noteSources = new Set<NoteSource>(['manual', 'lead', 'feedback', 'meeting', 'ai', 'import', 'dashboard', 'crm'])

export interface SupabaseNoteRow {
  id: string
  user_id?: string | null
  workspace_id?: string | null
  folder_id?: string | null
  related_lead_id?: string | null
  related_task_id?: string | null
  related_feedback_id?: string | null
  related_project_id?: string | null
  title: string
  content?: string | null
  excerpt?: string | null
  type?: string | null
  status?: string | null
  priority?: string | null
  impact?: string | null
  effort?: string | null
  tags?: string[] | null
  color?: string | null
  source?: string | null
  is_pinned?: boolean | null
  is_favorite?: boolean | null
  is_archived?: boolean | null
  is_deleted?: boolean | null
  last_viewed_at?: string | null
  created_at: string
  updated_at: string
}

export type SupabaseNoteInsert = Omit<SupabaseNoteRow, 'id' | 'created_at' | 'updated_at'>
export type SupabaseNoteUpdate = Partial<SupabaseNoteInsert>

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
  return [...new Set((tags ?? []).map(normalizeTag).filter(Boolean))]
}

function normalizeColor(value: string | null | undefined): NoteColor {
  return noteColors.has(value as NoteColor) ? (value as NoteColor) : DEFAULT_COLOR
}

function normalizeStatus(value: string | null | undefined): NoteStatus {
  return noteStatuses.has(value as NoteStatus) ? (value as NoteStatus) : DEFAULT_STATUS
}

function normalizePriority(value: string | null | undefined): NotePriority {
  return notePriorities.has(value as NotePriority) ? (value as NotePriority) : DEFAULT_PRIORITY
}

function normalizeImpact(value: string | null | undefined): NoteImpact {
  return noteImpacts.has(value as NoteImpact) ? (value as NoteImpact) : DEFAULT_IMPACT
}

function normalizeEffort(value: string | null | undefined): NoteEffort {
  return noteEfforts.has(value as NoteEffort) ? (value as NoteEffort) : DEFAULT_EFFORT
}

function normalizeSource(value: string | null | undefined): NoteSource {
  return noteSources.has(value as NoteSource) ? (value as NoteSource) : DEFAULT_SOURCE
}

function uuidOrNull(value: string | null | undefined): string | null {
  if (!value) return null
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    ? value
    : null
}

function deriveRelatedTo(input: Partial<Note>): Note['relatedTo'] {
  if (input.relatedLeadId) return 'lead'
  if (input.relatedTaskId) return 'task'
  if (input.relatedFeedbackId) return 'feedback'
  if (input.relatedProjectId) return 'project'
  return 'general'
}

export function fromSupabaseNoteRow(row: SupabaseNoteRow): Note {
  const tags = normalizeTags(row.tags)
  const content = row.content ?? ''
  const isPinned = row.is_pinned ?? false
  const isFavorite = row.is_favorite ?? false
  const isArchived = row.is_archived ?? row.status === 'archived'
  const note: Note = {
    id: row.id,
    title: row.title,
    content,
    excerpt: cleanString(row.excerpt) ?? generateExcerpt(content),
    type: cleanString(row.type) ?? DEFAULT_TYPE,
    status: isArchived ? 'archived' : normalizeStatus(row.status),
    priority: normalizePriority(row.priority),
    impact: normalizeImpact(row.impact),
    effort: normalizeEffort(row.effort),
    color: normalizeColor(row.color),
    tags,
    folderId: row.folder_id ?? null,
    isPinned,
    isFavorite,
    isArchived,
    isDeleted: row.is_deleted ?? false,
    relatedLeadId: row.related_lead_id ?? null,
    relatedTaskId: row.related_task_id ?? null,
    relatedFeedbackId: row.related_feedback_id ?? null,
    relatedProjectId: row.related_project_id ?? null,
    source: normalizeSource(row.source),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastViewedAt: row.last_viewed_at ?? null,
    tagIds: tags,
    relatedTo: 'general',
    pinned: isPinned,
    favorited: isFavorite,
    expectedImpact: normalizeImpact(row.impact),
    estimatedEffort: normalizeEffort(row.effort),
  }
  return normalizeNote({ ...note, relatedTo: deriveRelatedTo(note) })
}

type CreateNoteInput = Partial<NoteInput> &
  Pick<NoteInput, 'title' | 'content'> &
  Pick<Partial<Note>, 'excerpt'>

export function toSupabaseNoteInsert(input: CreateNoteInput, userId?: string): SupabaseNoteInsert {
  const content = input.content ?? ''
  const isArchived = input.isArchived ?? input.status === 'archived'
  return {
    user_id: userId,
    workspace_id: DEFAULT_WORKSPACE_ID,
    folder_id: uuidOrNull(input.folderId),
    related_lead_id: uuidOrNull(input.relatedLeadId),
    related_task_id: uuidOrNull(input.relatedTaskId),
    related_feedback_id: uuidOrNull(input.relatedFeedbackId),
    related_project_id: uuidOrNull(input.relatedProjectId),
    title: requiredString(input.title, 'Titulo obrigatorio para criar nota.'),
    content,
    excerpt: input.excerpt ?? generateExcerpt(content),
    type: input.type ?? DEFAULT_TYPE,
    status: isArchived ? 'archived' : input.status ?? DEFAULT_STATUS,
    priority: input.priority ?? DEFAULT_PRIORITY,
    impact: input.impact ?? DEFAULT_IMPACT,
    effort: input.effort ?? DEFAULT_EFFORT,
    tags: normalizeTags(input.tags),
    color: input.color ?? DEFAULT_COLOR,
    source: input.source ?? DEFAULT_SOURCE,
    is_pinned: input.isPinned ?? false,
    is_favorite: input.isFavorite ?? false,
    is_archived: isArchived,
    is_deleted: input.isDeleted ?? false,
    last_viewed_at: input.lastViewedAt ?? null,
  }
}

export function toSupabaseNoteUpdate(input: Partial<Note>, userId?: string): SupabaseNoteUpdate {
  const isArchived = input.isArchived ?? (input.status === 'archived' ? true : undefined)
  return removeUndefined({
    user_id: userId,
    folder_id: input.folderId === undefined ? undefined : uuidOrNull(input.folderId),
    related_lead_id: input.relatedLeadId === undefined ? undefined : uuidOrNull(input.relatedLeadId),
    related_task_id: input.relatedTaskId === undefined ? undefined : uuidOrNull(input.relatedTaskId),
    related_feedback_id: input.relatedFeedbackId === undefined ? undefined : uuidOrNull(input.relatedFeedbackId),
    related_project_id: input.relatedProjectId === undefined ? undefined : uuidOrNull(input.relatedProjectId),
    title: input.title === undefined ? undefined : requiredString(input.title, 'Titulo obrigatorio para atualizar nota.'),
    content: input.content,
    excerpt: input.excerpt ?? (input.content === undefined ? undefined : generateExcerpt(input.content)),
    type: input.type,
    status: isArchived ? 'archived' : input.status,
    priority: input.priority,
    impact: input.impact,
    effort: input.effort,
    tags: input.tags === undefined ? undefined : normalizeTags(input.tags),
    color: input.color,
    source: input.source,
    is_pinned: input.isPinned ?? input.pinned,
    is_favorite: input.isFavorite ?? input.favorited,
    is_archived: isArchived,
    is_deleted: input.isDeleted,
    last_viewed_at: input.lastViewedAt,
  }) as SupabaseNoteUpdate
}
