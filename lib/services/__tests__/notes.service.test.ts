import { beforeEach, describe, expect, it } from 'vitest'
import { noteFoldersRepo } from '@/lib/repositories/note-folders.repository'
import { notesRepo } from '@/lib/repositories/notes.repository'
import { tasksRepo } from '@/lib/repositories/tasks.repository'
import {
  createStrategicNote,
  createTaskFromNote,
  getActionableNotes,
  getHighImpactLowEffortNotes,
  getNotesForDashboard,
  getNotesForLead,
  getNotesStats,
  getStrategicMemory,
  getTagCloud,
  transformNoteToTaskPayload,
  updateStrategicNote,
} from '../notes.service'

const today = new Date('2026-05-05T12:00:00.000Z')

describe('notes.service', () => {
  beforeEach(async () => {
    window.localStorage.clear()
    await noteFoldersRepo.seedDemoData()
    await notesRepo.seedDemoData()
    await tasksRepo.seedDemoData()
  })

  it('getStrategicMemory returns a non-archived, non-deleted note', async () => {
    const memory = await getStrategicMemory({ currentDate: today })

    expect(memory).not.toBeNull()
    expect(memory?.note.isArchived).toBe(false)
    expect(memory?.note.isDeleted).not.toBe(true)
    expect(memory?.score).toBeGreaterThan(0)
  })

  it('getStrategicMemory prioritizes pinned favorite high-impact notes', async () => {
    await notesRepo.pinNote('note-018')
    await notesRepo.favoriteNote('note-018')

    const memory = await getStrategicMemory({ currentDate: today })

    expect(memory?.note.id).toBe('note-018')
    expect(memory?.memoryType).toBe('forgotten_idea')
    expect(memory?.reason).toContain('alto impacto')
  })

  it('getHighImpactLowEffortNotes returns quick wins', async () => {
    const notes = await getHighImpactLowEffortNotes()

    expect(notes.length).toBeGreaterThan(0)
    expect(notes.every((note) => note.impact === 'high' && note.effort === 'low')).toBe(true)
  })

  it('getNotesForLead filters by related lead', async () => {
    const notes = await getNotesForLead('lead-001')

    expect(notes.length).toBeGreaterThan(0)
    expect(notes.every((note) => note.relatedLeadId === 'lead-001')).toBe(true)
  })

  it('getTagCloud ranks most used tags', async () => {
    const tags = await getTagCloud()

    expect(tags.length).toBeGreaterThan(0)
    expect(tags[0]?.count).toBeGreaterThanOrEqual(tags[1]?.count ?? 0)
    expect(tags.some((tag) => tag.tag === 'brandkit')).toBe(true)
  })

  it('getNotesStats calculates totals and grouped summaries', async () => {
    const stats = await getNotesStats()

    expect(stats.total).toBeGreaterThanOrEqual(18)
    expect(stats.pinned).toBeGreaterThan(0)
    expect(stats.favorites).toBeGreaterThan(0)
    expect(stats.archived).toBeGreaterThan(0)
    expect(stats.byType.strategy).toBeGreaterThan(0)
    expect(stats.byFolder['folder-strategy']).toBeGreaterThan(0)
  })

  it('getNotesForDashboard excludes archived notes and returns strategic memory data', async () => {
    const dashboard = await getNotesForDashboard({ currentDate: today })

    expect(dashboard.strategicMemory).not.toBeNull()
    expect(dashboard.highImpact.every((note) => !note.isArchived)).toBe(true)
    expect(dashboard.recent.every((note) => !note.isArchived)).toBe(true)
  })

  it('createStrategicNote and updateStrategicNote persist editor fields', async () => {
    const created = await createStrategicNote({
      title: 'Nova memoria de pricing',
      content: '## Oferta\n\nTestar pacote de entrada para social medias.',
      type: 'pricing',
      status: 'draft',
      priority: 'medium',
      impact: 'high',
      effort: 'low',
      color: 'violet',
      folderId: 'folder-strategy',
      tags: ['Pricing', 'Oferta'],
      isPinned: true,
      isFavorite: false,
      source: 'manual',
    })

    const updated = await updateStrategicNote(created.id, {
      title: 'Memoria de pricing refinada',
      content: '## Oferta\n\n==Pacote inicial== para validar os 10 primeiros clientes.',
      status: 'active',
      priority: 'high',
      color: 'purple',
      tags: ['pricing', 'primeiros-clientes'],
      isFavorite: true,
    })

    expect(created).toMatchObject({
      folderId: 'folder-strategy',
      isPinned: true,
      tags: ['pricing', 'oferta'],
    })
    expect(updated).toMatchObject({
      title: 'Memoria de pricing refinada',
      status: 'active',
      priority: 'high',
      color: 'purple',
      tags: ['pricing', 'primeiros-clientes'],
      isPinned: true,
      isFavorite: true,
    })
    await expect(notesRepo.getNoteById(created.id)).resolves.toMatchObject({
      title: 'Memoria de pricing refinada',
      excerpt: expect.stringContaining('Pacote inicial'),
    })
  })

  it('getActionableNotes and transformNoteToTaskPayload prepare task creation', async () => {
    const actionable = await getActionableNotes()
    const payload = await transformNoteToTaskPayload(actionable[0]!.id)

    expect(actionable.length).toBeGreaterThan(0)
    expect(payload.title).toContain(actionable[0]!.title)
    expect(payload.relatedNoteId).toBe(actionable[0]!.id)
    expect(payload.source).toBe('note')
    expect(payload.tagIds).toEqual(actionable[0]!.tags)
  })

  it('createTaskFromNote creates a linked task and stores the task id on the note', async () => {
    const note = await createStrategicNote({
      title: 'Ideia de oferta operacional',
      content: 'Transformar insight de pricing em acao comercial.',
      type: 'idea',
      status: 'active',
      priority: 'high',
      impact: 'high',
      effort: 'low',
      color: 'purple',
      tags: ['pricing', 'oferta'],
      source: 'manual',
    })

    const result = await createTaskFromNote(note.id)

    expect(result.created).toBe(true)
    expect(result.task).toMatchObject({
      relatedNoteId: note.id,
      source: 'note',
      importance: 'high',
      tagIds: ['pricing', 'oferta'],
    })
    expect(result.note.relatedTaskId).toBe(result.task.id)
    await expect(notesRepo.getNoteById(note.id)).resolves.toMatchObject({
      relatedTaskId: result.task.id,
    })
    await expect(tasksRepo.getById(result.task.id)).resolves.toMatchObject({
      relatedNoteId: note.id,
    })
  })

  it('createTaskFromNote reuses an existing linked task instead of duplicating', async () => {
    const note = await createStrategicNote({
      title: 'Aprendizado de follow-up',
      content: 'Criar acao para responder leads mornos em ate 24 horas.',
      type: 'sales',
      status: 'active',
      priority: 'medium',
      impact: 'high',
      effort: 'low',
      color: 'green',
      tags: ['follow-up', 'vendas'],
      source: 'manual',
    })

    const first = await createTaskFromNote(note.id)
    const second = await createTaskFromNote(note.id)
    const linkedTasks = await tasksRepo.list({ relatedNoteId: note.id })

    expect(first.created).toBe(true)
    expect(second.created).toBe(false)
    expect(second.task.id).toBe(first.task.id)
    expect(linkedTasks).toHaveLength(1)
  })
})
