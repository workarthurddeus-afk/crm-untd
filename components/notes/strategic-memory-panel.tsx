'use client'

import { formatDistanceToNow, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { ArrowRight, CheckCircle2, CheckSquare, Pin, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils/cn'
import {
  getNoteTypeLabel,
  memoryTypeLabel,
  impactBadgeVariant,
} from '@/lib/utils/note-display'
import type { StrategicMemoryPick } from '@/lib/utils/strategic-memory'

interface Props {
  memory: StrategicMemoryPick | null
  isLoading: boolean
  onOpen: (noteId: string) => void
  onTransformToTask: (noteId: string) => Promise<void> | void
  onTogglePin: (noteId: string) => void
}

function relative(iso: string): string {
  try {
    return formatDistanceToNow(parseISO(iso), { locale: ptBR, addSuffix: true })
  } catch {
    return ''
  }
}

export function StrategicMemoryPanel({
  memory,
  isLoading,
  onOpen,
  onTransformToTask,
  onTogglePin,
}: Props) {
  if (isLoading && !memory) {
    return (
      <div className="rounded-xl border border-primary/15 bg-surface/40 p-4">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="mt-3 h-4 w-3/4" />
        <Skeleton className="mt-2 h-3 w-full" />
        <Skeleton className="mt-1.5 h-3 w-[88%]" />
      </div>
    )
  }

  if (!memory) {
    return (
      <div className="rounded-xl border border-border-subtle bg-surface/30 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
            Memória Estratégica
          </p>
        </div>
        <p className="mt-3 text-xs text-text-muted">
          Nenhuma memória disponível ainda. Fixe ou favorite uma nota de alto impacto para abrir
          esse espaço.
        </p>
      </div>
    )
  }

  const note = memory.note

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-xl border border-primary/25 bg-gradient-to-br from-surface-elevated to-surface',
        'shadow-[0_0_28px_rgba(83,50,234,0.10)] ring-1 ring-primary/15'
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-12 h-48 w-48 rounded-full opacity-70 blur-2xl"
        style={{
          background: 'radial-gradient(closest-side, rgba(83,50,234,0.20), transparent 70%)',
        }}
      />

      <div className="relative p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
              Memória Estratégica
            </span>
            <span className="text-[10px] text-primary">
              {memoryTypeLabel[memory.memoryType] ?? 'Lembrete do dia'}
            </span>
          </div>
          <span className="ml-auto rounded-full bg-primary/12 px-2 py-0.5 font-mono text-[10px] tabular-nums text-primary">
            {memory.score}
          </span>
        </div>

        <h3 className="mt-3 font-display text-sm font-semibold leading-snug text-text">
          {note.title}
        </h3>
        <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-text-secondary/90">
          {note.excerpt ?? note.content}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className="text-[10px]">
            {getNoteTypeLabel(note.type)}
          </Badge>
          {note.impact === 'high' && (
            <Badge variant={impactBadgeVariant(note.impact)} className="text-[10px]">
              alto impacto
            </Badge>
          )}
          <span className="ml-auto font-mono text-[10px] tabular-nums text-text-muted">
            {relative(note.updatedAt)}
          </span>
        </div>

        <p className="mt-2.5 text-[11px] italic leading-relaxed text-primary/80">
          {memory.reason}
        </p>

        <div className="mt-3 flex items-center gap-1.5">
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={() => onOpen(note.id)}
          >
            Abrir <ArrowRight aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTransformToTask(note.id)}
            aria-label={note.relatedTaskId ? 'Tarefa vinculada' : 'Virar tarefa'}
          >
            {note.relatedTaskId ? <CheckCircle2 aria-hidden /> : <CheckSquare aria-hidden />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={note.isPinned ? 'Desafixar' : 'Fixar'}
            onClick={() => onTogglePin(note.id)}
          >
            <Pin
              className={cn('h-4 w-4', note.isPinned && 'fill-primary text-primary')}
              strokeWidth={1.75}
              aria-hidden
            />
          </Button>
        </div>
      </div>
    </section>
  )
}
