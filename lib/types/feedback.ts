export const FEEDBACK_TYPES = [
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
] as const

export type FeedbackType = (typeof FEEDBACK_TYPES)[number]

export const FEEDBACK_SOURCES = [
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
] as const

export type FeedbackSource = (typeof FEEDBACK_SOURCES)[number]

export const FEEDBACK_STATUSES = [
  'new',
  'reviewing',
  'planned',
  'converted_to_task',
  'converted_to_note',
  'resolved',
  'archived',
] as const

export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number]

export type FeedbackImpact = 'low' | 'medium' | 'high' | 'critical'
export type FeedbackFrequency = 'one_off' | 'recurring' | 'very_recurring'
export type FeedbackSentiment = 'negative' | 'neutral' | 'positive' | 'mixed'
export type FeedbackPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Feedback {
  id: string
  title: string
  content: string
  type: FeedbackType
  source: FeedbackSource
  status: FeedbackStatus
  impact: FeedbackImpact
  frequency: FeedbackFrequency
  sentiment: FeedbackSentiment
  priority: FeedbackPriority
  tags: string[]
  relatedLeadId?: string | null
  relatedNoteId?: string | null
  relatedTaskId?: string | null
  relatedCalendarEventId?: string | null
  relatedProjectId?: string | null
  isArchived: boolean
  isPinned: boolean
  createdAt: string
  updatedAt: string
  capturedAt: string
  resolvedAt?: string | null
}

export type FeedbackInput = Omit<Feedback, 'id' | 'createdAt' | 'updatedAt' | 'resolvedAt'>

export interface FeedbackFilters {
  query?: string
  type?: FeedbackType
  source?: FeedbackSource
  status?: FeedbackStatus
  impact?: FeedbackImpact
  frequency?: FeedbackFrequency
  sentiment?: FeedbackSentiment
  priority?: FeedbackPriority
  tags?: string[]
  relatedLeadId?: string | null
  relatedNoteId?: string | null
  relatedTaskId?: string | null
  relatedCalendarEventId?: string | null
  isArchived?: boolean
  isPinned?: boolean
  capturedFrom?: string
  capturedTo?: string
}

export type FeedbackSort = 'review' | 'captured-desc' | 'impact-desc' | 'priority-desc' | 'title-asc'
