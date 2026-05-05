import type { Note, NoteColor, NoteEffort, NoteImpact, NotePriority, NoteType } from '@/lib/types'

export interface NoteFilters {
  query?: string
  tags?: string[]
  type?: NoteType
  status?: Note['status']
  priority?: NotePriority
  impact?: NoteImpact
  effort?: NoteEffort
  color?: NoteColor
  folderId?: string | null
  isPinned?: boolean
  isFavorite?: boolean
  isArchived?: boolean
  relatedLeadId?: string | null
  relatedTaskId?: string | null
  createdFrom?: string
  createdTo?: string
  updatedFrom?: string
  updatedTo?: string
  includeDeleted?: boolean
}

export type NoteSort =
  | 'strategic'
  | 'updated-desc'
  | 'created-desc'
  | 'impact-desc'
  | 'priority-desc'
  | 'title-asc'

const rankImpact: Record<NoteImpact, number> = { high: 3, medium: 2, low: 1 }
const rankPriority: Record<NotePriority, number> = { high: 3, medium: 2, low: 1 }

export function normalizeTag(tag: string): string {
  return createTagSlug(tag)
}

export function createTagSlug(tag: string): string {
  return tag
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateExcerpt(content: string, maxLength = 180): string {
  const plain = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[#>*_\-[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (plain.length <= maxLength) return plain
  return `${plain.slice(0, Math.max(0, maxLength - 3)).trim()}...`
}

export function normalizeNote(note: Note): Note {
  const tags = [...new Set((note.tags.length > 0 ? note.tags : note.tagIds).map(normalizeTag).filter(Boolean))]
  const isPinned = note.isPinned || note.pinned
  const isFavorite = note.isFavorite || note.favorited
  const isArchived = note.isArchived || note.status === 'archived'
  return {
    ...note,
    tags,
    tagIds: tags,
    isPinned,
    pinned: isPinned,
    isFavorite,
    favorited: isFavorite,
    isArchived,
    status: isArchived ? 'archived' : note.status,
    impact: note.impact ?? note.expectedImpact ?? 'medium',
    effort: note.effort ?? note.estimatedEffort ?? 'medium',
    expectedImpact: note.impact ?? note.expectedImpact,
    estimatedEffort: note.effort ?? note.estimatedEffort,
    excerpt: note.excerpt ?? generateExcerpt(note.content),
  }
}

function inDateRange(value: string, from?: string, to?: string): boolean {
  const time = new Date(value).getTime()
  if (from && time < new Date(from).getTime()) return false
  if (to && time > new Date(to).getTime()) return false
  return true
}

export function filterNotes(notes: Note[], filters: NoteFilters = {}): Note[] {
  const normalizedTags = filters.tags?.map(normalizeTag)
  const query = filters.query?.trim().toLowerCase()

  return notes.map(normalizeNote).filter((note) => {
    if (!filters.includeDeleted && note.isDeleted) return false
    if (filters.isArchived === undefined && note.isArchived) return false
    if (filters.isArchived !== undefined && note.isArchived !== filters.isArchived) return false
    if (query) {
      const haystack = [note.title, note.content, note.excerpt ?? '', ...note.tags].join(' ').toLowerCase()
      if (!haystack.includes(query)) return false
    }
    if (normalizedTags?.length && !normalizedTags.every((tag) => note.tags.includes(tag))) return false
    if (filters.type && note.type !== filters.type) return false
    if (filters.status && note.status !== filters.status) return false
    if (filters.priority && note.priority !== filters.priority) return false
    if (filters.impact && note.impact !== filters.impact) return false
    if (filters.effort && note.effort !== filters.effort) return false
    if (filters.color && note.color !== filters.color) return false
    if (filters.folderId !== undefined && note.folderId !== filters.folderId) return false
    if (filters.isPinned !== undefined && note.isPinned !== filters.isPinned) return false
    if (filters.isFavorite !== undefined && note.isFavorite !== filters.isFavorite) return false
    if (filters.relatedLeadId !== undefined && note.relatedLeadId !== filters.relatedLeadId) return false
    if (filters.relatedTaskId !== undefined && note.relatedTaskId !== filters.relatedTaskId) return false
    if (!inDateRange(note.createdAt, filters.createdFrom, filters.createdTo)) return false
    if (!inDateRange(note.updatedAt, filters.updatedFrom, filters.updatedTo)) return false
    return true
  })
}

export function sortNotes(notes: Note[], sort: NoteSort = 'strategic'): Note[] {
  return [...notes].sort((a, b) => {
    if (sort === 'title-asc') return a.title.localeCompare(b.title)
    if (sort === 'created-desc') return b.createdAt.localeCompare(a.createdAt)
    if (sort === 'updated-desc') return b.updatedAt.localeCompare(a.updatedAt)
    if (sort === 'impact-desc') return rankImpact[b.impact] - rankImpact[a.impact]
    if (sort === 'priority-desc') return rankPriority[b.priority] - rankPriority[a.priority]

    const pinnedDelta = Number(b.isPinned) - Number(a.isPinned)
    if (pinnedDelta !== 0) return pinnedDelta
    const favoriteDelta = Number(b.isFavorite) - Number(a.isFavorite)
    if (favoriteDelta !== 0) return favoriteDelta
    const impactDelta = rankImpact[b.impact] - rankImpact[a.impact]
    if (impactDelta !== 0) return impactDelta
    const priorityDelta = rankPriority[b.priority] - rankPriority[a.priority]
    if (priorityDelta !== 0) return priorityDelta
    return b.updatedAt.localeCompare(a.updatedAt)
  })
}

export function calculateNoteStrategicScore(note: Note, currentDate = new Date()): number {
  if (note.isArchived || note.isDeleted) return Number.NEGATIVE_INFINITY
  let score = 0
  if (note.isPinned) score += 30
  if (note.isFavorite) score += 20
  if (note.impact === 'high') score += 20
  if (note.priority === 'high') score += 10
  if (['strategy', 'insight', 'sales', 'product'].includes(note.type)) score += 10
  const lastViewedAt = note.lastViewedAt ? new Date(note.lastViewedAt) : new Date(note.updatedAt)
  const daysSinceViewed = Math.floor((currentDate.getTime() - lastViewedAt.getTime()) / 86_400_000)
  if (daysSinceViewed >= 30) score += 10
  return score
}

export function getNoteColorToken(color: NoteColor): string {
  return `note-${color}`
}

export function groupNotesByFolder(notes: Note[]): Record<string, Note[]> {
  return notes.reduce<Record<string, Note[]>>((acc, note) => {
    const key = note.folderId ?? 'none'
    acc[key] = [...(acc[key] ?? []), note]
    return acc
  }, {})
}

export function groupNotesByType(notes: Note[]): Record<string, Note[]> {
  return notes.reduce<Record<string, Note[]>>((acc, note) => {
    acc[note.type] = [...(acc[note.type] ?? []), note]
    return acc
  }, {})
}

export function getMostUsedTags(notes: Note[]): Array<{ tag: string; count: number }> {
  const counts = new Map<string, number>()
  for (const note of notes.map(normalizeNote)) {
    for (const tag of note.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
}

export function getNotesStats(notes: Note[]) {
  const normalized = notes.map(normalizeNote)
  return {
    total: normalized.length,
    active: normalized.filter((note) => !note.isArchived && !note.isDeleted).length,
    pinned: normalized.filter((note) => note.isPinned).length,
    favorites: normalized.filter((note) => note.isFavorite).length,
    archived: normalized.filter((note) => note.isArchived).length,
    deleted: normalized.filter((note) => note.isDeleted).length,
    byType: Object.fromEntries(
      Object.entries(groupNotesByType(normalized)).map(([type, group]) => [type, group.length])
    ) as Record<string, number>,
    byFolder: Object.fromEntries(
      Object.entries(groupNotesByFolder(normalized)).map(([folderId, group]) => [folderId, group.length])
    ) as Record<string, number>,
  }
}
