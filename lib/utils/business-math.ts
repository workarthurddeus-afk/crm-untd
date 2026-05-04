import type { BusinessMetrics } from '@/lib/types/business-metrics'

export interface DerivedMetrics {
  arr: number
  netBalance: number
  isPositive: boolean
  churnRate: number
  netSubscribers: number
}

export function deriveBusinessMetrics(m: BusinessMetrics): DerivedMetrics {
  const denominator = m.activeSubscribers + m.cancellations
  const churnRate = denominator > 0 ? (m.cancellations / denominator) * 100 : 0

  return {
    arr: m.mrr * 12,
    netBalance: m.revenueReceived - m.investment,
    isPositive: m.revenueReceived - m.investment > 0,
    churnRate,
    netSubscribers: m.newSubscribers - m.cancellations,
  }
}
