import { icpProfileSeed } from '@/lib/mocks/seeds/icp.seed'
import type { ICPProfile } from '@/lib/types'
import { nowIso } from '@/lib/utils/date'

const KEY = 'untd-icp-profile'

const listeners = new Set<() => void>()

function read(): ICPProfile {
  if (typeof window === 'undefined') return icpProfileSeed

  const raw = window.localStorage.getItem(KEY)
  if (!raw) {
    window.localStorage.setItem(KEY, JSON.stringify(icpProfileSeed))
    return icpProfileSeed
  }

  try {
    return JSON.parse(raw) as ICPProfile
  } catch {
    return icpProfileSeed
  }
}

function write(profile: ICPProfile): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(KEY, JSON.stringify(profile))
  listeners.forEach((listener) => listener())
}

export const icpRepo = {
  async get(): Promise<ICPProfile> {
    return read()
  },
  async update(data: Partial<ICPProfile>): Promise<ICPProfile> {
    const current = read()
    const next = { ...current, ...data, id: current.id, createdAt: current.createdAt, updatedAt: nowIso() }
    write(next)
    return next
  },
  async reset(): Promise<void> {
    write(icpProfileSeed)
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}
