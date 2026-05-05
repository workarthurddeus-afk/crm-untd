'use client'

import { formatDistanceToNow, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { Heart, Pin } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import {
  getNoteColorTokens,
  getNoteTypeLabel,
  impactBadgeVariant,
} from '@/lib/utils/note-display'
import { Badge } from '@/components/ui/badge'
import type { Note } from '@/lib/types'

interface Props {
  note: Note
  selected: boolean
  onSelect: () => void
}

function relativeFromIso(iso: string): string {
  try {
    return formatDistanceToNow(parseISO(iso), { locale: ptBR, addSuffix: true })
  } catch {
    return ''
  }
}

export function NoteCard({ note, selected, onSelect }: Props) {
  const tokens = getNoteColorTokens(note.color)
  const updated = relativeFromIso(note.updatedAt)
  const tags = note.tags.slice(0, 3)
  const remaining = note.tags.length - tags.length
  const impact = note.impact

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'group relative w-full overflow-hidden rounded-lg border text-left',
        'px-3.5 py-3 transition-all duration-fast',
        'before:absolute before:left-0 before:top-3 before:bottom-3 before:w-[2px] before:rounded-full',
        tokens.accent,
        selected
          ? 'border-primary/35 bg-surface-elevated/85 shadow-[0_0_0_1px_rgba(83,50,234,0.18),0_8px_24px_rgba(0,0,0,0.35)]'
          : 'border-border-subtle bg-surface/60 hover:border-border hover:bg-surface-elevated/60'
      )}
    >
      <div className="relative pl-2.5">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              {note.isPinned && (
                <Pin
                  className="h-3 w-3 shrink-0 fill-primary/80 text-primary"
                  strokeWidth={1.75}
                  aria-label="Fixada"
                />
              )}
              {note.isFavorite && (
                <Heart
                  className="h-3 w-3 shrink-0 fill-warning text-warning"
                  strokeWidth={1.75}
                  aria-label="Favorita"
                />
              )}
              <span
                className={cn(
                  'truncate font-display text-sm font-semibold leading-snug',
                  selected ? 'text-text' : 'text-text group-hover:text-text'
                )}
              >
                {note.title}
              </span>
            </div>

            {note.excerpt && (
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-secondary/90">
                {note.excerpt}
              </p>
            )}
          </div>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              'inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-medium',
              tokens.chipBg,
              tokens.chipText
            )}
          >
            {getNoteTypeLabel(note.type)}
          </span>
          {impact === 'high' && (
            <Badge variant={impactBadgeVariant(impact)} className="text-[10px]">
              alto impacto
            </Badge>
          )}
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-sm border border-border-subtle bg-surface px-1.5 py-0.5 text-[10px] text-text-muted"
            >
              {tag}
            </span>
          ))}
          {remaining > 0 && (
            <span className="text-[10px] font-mono tabular-nums text-text-muted">
              +{remaining}
            </span>
          )}
          {updated && (
            <span className="ml-auto font-mono text-[10px] tabular-nums text-text-muted">
              {updated}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
