import { describe, expect, it } from 'vitest'
import { getDefaultPipelineStageId } from '../lead-form-dialog-utils'
import type { PipelineStage } from '@/lib/types'

describe('lead form pipeline stage defaults', () => {
  const stages: PipelineStage[] = [
    { id: 'contacted', name: 'Primeiro contato', order: 1, color: '#60a5fa' },
    { id: 'prospecting', name: 'Prospeccao', order: 0, color: '#5332ea' },
  ]

  it('prefers prospecting when it exists', () => {
    expect(getDefaultPipelineStageId(stages)).toBe('prospecting')
  })

  it('falls back to the first stage', () => {
    expect(getDefaultPipelineStageId([stages[0]!])).toBe('contacted')
  })

  it('returns an empty value when there are no stages', () => {
    expect(getDefaultPipelineStageId([])).toBe('')
  })
})
