import { z } from 'zod'

export const businessMetricsSchema = z.object({
  monthIso: z.string().regex(/^\d{4}-\d{2}$/),
  activeSubscribers: z.number().int().min(0),
  mrr: z.number().min(0),
  revenueReceived: z.number().min(0),
  cancellations: z.number().int().min(0),
  newSubscribers: z.number().int().min(0),
  investment: z.number().min(0),
  updatedAt: z.string().datetime(),
})

export type BusinessMetricsSchema = z.infer<typeof businessMetricsSchema>
