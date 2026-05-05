import { z } from 'zod'

export const taskInputSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  dueDate: z.string().optional(),
  importance: z.enum(['low', 'medium', 'high']),
  status: z.enum(['pending', 'in-progress', 'done', 'cancelled']),
  category: z.enum([
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
  ]),
  relatedLeadId: z.string().optional(),
  relatedNoteId: z.string().optional(),
  relatedCalendarEventId: z.string().optional(),
  relatedFeedbackId: z.string().optional(),
  source: z.enum([
    'manual',
    'lead',
    'note',
    'calendar',
    'feedback',
    'ai',
    'import',
    'dashboard',
    'crm',
  ]).optional(),
  color: z.enum([
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
  ]).optional(),
  completedAt: z.string().optional(),
  cancelledAt: z.string().optional(),
  archivedAt: z.string().optional(),
  tagIds: z.array(z.string()).default([]),
})

export type TaskInputSchema = z.infer<typeof taskInputSchema>
export const taskUpdateSchema = taskInputSchema.partial()
export type TaskUpdateSchema = z.infer<typeof taskUpdateSchema>
