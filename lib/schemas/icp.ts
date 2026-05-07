import { z } from 'zod'

export const icpEvaluatorSchema = z.enum([
  'enum-match',
  'numeric-range',
  'boolean-true',
  'array-includes',
  'array-overlap',
  'text-includes',
  'string-not-empty',
])

export const icpCriterionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  weight: z.number().min(-100).max(100),
  field: z.string().min(1),
  evaluator: icpEvaluatorSchema,
  config: z.record(z.string(), z.unknown()).default({}),
})

export const icpPersonaSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().min(1).max(2000),
  pains: z.array(z.string().max(300)).default([]),
  desires: z.array(z.string().max(300)).default([]),
  objections: z.array(z.string().max(300)).default([]),
  purchaseTriggers: z.array(z.string().max(300)).default([]),
  bestMessage: z.string().max(1000).optional(),
  likelyOffer: z.string().max(500).optional(),
  foundOnChannels: z.array(z.string().max(120)).default([]),
})

export const icpClassificationRangeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(80),
  min: z.number().min(0).max(100),
  max: z.number().min(0).max(100),
  tone: z.enum(['success', 'primary', 'warning', 'danger']),
})

export const icpProfileInputSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  criteria: z.array(icpCriterionSchema).min(1, 'Pelo menos 1 criterio'),
  persona: icpPersonaSchema,
  classificationRanges: z.array(icpClassificationRangeSchema).default([]).optional(),
})
