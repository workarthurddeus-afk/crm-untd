import { pipelineStagesSeed } from '@/lib/mocks/seeds/pipeline.seed'
import type { PipelineStage } from '@/lib/types'

const KEY = 'untd-pipeline-stages'

const listeners = new Set<() => void>()

function sortByOrder(stages: PipelineStage[]): PipelineStage[] {
  return [...stages].sort((a, b) => a.order - b.order)
}

function read(): PipelineStage[] {
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

function write(stages: PipelineStage[]): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(KEY, JSON.stringify(stages))
  listeners.forEach((listener) => listener())
}

export const pipelineRepo = {
  async list(): Promise<PipelineStage[]> {
    return sortByOrder(read())
  },
  async getById(id: string): Promise<PipelineStage | null> {
    return read().find((stage) => stage.id === id) ?? null
  },
  async update(id: string, data: Partial<PipelineStage>): Promise<PipelineStage> {
    const all = read()
    const index = all.findIndex((stage) => stage.id === id)
    if (index < 0) throw new Error(`Stage ${id} not found`)

    const existing = all[index]
    if (!existing) throw new Error(`Stage ${id} not found`)

    const updated = { ...existing, ...data, id: existing.id }
    const next = [...all]
    next[index] = updated
    write(next)
    return updated
  },
  async reset(): Promise<void> {
    write([...pipelineStagesSeed])
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}
