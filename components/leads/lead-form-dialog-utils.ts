import type { PipelineStage } from '@/lib/types'

export function getDefaultPipelineStageId(stages: PipelineStage[]): string {
  return stages.find((stage) => stage.id === 'prospecting')?.id ?? stages[0]?.id ?? ''
}
