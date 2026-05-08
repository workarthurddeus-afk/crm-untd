import { pipelineStagesSeed } from '@/lib/mocks/seeds/pipeline.seed'
import {
  fromSupabasePipelineStageRow,
  pipelineSupabaseRepo,
} from '@/lib/repositories/pipeline.supabase.repository'
import type { PipelineStage } from '@/lib/types'

const KEY = 'untd-pipeline-stages'

type PipelineDataSource = 'local' | 'supabase'

const listeners = new Set<() => void>()

function sortByOrder(stages: PipelineStage[]): PipelineStage[] {
  return [...stages].sort((a, b) => a.order - b.order)
}

export function resolvePipelineDataSource(value: string | undefined): PipelineDataSource {
  return value === 'supabase' ? 'supabase' : 'local'
}

export { fromSupabasePipelineStageRow }

function readLocal(): PipelineStage[] {
  if (typeof window === 'undefined') return [...pipelineStagesSeed]

  const raw = window.localStorage.getItem(KEY)
  if (!raw) {
    window.localStorage.setItem(KEY, JSON.stringify(pipelineStagesSeed))
    return [...pipelineStagesSeed]
  }

  try {
    return JSON.parse(raw) as PipelineStage[]
  } catch {
    return [...pipelineStagesSeed]
  }
}

function writeLocal(stages: PipelineStage[]): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(KEY, JSON.stringify(stages))
  listeners.forEach((listener) => listener())
}

export const pipelineRepo = {
  async list(): Promise<PipelineStage[]> {
    if (resolvePipelineDataSource(process.env.NEXT_PUBLIC_DATA_SOURCE) === 'supabase') {
      return sortByOrder(await pipelineSupabaseRepo.list())
    }
    return sortByOrder(readLocal())
  },
  async getById(id: string): Promise<PipelineStage | null> {
    return (await this.list()).find((stage) => stage.id === id) ?? null
  },
  async update(id: string, data: Partial<PipelineStage>): Promise<PipelineStage> {
    if (resolvePipelineDataSource(process.env.NEXT_PUBLIC_DATA_SOURCE) === 'supabase') {
      throw new Error('Pipeline stage editing is not enabled for Supabase yet')
    }

    const all = readLocal()
    const index = all.findIndex((stage) => stage.id === id)
    if (index < 0) throw new Error(`Stage ${id} not found`)

    const existing = all[index]
    if (!existing) throw new Error(`Stage ${id} not found`)

    const updated = { ...existing, ...data, id: existing.id }
    const next = [...all]
    next[index] = updated
    writeLocal(next)
    return updated
  },
  async reset(): Promise<void> {
    writeLocal([...pipelineStagesSeed])
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}
