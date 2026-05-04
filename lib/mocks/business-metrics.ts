import type { BusinessMetrics } from '@/lib/types/business-metrics'

const now = new Date()
const monthIso = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`

export const businessMetricsMock: BusinessMetrics = {
  monthIso,
  activeSubscribers: 1,
  mrr: 497,
  revenueReceived: 497,
  cancellations: 0,
  newSubscribers: 1,
  investment: 180,
  updatedAt: now.toISOString(),
}
