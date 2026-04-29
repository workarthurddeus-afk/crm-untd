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
  tagIds: z.array(z.string()).default([]),
})
