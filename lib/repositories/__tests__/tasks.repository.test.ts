import { beforeEach, describe, expect, it } from 'vitest'
import { tasksSeed } from '@/lib/mocks/seeds/tasks.seed'
import { tasksRepo } from '../tasks.repository'

describe('tasksRepo', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('seeds 12 realistic productivity tasks for phase 2', async () => {
    const tasks = await tasksRepo.list()

    expect(tasks).toHaveLength(12)
    expect(tasks.map((task) => task.id)).toEqual(tasksSeed.map((task) => task.id))
    expect(tasks.some((task) => task.relatedLeadId === 'lead-001')).toBe(true)
    expect(tasks.some((task) => task.category === 'strategy')).toBe(true)
    expect(tasks.some((task) => task.status === 'done')).toBe(true)
  })

  it('filters tasks by partial fields', async () => {
    const pending = await tasksRepo.list({ status: 'pending' })

    expect(pending.length).toBeGreaterThan(0)
    expect(pending.every((task) => task.status === 'pending')).toBe(true)
  })

  it('creates a task with id and timestamps', async () => {
    const created = await tasksRepo.create({
      title: 'Revisar plano de conteudo',
      description: 'Organizar ideias para a semana.',
      dueDate: '2026-05-01T12:00:00.000Z',
      importance: 'medium',
      status: 'pending',
      category: 'content',
      tagIds: ['phase-2'],
    })

    expect(created.id).toBeTruthy()
    expect(created.createdAt).toBeTruthy()
    expect(await tasksRepo.getById(created.id)).toMatchObject({ title: 'Revisar plano de conteudo' })
  })

  it('notifies subscribers on mutations', async () => {
    let calls = 0
    const unsubscribe = tasksRepo.subscribe(() => calls++)

    await tasksRepo.update('task-001', { status: 'done' })
    expect(calls).toBe(1)

    unsubscribe()
    await tasksRepo.update('task-002', { status: 'in-progress' })
    expect(calls).toBe(1)
  })
})
