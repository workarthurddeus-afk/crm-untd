'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import {
  Archive,
  ArchiveRestore,
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  CheckSquare,
  Copy,
  Heart,
  Link2,
  ListChecks,
  MessageSquare,
  Pencil,
  Pin,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { DestructiveConfirmDialog } from '@/components/shared/destructive-confirm-dialog'
import { cn } from '@/lib/utils/cn'
import {
  getNoteColorTokens,
  getNoteTypeLabel,
  impactBadgeVariant,
  priorityBadgeVariant,
  statusBadgeVariant,
  noteImpactLabel,
  notePriorityLabel,
  noteStatusLabel,
} from '@/lib/utils/note-display'
import { NoteColorDot } from './note-color-dot'
import { NoteMarkdownPreview } from './note-markdown-preview'
import { NoteMetadataPanel } from './note-metadata-panel'
import { NoteEmptyState } from './empty-states'
import type { Note, NoteFolder } from '@/lib/types'

interface Props {
  note: Note | null
  folder?: NoteFolder | null
  isLoading: boolean
  onTogglePin: () => Promise<void> | void
  onToggleFavorite: () => Promise<void> | void
  onArchive: () => Promise<void> | void
  onRestore: () => Promise<void> | void
  onDelete: () => Promise<void> | void
  onTransformToTask: () => Promise<void> | void
  onEdit: () => void
  onCopyContent: () => void
  onTagClick: (tag: string) => void
  onClearSelection: () => void
}

function DetailSkeleton() {
  return (
    <div className="space-y-4 p-8">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-9 w-3/4" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="space-y-2 pt-4">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-[95%]" />
        <Skeleton className="h-3 w-[88%]" />
        <Skeleton className="h-3 w-[92%]" />
      </div>
    </div>
  )
}

function formatLong(iso: string): string {
  try {
    return format(parseISO(iso), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  } catch {
    return ''
  }
}

interface RelationProps {
  label: string
  value: string
  href?: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
}

function RelationLink({ label, value, href, icon: Icon }: RelationProps) {
  const inner = (
    <span className="flex items-center gap-2.5 rounded-lg border border-border-subtle bg-surface/60 px-3 py-2.5 transition-colors hover:border-border hover:bg-surface-elevated">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/12 text-primary">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] uppercase tracking-wider text-text-muted">
          {label}
        </span>
        <span className="block truncate text-xs text-text-secondary">{value}</span>
      </span>
      {href && (
        <ArrowUpRight
          className="h-3.5 w-3.5 text-text-muted opacity-0 transition-opacity group-hover:opacity-100"
          strokeWidth={1.75}
          aria-hidden
        />
      )}
    </span>
  )

  if (href) {
    return (
      <Link href={href} className="group block">
        {inner}
      </Link>
    )
  }
  return <div className="group">{inner}</div>
}

export function NoteDetail({
  note,
  folder,
  isLoading,
  onTogglePin,
  onToggleFavorite,
  onArchive,
  onRestore,
  onDelete,
  onTransformToTask,
  onEdit,
  onCopyContent,
  onTagClick,
  onClearSelection,
}: Props) {
  const [working, setWorking] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const guard = async (key: string, fn: () => Promise<void> | void) => {
    if (working) return
    setWorking(key)
    try {
      await fn()
    } finally {
      setWorking(null)
    }
  }

  if (isLoading && !note) return <DetailSkeleton />

  if (!note) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <NoteEmptyState
          icon={Sparkles}
          title="Selecione uma nota"
          description="Escolha uma ideia da lista ao lado, abra a memória estratégica do dia ou crie uma nova nota agora mesmo."
          className="max-w-md"
        />
      </div>
    )
  }

  const tokens = getNoteColorTokens(note.color)
  const created = formatLong(note.createdAt)
  const updated = formatLong(note.updatedAt)

  return (
    <article
      className={cn(
        'relative flex h-full min-w-0 flex-1 flex-col bg-background',
        'before:pointer-events-none before:absolute before:left-0 before:right-0 before:top-0 before:h-1',
        tokens.accent
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-0 h-72 w-72 rounded-full opacity-40 blur-3xl"
        style={{ background: `radial-gradient(closest-side, ${tokens.glow}, transparent 70%)` }}
      />

      <header className="relative border-b border-border-subtle px-6 pt-6 pb-4 lg:px-10 lg:pt-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-text-muted">
            <NoteColorDot color={note.color} size="sm" />
            <span className={tokens.chipText}>{getNoteTypeLabel(note.type)}</span>
            {folder && (
              <>
                <span className="text-text-muted/50">·</span>
                <span>{folder.name}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label={note.isPinned ? 'Desafixar' : 'Fixar'}
              onClick={() => guard('pin', onTogglePin)}
              disabled={working === 'pin'}
              className={cn(note.isPinned && 'text-primary')}
            >
              <Pin
                className={cn('h-4 w-4', note.isPinned && 'fill-primary')}
                strokeWidth={1.75}
                aria-hidden
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={note.isFavorite ? 'Desfavoritar' : 'Favoritar'}
              onClick={() => guard('fav', onToggleFavorite)}
              disabled={working === 'fav'}
              className={cn(note.isFavorite && 'text-warning')}
            >
              <Heart
                className={cn('h-4 w-4', note.isFavorite && 'fill-warning')}
                strokeWidth={1.75}
                aria-hidden
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Copiar conteúdo"
              onClick={onCopyContent}
            >
              <Copy className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            </Button>
            {note.isArchived ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => guard('arch', onRestore)}
                disabled={working === 'arch'}
              >
                <ArchiveRestore aria-hidden /> Restaurar
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => guard('arch', onArchive)}
                disabled={working === 'arch'}
              >
                <Archive aria-hidden /> Arquivar
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={onEdit}>
              <Pencil aria-hidden /> Editar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              disabled={Boolean(working)}
            >
              <Trash2 aria-hidden /> Excluir
            </Button>
            <Button
              variant={note.relatedTaskId ? 'secondary' : 'primary'}
              size="sm"
              onClick={() => guard('task', onTransformToTask)}
              disabled={working === 'task'}
            >
              {note.relatedTaskId ? (
                <>
                  <CheckCircle2 aria-hidden /> Tarefa criada
                </>
              ) : (
                <>
                  <CheckSquare aria-hidden /> Virar tarefa
                </>
              )}
            </Button>
          </div>
        </div>

        <h2 className="mt-4 font-display text-2xl font-bold leading-tight tracking-tight text-text lg:text-3xl">
          {note.title}
        </h2>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <Badge variant={statusBadgeVariant(note.status)}>
            {noteStatusLabel[note.status] ?? note.status}
          </Badge>
          <Badge variant={priorityBadgeVariant(note.priority)}>
            {notePriorityLabel[note.priority]}
          </Badge>
          <Badge variant={impactBadgeVariant(note.impact)}>{noteImpactLabel[note.impact]}</Badge>
          <span className="ml-1 text-[11px] text-text-muted">
            <span className="font-mono tabular-nums">{updated}</span>
            {created !== updated && (
              <>
                <span className="mx-1.5 text-text-muted/50">·</span>
                <span>criada em </span>
                <span className="font-mono tabular-nums">{created}</span>
              </>
            )}
          </span>
        </div>
      </header>

      <ScrollArea className="relative min-h-0 flex-1">
        <div className="grid gap-8 px-6 py-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:px-10">
          <div className="min-w-0">
            <NoteMarkdownPreview content={note.content} className="max-w-prose" />

            {note.tags.length > 0 && (
              <div className="mt-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                  Tags
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {note.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => onTagClick(tag)}
                      className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-surface px-2.5 py-0.5 text-[11px] text-text-secondary transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                    >
                      <span className="text-text-muted">#</span>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(note.relatedLeadId ||
              note.relatedTaskId ||
              note.relatedFeedbackId ||
              note.relatedProjectId) && (
              <div className="mt-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                  Relacionado a
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {note.relatedLeadId && (
                    <RelationLink
                      label="Lead vinculado"
                      value={note.relatedLeadId}
                      href={`/leads/${note.relatedLeadId}`}
                      icon={Link2}
                    />
                  )}
                  {note.relatedTaskId && (
                    <RelationLink
                      label="Tarefa vinculada"
                      value={note.relatedTaskId}
                      href="/tasks"
                      icon={ListChecks}
                    />
                  )}
                  {note.relatedFeedbackId && (
                    <RelationLink
                      label="Feedback vinculado"
                      value={note.relatedFeedbackId}
                      href="/feedbacks"
                      icon={MessageSquare}
                    />
                  )}
                  {note.relatedProjectId && (
                    <RelationLink
                      label="Projeto vinculado"
                      value={note.relatedProjectId}
                      icon={Briefcase}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-2 lg:self-start">
            <NoteMetadataPanel note={note} folder={folder} />

            <button
              type="button"
              onClick={onClearSelection}
              className="mt-3 hidden w-full text-center text-xs text-text-muted hover:text-text-secondary lg:hidden"
            >
              Voltar para a lista
            </button>
          </div>
        </div>
      </ScrollArea>

      <DestructiveConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir nota permanentemente?"
        description="Essa acao remove a nota da memoria estrategica. Tarefas ou feedbacks vinculados nao serao apagados automaticamente."
        confirmLabel="Excluir nota"
        confirmationText="EXCLUIR"
        onConfirm={() => guard('delete', onDelete)}
      />
    </article>
  )
}

// Used by toggle handlers to give the user a friendly fallback
export function notesActionToast(message: string) {
  toast.info(message)
}
