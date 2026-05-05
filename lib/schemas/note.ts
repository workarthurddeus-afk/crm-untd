import { z } from 'zod'
import { NOTE_COLORS, NOTE_SOURCES, NOTE_TYPES } from '@/lib/types'

export const noteTypeSchema = z.enum(NOTE_TYPES)
export const noteStatusSchema = z.enum([
  'draft',
  'active',
  'in_review',
  'approved',
  'in_progress',
  'executed',
  'archived',
])
export const notePrioritySchema = z.enum(['low', 'medium', 'high'])
export const noteImpactSchema = z.enum(['low', 'medium', 'high'])
export const noteEffortSchema = z.enum(['low', 'medium', 'high'])
export const noteColorSchema = z.enum(NOTE_COLORS)
export const noteSourceSchema = z.enum(NOTE_SOURCES)

export const noteInputSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().default(''),
  excerpt: z.string().max(280).optional(),
  type: noteTypeSchema.default('general'),
  status: noteStatusSchema.default('draft'),
  priority: notePrioritySchema.default('medium'),
  impact: noteImpactSchema.default('medium'),
  effort: noteEffortSchema.default('medium'),
  color: noteColorSchema.default('default'),
  tags: z.array(z.string().min(1).max(80)).default([]),
  folderId: z.string().nullable().optional(),
  isPinned: z.boolean().default(false),
  isFavorite: z.boolean().default(false),
  isArchived: z.boolean().default(false),
  isDeleted: z.boolean().optional(),
  relatedLeadId: z.string().nullable().optional(),
  relatedTaskId: z.string().nullable().optional(),
  relatedFeedbackId: z.string().nullable().optional(),
  relatedProjectId: z.string().nullable().optional(),
  source: noteSourceSchema.default('manual'),
  lastViewedAt: z.string().nullable().optional(),
})

export type NoteInputSchema = z.infer<typeof noteInputSchema>
