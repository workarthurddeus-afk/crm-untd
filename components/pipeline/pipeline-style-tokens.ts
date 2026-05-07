import type { CSSProperties } from 'react'

export function getPipelineStageAccentStyle(color: string): CSSProperties {
  return {
    '--pipeline-stage-color': color,
  } as CSSProperties
}
