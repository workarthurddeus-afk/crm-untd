'use client'

import { Loader2, Megaphone, Pin, Save } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils/cn'
import type { Feedback, FeedbackInput, Lead } from '@/lib/types'
import {
  FEEDBACK_FREQUENCY_OPTIONS,
  FEEDBACK_IMPACT_OPTIONS,
  FEEDBACK_PRIORITY_OPTIONS,
  FEEDBACK_SENTIMENT_OPTIONS,
  FEEDBACK_SOURCE_OPTIONS,
  FEEDBACK_STATUS_OPTIONS,
  FEEDBACK_TYPE_OPTIONS,
  NO_FEEDBACK_RELATION_VALUE,
  buildFeedbackPayloadFromForm,
  feedbackToFormState,
  getDefaultFeedbackFormState,
  type FeedbackFormState,
} from './feedback-view-utils'

interface Props {
  open: boolean
  feedback: Feedback | null
  leads: Lead[]
  onOpenChange: (open: boolean) => void
  onCreate: (input: FeedbackInput) => Promise<Feedback>
  onUpdate: (id: string, input: Partial<FeedbackInput>) => Promise<Feedback>
  onSaved?: (feedback: Feedback) => void
}

interface FieldProps {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  className?: string
  children: React.ReactNode
}

function FeedbackField({ label, htmlFor, error, hint, className, children }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={htmlFor} className="text-xs font-medium text-text-secondary">
        {label}
      </Label>
      {children}
      <div className="min-h-[1rem] text-[11px] leading-tight">
        {error ? (
          <span id={`${htmlFor}-error`} role="alert" className="text-danger">
            {error}
          </span>
        ) : hint ? (
          <span className="text-text-muted">{hint}</span>
        ) : null}
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <h3 className="font-display text-sm font-semibold text-text">{children}</h3>
      <Separator className="flex-1" />
    </div>
  )
}

export function FeedbackFormSheet({
  open,
  feedback,
  leads,
  onOpenChange,
  onCreate,
  onUpdate,
  onSaved,
}: Props) {
  const [form, setForm] = useState<FeedbackFormState>(() => getDefaultFeedbackFormState())
  const [titleError, setTitleError] = useState<string | undefined>()
  const [contentError, setContentError] = useState<string | undefined>()
  const [isSaving, setIsSaving] = useState(false)
  const isEdit = Boolean(feedback)

  const seed = `${open ? '1' : '0'}|${feedback?.id ?? 'new'}|${feedback?.updatedAt ?? ''}`
  const [prevSeed, setPrevSeed] = useState(seed)
  if (open && seed !== prevSeed) {
    setPrevSeed(seed)
    setForm(feedbackToFormState(feedback))
    setTitleError(undefined)
    setContentError(undefined)
    setIsSaving(false)
  } else if (!open && prevSeed !== seed) {
    setPrevSeed(seed)
  }

  const selectedImpact = useMemo(
    () => FEEDBACK_IMPACT_OPTIONS.find((option) => option.value === form.impact),
    [form.impact]
  )

  function update<K extends keyof FeedbackFormState>(key: K, value: FeedbackFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (key === 'title' && String(value).trim()) setTitleError(undefined)
    if (key === 'content' && String(value).trim()) setContentError(undefined)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.title.trim()) {
      setTitleError('Digite um titulo para o feedback.')
      return
    }
    if (!form.content.trim()) {
      setContentError('Registre o sinal com contexto suficiente.')
      return
    }

    setIsSaving(true)
    try {
      const payload = buildFeedbackPayloadFromForm(form)
      const saved = feedback ? await onUpdate(feedback.id, payload) : await onCreate(payload)
      setForm(feedbackToFormState(saved))
      toast.success(feedback ? 'Feedback atualizado' : 'Feedback criado', {
        description: saved.title,
      })
      onSaved?.(saved)
      onOpenChange(false)
    } catch (err) {
      toast.error('Falha ao salvar feedback', {
        description: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[680px] max-w-[96vw]">
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
          <SheetHeader className="bg-gradient-to-b from-surface-elevated to-surface">
            <div className="flex items-start gap-3 pr-8">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary-muted text-primary">
                <Megaphone className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </span>
              <div className="min-w-0">
                <SheetTitle>{isEdit ? 'Editar feedback' : 'Novo feedback'}</SheetTitle>
                <SheetDescription>
                  Capture dores, objeções e sinais de produto com contexto para virar acao.
                </SheetDescription>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge variant={form.impact === 'critical' ? 'danger' : 'default'}>
                Impacto {selectedImpact?.label}
              </Badge>
              <Badge variant={form.priority === 'urgent' ? 'danger' : 'secondary'}>
                Prioridade{' '}
                {FEEDBACK_PRIORITY_OPTIONS.find((option) => option.value === form.priority)?.label}
              </Badge>
              {form.isPinned && <Badge variant="info">Fixado</Badge>}
            </div>
          </SheetHeader>

          <SheetBody className="space-y-6">
            <section className="space-y-4">
              <SectionTitle>Sinal capturado</SectionTitle>
              <FeedbackField label="Titulo" htmlFor="feedback-title" error={titleError}>
                <Input
                  id="feedback-title"
                  value={form.title}
                  onChange={(event) => update('title', event.target.value)}
                  placeholder="Objeção, dor, pedido de feature ou aprendizado..."
                  aria-invalid={Boolean(titleError)}
                  aria-describedby={titleError ? 'feedback-title-error' : undefined}
                  autoFocus
                />
              </FeedbackField>
              <FeedbackField label="Conteudo" htmlFor="feedback-content" error={contentError}>
                <Textarea
                  id="feedback-content"
                  value={form.content}
                  onChange={(event) => update('content', event.target.value)}
                  placeholder="O que foi dito, por quem, em qual contexto e por que importa."
                  aria-invalid={Boolean(contentError)}
                  aria-describedby={contentError ? 'feedback-content-error' : undefined}
                  rows={5}
                  className="min-h-[150px]"
                />
              </FeedbackField>
            </section>

            <section className="space-y-4">
              <SectionTitle>Classificacao</SectionTitle>
              <div className="grid gap-3 sm:grid-cols-2">
                <FeedbackField label="Tipo" htmlFor="feedback-type">
                  <Select
                    value={form.type}
                    onValueChange={(value) => update('type', value as FeedbackFormState['type'])}
                  >
                    <SelectTrigger id="feedback-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FEEDBACK_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FeedbackField>
                <FeedbackField label="Fonte" htmlFor="feedback-source">
                  <Select
                    value={form.source}
                    onValueChange={(value) =>
                      update('source', value as FeedbackFormState['source'])
                    }
                  >
                    <SelectTrigger id="feedback-source">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FEEDBACK_SOURCE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FeedbackField>
                <FeedbackField label="Status" htmlFor="feedback-status">
                  <Select
                    value={form.status}
                    onValueChange={(value) =>
                      update('status', value as FeedbackFormState['status'])
                    }
                  >
                    <SelectTrigger id="feedback-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FEEDBACK_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FeedbackField>
                <FeedbackField label="Lead relacionado" htmlFor="feedback-lead">
                  <Select
                    value={form.relatedLeadId}
                    onValueChange={(value) => update('relatedLeadId', value)}
                  >
                    <SelectTrigger id="feedback-lead">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_FEEDBACK_RELATION_VALUE}>Sem lead</SelectItem>
                      {leads.map((lead) => (
                        <SelectItem key={lead.id} value={lead.id}>
                          {lead.name} · {lead.company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FeedbackField>
              </div>
            </section>

            <section className="space-y-4">
              <SectionTitle>Peso operacional</SectionTitle>
              <div className="grid gap-3 sm:grid-cols-2">
                <FeedbackField label="Impacto" htmlFor="feedback-impact">
                  <Select
                    value={form.impact}
                    onValueChange={(value) =>
                      update('impact', value as FeedbackFormState['impact'])
                    }
                  >
                    <SelectTrigger id="feedback-impact">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FEEDBACK_IMPACT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FeedbackField>
                <FeedbackField label="Frequencia" htmlFor="feedback-frequency">
                  <Select
                    value={form.frequency}
                    onValueChange={(value) =>
                      update('frequency', value as FeedbackFormState['frequency'])
                    }
                  >
                    <SelectTrigger id="feedback-frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FEEDBACK_FREQUENCY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FeedbackField>
                <FeedbackField label="Sentimento" htmlFor="feedback-sentiment">
                  <Select
                    value={form.sentiment}
                    onValueChange={(value) =>
                      update('sentiment', value as FeedbackFormState['sentiment'])
                    }
                  >
                    <SelectTrigger id="feedback-sentiment">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FEEDBACK_SENTIMENT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FeedbackField>
                <FeedbackField label="Prioridade" htmlFor="feedback-priority">
                  <Select
                    value={form.priority}
                    onValueChange={(value) =>
                      update('priority', value as FeedbackFormState['priority'])
                    }
                  >
                    <SelectTrigger id="feedback-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FEEDBACK_PRIORITY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FeedbackField>
              </div>
            </section>

            <section className="space-y-4">
              <SectionTitle>Contexto</SectionTitle>
              <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
                <FeedbackField
                  label="Tags"
                  htmlFor="feedback-tags"
                  hint="Separe por virgulas. Ex: pricing, brandkit, social-media"
                >
                  <Input
                    id="feedback-tags"
                    value={form.tags}
                    onChange={(event) => update('tags', event.target.value)}
                    placeholder="pricing, brandkit, social-media"
                  />
                </FeedbackField>
                <div className="rounded-lg border border-border-subtle bg-surface/40 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="feedback-pinned" className="text-xs text-text-secondary">
                      Fixar
                    </Label>
                    <Switch
                      id="feedback-pinned"
                      checked={form.isPinned}
                      onCheckedChange={(value) => update('isPinned', value)}
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-text-muted">
                    <Pin className="h-3 w-3" aria-hidden />
                    Sobe no review.
                  </div>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <FeedbackField label="Data capturada" htmlFor="feedback-captured-date">
                  <Input
                    id="feedback-captured-date"
                    type="date"
                    value={form.capturedDate}
                    onChange={(event) => update('capturedDate', event.target.value)}
                  />
                </FeedbackField>
                <FeedbackField label="Hora" htmlFor="feedback-captured-time">
                  <Input
                    id="feedback-captured-time"
                    type="time"
                    value={form.capturedTime}
                    onChange={(event) => update('capturedTime', event.target.value)}
                  />
                </FeedbackField>
              </div>
            </section>
          </SheetBody>

          <SheetFooter className="bg-surface/80">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isSaving} className="min-w-[148px]">
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden /> Salvando
                </>
              ) : (
                <>
                  <Save aria-hidden /> {isEdit ? 'Salvar feedback' : 'Criar feedback'}
                </>
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
