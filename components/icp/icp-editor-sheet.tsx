'use client'

import { useState } from 'react'
import { Loader2, RotateCcw, Save, SlidersHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { icpProfileInputSchema } from '@/lib/schemas/icp'
import type { ICPClassificationRange, ICPCriterion, ICPProfile } from '@/lib/types'

interface Props {
  open: boolean
  profile: ICPProfile
  onOpenChange: (open: boolean) => void
  onSave: (input: Partial<ICPProfile>) => Promise<ICPProfile>
}

interface ICPFormState {
  name: string
  description: string
  personaName: string
  personaDescription: string
  pains: string
  desires: string
  purchaseTriggers: string
  objections: string
  bestMessage: string
  likelyOffer: string
  foundOnChannels: string
  criteriaJson: string
  rangesJson: string
}

function toList(value: string): string[] {
  return value
    .split('\n')
    .flatMap((line) => line.split(','))
    .map((item) => item.trim())
    .filter(Boolean)
}

function fromList(items: string[]): string {
  return items.join('\n')
}

function stateFromProfile(profile: ICPProfile): ICPFormState {
  return {
    name: profile.name,
    description: profile.description ?? '',
    personaName: profile.persona.name,
    personaDescription: profile.persona.description,
    pains: fromList(profile.persona.pains),
    desires: fromList(profile.persona.desires),
    purchaseTriggers: fromList(profile.persona.purchaseTriggers),
    objections: fromList(profile.persona.objections),
    bestMessage: profile.persona.bestMessage ?? '',
    likelyOffer: profile.persona.likelyOffer ?? '',
    foundOnChannels: fromList(profile.persona.foundOnChannels),
    criteriaJson: JSON.stringify(profile.criteria, null, 2),
    rangesJson: JSON.stringify(profile.classificationRanges ?? [], null, 2),
  }
}

function parseJson<T>(value: string, label: string): T {
  try {
    return JSON.parse(value) as T
  } catch {
    throw new Error(`${label} precisa ser um JSON valido.`)
  }
}

function Field({
  label,
  htmlFor,
  children,
  hint,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs font-medium text-text-secondary">
        {label}
      </Label>
      {children}
      {hint && <p className="text-[11px] leading-relaxed text-text-secondary">{hint}</p>}
    </div>
  )
}

export function ICPEditorSheet({ open, profile, onOpenChange, onSave }: Props) {
  const seed = `${open ? '1' : '0'}|${profile.updatedAt}`
  const [prevSeed, setPrevSeed] = useState(seed)
  const [form, setForm] = useState<ICPFormState>(() => stateFromProfile(profile))
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  if (seed !== prevSeed) {
    setPrevSeed(seed)
    setForm(stateFromProfile(profile))
    setError(null)
    setIsSaving(false)
  }

  function update<K extends keyof ICPFormState>(key: K, value: ICPFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setError(null)
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      const criteria = parseJson<ICPCriterion[]>(form.criteriaJson, 'Regras de scoring')
      const classificationRanges = parseJson<ICPClassificationRange[]>(form.rangesJson, 'Faixas de classificacao')
      const payload = icpProfileInputSchema.parse({
        name: form.name,
        description: form.description,
        criteria,
        classificationRanges,
        persona: {
          name: form.personaName,
          description: form.personaDescription,
          pains: toList(form.pains),
          desires: toList(form.desires),
          purchaseTriggers: toList(form.purchaseTriggers),
          objections: toList(form.objections),
          bestMessage: form.bestMessage,
          likelyOffer: form.likelyOffer,
          foundOnChannels: toList(form.foundOnChannels),
        },
      })

      const updated = await onSave(payload)
      toast.success('ICP atualizado', { description: updated.name })
      onOpenChange(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nao foi possivel salvar o ICP.'
      setError(message)
      toast.error('Falha ao salvar ICP', { description: message })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[min(720px,96vw)] max-w-[96vw]">
        <form onSubmit={handleSave} className="flex min-h-0 flex-1 flex-col">
          <SheetHeader className="bg-gradient-to-b from-surface-elevated to-surface">
            <div className="flex items-start gap-3 pr-8">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary-muted text-primary">
                <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </span>
              <div>
                <SheetTitle>Editar ICP</SheetTitle>
                <SheetDescription>
                  Ajuste alvo, sinais de compra, red flags, pesos e faixas de classificacao.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <SheetBody className="space-y-6">
            {error && (
              <div className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
                {error}
              </div>
            )}

            <section className="grid gap-3 sm:grid-cols-2">
              <Field label="Nome do modelo" htmlFor="icp-name">
                <Input id="icp-name" value={form.name} onChange={(event) => update('name', event.target.value)} />
              </Field>
              <Field label="Nome do ICP alvo" htmlFor="icp-persona-name">
                <Input
                  id="icp-persona-name"
                  value={form.personaName}
                  onChange={(event) => update('personaName', event.target.value)}
                />
              </Field>
              <Field label="Resumo do modelo" htmlFor="icp-description">
                <Textarea
                  id="icp-description"
                  rows={3}
                  value={form.description}
                  onChange={(event) => update('description', event.target.value)}
                />
              </Field>
              <Field label="Descricao completa" htmlFor="icp-persona-description">
                <Textarea
                  id="icp-persona-description"
                  rows={3}
                  value={form.personaDescription}
                  onChange={(event) => update('personaDescription', event.target.value)}
                />
              </Field>
            </section>

            <section className="grid gap-3 sm:grid-cols-2">
              <Field label="Dores principais" htmlFor="icp-pains" hint="Uma por linha ou separadas por virgula.">
                <Textarea id="icp-pains" rows={4} value={form.pains} onChange={(event) => update('pains', event.target.value)} />
              </Field>
              <Field label="Sinais de compra" htmlFor="icp-triggers">
                <Textarea id="icp-triggers" rows={4} value={form.purchaseTriggers} onChange={(event) => update('purchaseTriggers', event.target.value)} />
              </Field>
              <Field label="Objecoes comuns / red flags" htmlFor="icp-objections">
                <Textarea id="icp-objections" rows={4} value={form.objections} onChange={(event) => update('objections', event.target.value)} />
              </Field>
              <Field label="Potencial de recorrencia esperado" htmlFor="icp-desires">
                <Textarea id="icp-desires" rows={4} value={form.desires} onChange={(event) => update('desires', event.target.value)} />
              </Field>
            </section>

            <section className="grid gap-3 sm:grid-cols-2">
              <Field label="Proposta principal" htmlFor="icp-offer">
                <Textarea id="icp-offer" rows={3} value={form.likelyOffer} onChange={(event) => update('likelyOffer', event.target.value)} />
              </Field>
              <Field label="Mensagem de entrada" htmlFor="icp-message">
                <Textarea id="icp-message" rows={3} value={form.bestMessage} onChange={(event) => update('bestMessage', event.target.value)} />
              </Field>
            </section>

            <Field label="Canais onde encontrar" htmlFor="icp-channels">
              <Input
                id="icp-channels"
                value={form.foundOnChannels.replace(/\n/g, ', ')}
                onChange={(event) => update('foundOnChannels', event.target.value)}
              />
            </Field>

            <section className="grid gap-3">
              <Field
                label="Regras e pesos do scoring"
                htmlFor="icp-criteria"
                hint="JSON estruturado. Pesos negativos funcionam como red flags."
              >
                <Textarea
                  id="icp-criteria"
                  rows={10}
                  value={form.criteriaJson}
                  onChange={(event) => update('criteriaJson', event.target.value)}
                  className="font-mono text-xs"
                />
              </Field>
              <Field label="Faixas de classificacao" htmlFor="icp-ranges" hint="JSON com min/max e tone.">
                <Textarea
                  id="icp-ranges"
                  rows={5}
                  value={form.rangesJson}
                  onChange={(event) => update('rangesJson', event.target.value)}
                  className="font-mono text-xs"
                />
              </Field>
            </section>
          </SheetBody>

          <SheetFooter className="bg-surface/80">
            <Button type="button" variant="ghost" onClick={() => setForm(stateFromProfile(profile))} disabled={isSaving}>
              <RotateCcw aria-hidden />
              Restaurar edicao
            </Button>
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden />
                  Salvando
                </>
              ) : (
                <>
                  <Save aria-hidden />
                  Salvar ICP
                </>
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
