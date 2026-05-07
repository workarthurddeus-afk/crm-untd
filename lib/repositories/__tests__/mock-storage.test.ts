import { describe, it, expect, beforeEach } from 'vitest'
import { createMockRepository } from '../mock-storage'
import type { Entity } from '../base.repository'

interface Item extends Entity {
  name: string
  value: number
}

describe('createMockRepository', () => {
  let repo: ReturnType<typeof createMockRepository<Item>>

  beforeEach(() => {
    window.localStorage.clear()
    repo = createMockRepository<Item>('test-items', [])
  })

  it('returns empty list when storage empty and no seed', async () => {
    const items = await repo.list()
    expect(items).toEqual([])
  })

  it('does not seed storage on first read when seed provided', async () => {
    const seeded = createMockRepository<Item>('test-seeded', [
      { id: '1', name: 'A', value: 1, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
    ])
    const items = await seeded.list()
    expect(items).toEqual([])
  })

  it('loads demo data only when explicitly requested', async () => {
    const seeded = createMockRepository<Item>('test-explicit-seeded', [
      { id: '1', name: 'A', value: 1, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
    ])

    await seeded.seedDemoData()
    const items = await seeded.list()

    expect(items).toHaveLength(1)
    expect(items[0]?.name).toBe('A')
  })

  it('can opt into auto seeding for real defaults', async () => {
    const seeded = createMockRepository<Item>(
      'test-auto-seeded',
      [{ id: '1', name: 'A', value: 1, createdAt: '2026-01-01', updatedAt: '2026-01-01' }],
      { autoSeed: true, resetToSeed: true }
    )

    expect(await seeded.list()).toHaveLength(1)

    await seeded.create({ name: 'B', value: 2 })
    await seeded.reset()

    const items = await seeded.list()
    expect(items).toHaveLength(1)
    expect(items[0]?.name).toBe('A')
  })

  it('creates an item with generated id and timestamps', async () => {
    const created = await repo.create({ name: 'B', value: 2 })
    expect(created.id).toBeTruthy()
    expect(created.name).toBe('B')
    expect(created.createdAt).toBeTruthy()
    const all = await repo.list()
    expect(all).toHaveLength(1)
  })

  it('persists across instances via localStorage', async () => {
    await repo.create({ name: 'C', value: 3 })
    const repo2 = createMockRepository<Item>('test-items', [])
    const items = await repo2.list()
    expect(items).toHaveLength(1)
    expect(items[0]?.name).toBe('C')
  })

  it('updates an item and bumps updatedAt', async () => {
    const a = await repo.create({ name: 'A', value: 1 })
    const before = a.updatedAt
    await new Promise((r) => setTimeout(r, 5))
    const updated = await repo.update(a.id, { value: 99 })
    expect(updated.value).toBe(99)
    expect(updated.updatedAt).not.toBe(before)
  })

  it('deletes an item', async () => {
    const a = await repo.create({ name: 'A', value: 1 })
    await repo.delete(a.id)
    expect(await repo.getById(a.id)).toBeNull()
  })

  it('notifies subscribers on mutations', async () => {
    let calls = 0
    const unsub = repo.subscribe(() => calls++)
    await repo.create({ name: 'A', value: 1 })
    expect(calls).toBe(1)
    unsub()
    await repo.create({ name: 'B', value: 2 })
    expect(calls).toBe(1)
  })
})
