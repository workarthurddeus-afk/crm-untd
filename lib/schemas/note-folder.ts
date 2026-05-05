import { z } from 'zod'
import { NOTE_COLORS } from '@/lib/types'

export const noteFolderInputSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  color: z.enum(NOTE_COLORS).default('default'),
  icon: z.string().max(80).optional(),
  parentId: z.string().nullable().optional(),
  order: z.number().int().min(0).default(0),
  isArchived: z.boolean().default(false),
})

export type NoteFolderInputSchema = z.infer<typeof noteFolderInputSchema>
