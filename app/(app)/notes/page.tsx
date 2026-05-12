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
import { NoteEditorSheet } from '@/components/notes/note-editor-sheet'
import { NoteFolderSheet } from '@/components/notes/note-folder-sheet'
import { StrategicMemoryPanel } from '@/components/notes/strategic-memory-panel'
import { DestructiveConfirmDialog } from '@/components/shared/destructive-confirm-dialog'
import type { NoteFolderWithCount } from '@/lib/services/note-folders.service'
import type { Note, NoteFolderInput, NoteInput } from '@/lib/types'

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
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [folderSheetOpen, setFolderSheetOpen] = useState(false)
  const [folderToDelete, setFolderToDelete] = useState<NoteFolderWithCount | null>(null)

  // Two stable hook calls — one for active library, one for archived.
  const { notes: activeNotes, isLoading: activeLoading, actions } = useNotes()
  const { notes: archivedNotes, isLoading: archivedLoading } = useNotes(ARCHIVED_FETCH_FILTER)
  const { folders, isLoading: foldersLoading, actions: folderActions } = useNoteFolders()
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

  const editorNote = useMemo(() => {
    if (!editingNoteId) return null
    if (selectedNote?.id === editingNoteId) return selectedNote
    return [...activeNotes, ...archivedNotes].find((note) => note.id === editingNoteId) ?? null
  }, [activeNotes, archivedNotes, editingNoteId, selectedNote])

  const nextFolderOrder = useMemo(
    () => folders.reduce((max, folder) => Math.max(max, folder.order), -1) + 1,
    [folders]
  )

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

  const handleDeleteNote = async (noteId: string) => {
    try {
      await actions.deletePermanently(noteId)
      setSelectedNoteId((current) => (current === noteId ? null : current))
      toast.success('Nota excluida permanentemente')
    } catch (err) {
      toast.error('Falha ao excluir nota', {
        description: err instanceof Error ? err.message : String(err),
      })
      throw err
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
    setEditingNoteId(null)
    setEditorOpen(true)
  }

  const handleNewFolder = () => {
    setFolderSheetOpen(true)
  }

  const handleEditNote = (note: Note) => {
    setEditingNoteId(note.id)
    setEditorOpen(true)
  }

  const handleCreateNote = async (input: NoteInput) => {
    const created = await actions.create(input)
    setSelectedNoteId(created.id)
    setActiveFilter(created.isArchived ? { kind: 'archived' } : { kind: 'all' })
    return created
  }

  const handleUpdateNote = async (id: string, input: Partial<NoteInput>) => {
    const updated = await actions.update(id, input)
    setSelectedNoteId(updated.id)
    if (updated.isArchived) setActiveFilter({ kind: 'archived' })
    return updated
  }

  const handleCreateFolder = async (input: NoteFolderInput) => {
    const created = await folderActions.create(input)
    setActiveFilter({ kind: 'folder', folderId: created.id })
    return created
  }

  const handleDeleteFolder = async () => {
    if (!folderToDelete) return
    try {
      await folderActions.delete(folderToDelete.id)
      setActiveFilter((current) =>
        current.kind === 'folder' && current.folderId === folderToDelete.id
          ? { kind: 'all' }
          : current
      )
      toast.success('Pasta excluida', {
        description: 'Notas dessa pasta foram movidas para Sem pasta.',
      })
      setFolderToDelete(null)
    } catch (err) {
      toast.error('Falha ao excluir pasta', {
        description: err instanceof Error ? err.message : String(err),
      })
      throw err
    }
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
        onNewFolder={handleNewFolder}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <NotesSidebar
          active={activeFilter}
          onChange={(filter) => setActiveFilter(filter)}
          folders={folders}
          foldersLoading={foldersLoading}
          tagCloud={tagCloud}
          counts={counts}
          onDeleteFolder={setFolderToDelete}
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
            onDelete={async () => {
              if (selectedNote) await handleDeleteNote(selectedNote.id)
            }}
            onTransformToTask={async () => {
              if (selectedNote) await handleTransformToTask(selectedNote)
            }}
            onEdit={() => selectedNote && handleEditNote(selectedNote)}
            onCopyContent={() => selectedNote && handleCopyContent(selectedNote)}
            onTagClick={(tag) => setActiveFilter({ kind: 'tag', tag })}
            onClearSelection={() => setSelectedNoteId(null)}
          />
        </div>
      </div>

      <NoteEditorSheet
        open={editorOpen}
        note={editorNote}
        folders={folders}
        onOpenChange={(open) => {
          setEditorOpen(open)
          if (!open) setEditingNoteId(null)
        }}
        onCreate={handleCreateNote}
        onUpdate={handleUpdateNote}
        onArchive={async (id) => {
          await handleArchive(id)
        }}
        onRestore={async (id) => {
          await handleRestore(id)
        }}
        onTransformToTask={async (id) => {
          const target = selectedNote?.id === id
            ? selectedNote
            : [...activeNotes, ...archivedNotes].find((note) => note.id === id)
          if (target) await handleTransformToTask(target)
        }}
        onSaved={(note) => setSelectedNoteId(note.id)}
      />

      <NoteFolderSheet
        open={folderSheetOpen}
        nextOrder={nextFolderOrder}
        onOpenChange={setFolderSheetOpen}
        onCreate={handleCreateFolder}
      />
      <DestructiveConfirmDialog
        open={Boolean(folderToDelete)}
        onOpenChange={(open) => {
          if (!open) setFolderToDelete(null)
        }}
        title="Excluir pasta?"
        description="A pasta sera removida, mas as notas dentro dela serao movidas para Sem pasta."
        confirmLabel="Excluir pasta"
        onConfirm={handleDeleteFolder}
      />
    </div>
  )
}
