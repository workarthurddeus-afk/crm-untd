export type TaskStatus = 'pending' | 'in-progress' | 'done' | 'cancelled'
export type TaskImportance = 'low' | 'medium' | 'high'
export type TaskColor =
  | 'default' | 'purple' | 'violet' | 'blue' | 'cyan' | 'green'
  | 'yellow' | 'orange' | 'red' | 'pink' | 'slate'
export type TaskSource =
  | 'manual' | 'lead' | 'note' | 'calendar' | 'feedback'
  | 'ai' | 'import' | 'dashboard' | 'crm'
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
  relatedCalendarEventId?: string
  relatedFeedbackId?: string
  source?: TaskSource
  color?: TaskColor
  completedAt?: string
  cancelledAt?: string
  archivedAt?: string
  tagIds: string[]
  createdAt: string
  updatedAt: string
}

export type TaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
