'use client'

import { useMemo, useState } from 'react'
import {
  BadgeDollarSign,
  BriefcaseBusiness,
  CalendarClock,
  Check,
  ChevronRight,
  CircleDashed,
  Database,
  Loader2,
  PlugZap,
  RefreshCcw,
  Save,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  UserRound,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  buildSettingsUpdateFromForm,
  settingsToFormState,
  type SettingsFormState,
} from '@/components/settings/settings-form-utils'
import { settingsPersistenceCopy } from '@/components/settings/settings-page-config'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useSettings } from '@/lib/hooks/use-settings'
import {
  clearOperationalWorkspaceData,
  loadDemoWorkspaceData,
  resetLocalWorkspace,
} from '@/lib/services/local-workspace.service'
import { cn } from '@/lib/utils/cn'
import type { TaskCategory, TaskImportance } from '@/lib/types'
import type { IntegrationSettings } from '@/lib/types/settings'

type SettingsSection =
  | 'general'
  | 'metrics'
  | 'crm'
  | 'tasks'
  | 'product'
  | 'integrations'
  | 'local-data'

const sections: Array<{
  id: SettingsSection
  label: string
  description: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
}> = [
  { id: 'general', label: 'Geral', description: 'Workspace e preferencias base', icon: UserRound },
  { id: 'metrics', label: 'Metricas', description: 'Numeros manuais para o dashboard', icon: BadgeDollarSign },
  { id: 'crm', label: 'CRM & Pipeline', description: 'Ritmo comercial e follow-up', icon: SlidersHorizontal },
  { id: 'tasks', label: 'Tarefas & Calendario', description: 'Defaults de execucao diaria', icon: CalendarClock },
  { id: 'product', label: 'Produto & Vendas', description: 'Oferta, ICP e argumentos', icon: BriefcaseBusiness },
  { id: 'integrations', label: 'Integracoes', description: 'Conexoes futuras do OS', icon: PlugZap },
  { id: 'local-data', label: 'Dados locais', description: 'Limpeza e modo demonstracao', icon: Database },
]

const languageOptions = [
  { value: 'pt-BR', label: 'Portugues (Brasil)' },
  { value: 'en-US', label: 'English (US)' },
] as const

const currencyOptions = [
  { value: 'BRL', label: 'BRL' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
] as const

const taskImportanceOptions: Array<{ value: TaskImportance; label: string }> = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
]

const taskCategoryOptions: Array<{ value: TaskCategory; label: string }> = [
  { value: 'prospecting', label: 'Prospeccao' },
  { value: 'follow-up', label: 'Follow-up' },
  { value: 'meeting', label: 'Reuniao' },
  { value: 'product', label: 'Produto' },
  { value: 'design', label: 'Design' },
  { value: 'content', label: 'Conteudo' },
  { value: 'social', label: 'Social' },
  { value: 'meta-ads', label: 'Meta Ads' },
  { value: 'strategy', label: 'Estrategia' },
  { value: 'study', label: 'Estudo' },
  { value: 'ops', label: 'Operacoes' },
  { value: 'other', label: 'Outro' },
]

interface FieldProps {
  label: string
  htmlFor: string
  hint?: string
  className?: string
  children: React.ReactNode
}

function Field({ label, htmlFor, hint, className, children }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={htmlFor} className="text-xs font-medium text-text-secondary">
        {label}
      </Label>
      {children}
      <div className="min-h-[1rem] text-[11px] leading-tight text-text-muted">{hint}</div>
    </div>
  )
}

function SectionPanel({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border-subtle bg-surface/60 shadow-sm-token">
      <div className="border-b border-border-subtle p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary-muted text-primary">
            <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold text-text">{title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-text-muted">{description}</p>
          </div>
        </div>
      </div>
      <div className="space-y-6 p-5">{children}</div>
    </section>
  )
}

function NumberInput({
  id,
  value,
  onChange,
  prefix,
}: {
  id: string
  value: number
  onChange: (value: number) => void
  prefix?: string
}) {
  return (
    <div className="relative">
      {prefix && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-text-muted">
          {prefix}
        </span>
      )}
      <Input
        id={id}
        type="number"
        min={0}
        value={value}
        onChange={(event) => onChange(Number(event.target.value || 0))}
        className={cn(prefix && 'pl-10')}
      />
    </div>
  )
}

function SettingsSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-6 py-8 lg:px-8">
      <Skeleton className="h-36 rounded-2xl" />
      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <Skeleton className="h-[420px] rounded-2xl" />
        <Skeleton className="h-[620px] rounded-2xl" />
      </div>
    </div>
  )
}

function IntegrationCard({ integration }: { integration: IntegrationSettings }) {
  const statusLabel =
    integration.status === 'connected'
      ? 'Conectado'
      : integration.status === 'not_connected'
        ? 'Nao conectado'
        : 'Em breve'
  const variant =
    integration.status === 'connected'
      ? 'success'
      : integration.status === 'not_connected'
        ? 'outline'
        : 'secondary'

  return (
    <div className="rounded-xl border border-border-subtle bg-background/35 p-4 transition-colors duration-base hover:border-primary/25">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-sm font-semibold text-text">{integration.name}</p>
          <p className="mt-1 text-xs leading-relaxed text-text-muted">{integration.description}</p>
        </div>
        <Badge variant={variant}>{statusLabel}</Badge>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-text-muted">
        <CircleDashed className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
        Preparado para conectar depois.
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { settings, isLoading, error, actions } = useSettings()
  const [activeSection, setActiveSection] = useState<SettingsSection>('general')
  const [form, setForm] = useState<SettingsFormState | null>(null)
  const [formSeed, setFormSeed] = useState('empty')
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isClearingData, setIsClearingData] = useState(false)
  const [isLoadingDemo, setIsLoadingDemo] = useState(false)
  const settingsSeed = settings ? `${settings.id}|${settings.updatedAt}` : 'empty'
  const canLoadDemoData = process.env.NODE_ENV !== 'production'

  if (settings && !isDirty && settingsSeed !== formSeed) {
    setFormSeed(settingsSeed)
    setForm(settingsToFormState(settings))
  }

  const monthlyNet = useMemo(() => {
    if (!form) return 0
    return form.businessMetrics.revenueReceivedThisMonth - form.businessMetrics.investmentThisMonth
  }, [form])

  const revenueProgress = useMemo(() => {
    if (!form || form.businessMetrics.monthlyRevenueGoal <= 0) return 0
    return Math.min(
      100,
      Math.round(
        (form.businessMetrics.revenueReceivedThisMonth / form.businessMetrics.monthlyRevenueGoal) *
          100
      )
    )
  }, [form])

  function updateSection<
    Section extends keyof SettingsFormState,
    Key extends keyof SettingsFormState[Section],
  >(section: Section, key: Key, value: SettingsFormState[Section][Key]) {
    setForm((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value,
        },
      }
    })
    setIsDirty(true)
  }

  async function handleSave() {
    if (!form) return
    setIsSaving(true)
    try {
      const saved = await actions.updateSettings(buildSettingsUpdateFromForm(form))
      setForm(settingsToFormState(saved))
      setFormSeed(`${saved.id}|${saved.updatedAt}`)
      setIsDirty(false)
      toast.success('Configuracoes salvas', {
        description: 'O UNTD OS ja pode usar esses dados manuais.',
      })
    } catch (err) {
      toast.error('Nao foi possivel salvar', {
        description: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleReset() {
    const confirmed = window.confirm('Restaurar as configuracoes padrao do UNTD OS?')
    if (!confirmed) return
    setIsResetting(true)
    try {
      const reset = await actions.resetSettings()
      setForm(settingsToFormState(reset))
      setFormSeed(`${reset.id}|${reset.updatedAt}`)
      setIsDirty(false)
      toast.success('Configuracoes restauradas')
    } catch (err) {
      toast.error('Nao foi possivel restaurar', {
        description: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setIsResetting(false)
    }
  }

  async function handleClearOperationalData() {
    const confirmed = window.confirm(
      'Limpar leads, tarefas, notas, agenda, feedbacks e interacoes salvos localmente?'
    )
    if (!confirmed) return
    setIsClearingData(true)
    try {
      await clearOperationalWorkspaceData()
      toast.success('Dados operacionais limpos', {
        description: 'O CRM local agora esta pronto para uso real, sem registros de exemplo.',
      })
    } catch (err) {
      toast.error('Nao foi possivel limpar os dados', {
        description: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setIsClearingData(false)
    }
  }

  async function handleResetWorkspaceData() {
    const confirmed = window.confirm(
      'Resetar o CRM local? Isso limpa dados operacionais e restaura as configuracoes padrao.'
    )
    if (!confirmed) return
    setIsClearingData(true)
    try {
      await resetLocalWorkspace()
      const reset = await actions.resetSettings()
      setForm(settingsToFormState(reset))
      setFormSeed(`${reset.id}|${reset.updatedAt}`)
      setIsDirty(false)
      toast.success('CRM local resetado', {
        description: 'Configuracoes padrao preservadas e dados operacionais removidos.',
      })
    } catch (err) {
      toast.error('Nao foi possivel resetar o CRM local', {
        description: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setIsClearingData(false)
    }
  }

  async function handleLoadDemoData() {
    const confirmed = window.confirm(
      'Carregar dados ficticios apenas para testar a interface? Nao use em operacao real.'
    )
    if (!confirmed) return
    setIsLoadingDemo(true)
    try {
      await loadDemoWorkspaceData()
      toast.success('Dados de exemplo carregados', {
        description: 'Use apenas para validacao visual e desenvolvimento.',
      })
    } catch (err) {
      toast.error('Nao foi possivel carregar os dados de exemplo', {
        description: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setIsLoadingDemo(false)
    }
  }

  if (isLoading || !form || !settings) return <SettingsSkeleton />

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-6 py-8 lg:px-8">
      <header className="rounded-2xl border border-border-subtle bg-[radial-gradient(circle_at_top_left,rgba(83,50,234,0.22),transparent_35%),linear-gradient(135deg,rgba(24,22,35,0.94),rgba(15,14,23,0.96))] p-5 shadow-md-token">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/25 bg-primary-muted text-primary">
                <Settings2 className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-text">
                  Configuracoes
                </h1>
                <p className="mt-1 text-sm text-text-muted">
                  Preferencias, metas e dados manuais do UNTD OS
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Badge variant={isDirty ? 'warning' : 'success'}>
              {isDirty ? 'Alteracoes pendentes' : 'Sincronizado'}
            </Badge>
            <Button variant="outline" onClick={() => void handleReset()} disabled={isSaving || isResetting}>
              {isResetting ? <Loader2 className="animate-spin" aria-hidden /> : <RefreshCcw aria-hidden />}
              Restaurar padrao
            </Button>
            <Button onClick={() => void handleSave()} disabled={!isDirty || isSaving || isResetting}>
              {isSaving ? <Loader2 className="animate-spin" aria-hidden /> : <Save aria-hidden />}
              Salvar
            </Button>
          </div>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          Nao foi possivel carregar settings: {error.message}
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border-subtle bg-surface/55 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
            Receita liquida mes
          </p>
          <p className="mt-2 font-display text-2xl font-semibold text-text">
            R$ {monthlyNet.toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="rounded-xl border border-border-subtle bg-surface/55 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
            Meta receita
          </p>
          <p className="mt-2 font-display text-2xl font-semibold text-text">{revenueProgress}%</p>
        </div>
        <div className="rounded-xl border border-border-subtle bg-surface/55 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
            Alvo diario prospeccao
          </p>
          <p className="mt-2 font-display text-2xl font-semibold text-text">
            {form.crm.dailyProspectingTarget}
          </p>
        </div>
      </section>

      <main className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-border-subtle bg-surface/55 p-3 shadow-sm-token">
          <div className="px-2 pb-2 pt-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
              Centro de controle
            </p>
          </div>
          <nav className="space-y-1" aria-label="Secoes de configuracoes">
            {sections.map((section) => {
              const Icon = section.icon
              const active = activeSection === section.id
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  aria-pressed={active}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-3 text-left',
                    'transition-all duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                    active
                      ? 'bg-primary-muted text-text shadow-sm-token'
                      : 'text-text-secondary hover:bg-surface-elevated hover:text-text'
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{section.label}</span>
                      <span className="block truncate text-xs text-text-muted">
                        {section.description}
                      </span>
                    </span>
                  </span>
                  <ChevronRight
                    className={cn('h-4 w-4 shrink-0 transition-transform', active && 'translate-x-0.5 text-primary')}
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </button>
              )
            })}
          </nav>
        </aside>

        <div className="min-w-0">
          {activeSection === 'general' && (
            <SectionPanel
              title="Workspace / Perfil"
              description="A identidade basica que orienta labels, moeda, idioma e contexto diario."
              icon={UserRound}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nome do workspace" htmlFor="workspace-name">
                  <Input
                    id="workspace-name"
                    value={form.workspace.workspaceName}
                    onChange={(event) =>
                      updateSection('workspace', 'workspaceName', event.target.value)
                    }
                  />
                </Field>
                <Field label="Usuario" htmlFor="user-name">
                  <Input
                    id="user-name"
                    value={form.workspace.userName}
                    onChange={(event) => updateSection('workspace', 'userName', event.target.value)}
                  />
                </Field>
                <Field label="Empresa" htmlFor="company-name">
                  <Input
                    id="company-name"
                    value={form.workspace.companyName}
                    onChange={(event) =>
                      updateSection('workspace', 'companyName', event.target.value)
                    }
                  />
                </Field>
                <Field label="Timezone" htmlFor="timezone">
                  <Input
                    id="timezone"
                    value={form.workspace.timezone}
                    onChange={(event) => updateSection('workspace', 'timezone', event.target.value)}
                  />
                </Field>
                <Field label="Idioma" htmlFor="language">
                  <Select
                    value={form.workspace.language}
                    onValueChange={(value) =>
                      updateSection('workspace', 'language', value as SettingsFormState['workspace']['language'])
                    }
                  >
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languageOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Moeda" htmlFor="currency">
                  <Select
                    value={form.workspace.currency}
                    onValueChange={(value) =>
                      updateSection('workspace', 'currency', value as SettingsFormState['workspace']['currency'])
                    }
                  >
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="Descricao da empresa" htmlFor="company-description">
                <Textarea
                  id="company-description"
                  value={form.workspace.companyDescription}
                  onChange={(event) =>
                    updateSection('workspace', 'companyDescription', event.target.value)
                  }
                  rows={4}
                />
              </Field>
            </SectionPanel>
          )}

          {activeSection === 'metrics' && (
            <SectionPanel
              title="Metricas do negocio"
              description="Numeros manuais preparados para alimentar o Dashboard sem depender de integracoes."
              icon={BadgeDollarSign}
            >
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <Field label="MRR atual" htmlFor="current-mrr">
                  <NumberInput id="current-mrr" prefix="R$" value={form.businessMetrics.currentMRR} onChange={(value) => updateSection('businessMetrics', 'currentMRR', value)} />
                </Field>
                <Field label="Assinantes ativos" htmlFor="active-subscribers">
                  <NumberInput id="active-subscribers" value={form.businessMetrics.activeSubscribers} onChange={(value) => updateSection('businessMetrics', 'activeSubscribers', value)} />
                </Field>
                <Field label="Novos assinantes no mes" htmlFor="new-subscribers">
                  <NumberInput id="new-subscribers" value={form.businessMetrics.newSubscribersThisMonth} onChange={(value) => updateSection('businessMetrics', 'newSubscribersThisMonth', value)} />
                </Field>
                <Field label="Cancelamentos no mes" htmlFor="cancellations">
                  <NumberInput id="cancellations" value={form.businessMetrics.cancellationsThisMonth} onChange={(value) => updateSection('businessMetrics', 'cancellationsThisMonth', value)} />
                </Field>
                <Field label="Receita recebida no mes" htmlFor="revenue-received">
                  <NumberInput id="revenue-received" prefix="R$" value={form.businessMetrics.revenueReceivedThisMonth} onChange={(value) => updateSection('businessMetrics', 'revenueReceivedThisMonth', value)} />
                </Field>
                <Field label="Investimento no mes" htmlFor="investment">
                  <NumberInput id="investment" prefix="R$" value={form.businessMetrics.investmentThisMonth} onChange={(value) => updateSection('businessMetrics', 'investmentThisMonth', value)} />
                </Field>
                <Field label="Meta de receita mensal" htmlFor="revenue-goal">
                  <NumberInput id="revenue-goal" prefix="R$" value={form.businessMetrics.monthlyRevenueGoal} onChange={(value) => updateSection('businessMetrics', 'monthlyRevenueGoal', value)} />
                </Field>
                <Field label="Meta mensal de prospeccao" htmlFor="prospecting-goal">
                  <NumberInput id="prospecting-goal" value={form.businessMetrics.monthlyProspectingGoal} onChange={(value) => updateSection('businessMetrics', 'monthlyProspectingGoal', value)} />
                </Field>
                <Field label="Meta mensal de clientes" htmlFor="customer-goal">
                  <NumberInput id="customer-goal" value={form.businessMetrics.monthlyCustomerGoal} onChange={(value) => updateSection('businessMetrics', 'monthlyCustomerGoal', value)} />
                </Field>
              </div>
            </SectionPanel>
          )}

          {activeSection === 'crm' && (
            <SectionPanel
              title="CRM & Pipeline"
              description="Preferencias que definem urgencia comercial, follow-up e qualidade de oportunidade."
              icon={SlidersHorizontal}
            >
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <Field label="Lead parado apos dias" htmlFor="stale-lead-days">
                  <NumberInput id="stale-lead-days" value={form.crm.staleLeadDays} onChange={(value) => updateSection('crm', 'staleLeadDays', value)} />
                </Field>
                <Field label="Follow-up padrao em dias" htmlFor="followup-days">
                  <NumberInput id="followup-days" value={form.crm.defaultFollowUpDays} onChange={(value) => updateSection('crm', 'defaultFollowUpDays', value)} />
                </Field>
                <Field label="ICP para lead quente" htmlFor="hot-threshold" hint="0 a 100">
                  <NumberInput id="hot-threshold" value={form.crm.hotLeadIcpThreshold} onChange={(value) => updateSection('crm', 'hotLeadIcpThreshold', value)} />
                </Field>
                <Field label="Lembrar proposta em dias" htmlFor="proposal-reminder">
                  <NumberInput id="proposal-reminder" value={form.crm.proposalReminderDays} onChange={(value) => updateSection('crm', 'proposalReminderDays', value)} />
                </Field>
                <Field label="Potencial de receita padrao" htmlFor="revenue-potential">
                  <NumberInput id="revenue-potential" prefix="R$" value={form.crm.defaultRevenuePotential} onChange={(value) => updateSection('crm', 'defaultRevenuePotential', value)} />
                </Field>
                <Field label="Alvo diario de prospeccao" htmlFor="daily-prospecting">
                  <NumberInput id="daily-prospecting" value={form.crm.dailyProspectingTarget} onChange={(value) => updateSection('crm', 'dailyProspectingTarget', value)} />
                </Field>
              </div>
            </SectionPanel>
          )}

          {activeSection === 'tasks' && (
            <SectionPanel
              title="Tarefas & Calendario"
              description="Defaults para criar acoes mais rapido e manter a agenda previsivel."
              icon={CalendarClock}
            >
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <Field label="Importancia padrao" htmlFor="task-importance">
                  <Select value={form.tasksCalendar.defaultTaskImportance} onValueChange={(value) => updateSection('tasksCalendar', 'defaultTaskImportance', value as TaskImportance)}>
                    <SelectTrigger id="task-importance"><SelectValue /></SelectTrigger>
                    <SelectContent>{taskImportanceOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Categoria padrao" htmlFor="task-category">
                  <Select value={form.tasksCalendar.defaultTaskCategory} onValueChange={(value) => updateSection('tasksCalendar', 'defaultTaskCategory', value as TaskCategory)}>
                    <SelectTrigger id="task-category"><SelectValue /></SelectTrigger>
                    <SelectContent>{taskCategoryOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Duracao padrao de evento" htmlFor="event-duration" hint="Minutos">
                  <NumberInput id="event-duration" value={form.tasksCalendar.defaultEventDurationMinutes} onChange={(value) => updateSection('tasksCalendar', 'defaultEventDurationMinutes', value)} />
                </Field>
                <Field label="Inicio do dia" htmlFor="workday-start">
                  <Input id="workday-start" type="time" value={form.tasksCalendar.workdayStart} onChange={(event) => updateSection('tasksCalendar', 'workdayStart', event.target.value)} />
                </Field>
                <Field label="Fim do dia" htmlFor="workday-end">
                  <Input id="workday-end" type="time" value={form.tasksCalendar.workdayEnd} onChange={(event) => updateSection('tasksCalendar', 'workdayEnd', event.target.value)} />
                </Field>
              </div>
              <div className="rounded-xl border border-border-subtle bg-background/35 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-text">Mostrar tarefas concluidas por padrao</p>
                    <p className="mt-1 text-sm text-text-muted">
                      Mantem historico visivel em listas operacionais futuras.
                    </p>
                  </div>
                  <Switch
                    checked={form.tasksCalendar.showCompletedTasksByDefault}
                    onCheckedChange={(value) =>
                      updateSection('tasksCalendar', 'showCompletedTasksByDefault', value)
                    }
                  />
                </div>
              </div>
            </SectionPanel>
          )}

          {activeSection === 'product' && (
            <SectionPanel
              title="Produto & Vendas"
              description="Contexto comercial para copy, notas, tarefas e futuras sugestoes de IA."
              icon={BriefcaseBusiness}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Produto" htmlFor="product-name">
                  <Input id="product-name" value={form.productSales.productName} onChange={(event) => updateSection('productSales', 'productName', event.target.value)} />
                </Field>
                <Field label="Publico alvo" htmlFor="target-audience">
                  <Input id="target-audience" value={form.productSales.targetAudience} onChange={(event) => updateSection('productSales', 'targetAudience', event.target.value)} />
                </Field>
              </div>
              <Field label="Descricao do produto" htmlFor="product-description">
                <Textarea id="product-description" value={form.productSales.productDescription} onChange={(event) => updateSection('productSales', 'productDescription', event.target.value)} rows={4} />
              </Field>
              <Field label="Oferta principal" htmlFor="core-offer">
                <Textarea id="core-offer" value={form.productSales.coreOffer} onChange={(event) => updateSection('productSales', 'coreOffer', event.target.value)} rows={3} />
              </Field>
              <div className="grid gap-4 lg:grid-cols-2">
                <Field label="Objecoes principais" htmlFor="main-objections" hint="Uma por linha ou separadas por virgula.">
                  <Textarea id="main-objections" value={form.productSales.mainObjections} onChange={(event) => updateSection('productSales', 'mainObjections', event.target.value)} rows={5} />
                </Field>
                <Field label="Beneficios chave" htmlFor="key-benefits" hint="Uma por linha ou separadas por virgula.">
                  <Textarea id="key-benefits" value={form.productSales.keyBenefits} onChange={(event) => updateSection('productSales', 'keyBenefits', event.target.value)} rows={5} />
                </Field>
              </div>
              <Field label="Notas de venda" htmlFor="sales-notes">
                <Textarea id="sales-notes" value={form.productSales.salesNotes} onChange={(event) => updateSection('productSales', 'salesNotes', event.target.value)} rows={4} />
              </Field>
            </SectionPanel>
          )}

          {activeSection === 'integrations' && (
            <SectionPanel
              title="Integracoes futuras"
              description="Status visual das conexoes que vao alimentar Social Media, Ads, agenda, receita e email."
              icon={PlugZap}
            >
              <div className="grid gap-3 lg:grid-cols-2">
                {settings.integrations.map((integration) => (
                  <IntegrationCard key={integration.key} integration={integration} />
                ))}
              </div>
              <Separator />
              <div className="rounded-xl border border-primary/20 bg-primary-muted p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" strokeWidth={1.75} aria-hidden />
                  <div>
                    <p className="text-sm font-medium text-text">Sem conexoes reais por enquanto</p>
                    <p className="mt-1 text-sm leading-relaxed text-text-muted">
                      Esta area deixa o produto pronto para integrar depois, mas nenhum token,
                      OAuth ou webhook foi implementado agora.
                    </p>
                  </div>
                </div>
              </div>
            </SectionPanel>
          )}

          {activeSection === 'local-data' && (
            <SectionPanel
              title="Dados locais"
              description="Controle os registros salvos neste navegador antes de conectar Supabase e deploy."
              icon={Database}
            >
              <div className="grid gap-3 lg:grid-cols-2">
                <div className="rounded-xl border border-border-subtle bg-background/35 p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-danger/25 bg-danger/10 text-danger">
                      <Trash2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="font-display text-sm font-semibold text-text">
                        Limpar dados operacionais
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-text-muted">
                        Remove leads, tarefas, notas, eventos, feedbacks e interacoes locais. As
                        preferencias do workspace continuam preservadas.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => void handleClearOperationalData()}
                        disabled={isClearingData || isLoadingDemo}
                      >
                        {isClearingData ? (
                          <Loader2 className="animate-spin" aria-hidden />
                        ) : (
                          <Trash2 aria-hidden />
                        )}
                        Limpar operacao
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border-subtle bg-background/35 p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary-muted text-primary">
                      <RefreshCcw className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="font-display text-sm font-semibold text-text">
                        Resetar CRM local
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-text-muted">
                        Volta as configuracoes para os defaults reais do UNTD OS e deixa a base
                        operacional vazia para iniciar o uso real.
                      </p>
                      <Button
                        className="mt-4"
                        onClick={() => void handleResetWorkspaceData()}
                        disabled={isClearingData || isLoadingDemo}
                      >
                        {isClearingData ? (
                          <Loader2 className="animate-spin" aria-hidden />
                        ) : (
                          <RefreshCcw aria-hidden />
                        )}
                        Resetar local
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {canLoadDemoData && (
                <div className="rounded-xl border border-warning/25 bg-warning/10 p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-warning" strokeWidth={1.75} aria-hidden />
                        <p className="font-display text-sm font-semibold text-text">
                          Dados de exemplo para desenvolvimento
                        </p>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-text-muted">
                        Carrega dados ficticios apenas para testar a interface. Nao use em
                        operacao real.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => void handleLoadDemoData()}
                      disabled={isClearingData || isLoadingDemo}
                    >
                      {isLoadingDemo ? (
                        <Loader2 className="animate-spin" aria-hidden />
                      ) : (
                        <Sparkles aria-hidden />
                      )}
                      Carregar exemplo
                    </Button>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-primary/20 bg-primary-muted p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" strokeWidth={1.75} aria-hidden />
                  <div>
                    <p className="text-sm font-medium text-text">Workspace limpo por padrao</p>
                    <p className="mt-1 text-sm leading-relaxed text-text-muted">
                      Seeds continuam disponiveis para testes e desenvolvimento, mas nao entram
                      automaticamente no runtime normal.
                    </p>
                  </div>
                </div>
              </div>
            </SectionPanel>
          )}
        </div>
      </main>

      <div className="flex items-center gap-2 text-xs text-text-muted">
        <Check className="h-3.5 w-3.5 text-success" strokeWidth={1.75} aria-hidden />
        {settingsPersistenceCopy}
      </div>
    </div>
  )
}
