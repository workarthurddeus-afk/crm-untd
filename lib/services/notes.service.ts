import { noteFoldersRepo } from '@/lib/repositories/note-folders.repository'
import { notesRepo } from '@/lib/repositories/notes.repository'
import type { Note, NoteFolder, NoteInput, TaskCategory, TaskImportance } from '@/lib/types'
import {
  filterNotes,
  getMostUsedTags,
  getNotesStats as buildNotesStats,
  normalizeNote,
  sortNotes,
  type NoteFilters,
  type NoteSort,
} from '@/lib/utils/notes'
import {
  getStrategicMemory as pickStrategicMemory,
  type StrategicMemoryPick,
} from '@/lib/utils/strategic-memory'

type CreateStrategicNoteInput = Partial<NoteInput> &
  Pick<NoteInput, 'title' | 'content' | 'type' | 'status' | 'priority' | 'impact' | 'effort' | 'color'>

export interface NotesLibraryOptions {
  filters?: NoteFilters
  sort?: NoteSort
}

export interface StrategicMemoryOptions {
  currentDate?: Date
}

export interface NotesDashboardData {
  strategicMemory: StrategicMemoryPick | null
  highImpact: Note[]
  quickWins: Note[]
  pinned: Note[]
  favorites: Note[]
  recent: Note[]
}

export interface TaskPayloadFromNote {
  title: string
  description: string
  importance: TaskImportance
  status: 'pending'
  category: TaskCategory
  relatedLeadId?: string
  relatedNoteId: string
  tagIds: string[]
}

function toTaskImportance(note: Note): TaskImportance {
  if (note.priority === 'high' || note.impact === 'high') return 'high'
  if (note.priority === 'low' && note.impact === 'low') return 'low'
  return 'medium'
}

function toTaskCategory(note: Note): TaskCategory {
  if (note.type === 'sales' || note.tags.includes('vendas')) return 'prospecting'
  if (note.type === 'meeting') return 'meeting'
  if (['product', 'feature', 'brandkit', 'onboarding'].includes(note.type)) return 'product'
  if (note.type === 'ui') return 'design'
  if (note.type === 'campaign') return 'meta-ads'
  if (note.type === 'strategy' || note.type === 'decision') return 'strategy'
  return 'other'
}

function activeNotes(notes: Note[], filters?: NoteFilters): Note[] {
  return filterNotes(notes.map(normalizeNote), filters)
}

export async function getNotesLibrary(options: NotesLibraryOptions = {}): Promise<Note[]> {
  return notesRepo.listNotes(options.filters, options.sort)
}

export async function getNoteDetails(id: string): Promise<Note | null> {
  return notesRepo.getNoteById(id)
}

export async function createStrategicNote(input: CreateStrategicNoteInput): Promise<Note> {
  return notesRepo.createNote(input)
}

export async function updateStrategicNote(id: string, input: Partial<Note>): Promise<Note> {
  return notesRepo.updateNote(id, input)
}

export async function togglePinned(id: string): Promise<Note> {
  const note = await notesRepo.getNoteById(id)
  if (!note) throw new Error(`Note ${id} not found`)
  return note.isPinned ? notesRepo.unpinNote(id) : notesRepo.pinNote(id)
}

export async function toggleFavorite(id: string): Promise<Note> {
  const note = await notesRepo.getNoteById(id)
  if (!note) throw new Error(`Note ${id} not found`)
  return note.isFavorite ? notesRepo.unfavoriteNote(id) : notesRepo.favoriteNote(id)
}

export async function archiveNote(id: string): Promise<Note> {
  return notesRepo.archiveNote(id)
}

export async function restoreNote(id: string): Promise<Note> {
  return notesRepo.unarchiveNote(id)
}

export async function getNotesForLead(leadId: string): Promise<Note[]> {
  return notesRepo.getNotesByLeadId(leadId)
}

export async function getStrategicMemory(
  options: StrategicMemoryOptions = {}
): Promise<StrategicMemoryPick | null> {
  const notes = await notesRepo.listNotes()
  return pickStrategicMemory(notes, options.currentDate)
}

export async function getHighImpactLowEffortNotes(limit = 8): Promise<Note[]> {
  const notes = await notesRepo.listNotes({ impact: 'high', effort: 'low' }, 'strategic')
  return notes.slice(0, limit)
}

export async function getIdeasBacklog(): Promise<Note[]> {
  return notesRepo.filterNotes({ type: 'idea' })
}

export async function getActionableNotes(limit = 10): Promise<Note[]> {
  const notes = await notesRepo.listNotes()
  return sortNotes(
    notes.filter((note) => {
      if (note.isArchived || note.isDeleted) return false
      if (note.status === 'executed' || note.status === 'approved') return false
      return note.impact === 'high' || note.priority === 'high' || note.effort === 'low'
    }),
    'strategic'
  ).slice(0, limit)
}

export async function getHighImpactNotes(limit = 6): Promise<Note[]> {
  return (await notesRepo.getHighImpactNotes()).slice(0, limit)
}

export async function getNotesForDashboard(
  options: StrategicMemoryOptions = {}
): Promise<NotesDashboardData> {
  const [strategicMemory, highImpact, quickWins, pinned, favorites, recent] = await Promise.all([
    getStrategicMemory(options),
    getHighImpactNotes(6),
    getHighImpactLowEffortNotes(6),
    notesRepo.getPinnedNotes(),
    notesRepo.getFavoriteNotes(),
    notesRepo.getRecentNotes(6),
  ])

  return { strategicMemory, highImpact, quickWins, pinned, favorites, recent }
}

export async function getNotesStats() {
  return buildNotesStats(await notesRepo.listAllNotes(false))
}

export async function getTagCloud(limit = 20): Promise<Array<{ tag: string; count: number }>> {
  return getMostUsedTags(await notesRepo.listNotes()).slice(0, limit)
}

export async function getFolderStats(): Promise<
  Array<{ folder: NoteFolder; total: number; active: number; archived: number }>
> {
  const [folders, notes] = await Promise.all([
    noteFoldersRepo.listAllFolders(),
    notesRepo.listAllNotes(false),
  ])

  return folders.map((folder) => {
    const folderNotes = notes.filter((note) => note.folderId === folder.id)
    return {
      folder,
      total: folderNotes.length,
      active: activeNotes(folderNotes).length,
      archived: folderNotes.filter((note) => note.isArchived).length,
    }
  })
}

export async function transformNoteToTaskPayload(noteId: string): Promise<TaskPayloadFromNote> {
  const note = await notesRepo.getNoteById(noteId)
  if (!note) throw new Error(`Note ${noteId} not found`)

  return {
    title: `Transformar nota em acao: ${note.title}`,
    description: [note.excerpt ?? note.content, `Fonte: ${note.source ?? 'manual'}`].join('\n\n'),
    importance: toTaskImportance(note),
    status: 'pending',
    category: toTaskCategory(note),
    relatedLeadId: note.relatedLeadId ?? undefined,
    relatedNoteId: note.id,
    tagIds: note.tags,
  }
}
