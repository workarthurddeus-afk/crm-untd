import type { Lead } from '@/lib/types'

export function getBestOpportunity(leads: Lead[]): Lead | null {
  const open = leads.filter(l => l.result === 'open')
  if (open.length === 0) return null
  const tempBonus: Record<string, number> = { hot: 30, warm: 15, cold: 0 }
  const scored = open.map(lead => ({
    lead,
    score: lead.icpScore + (tempBonus[lead.temperature] ?? 0) + Math.min(50, (lead.revenuePotential ?? 0) / 200),
  }))
  scored.sort((a, b) => b.score - a.score)
  return scored[0]?.lead ?? null
}
