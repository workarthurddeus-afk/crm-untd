import { describe, expect, it } from 'vitest'
import { createPipelineSupabaseRepository } from '../pipeline.supabase.repository'

describe('pipelineSupabaseRepository', () => {
  it('lists Supabase pipeline stages ordered by order_index', async () => {
    const repository = createPipelineSupabaseRepository({
      from: (table: string) => {
        expect(table).toBe('pipeline_stages')
        return {
          select: (columns: string) => {
            expect(columns).toBe('*')
            return {
              order: async (column: string, options: { ascending: boolean }) => {
                expect(column).toBe('order_index')
                expect(options).toEqual({ ascending: true })
                return {
                  data: [
                    { id: 'meeting', name: 'Reuniao marcada', order_index: 3, color: '#8b5cf6' },
                    { id: 'prospecting', name: 'Prospeccao', order_index: 0, color: '#5332ea' },
                    { id: 'won', name: 'Cliente ganho', order_index: 5, color: '#22c55e' },
                  ],
                  error: null,
                }
              },
            }
          },
        }
      },
    })

    const stages = await repository.list()

    expect(stages.map((stage) => stage.id)).toEqual(['prospecting', 'meeting', 'won'])
    expect(stages[0]).toMatchObject({ id: 'prospecting', name: 'Prospeccao', order: 0 })
    expect(stages[2]).toMatchObject({ id: 'won', isFinalWon: true })
  })

  it('surfaces Supabase query errors', async () => {
    const repository = createPipelineSupabaseRepository({
      from: () => ({
        select: () => ({
          order: async () => ({
            data: null,
            error: { message: 'permission denied for table pipeline_stages' },
          }),
        }),
      }),
    })

    await expect(repository.list()).rejects.toThrow('permission denied for table pipeline_stages')
  })
})
