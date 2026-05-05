import type { Lead, PipelineStage } from '@/lib/types'

export interface StageBucket { stage: PipelineStage; count: number; totalValue: number }
export interface PipelineSummary {
  buckets: StageBucket[]
  totalOpen: number
  totalValue: number
  bottleneck: { stage: PipelineStage; count: number; reason: string } | null
}

export function getPipelineSummary(leads: Lead[], stages: PipelineStage[]): PipelineSummary {
  const open = leads.filter(l => l.result === 'open')
  const sortedStages = [...stages]
    .sort((a, b) => a.order - b.order)
    .filter(s => !s.isFinalWon && !s.isFinalLost)
  const buckets: StageBucket[] = sortedStages.map(stage => {
    const inStage = open.filter(l => l.pipelineStageId === stage.id)
    return { stage, count: inStage.length, totalValue: inStage.reduce((s, l) => s + (l.revenuePotential ?? 0), 0) }
  })
  const totalOpen = open.length
  const totalValue = buckets.reduce((s, b) => s + b.totalValue, 0)
  let bottleneck: PipelineSummary['bottleneck'] = null
  if (totalOpen >= 5 && buckets.length > 0) {
    const maxBucket = buckets.reduce((max, b) => b.count > max.count ? b : max, buckets[0]!)
    if (maxBucket.count > 0 && maxBucket.count / totalOpen > 0.3) {
      bottleneck = {
        stage: maxBucket.stage,
        count: maxBucket.count,
        reason: `${maxBucket.count} leads acumulados em ${maxBucket.stage.name}.`,
      }
    }
  }
  return { buckets, totalOpen, totalValue, bottleneck }
}
