import { createElement } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { cn } from '@/lib/utils/cn'
import {
  getNoteColorTokens,
  noteEffortLabel,
  noteImpactLabel,
  notePriorityLabel,
  noteStatusLabel,
} from '@/lib/utils/note-display'
import { NoteColorDot } from './note-color-dot'
import { getFolderIcon } from './folder-icon'
import type { Note, NoteFolder } from '@/lib/types'

interface Props {
  note: Note
  folder?: NoteFolder | null
}

function formatDate(iso?: string | null): string {
  if (!iso) return '—'
  try {
    return format(parseISO(iso), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })
  } catch {
    return '—'
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <span className="text-[11px] uppercase tracking-wider text-text-muted">{label}</span>
      <span className="min-w-0 text-right text-xs text-text-secondary">{children}</span>
    </div>
  )
}

function FolderTag({ folder }: { folder: NoteFolder | null | undefined }) {
  if (!folder) return <span className="text-text-muted">Sem pasta</span>
  // Lucide icons are stable module exports keyed by string. We use
  // createElement to avoid the static-components lint check that flags
  // dynamic component lookups (the icon is not "created" — it's selected).
  const icon = createElement(getFolderIcon(folder.icon), {
    className: 'h-3 w-3 text-text-muted',
    strokeWidth: 1.75,
    'aria-hidden': true,
  })
  return (
    <span className="inline-flex items-center gap-1.5">
      {icon}
      {folder.name}
    </span>
  )
}

export function NoteMetadataPanel({ note, folder }: Props) {
  const tokens = getNoteColorTokens(note.color)

  return (
    <aside className="rounded-lg border border-border-subtle bg-surface/40 p-4">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
        Metadados
      </p>

      <div className="divide-y divide-border-subtle">
        <Field label="Pasta">
          <FolderTag folder={folder} />
        </Field>
        <Field label="Status">{noteStatusLabel[note.status] ?? note.status}</Field>
        <Field label="Prioridade">{notePriorityLabel[note.priority]}</Field>
        <Field label="Impacto">{noteImpactLabel[note.impact]}</Field>
        <Field label="Esforço">{noteEffortLabel[note.effort]}</Field>
        <Field label="Cor">
          <span className="inline-flex items-center gap-1.5">
            <NoteColorDot color={note.color} size="sm" />
            <span className={cn('capitalize', tokens.chipText)}>{note.color}</span>
          </span>
        </Field>
        <Field label="Criada">
          <span className="font-mono tabular-nums">{formatDate(note.createdAt)}</span>
        </Field>
        <Field label="Atualizada">
          <span className="font-mono tabular-nums">{formatDate(note.updatedAt)}</span>
        </Field>
        {note.lastViewedAt && (
          <Field label="Última visita">
            <span className="font-mono tabular-nums">{formatDate(note.lastViewedAt)}</span>
          </Field>
        )}
        {note.source && <Field label="Origem">{note.source}</Field>}
      </div>
    </aside>
  )
}
