import { describe, expect, it } from 'vitest'
import { fromSupabasePipelineStageRow, resolvePipelineDataSource } from '../pipeline.repository'

describe('pipeline repository data source', () => {
  it('uses local repository by default', () => {
    expect(resolvePipelineDataSource(undefined)).toBe('local')
    expect(resolvePipelineDataSource('')).toBe('local')
  })

  it('uses Supabase only when explicitly requested', () => {
    expect(resolvePipelineDataSource('supabase')).toBe('supabase')
    expect(resolvePipelineDataSource('local')).toBe('local')
    expect(resolvePipelineDataSource('other')).toBe('local')
  })

  it('maps Supabase pipeline rows into internal stages', () => {
    expect(
      fromSupabasePipelineStageRow({
        id: 'prospecting',
        name: 'Prospeccao',
        order_index: 0,
        color: '#a78bfa',
      })
    ).toEqual({
      id: 'prospecting',
      name: 'Prospeccao',
      order: 0,
      color: '#a78bfa',
    })
  })
})
