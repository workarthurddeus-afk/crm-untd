export type FeedbackType =
  | 'pain' | 'objection' | 'feature-request' | 'complaint'
  | 'compliment' | 'sales-insight' | 'product-insight' | 'bug' | 'improvement'

export type FeedbackImpact = 'low' | 'medium' | 'high'
export type FeedbackFrequency = 'one-off' | 'recurring' | 'very-recurring'
export type FeedbackStatus =
  | 'new' | 'reviewing' | 'converted-task' | 'converted-feature' | 'archived'

export interface Feedback {
  id: string
  source: string
  relatedLeadId?: string
  type: FeedbackType
  content: string
  date: string
  impact: FeedbackImpact
  frequency: FeedbackFrequency
  status: FeedbackStatus
  tagIds: string[]
  createdAt: string
  updatedAt: string
}
