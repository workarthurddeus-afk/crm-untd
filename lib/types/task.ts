export type TaskStatus = 'pending' | 'in-progress' | 'done' | 'cancelled'
export type TaskImportance = 'low' | 'medium' | 'high'
export type TaskCategory =
  | 'prospecting' | 'follow-up' | 'meeting' | 'product' | 'design'
  | 'content' | 'social' | 'meta-ads' | 'strategy' | 'study' | 'ops' | 'other'

export interface Task {
  id: string
  title: string
  description?: string
  dueDate?: string
  importance: TaskImportance
  status: TaskStatus
  category: TaskCategory
  relatedLeadId?: string
  relatedNoteId?: string
  tagIds: string[]
  createdAt: string
  updatedAt: string
}
