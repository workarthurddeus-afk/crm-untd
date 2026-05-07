import { beforeEach, describe, expect, it } from 'vitest'
import { notesRepo } from '../notes.repository'

describe('notesRepo', () => {
  beforeEach(async () => {
    window.localStorage.clear()
    await notesRepo.seedDemoData()
  })

  it('starts empty until demo notes are loaded explicitly', async () => {
    await notesRepo.clear()
    await expect(notesRepo.listNotes()).resolves.toEqual([])
  })

  it('lists non-archived and non-deleted notes by default', async () => {
    const notes = await notesRepo.listNotes()

    expect(notes.length).toBeGreaterThanOrEqual(18)
    expect(notes.every((note) => !note.isArchived && !note.isDeleted)).toBe(true)
  })

  it('searches notes by title and content', async () => {
    const byTitle = await notesRepo.searchNotes('BrandKit')
    const byContent = await notesRepo.searchNotes('consistencia visual')

    expect(byTitle.some((note) => note.title.includes('BrandKit'))).toBe(true)
    expect(byContent.length).toBeGreaterThan(0)
  })

  it('filters notes by tag, type and folder', async () => {
    const byTag = await notesRepo.getNotesByTag('dm fria')
    const byType = await notesRepo.filterNotes({ type: 'sales' })
    const byFolder = await notesRepo.getNotesByFolder('folder-sales')

    expect(byTag.every((note) => note.tags.includes('dm-fria'))).toBe(true)
    expect(byType.every((note) => note.type === 'sales')).toBe(true)
    expect(byFolder.every((note) => note.folderId === 'folder-sales')).toBe(true)
  })

  it('toggles pinned and favorite flags', async () => {
    const pinned = await notesRepo.pinNote('note-002')
    const favorite = await notesRepo.favoriteNote('note-003')

    expect(pinned.isPinned).toBe(true)
    expect(pinned.pinned).toBe(true)
    expect(favorite.isFavorite).toBe(true)
    expect(favorite.favorited).toBe(true)
  })

  it('archives and soft deletes notes out of default list', async () => {
    await notesRepo.archiveNote('note-004')
    await notesRepo.deleteNote('note-005')

    const notes = await notesRepo.listNotes()
    expect(notes.map((note) => note.id)).not.toContain('note-004')
    expect(notes.map((note) => note.id)).not.toContain('note-005')

    const archived = await notesRepo.listNotes({ isArchived: true })
    expect(archived.map((note) => note.id)).toContain('note-004')
  })

  it('creates and updates notes preserving strategic metadata', async () => {
    const created = await notesRepo.createNote({
      title: 'Nova ideia estrategica',
      content: '# Ideia\n\nTransformar notas em tarefas automaticamente.',
      type: 'idea',
      status: 'draft',
      priority: 'high',
      impact: 'high',
      effort: 'low',
      color: 'purple',
      tags: ['IA', ' Produto '],
      folderId: 'folder-product',
      isPinned: false,
      isFavorite: true,
      isArchived: false,
      source: 'manual',
    })

    expect(created.id).toBeTruthy()
    expect(created.excerpt).toBe('Ideia Transformar notas em tarefas automaticamente.')
    expect(created.tags).toEqual(['ia', 'produto'])

    const updated = await notesRepo.updateNote(created.id, { title: 'Ideia estrategica revisada' })
    expect(updated.title).toBe('Ideia estrategica revisada')
    expect(updated.id).toBe(created.id)
  })

  it('returns high impact and recent notes sorted by strategy priority', async () => {
    const highImpact = await notesRepo.getHighImpactNotes()
    const recent = await notesRepo.getRecentNotes(3)

    expect(highImpact.every((note) => note.impact === 'high')).toBe(true)
    expect(recent).toHaveLength(3)
    expect(recent[0]?.updatedAt.localeCompare(recent[1]?.updatedAt ?? '')).toBeGreaterThanOrEqual(0)
  })
})
