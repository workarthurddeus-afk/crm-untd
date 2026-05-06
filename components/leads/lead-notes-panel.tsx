'use client'

import { Archive, NotebookPen, Pin, Plus, Sparkles, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { cn } from '@/lib/utils/cn'
import type { Note, NoteFolder } from '@/lib/types'

interface Props {
  notes: Note[]
  folders: NoteFolder[]
  isLoading: boolean
  onCreate: () => void
  onEdit: (note: Note) => void
}

function folderName(note: Note, folders: NoteFolder[]): string | null {
  if (!note.folderId) return null
  return folders.find((folder) => folder.id === note.folderId)?.name ?? 'Pasta'
}

export function LeadNotesPanel({ notes, folders, isLoading, onCreate, onEdit }: Props) {
  if (isLoading) {
    return (
      <div className="grid gap-3 pt-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="p-4">
            <Skeleton className="h-4 w-52" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-2/3" />
          </Card>
        ))}
      </div>
    )
  }

  if (notes.length === 0) {
    return (
      <EmptyState
        icon={NotebookPen}
        title="Nenhuma nota ligada a este lead"
        description="Capture aprendizados, objecoes e sinais comerciais enquanto o contexto esta fresco."
        action={
          <Button variant="primary" onClick={onCreate}>
            <Plus aria-hidden /> Nova nota do lead
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-3 pt-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-text">
            {notes.length} nota{notes.length === 1 ? '' : 's'} vinculada{notes.length === 1 ? '' : 's'}
          </p>
          <p className="mt-1 text-xs text-text-muted">Memoria comercial especifica deste relacionamento.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={onCreate}>
          <Plus aria-hidden /> Nova nota
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {notes.map((note) => {
          const folder = folderName(note, folders)
          return (
            <Card
              key={note.id}
              className={cn(
                'p-4 transition-all duration-base hover:border-primary/35 hover:bg-surface-elevated/55',
                note.isPinned && 'ring-1 ring-primary/20'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="default">{note.type}</Badge>
                    <Badge variant={note.impact === 'high' ? 'success' : 'outline'}>
                      Impacto {note.impact}
                    </Badge>
                    {folder && <Badge variant="secondary">{folder}</Badge>}
                  </div>
                  <h3 className="mt-3 line-clamp-2 font-display text-base font-semibold text-text">
                    {note.title}
                  </h3>
                </div>
                <div className="flex shrink-0 items-center gap-1 text-text-muted">
                  {note.isPinned && <Pin className="h-4 w-4 fill-primary text-primary" aria-hidden />}
                  {note.isFavorite && <Star className="h-4 w-4 fill-warning text-warning" aria-hidden />}
                  {note.isArchived && <Archive className="h-4 w-4" aria-hidden />}
                </div>
              </div>

              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-text-secondary">
                {note.excerpt || note.content || 'Sem conteudo ainda.'}
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-3">
                <div className="flex min-w-0 flex-wrap gap-1.5">
                  {note.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border-subtle bg-background/35 px-2 py-1 text-[11px] font-medium text-text-muted"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <Button variant="ghost" size="sm" onClick={() => onEdit(note)}>
                  <Sparkles aria-hidden /> Abrir
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
