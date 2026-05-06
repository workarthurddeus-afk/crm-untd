'use client'

import {
  Archive,
  ArchiveRestore,
  CheckCircle2,
  CheckSquare,
  Edit3,
  FileText,
  Loader2,
  Pin,
  PinOff,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils/cn'
import type { Feedback, Lead } from '@/lib/types'
import {
  formatFeedbackDate,
  getFeedbackFrequencyLabel,
  getFeedbackImpactLabel,
  getFeedbackPriorityLabel,
  getFeedbackSentimentLabel,
  getFeedbackSourceLabel,
  getFeedbackStatusLabel,
  getFeedbackTone,
  getFeedbackTypeLabel,
  getLeadLabel,
} from './feedback-view-utils'

interface Props {
  open: boolean
  feedback: Feedback | null
  leads: Lead[]
  onOpenChange: (open: boolean) => void
  onEdit: (feedback: Feedback) => void
  onResolve: (id: string) => Promise<Feedback>
  onReopen: (id: string) => Promise<Feedback>
  onArchive: (id: string) => Promise<Feedback>
  onRestore: (id: string) => Promise<Feedback>
  onPin: (id: string) => Promise<Feedback>
  onUnpin: (id: string) => Promise<Feedback>
  onConvertToNote: (feedback: Feedback) => Promise<Feedback>
  onConvertToTask: (feedback: Feedback) => Promise<Feedback>
}

type BusyAction = 'resolve' | 'archive' | 'pin' | 'note' | 'task' | null

function toneBackground(tone: ReturnType<typeof getFeedbackTone>) {
  return {
    danger: 'from-danger/15 via-surface-elevated to-surface',
    warning: 'from-warning/15 via-surface-elevated to-surface',
    success: 'from-success/12 via-surface-elevated to-surface',
    info: 'from-info/12 via-surface-elevated to-surface',
    default: 'from-primary/12 via-surface-elevated to-surface',
  }[tone]
}

function MetaItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface/35 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
        {label}
      </p>
      <div className="mt-1.5 text-sm font-medium text-text">{value}</div>
    </div>
  )
}

export function FeedbackDetailSheet({
  open,
  feedback,
  leads,
  onOpenChange,
  onEdit,
  onResolve,
  onReopen,
  onArchive,
  onRestore,
  onPin,
  onUnpin,
  onConvertToNote,
  onConvertToTask,
}: Props) {
  const [busyAction, setBusyAction] = useState<BusyAction>(null)

  if (!feedback) {
    return <Sheet open={open} onOpenChange={onOpenChange} />
  }

  const tone = getFeedbackTone(feedback)
  const leadLabel = getLeadLabel(feedback.relatedLeadId, leads)
  const resolved = feedback.status === 'resolved'

  async function runAction(action: Exclude<BusyAction, null>) {
    if (!feedback) return
    setBusyAction(action)
    try {
      const updated =
        action === 'resolve'
          ? resolved
            ? await onReopen(feedback.id)
            : await onResolve(feedback.id)
          : action === 'archive'
            ? feedback.isArchived
              ? await onRestore(feedback.id)
              : await onArchive(feedback.id)
            : action === 'pin'
              ? feedback.isPinned
                ? await onUnpin(feedback.id)
                : await onPin(feedback.id)
              : action === 'note'
                ? await onConvertToNote(feedback)
                : await onConvertToTask(feedback)

      const messages = {
        resolve: resolved ? 'Feedback reaberto' : 'Feedback resolvido',
        archive: feedback.isArchived ? 'Feedback restaurado' : 'Feedback arquivado',
        pin: feedback.isPinned ? 'Feedback desafixado' : 'Feedback fixado',
        note: updated.relatedNoteId ? 'Nota criada a partir do feedback' : 'Nota vinculada',
        task: updated.relatedTaskId ? 'Tarefa criada a partir do feedback' : 'Tarefa vinculada',
      }
      toast.success(messages[action], { description: updated.title })
    } catch (err) {
      toast.error('Acao nao concluida', {
        description: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setBusyAction(null)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[640px] max-w-[96vw]">
        <SheetHeader className={cn('bg-gradient-to-b', toneBackground(tone))}>
          <div className="flex items-start gap-3 pr-8">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary-muted text-primary">
              <Sparkles className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            </span>
            <div className="min-w-0">
              <SheetTitle>{feedback.title}</SheetTitle>
              <SheetDescription>
                {getFeedbackTypeLabel(feedback.type)} capturado em{' '}
                {formatFeedbackDate(feedback.capturedAt)}
              </SheetDescription>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge variant="default">{getFeedbackStatusLabel(feedback.status)}</Badge>
            <Badge variant={feedback.impact === 'critical' ? 'danger' : 'warning'}>
              Impacto {getFeedbackImpactLabel(feedback.impact)}
            </Badge>
            <Badge variant={feedback.priority === 'urgent' ? 'danger' : 'secondary'}>
              {getFeedbackPriorityLabel(feedback.priority)}
            </Badge>
            {feedback.isPinned && <Badge variant="info">Fixado</Badge>}
            {feedback.isArchived && <Badge variant="outline">Arquivado</Badge>}
          </div>
        </SheetHeader>

        <SheetBody className="space-y-6">
          <section className="rounded-xl border border-border-subtle bg-background/35 p-4">
            <p className="text-sm leading-relaxed text-text-secondary whitespace-pre-wrap">
              {feedback.content}
            </p>
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            <MetaItem label="Fonte" value={getFeedbackSourceLabel(feedback.source)} />
            <MetaItem label="Frequencia" value={getFeedbackFrequencyLabel(feedback.frequency)} />
            <MetaItem label="Sentimento" value={getFeedbackSentimentLabel(feedback.sentiment)} />
            <MetaItem label="Lead" value={leadLabel ?? 'Sem lead relacionado'} />
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <h3 className="font-display text-sm font-semibold text-text">Tags e vinculos</h3>
              <Separator className="flex-1" />
            </div>
            <div className="flex flex-wrap gap-2">
              {feedback.tags.length > 0 ? (
                feedback.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    #{tag}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-text-muted">Sem tags.</span>
              )}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-border-subtle bg-surface/35 p-3 text-sm">
                <p className="font-medium text-text">Nota</p>
                <p className="mt-1 text-xs text-text-muted">
                  {feedback.relatedNoteId ? 'Ja existe nota vinculada.' : 'Pronto para virar memoria.'}
                </p>
              </div>
              <div className="rounded-lg border border-border-subtle bg-surface/35 p-3 text-sm">
                <p className="font-medium text-text">Tarefa</p>
                <p className="mt-1 text-xs text-text-muted">
                  {feedback.relatedTaskId ? 'Ja existe tarefa vinculada.' : 'Pronto para virar acao.'}
                </p>
              </div>
            </div>
          </section>
        </SheetBody>

        <SheetFooter className="bg-surface/80">
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            <Button variant="secondary" onClick={() => onEdit(feedback)} disabled={Boolean(busyAction)}>
              <Edit3 aria-hidden /> Editar
            </Button>
            <Button
              variant="outline"
              onClick={() => void runAction('pin')}
              disabled={Boolean(busyAction)}
            >
              {busyAction === 'pin' ? (
                <Loader2 className="animate-spin" aria-hidden />
              ) : feedback.isPinned ? (
                <PinOff aria-hidden />
              ) : (
                <Pin aria-hidden />
              )}
              {feedback.isPinned ? 'Desafixar' : 'Fixar'}
            </Button>
            <Button
              variant={resolved ? 'outline' : 'secondary'}
              onClick={() => void runAction('resolve')}
              disabled={Boolean(busyAction)}
            >
              {busyAction === 'resolve' ? (
                <Loader2 className="animate-spin" aria-hidden />
              ) : resolved ? (
                <RotateCcw aria-hidden />
              ) : (
                <CheckCircle2 aria-hidden />
              )}
              {resolved ? 'Reabrir' : 'Resolver'}
            </Button>
            <Button
              variant={feedback.isArchived ? 'secondary' : 'outline'}
              onClick={() => void runAction('archive')}
              disabled={Boolean(busyAction)}
            >
              {busyAction === 'archive' ? (
                <Loader2 className="animate-spin" aria-hidden />
              ) : feedback.isArchived ? (
                <ArchiveRestore aria-hidden />
              ) : (
                <Archive aria-hidden />
              )}
              {feedback.isArchived ? 'Restaurar' : 'Arquivar'}
            </Button>
            <Button
              variant={feedback.relatedNoteId ? 'secondary' : 'outline'}
              onClick={() => void runAction('note')}
              disabled={Boolean(busyAction) || Boolean(feedback.relatedNoteId)}
            >
              {busyAction === 'note' ? (
                <Loader2 className="animate-spin" aria-hidden />
              ) : (
                <FileText aria-hidden />
              )}
              {feedback.relatedNoteId ? 'Nota criada' : 'Virar nota'}
            </Button>
            <Button
              variant={feedback.relatedTaskId ? 'secondary' : 'primary'}
              onClick={() => void runAction('task')}
              disabled={Boolean(busyAction) || Boolean(feedback.relatedTaskId)}
            >
              {busyAction === 'task' ? (
                <Loader2 className="animate-spin" aria-hidden />
              ) : (
                <CheckSquare aria-hidden />
              )}
              {feedback.relatedTaskId ? 'Tarefa criada' : 'Virar tarefa'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
