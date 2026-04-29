export interface PipelineStage {
  id: string
  name: string
  order: number
  color: string
  isFinalWon?: boolean
  isFinalLost?: boolean
}
