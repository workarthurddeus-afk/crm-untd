export type NoteType =
  | 'product-idea' | 'ui-idea' | 'feature-idea' | 'campaign-idea'
  | 'copy-idea' | 'offer-idea' | 'client-feedback' | 'market-insight'
  | 'sales-learning' | 'strategic-decision' | 'useful-prompt'
  | 'visual-reference' | 'bug-improvement' | 'onboarding-idea'
  | 'pricing-idea' | 'brandkit-idea' | 'other'

export type NotePriority = 'low' | 'medium' | 'high'
export type NoteStatus = 'draft' | 'review' | 'approved' | 'in-progress' | 'archived'
export type NoteRelation =
  | 'lead' | 'client' | 'product' | 'campaign' | 'ui'
  | 'sales' | 'social' | 'meta-ads' | 'general'
export type ImpactEffort = 'low' | 'medium' | 'high'

export interface Note {
  id: string
  title: string
  content: string
  type: NoteType
  tagIds: string[]
  relatedTo: NoteRelation
  priority: NotePriority
  status: NoteStatus
  pinned: boolean
  favorited: boolean
  expectedImpact?: ImpactEffort
  estimatedEffort?: ImpactEffort
  createdAt: string
  updatedAt: string
}
