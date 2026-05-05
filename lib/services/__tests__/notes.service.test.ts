import { beforeEach, describe, expect, it } from 'vitest'
import { noteFoldersRepo } from '@/lib/repositories/note-folders.repository'
import { notesRepo } from '@/lib/repositories/notes.repository'
import {
  getActionableNotes,
  getHighImpactLowEffortNotes,
  getNotesForDashboard,
  getNotesForLead,
  getNotesStats,
  getStrategicMemory,
  getTagCloud,
  transformNoteToTaskPayload,
} from '../notes.service'

const today = new Date('2026-05-05T12:00:00.000Z')

describe('notes.service', () => {
  beforeEach(async () => {
    window.localStorage.clear()
    await noteFoldersRepo.reset()
    await notesRepo.reset()
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

  it('getActionableNotes and transformNoteToTaskPayload prepare task creation', async () => {
    const actionable = await getActionableNotes()
    const payload = await transformNoteToTaskPayload(actionable[0]!.id)

    expect(actionable.length).toBeGreaterThan(0)
    expect(payload.title).toContain(actionable[0]!.title)
    expect(payload.relatedNoteId).toBe(actionable[0]!.id)
  })
})
