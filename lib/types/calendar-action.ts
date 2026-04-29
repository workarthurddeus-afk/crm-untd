import type { TaskCategory, TaskImportance, TaskStatus } from './task'

export type CalendarUrgency = 'normal' | 'today' | 'overdue'

export interface CalendarAction {
  id: string
  title: string
  description?: string
  date: string
  startTime?: string
  endTime?: string
  type: TaskCategory
  importance: TaskImportance
  urgency: CalendarUrgency
  status: TaskStatus
  relatedLeadId?: string
  relatedNoteId?: string
  tagIds: string[]
  createdAt: string
  updatedAt: string
}
