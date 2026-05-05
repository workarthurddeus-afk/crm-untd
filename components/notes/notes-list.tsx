'use client'

import { ArrowDownNarrowWide, NotebookPen, SearchX, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils/cn'
import { NoteCard } from './note-card'
import { NoteEmptyState } from './empty-states'
import type { Note } from '@/lib/types'
import type { NoteSort } from '@/lib/utils/notes'

interface Props {
  notes: Note[]
  total: number
  selectedNoteId: string | null
  onSelect: (id: string) => void
  isLoading: boolean
  sort: NoteSort
  onSortChange: (sort: NoteSort) => void
  filterLabel: string
  filterChip?: { label: string; onClear: () => void }
  onNewNote: () => void
}

function ListSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-border-subtle bg-surface/40 px-3.5 py-3"
        >
          <Skeleton className="h-3.5 w-2/3" />
          <Skeleton className="mt-2 h-2.5 w-full" />
          <Skeleton className="mt-1.5 h-2.5 w-4/5" />
          <div className="mt-3 flex gap-1.5">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function NotesList({
  notes,
  total,
  selectedNoteId,
  onSelect,
  isLoading,
  sort,
  onSortChange,
  filterLabel,
  filterChip,
  onNewNote,
}: Props) {
  return (
    <section
      className={cn(
        'flex h-full min-w-0 flex-col border-r border-border bg-background',
        'lg:w-[360px] xl:w-[380px] lg:shrink-0'
      )}
    >
      <header className="border-b border-border-subtle bg-surface/30 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">
              {filterLabel}
            </p>
            <p className="mt-0.5 text-xs text-text-muted">
              <span className="font-mono tabular-nums text-text-secondary">{notes.length}</span>{' '}
              {notes.length === 1 ? 'nota' : 'notas'}
              {notes.length !== total && (
                <>
                  {' '}
                  de <span className="font-mono tabular-nums">{total}</span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <Select value={sort} onValueChange={(v) => onSortChange(v as NoteSort)}>
              <SelectTrigger className="h-8 w-[148px] text-xs" aria-label="Ordenar notas">
                <ArrowDownNarrowWide
                  className="mr-1 h-3.5 w-3.5 text-text-muted"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strategic">Estratégica</SelectItem>
                <SelectItem value="updated-desc">Mais recentes</SelectItem>
                <SelectItem value="created-desc">Criadas recentes</SelectItem>
                <SelectItem value="impact-desc">Maior impacto</SelectItem>
                <SelectItem value="priority-desc">Maior prioridade</SelectItem>
                <SelectItem value="title-asc">Título (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filterChip && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge
              variant="default"
              className="cursor-pointer pr-1"
              onClick={filterChip.onClear}
            >
              <span>{filterChip.label}</span>
              <X className="h-3 w-3" strokeWidth={2} aria-hidden />
            </Badge>
            <button
              type="button"
              onClick={filterChip.onClear}
              className="text-[11px] text-text-muted underline-offset-2 hover:text-text-secondary hover:underline"
            >
              Limpar
            </button>
          </div>
        )}
      </header>

      <div className="min-h-0 flex-1">
        {isLoading && notes.length === 0 ? (
          <ListSkeleton />
        ) : notes.length === 0 ? (
          <div className="px-4 py-8">
            <NoteEmptyState
              icon={SearchX}
              title="Nenhuma nota encontrada"
              description="Tente outra busca, mude o filtro ou crie uma nova ideia agora mesmo."
              action={
                <Button variant="primary" size="sm" onClick={onNewNote}>
                  <NotebookPen aria-hidden /> Nova nota
                </Button>
              }
            />
          </div>
        ) : (
          <ScrollArea className="h-full">
            <ul className="flex flex-col gap-1.5 p-3">
              {notes.map((note) => (
                <li key={note.id}>
                  <NoteCard
                    note={note}
                    selected={selectedNoteId === note.id}
                    onSelect={() => onSelect(note.id)}
                  />
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </div>
    </section>
  )
}
