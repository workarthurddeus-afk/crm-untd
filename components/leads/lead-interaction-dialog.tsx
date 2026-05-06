'use client'

import { useState } from 'react'
import { Loader2, MessageSquarePlus, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { InteractionType, LeadInteraction, LeadInteractionInput } from '@/lib/types'
import {
  buildLeadInteractionPayload,
  getDefaultLeadInteractionFormState,
  type LeadInteractionFormState,
} from './lead-detail-actions'

const interactionOptions: Array<{ value: InteractionType; label: string }> = [
  { value: 'first-contact-sent', label: 'Primeiro contato enviado' },
  { value: 'replied', label: 'Lead respondeu' },
  { value: 'follow-up-sent', label: 'Follow-up enviado' },
  { value: 'meeting-scheduled', label: 'Reuniao agendada' },
  { value: 'meeting-held', label: 'Reuniao realizada' },
  { value: 'proposal-sent', label: 'Proposta enviada' },
  { value: 'feedback-received', label: 'Feedback recebido' },
  { value: 'won', label: 'Lead ganho' },
  { value: 'lost', label: 'Lead perdido' },
  { value: 'note', label: 'Nota interna' },
]

interface Props {
  open: boolean
  leadId: string
  leadName: string
  onOpenChange: (open: boolean) => void
  onCreate: (input: LeadInteractionInput) => Promise<LeadInteraction>
}

export function LeadInteractionDialog({ open, leadId, leadName, onOpenChange, onCreate }: Props) {
  const [form, setForm] = useState<LeadInteractionFormState>(() =>
    getDefaultLeadInteractionFormState()
  )
  const [descriptionError, setDescriptionError] = useState<string | undefined>()
  const [isSaving, setIsSaving] = useState(false)
  const seed = `${open ? '1' : '0'}|${leadId}`
  const [prevSeed, setPrevSeed] = useState(seed)

  if (open && seed !== prevSeed) {
    setPrevSeed(seed)
    setForm(getDefaultLeadInteractionFormState())
    setDescriptionError(undefined)
    setIsSaving(false)
  } else if (!open && seed !== prevSeed) {
    setPrevSeed(seed)
  }

  function update<K extends keyof LeadInteractionFormState>(key: K, value: LeadInteractionFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    if (key === 'description' && String(value).trim()) setDescriptionError(undefined)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.description.trim()) {
      setDescriptionError('Descreva o que aconteceu com esse lead.')
      return
    }

    setIsSaving(true)
    try {
      const created = await onCreate(buildLeadInteractionPayload(leadId, form))
      toast.success('Interacao registrada', { description: created.description ?? leadName })
      onOpenChange(false)
    } catch (err) {
      toast.error('Falha ao registrar interacao', {
        description: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0">
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader className="border-b border-border-subtle px-6 py-5">
            <div className="flex items-start gap-3 pr-8">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary-muted text-primary">
                <MessageSquarePlus className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </span>
              <div>
                <DialogTitle>Adicionar interacao</DialogTitle>
                <DialogDescription>
                  Registre um contato real com {leadName} para manter a timeline viva.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 px-6 py-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="interaction-type">Tipo</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) => update('type', value as InteractionType)}
                >
                  <SelectTrigger id="interaction-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {interactionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-[1fr_110px] gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="interaction-date">Data</Label>
                  <Input
                    id="interaction-date"
                    type="date"
                    value={form.date}
                    onChange={(event) => update('date', event.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="interaction-time">Hora</Label>
                  <Input
                    id="interaction-time"
                    type="time"
                    value={form.time}
                    onChange={(event) => update('time', event.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="interaction-description">Descricao</Label>
              <Textarea
                id="interaction-description"
                value={form.description}
                onChange={(event) => update('description', event.target.value)}
                placeholder="Resumo objetivo do contato, resposta, decisao ou proximo passo."
                rows={4}
                aria-invalid={Boolean(descriptionError)}
                aria-describedby={descriptionError ? 'interaction-description-error' : undefined}
              />
              <div className="min-h-[1rem] text-[11px] leading-tight">
                {descriptionError && (
                  <span id="interaction-description-error" role="alert" className="text-danger">
                    {descriptionError}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border-subtle bg-surface-elevated/35 px-6 py-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isSaving} className="min-w-[132px]">
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden /> Salvando
                </>
              ) : (
                <>
                  <Save aria-hidden /> Registrar
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
