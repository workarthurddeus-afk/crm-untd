'use client'

import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  leadInputSchema,
  type LeadInputSchema,
  type LeadInputSchemaInput,
} from '@/lib/schemas'
import { leadsRepo } from '@/lib/repositories/leads.repository'
import { usePipelineStages } from '@/lib/hooks/use-pipeline-stages'
import type { Lead, LeadOrigin, LeadTemperature } from '@/lib/types'
import { FormField } from './_form-field'
import { getDefaultPipelineStageId } from './lead-form-dialog-utils'

const origins: LeadOrigin[] = [
  'cold-dm',
  'cold-email',
  'in-person',
  'referral',
  'paid-traffic',
  'social',
  'community',
  'event',
  'manual',
  'manual-search',
  'other',
]
const originLabels: Record<LeadOrigin, string> = {
  'cold-dm': 'DM fria',
  'cold-email': 'Cold email',
  'in-person': 'Presencial',
  referral: 'Indicação',
  'paid-traffic': 'Tráfego pago',
  social: 'Rede social',
  community: 'Comunidade',
  event: 'Evento',
  manual: 'Manual',
  'manual-search': 'Busca manual',
  other: 'Outro',
}
const temps: LeadTemperature[] = ['cold', 'warm', 'hot']
const tempLabels: Record<LeadTemperature, string> = {
  cold: 'Frio',
  warm: 'Morno',
  hot: 'Quente',
}

interface Props {
  open: boolean
  onClose: () => void
  initial?: Lead | null
}

interface SectionProps {
  title: string
  children: React.ReactNode
}

function Section({ title, children }: SectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <h3 className="font-display text-sm font-semibold text-text">
          {title}
        </h3>
        <Separator />
      </div>
      <div className="grid grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-2">{children}</div>
    </section>
  )
}

/** Convert a YYYY-MM-DD <input type="date"> value into the ISO format used by Lead seeds. */
function dateInputToIso(value: string | undefined): string | undefined {
  if (!value) return undefined
  // Already ISO? leave it.
  if (value.includes('T')) return value
  return `${value}T00:00:00.000Z`
}

/** Convert an ISO timestamp from a Lead back to YYYY-MM-DD for the date input. */
function isoToDateInput(value: string | undefined): string {
  if (!value) return ''
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(value)
  return m ? m[1]! : ''
}

export function LeadFormDialog({ open, onClose, initial }: Props) {
  const { stages, isLoading: stagesLoading, error: stagesError } = usePipelineStages()
  const isEdit = Boolean(initial)
  const hasPipelineStages = stages.length > 0

  const {
    register,
    handleSubmit,
    control,
    reset,
    setFocus,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<LeadInputSchemaInput, unknown, LeadInputSchema>({
    resolver: zodResolver(leadInputSchema),
    mode: 'onTouched',
    defaultValues: {
      ownerId: 'arthur',
      tagIds: [],
      result: 'open',
    },
  })

  // Reset only when the dialog opens (not on every render, not on close).
  useEffect(() => {
    if (!open) return

    if (initial) {
      reset({
        name: initial.name,
        company: initial.company,
        role: initial.role ?? '',
        niche: initial.niche,
        website: initial.website ?? '',
        instagram: initial.instagram ?? '',
        linkedin: initial.linkedin ?? '',
        email: initial.email ?? '',
        phone: initial.phone ?? '',
        location: {
          city: initial.location?.city ?? '',
          country: initial.location?.country ?? '',
        },
        origin: initial.origin,
        pipelineStageId: initial.pipelineStageId,
        temperature: initial.temperature,
        pain: initial.pain ?? '',
        revenuePotential: initial.revenuePotential,
        nextFollowUpAt: isoToDateInput(initial.nextFollowUpAt),
        ownerId: initial.ownerId,
        tagIds: initial.tagIds,
        result: initial.result,
        internalNotes: initial.internalNotes ?? '',
      })
    } else {
      reset({
        name: '',
        company: '',
        role: '',
        niche: '',
        website: '',
        instagram: '',
        linkedin: '',
        email: '',
        phone: '',
        location: { city: '', country: '' },
        origin: 'cold-dm',
        pipelineStageId: getDefaultPipelineStageId(stages),
        temperature: 'cold',
        pain: '',
        revenuePotential: undefined,
        nextFollowUpAt: '',
        ownerId: 'arthur',
        tagIds: [],
        result: 'open',
        internalNotes: '',
      })
    }
    // Focus the first field once the dialog is mounted.
    const t = window.setTimeout(() => setFocus('name'), 0)
    return () => window.clearTimeout(t)
  }, [open, initial, stages, reset, setFocus])

  useEffect(() => {
    if (!open || initial) return
    const defaultStageId = getDefaultPipelineStageId(stages)
    if (!defaultStageId || getValues('pipelineStageId')) return
    setValue('pipelineStageId', defaultStageId, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true,
    })
  }, [getValues, initial, open, setValue, stages])

  async function onSubmit(values: LeadInputSchema) {
    if (!hasPipelineStages) {
      toast.error('Etapas do pipeline indisponiveis', {
        description: 'Carregue as etapas do pipeline antes de criar o lead.',
      })
      return
    }
    if (!stages.some((stage) => stage.id === values.pipelineStageId)) {
      toast.error('Etapa do pipeline invalida', {
        description: 'Escolha uma etapa carregada antes de salvar.',
      })
      return
    }

    try {
      const payload = {
        ...values,
        nextFollowUpAt: dateInputToIso(values.nextFollowUpAt),
      }

      if (initial) {
        await leadsRepo.update(initial.id, payload)
        toast.success('Lead atualizado', {
          description: 'Mudanças salvas com sucesso.',
        })
      } else {
        await leadsRepo.create({
          ...payload,
          icpScore: 0,
        } as Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>)
        toast.success('Lead criado', {
          description: 'Disponível na tabela.',
        })
      }
      onClose()
    } catch (err) {
      toast.error('Erro ao salvar lead', {
        description: err instanceof Error ? err.message : String(err),
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[85vh] w-[calc(100vw-2rem)] max-w-2xl flex flex-col p-0 gap-0">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 min-h-0 flex-col"
          noValidate
        >
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
            <DialogTitle>{isEdit ? 'Editar lead' : 'Novo lead'}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? 'Atualize os dados deste lead.'
                : 'Crie um novo lead no pipeline. Campos com * são obrigatórios.'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="flex flex-col gap-6">
              {/* IDENTIFICAÇÃO */}
              <Section title="Identificação">
                <FormField
                  label="Nome"
                  htmlFor="lead-name"
                  required
                  error={errors.name?.message}
                >
                  <Input
                    id="lead-name"
                    autoComplete="name"
                    aria-invalid={!!errors.name}
                    {...register('name')}
                  />
                </FormField>
                <FormField
                  label="Empresa"
                  htmlFor="lead-company"
                  required
                  error={errors.company?.message}
                >
                  <Input
                    id="lead-company"
                    autoComplete="organization"
                    aria-invalid={!!errors.company}
                    {...register('company')}
                  />
                </FormField>
                <FormField label="Cargo" htmlFor="lead-role">
                  <Input
                    id="lead-role"
                    autoComplete="organization-title"
                    {...register('role')}
                  />
                </FormField>
                <FormField
                  label="Nicho"
                  htmlFor="lead-niche"
                  required
                  error={errors.niche?.message}
                >
                  <Input
                    id="lead-niche"
                    aria-invalid={!!errors.niche}
                    {...register('niche')}
                  />
                </FormField>
              </Section>

              {/* CONTATO */}
              <Section title="Contato">
                <FormField
                  label="Email"
                  htmlFor="lead-email"
                  error={errors.email?.message}
                >
                  <Input
                    id="lead-email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    {...register('email')}
                  />
                </FormField>
                <FormField label="Telefone" htmlFor="lead-phone">
                  <Input
                    id="lead-phone"
                    type="tel"
                    autoComplete="tel"
                    {...register('phone')}
                  />
                </FormField>
                <FormField label="Instagram" htmlFor="lead-instagram">
                  <Input
                    id="lead-instagram"
                    placeholder="@usuario"
                    {...register('instagram')}
                  />
                </FormField>
                <FormField
                  label="Website"
                  htmlFor="lead-website"
                  error={errors.website?.message}
                  hint="https://..."
                >
                  <Input
                    id="lead-website"
                    type="url"
                    aria-invalid={!!errors.website}
                    {...register('website')}
                  />
                </FormField>
                <FormField label="Cidade" htmlFor="lead-city">
                  <Input
                    id="lead-city"
                    autoComplete="address-level2"
                    {...register('location.city')}
                  />
                </FormField>
                <FormField label="País" htmlFor="lead-country">
                  <Input
                    id="lead-country"
                    autoComplete="country-name"
                    {...register('location.country')}
                  />
                </FormField>
              </Section>

              {/* COMERCIAL / CRM */}
              <Section title="Comercial / CRM">
                <FormField
                  label="Origem"
                  htmlFor="lead-origin"
                  required
                  error={errors.origin?.message}
                >
                  <Controller
                    name="origin"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id="lead-origin"
                          aria-invalid={!!errors.origin}
                        >
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {origins.map((o) => (
                            <SelectItem key={o} value={o}>
                              {originLabels[o]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>
                <FormField
                  label="Temperatura"
                  htmlFor="lead-temperature"
                  required
                  error={errors.temperature?.message}
                >
                  <Controller
                    name="temperature"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id="lead-temperature"
                          aria-invalid={!!errors.temperature}
                        >
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {temps.map((t) => (
                            <SelectItem key={t} value={t}>
                              {tempLabels[t]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>
                <FormField
                  label="Etapa do pipeline"
                  htmlFor="lead-stage"
                  required
                  error={
                    errors.pipelineStageId?.message ??
                    (stagesError
                      ? 'Nao foi possivel carregar as etapas do pipeline.'
                      : !stagesLoading && !hasPipelineStages
                        ? 'Nenhuma etapa do pipeline cadastrada.'
                        : undefined)
                  }
                  className="md:col-span-2"
                >
                  <Controller
                    name="pipelineStageId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={stagesLoading || !hasPipelineStages}
                      >
                        <SelectTrigger
                          id="lead-stage"
                          aria-invalid={!!errors.pipelineStageId || !!stagesError || (!stagesLoading && !hasPipelineStages)}
                        >
                          <SelectValue
                            placeholder={
                              stagesLoading
                                ? 'Carregando etapas...'
                                : hasPipelineStages
                                  ? 'Selecione uma etapa...'
                                  : 'Sem etapas disponiveis'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {stages.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>
                <FormField
                  label="Potencial de receita (R$)"
                  htmlFor="lead-revenue"
                  error={errors.revenuePotential?.message}
                >
                  <Input
                    id="lead-revenue"
                    type="number"
                    inputMode="numeric"
                    step="100"
                    min={0}
                    aria-invalid={!!errors.revenuePotential}
                    {...register('revenuePotential', {
                      setValueAs: (v) =>
                        v === '' || v === null || v === undefined
                          ? undefined
                          : Number(v),
                    })}
                  />
                </FormField>
                <FormField label="Próximo follow-up" htmlFor="lead-followup">
                  <Input
                    id="lead-followup"
                    type="date"
                    {...register('nextFollowUpAt')}
                  />
                </FormField>
              </Section>

              {/* NOTAS */}
              <Section title="Notas">
                <FormField
                  label="Dor principal"
                  htmlFor="lead-pain"
                  className="md:col-span-2"
                  error={errors.pain?.message}
                  hint="O problema central que esse lead precisa resolver."
                >
                  <Textarea
                    id="lead-pain"
                    rows={3}
                    aria-invalid={!!errors.pain}
                    {...register('pain')}
                  />
                </FormField>
                <FormField
                  label="Notas internas"
                  htmlFor="lead-notes"
                   className="md:col-span-2"
                  error={errors.internalNotes?.message}
                >
                  <Textarea
                    id="lead-notes"
                    rows={3}
                    aria-invalid={!!errors.internalNotes}
                    {...register('internalNotes')}
                  />
                </FormField>
              </Section>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 px-6 py-4 border-t border-border-subtle bg-surface-elevated/40 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || stagesLoading || !hasPipelineStages}
              className="w-full sm:w-auto sm:min-w-[128px]"
            >
              {isSubmitting && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              {isSubmitting
                ? isEdit
                  ? 'Salvando...'
                  : 'Criando...'
                : isEdit
                  ? 'Salvar'
                  : 'Criar lead'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
