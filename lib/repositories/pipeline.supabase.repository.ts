import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { PipelineStage } from '@/lib/types'

export interface SupabasePipelineStageRow {
  id: string
  name: string
  order_index: number
  color?: string | null
  is_default?: boolean | null
}

type SupabasePipelineQueryResult = {
  data: SupabasePipelineStageRow[] | null
  error: { message: string } | null
}

export interface SupabasePipelineStagesClient {
  from(table: string): {
    select(columns: string): {
      order(
        column: string,
        options: { ascending: boolean }
      ): Promise<SupabasePipelineQueryResult>
    }
  }
}

function sortByOrder(stages: PipelineStage[]): PipelineStage[] {
  return [...stages].sort((a, b) => a.order - b.order)
}

export function fromSupabasePipelineStageRow(row: SupabasePipelineStageRow): PipelineStage {
  return {
    id: row.id,
    name: row.name,
    order: row.order_index,
    color: row.color ?? 'var(--pipe-prospect)',
    ...(row.id === 'won' ? { isFinalWon: true } : {}),
    ...(row.id === 'lost' ? { isFinalLost: true } : {}),
  }
}

export function createPipelineSupabaseRepository(
  client?: SupabasePipelineStagesClient
) {
  return {
    async list(): Promise<PipelineStage[]> {
      const supabase = client ?? (getSupabaseBrowserClient() as unknown as SupabasePipelineStagesClient)
      const { data, error } = await supabase
        .from('pipeline_stages')
        .select('*')
        .order('order_index', { ascending: true })

      if (error) throw new Error(error.message)
      return sortByOrder((data ?? []).map(fromSupabasePipelineStageRow))
    },
    async getById(id: string): Promise<PipelineStage | null> {
      return (await this.list()).find((stage) => stage.id === id) ?? null
    },
    async update(): Promise<PipelineStage> {
      throw new Error('Pipeline stage editing is not enabled for Supabase yet')
    },
    async reset(): Promise<void> {
      return Promise.resolve()
    },
    subscribe(): () => void {
      return () => undefined
    },
  }
}

export const pipelineSupabaseRepo = createPipelineSupabaseRepository()
