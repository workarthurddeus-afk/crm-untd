export const NOTE_TYPES = [
  'insight',
  'idea',
  'meeting',
  'feedback',
  'strategy',
  'product',
  'ui',
  'feature',
  'campaign',
  'copy',
  'offer',
  'sales',
  'pricing',
  'brandkit',
  'prompt',
  'reference',
  'bug',
  'improvement',
  'onboarding',
  'market',
  'decision',
  'general',
] as const

export type NoteTypeValue = (typeof NOTE_TYPES)[number]

export type LegacyNoteType =
  | 'product-idea'
  | 'ui-idea'
  | 'feature-idea'
  | 'campaign-idea'
  | 'copy-idea'
  | 'offer-idea'
  | 'client-feedback'
  | 'market-insight'
  | 'sales-learning'
  | 'strategic-decision'
  | 'useful-prompt'
  | 'visual-reference'
  | 'bug-improvement'
  | 'onboarding-idea'
  | 'pricing-idea'
  | 'brandkit-idea'
  | 'other'

export type NoteType = string

export type NoteStatus =
  | 'draft'
  | 'active'
  | 'in_review'
  | 'approved'
  | 'in_progress'
  | 'executed'
  | 'archived'
  | 'review'
  | 'in-progress'

export type NotePriority = 'low' | 'medium' | 'high'
export type NoteImpact = 'low' | 'medium' | 'high'
export type NoteEffort = 'low' | 'medium' | 'high'
export type ImpactEffort = 'low' | 'medium' | 'high'

export const NOTE_COLORS = [
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

export type NoteColor = (typeof NOTE_COLORS)[number]

export const NOTE_SOURCES = [
  'manual',
  'lead',
  'feedback',
  'meeting',
  'ai',
  'import',
  'dashboard',
  'crm',
] as const

export type NoteSource = (typeof NOTE_SOURCES)[number]

export type NoteRelation =
  | 'lead'
  | 'client'
  | 'product'
  | 'campaign'
  | 'ui'
  | 'sales'
  | 'social'
  | 'meta-ads'
  | 'general'
  | 'task'
  | 'feedback'
  | 'project'

export interface Note {
  id: string
  title: string
  content: string
  excerpt?: string
  type: NoteType
  status: NoteStatus
  priority: NotePriority
  impact: NoteImpact
  effort: NoteEffort
  color: NoteColor
  tags: string[]
  folderId?: string | null
  isPinned: boolean
  isFavorite: boolean
  isArchived: boolean
  isDeleted?: boolean
  relatedLeadId?: string | null
  relatedTaskId?: string | null
  relatedFeedbackId?: string | null
  relatedProjectId?: string | null
  source?: NoteSource
  createdAt: string
  updatedAt: string
  lastViewedAt?: string | null
  // Backward-compatible aliases used by current Phase 1 UI.
  tagIds: string[]
  relatedTo: NoteRelation
  pinned: boolean
  favorited: boolean
  expectedImpact?: ImpactEffort
  estimatedEffort?: ImpactEffort
}

export type NoteInput = Omit<
  Note,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'excerpt'
  | 'tagIds'
  | 'relatedTo'
  | 'pinned'
  | 'favorited'
  | 'expectedImpact'
  | 'estimatedEffort'
>

export interface NoteFolder {
  id: string
  name: string
  description?: string
  color: NoteColor
  icon?: string
  parentId?: string | null
  order: number
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export type NoteFolderInput = Omit<NoteFolder, 'id' | 'createdAt' | 'updatedAt'>

export interface NoteTag {
  id: string
  name: string
  slug: string
  color: NoteColor
  usageCount?: number
  createdAt: string
  updatedAt: string
}
