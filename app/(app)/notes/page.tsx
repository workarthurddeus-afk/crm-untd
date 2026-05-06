'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useNoteFolders } from '@/lib/hooks/use-note-folders'
import { useNote, useNotes, useNotesStats, useStrategicMemory } from '@/lib/hooks/use-notes'
import {
  filterNotes as applyNoteFilters,
  getMostUsedTags,
  sortNotes,
  type NoteFilters,
  type NoteSort,
} from '@/lib/utils/notes'
import { NotesPageHeader } from '@/components/notes/notes-page-header'
import { NotesSidebar, type NotesActiveFilter } from '@/components/notes/notes-sidebar'
import { NotesList } from '@/components/notes/notes-list'
import { NoteDetail } from '@/components/notes/note-detail'
import { StrategicMemoryPanel } from '@/components/notes/strategic-memory-panel'
import type { Note } from '@/lib/types'

const ARCHIVED_FETCH_FILTER: NoteFilters = { isArchived: true }
const FORGOTTEN_DAYS = 30

function isForgotten(note: Note, now = new Date()): boolean {
  if (note.isArchived || note.isDeleted) return false
  const ref = note.lastViewedAt ?? note.updatedAt
  const days = Math.floor((now.getTime() - new Date(ref).getTime()) / 86_400_000)
  if (days < FORGOTTEN_DAYS) return false
  return note.type === 'idea' || note.impact === 'high'
}

function deriveFilterLabel(filter: NotesActiveFilter): string {
  switch (filter.kind) {
    case 'all':
      return 'Todas as notas'
    case 'pinned':
      return 'Fixadas'
    case 'favorites':
      return 'Favoritas'
    case 'high-impact':
      return 'Alto impacto'
    case 'forgotten':
      return 'Ideias esquecidas'
    case 'archived':
      return 'Arquivadas'
    case 'folder':
      return 'Pasta'
    case 'tag':
      return `#${filter.tag}`
  }
}

export default function NotesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<NotesActiveFilter>({ kind: 'all' })
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [sort, setSort] = useState<NoteSort>('strategic')

  // Two stable hook calls — one for active library, one for archived.
  const { notes: activeNotes, isLoading: activeLoading, actions } = useNotes()
  const { notes: archivedNotes, isLoading: archivedLoading } = useNotes(ARCHIVED_FETCH_FILTER)
  const { folders, isLoading: foldersLoading } = useNoteFolders()
  const { stats } = useNotesStats()
  const { memory, isLoading: memoryLoading } = useStrategicMemory()

  // Sidebar counts (mix repository stats with derived counts).
  const counts = useMemo(() => {
    const highImpact = activeNotes.filter((n) => n.impact === 'high').length
    const now = new Date()
    const forgotten = activeNotes.filter((n) => isForgotten(n, now)).length
    return {
      all: activeNotes.length,
      pinned: stats?.pinned ?? activeNotes.filter((n) => n.isPinned).length,
      favorites: stats?.favorites ?? activeNotes.filter((n) => n.isFavorite).length,
      highImpact,
      forgotten,
      archived: stats?.archived ?? archivedNotes.length,
    }
  }, [activeNotes, archivedNotes, stats])

  const tagCloud = useMemo(() => getMostUsedTags(activeNotes), [activeNotes])

  // Compose the visible list based on the active filter, search and sort.
  const baseNotes = activeFilter.kind === 'archived' ? archivedNotes : activeNotes

  const filteredNotes = useMemo(() => {
    const now = new Date()
    let pool = baseNotes
    if (activeFilter.kind === 'pinned') pool = pool.filter((n) => n.isPinned)
    if (activeFilter.kind === 'favorites') pool = pool.filter((n) => n.isFavorite)
    if (activeFilter.kind === 'high-impact') pool = pool.filter((n) => n.impact === 'high')
    if (activeFilter.kind === 'forgotten') pool = pool.filter((n) => isForgotten(n, now))
    if (activeFilter.kind === 'folder')
      pool = pool.filter((n) => n.folderId === activeFilter.folderId)
    if (activeFilter.kind === 'tag') pool = pool.filter((n) => n.tags.includes(activeFilter.tag))

    const filters: NoteFilters = { query: searchQuery.trim() || undefined }
    if (activeFilter.kind === 'archived') filters.isArchived = true
    return sortNotes(applyNoteFilters(pool, filters), sort)
  }, [baseNotes, activeFilter, searchQuery, sort])

  // Derived selection: keep the user's explicit pick when valid, otherwise
  // fall back to the first note of the current view. Computed during render
  // (no effect) so the list and detail stay in sync without cascading state.
  const effectiveSelectedNoteId = useMemo(() => {
    if (selectedNoteId && filteredNotes.some((n) => n.id === selectedNoteId)) {
      return selectedNoteId
    }
    return filteredNotes[0]?.id ?? null
  }, [filteredNotes, selectedNoteId])

  const { note: selectedNote, isLoading: selectedLoading } = useNote(effectiveSelectedNoteId)

  const selectedFolder = useMemo(() => {
    if (!selectedNote?.folderId) return null
    return folders.find((f) => f.id === selectedNote.folderId) ?? null
  }, [folders, selectedNote])

  const filterChip = useMemo(() => {
    if (activeFilter.kind === 'tag')
      return { label: `#${activeFilter.tag}`, onClear: () => setActiveFilter({ kind: 'all' }) }
    if (activeFilter.kind === 'folder') {
      const folder = folders.find((f) => f.id === activeFilter.folderId)
      return {
        label: folder ? `Pasta · ${folder.name}` : 'Pasta',
        onClear: () => setActiveFilter({ kind: 'all' }),
      }
    }
    return undefined
  }, [activeFilter, folders])

  const filterLabel = useMemo(() => {
    if (activeFilter.kind === 'folder') {
      const folder = folders.find((f) => f.id === activeFilter.folderId)
      return folder ? folder.name : 'Pasta'
    }
    return deriveFilterLabel(activeFilter)
  }, [activeFilter, folders])

  // Action handlers — wrapped with toast feedback.
  const handleTogglePin = async (noteId: string) => {
    try {
      const next = await actions.togglePinned(noteId)
      toast.success(next.isPinned ? 'Nota fixada' : 'Nota desafixada')
    } catch (err) {
      toast.error('Falha ao atualizar', {
        description: err instanceof Error ? err.message : String(err),
      })
    }
  }

  const handleToggleFavorite = async (noteId: string) => {
    try {
      const next = await actions.toggleFavorite(noteId)
      toast.success(next.isFavorite ? 'Marcada como favorita' : 'Removida dos favoritos')
    } catch (err) {
      toast.error('Falha ao atualizar', {
        description: err instanceof Error ? err.message : String(err),
      })
    }
  }

  const handleArchive = async (noteId: string) => {
    try {
      await actions.archive(noteId)
      toast.success('Nota arquivada')
    } catch (err) {
      toast.error('Falha ao arquivar', {
        description: err instanceof Error ? err.message : String(err),
      })
    }
  }

  const handleRestore = async (noteId: string) => {
    try {
      await actions.restore(noteId)
      toast.success('Nota restaurada')
    } catch (err) {
      toast.error('Falha ao restaurar', {
        description: err instanceof Error ? err.message : String(err),
      })
    }
  }

  const handleCopyContent = async (note: Note) => {
    try {
      await navigator.clipboard.writeText(`# ${note.title}\n\n${note.content}`)
      toast.success('Conteúdo copiado')
    } catch {
      toast.error('Falha ao copiar')
    }
  }

  const handleTransformToTask = async (note: Note) => {
    try {
      const result = await actions.createTaskFromNote(note.id)
      toast.success(result.created ? 'Tarefa criada' : 'Tarefa ja vinculada', {
        description: result.task.title,
      })
    } catch (err) {
      toast.error('Falha ao transformar nota', {
        description: err instanceof Error ? err.message : String(err),
      })
    }
  }

  const handleNewNote = () => {
    toast.info('Editor de nota em breve.', {
      description: 'A criação completa de notas com BrandKit chega na próxima fase.',
    })
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <NotesPageHeader
        query={searchQuery}
        onQueryChange={setSearchQuery}
        totals={{
          total: counts.all + counts.archived,
          pinned: counts.pinned,
          favorites: counts.favorites,
          highImpact: counts.highImpact,
          archived: counts.archived,
        }}
        onNewNote={handleNewNote}
        onNewFolder={() => undefined}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <NotesSidebar
          active={activeFilter}
          onChange={(filter) => setActiveFilter(filter)}
          folders={folders}
          foldersLoading={foldersLoading}
          tagCloud={tagCloud}
          counts={counts}
          topSlot={
            <StrategicMemoryPanel
              memory={memory}
              isLoading={memoryLoading}
              onOpen={(id) => setSelectedNoteId(id)}
              onTransformToTask={async (id) => {
                const target = activeNotes.find((n) => n.id === id) ?? memory?.note
                if (target) await handleTransformToTask(target)
              }}
              onTogglePin={(id) => handleTogglePin(id)}
            />
          }
        />

        <NotesList
          notes={filteredNotes}
          total={baseNotes.length}
          selectedNoteId={effectiveSelectedNoteId}
          onSelect={setSelectedNoteId}
          isLoading={activeFilter.kind === 'archived' ? archivedLoading : activeLoading}
          sort={sort}
          onSortChange={setSort}
          filterLabel={filterLabel}
          filterChip={filterChip}
          onNewNote={handleNewNote}
        />

        <div className="hidden min-w-0 flex-1 flex-col lg:flex">
          <NoteDetail
            note={selectedNote}
            folder={selectedFolder ?? null}
            isLoading={selectedLoading}
            onTogglePin={async () => {
              if (selectedNote) await handleTogglePin(selectedNote.id)
            }}
            onToggleFavorite={async () => {
              if (selectedNote) await handleToggleFavorite(selectedNote.id)
            }}
            onArchive={async () => {
              if (selectedNote) await handleArchive(selectedNote.id)
            }}
            onRestore={async () => {
              if (selectedNote) await handleRestore(selectedNote.id)
            }}
            onTransformToTask={async () => {
              if (selectedNote) await handleTransformToTask(selectedNote)
            }}
            onEdit={() => toast.info('Edição inline em breve.')}
            onCopyContent={() => selectedNote && handleCopyContent(selectedNote)}
            onTagClick={(tag) => setActiveFilter({ kind: 'tag', tag })}
            onClearSelection={() => setSelectedNoteId(null)}
          />
        </div>
      </div>
    </div>
  )
}
