import type { OperationActivityPoint } from '@/lib/types/operation-activity'

export type ActivityPeriod = 7 | 30 | 90

export function activityForPeriod(seed: OperationActivityPoint[], days: ActivityPeriod): OperationActivityPoint[] {
  return seed.slice(-days)
}

export function totalInteractions(period: OperationActivityPoint[]): number {
  return period.reduce((s, p) => s + p.leads + p.followUps + p.meetings + p.pipelineMoves, 0)
}

export function totalsByCategory(period: OperationActivityPoint[]): {
  leads: number
  followUps: number
  meetings: number
  pipelineMoves: number
} {
  return period.reduce(
    (acc, p) => ({
      leads: acc.leads + p.leads,
      followUps: acc.followUps + p.followUps,
      meetings: acc.meetings + p.meetings,
      pipelineMoves: acc.pipelineMoves + p.pipelineMoves,
    }),
    { leads: 0, followUps: 0, meetings: 0, pipelineMoves: 0 }
  )
}
