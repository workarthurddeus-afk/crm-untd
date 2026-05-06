import { z } from 'zod'
import { FEEDBACK_SOURCES, FEEDBACK_STATUSES, FEEDBACK_TYPES } from '@/lib/types'

export const feedbackTypeSchema = z.enum(FEEDBACK_TYPES)
export const feedbackSourceSchema = z.enum(FEEDBACK_SOURCES)
export const feedbackStatusSchema = z.enum(FEEDBACK_STATUSES)
export const feedbackImpactSchema = z.enum(['low', 'medium', 'high', 'critical'])
export const feedbackFrequencySchema = z.enum(['one_off', 'recurring', 'very_recurring'])
export const feedbackSentimentSchema = z.enum(['negative', 'neutral', 'positive', 'mixed'])
export const feedbackPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent'])

export const feedbackInputSchema = z.object({
  title: z.string().min(1).max(220),
  content: z.string().min(1).max(4000),
  type: feedbackTypeSchema,
  source: feedbackSourceSchema,
  status: feedbackStatusSchema.default('new'),
  impact: feedbackImpactSchema.default('medium'),
  frequency: feedbackFrequencySchema.default('one_off'),
  sentiment: feedbackSentimentSchema.default('neutral'),
  priority: feedbackPrioritySchema.default('medium'),
  tags: z.array(z.string().min(1).max(80)).default([]),
  relatedLeadId: z.string().nullable().optional(),
  relatedNoteId: z.string().nullable().optional(),
  relatedTaskId: z.string().nullable().optional(),
  relatedCalendarEventId: z.string().nullable().optional(),
  relatedProjectId: z.string().nullable().optional(),
  isArchived: z.boolean().default(false),
  isPinned: z.boolean().default(false),
  capturedAt: z.string(),
})

export const feedbackUpdateSchema = feedbackInputSchema.partial()

export type FeedbackInputSchema = z.infer<typeof feedbackInputSchema>
export type FeedbackUpdateSchema = z.infer<typeof feedbackUpdateSchema>
