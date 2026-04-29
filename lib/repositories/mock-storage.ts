import { newId } from '@/lib/utils/id'
import { nowIso } from '@/lib/utils/date'
import type { Entity, EntityInput, Repository } from './base.repository'

const SIM_LATENCY_MIN = 30
const SIM_LATENCY_MAX = 80

function delay(): Promise<void> {
  const ms = Math.floor(Math.random() * (SIM_LATENCY_MAX - SIM_LATENCY_MIN)) + SIM_LATENCY_MIN
  return new Promise((r) => setTimeout(r, ms))
}

function readStorage<T>(key: string): T[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T[]
  } catch {
    return null
  }
}

function writeStorage<T>(key: string, value: T[]): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function createMockRepository<T extends Entity>(
  storageKey: string,
  seed: T[]
): Repository<T> & { reset: () => Promise<void> } {
  const listeners = new Set<() => void>()

  function getAll(): T[] {
    const stored = readStorage<T>(storageKey)
    if (stored !== null) return stored
    if (seed.length > 0) {
      writeStorage(storageKey, seed)
      return [...seed]
    }
    return []
  }

  function setAll(items: T[]): void {
    writeStorage(storageKey, items)
    listeners.forEach((l) => l())
  }

  function matches(item: T, filters: Partial<T>): boolean {
    return Object.entries(filters).every(([k, v]) => {
      if (v === undefined) return true
      return (item as Record<string, unknown>)[k] === v
    })
  }

  return {
    async list(filters) {
      await delay()
      const all = getAll()
      if (!filters) return all
      return all.filter((i) => matches(i, filters))
    },
    async getById(id) {
      await delay()
      const all = getAll()
      return all.find((i) => i.id === id) ?? null
    },
    async create(data: EntityInput<T>) {
      await delay()
      const now = nowIso()
      const created = {
        ...(data as object),
        id: newId(),
        createdAt: now,
        updatedAt: now,
      } as T
      setAll([...getAll(), created])
      return created
    },
    async update(id, data) {
      await delay()
      const all = getAll()
      const idx = all.findIndex((i) => i.id === id)
      if (idx < 0) throw new Error(`Item ${id} not found in ${storageKey}`)
      const existing = all[idx]
      if (!existing) throw new Error(`Item ${id} not found in ${storageKey}`)
      const updated = { ...existing, ...data, id: existing.id, updatedAt: nowIso() } as T
      const next = [...all]
      next[idx] = updated
      setAll(next)
      return updated
    },
    async delete(id) {
      await delay()
      setAll(getAll().filter((i) => i.id !== id))
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    async reset() {
      writeStorage(storageKey, seed)
      listeners.forEach((l) => l())
    },
  }
}
