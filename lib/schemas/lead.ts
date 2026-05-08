import { z } from 'zod'

export const leadOriginSchema = z.enum([
  'cold-dm',
  'cold-email',
  'in-person',
  'referral',
  'paid-traffic',
  'social',
  'community',
  'event',
  'manual',
  'manual-search',
  'other',
])

export const leadTemperatureSchema = z.enum(['cold', 'warm', 'hot'])
export const leadResultSchema = z.enum(['open', 'won', 'lost', 'no-response', 'no-fit'])

export const leadInputSchema = z.object({
  name: z.string().trim().min(1, 'Nome obrigatorio').max(120),
  company: z.string().trim().min(1, 'Empresa obrigatoria').max(120),
  role: z.string().max(120).optional(),
  niche: z.string().trim().min(1, 'Nicho obrigatorio').max(120),
  website: z.string().url('URL invalida').optional().or(z.literal('')),
  instagram: z.string().max(120).optional(),
  linkedin: z.string().max(200).optional(),
  email: z.string().email('Email invalido').optional().or(z.literal('')),
  phone: z.string().max(40).optional(),
  location: z
    .object({
      city: z.string().max(80).optional(),
      country: z.string().max(80).optional(),
    })
    .optional(),
  origin: leadOriginSchema,
  pipelineStageId: z.string().trim().min(1, 'Etapa do pipeline obrigatoria'),
  temperature: leadTemperatureSchema,
  pain: z.string().max(500).optional(),
  revenuePotential: z.number().nonnegative().optional(),
  objections: z.array(z.string().max(200)).optional(),
  firstContactAt: z.string().optional(),
  lastContactAt: z.string().optional(),
  nextFollowUpAt: z.string().optional(),
  ownerId: z.string().min(1).default('arthur'),
  tagIds: z.array(z.string()).default([]),
  internalNotes: z.string().max(2000).optional(),
  result: leadResultSchema.default('open'),
})

export type LeadInputSchema = z.infer<typeof leadInputSchema>
export type LeadInputSchemaInput = z.input<typeof leadInputSchema>
