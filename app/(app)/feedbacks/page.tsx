'use client'

import {
  AlertTriangle,
  Archive,
  Bug,
  Inbox,
  Megaphone,
  Plus,
  Repeat2,
  Search,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { FeedbackCard } from '@/components/feedbacks/feedback-card'
import { FeedbackDetailSheet } from '@/components/feedbacks/feedback-detail-sheet'
import { FeedbackFormSheet } from '@/components/feedbacks/feedback-form-sheet'
import {
  filterFeedbacksForView,
  getFeedbackQuickStats,
  searchFeedbacks,
  type FeedbackView,
} from '@/components/feedbacks/feedback-view-utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useFeedbacks } from '@/lib/hooks/use-feedbacks'
import { useLeads } from '@/lib/hooks/use-leads'
import {
  convertFeedbackToNotePayload,
  convertFeedbackToTaskPayload,
} from '@/lib/services/feedbacks.service'
import { createStrategicNote } from '@/lib/services/notes.service'
import { createTask } from '@/lib/services/tasks.service'
import { cn } from '@/lib/utils/cn'
import type { Feedback, FeedbackFilters } from '@/lib/types'

const archivedFeedbackFilters: FeedbackFilters = { isArchived: true }

const views: Array<{
  id: FeedbackView
  label: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
}> = [
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'high-impact', label: 'Alto impacto', icon: Target },
  { id: 'recurring', label: 'Recorrentes', icon: Repeat2 },
  { id: 'sales', label: 'Objecoes comerciais', icon: Megaphone },
  { id: 'product', label: 'Sinais de produto', icon: Bug },
  { id: 'churn', label: 'Riscos de churn', icon: AlertTriangle },
  { id: 'resolved', label: 'Resolvidos', icon: Sparkles },
  { id: 'archived', label: 'Arquivados', icon: Archive },
]

function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'default',
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  tone?: 'default' | 'danger' | 'warning' | 'success' | 'info'
}) {
  const toneClass = {
    default: 'border-primary/20 bg-primary/10 text-primary',
    danger: 'border-danger/25 bg-danger/10 text-danger',
    warning: 'border-warning/25 bg-warning/10 text-warning',
    success: 'border-success/25 bg-success/10 text-success',
    info: 'border-info/25 bg-info/10 text-info',
  }[tone]

  return (
    <div className="rounded-xl border border-border-subtle bg-surface/55 p-4 shadow-sm-token">
      <div className="flex items-center justify-between gap-4">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
          {label}
        </span>
        <span className={cn('rounded-lg border p-2', toneClass)}>
          <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
        </span>
      </div>
      <p className="mt-3 font-display text-2xl font-semibold text-text">{value}</p>
    </div>
  )
}

function FeedbacksSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="rounded-xl border border-border-subtle bg-surface/45 p-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="mt-4 h-5 w-3/4" />
          <Skeleton className="mt-2 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-2/3" />
        </div>
      ))}
    </div>
  )
}

function EmptyFeedbackState({
  query,
  view,
  onCreate,
}: {
  query: string
  view: FeedbackView
  onCreate: () => void
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface/35 p-10 text-center">
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-primary/25 bg-primary-muted text-primary">
        <Sparkles className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      </span>
      <h2 className="mt-4 font-display text-lg font-semibold text-text">
        {query ? 'Nenhum sinal encontrado' : 'Inbox limpo por aqui'}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-text-muted">
        {query
          ? 'A busca ou aba atual nao retornou feedbacks. Ajuste o termo para revisar outros sinais.'
          : view === 'archived'
            ? 'Nenhum feedback arquivado ainda.'
            : 'Capture dores, objecoes, pedidos e aprendizados do mercado assim que aparecerem.'}
      </p>
      {!query && view !== 'archived' && (
        <Button className="mt-5" onClick={onCreate}>
          <Plus aria-hidden /> Novo feedback
        </Button>
      )}
    </div>
  )
}

export default function FeedbacksPage() {
  const [query, setQuery] = useState('')
  const [activeView, setActiveView] = useState<FeedbackView>('inbox')
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(null)

  const activeFeedbacks = useFeedbacks()
  const archivedFeedbacks = useFeedbacks(archivedFeedbackFilters)
  const { leads } = useLeads()
  const actions = activeFeedbacks.actions

  const allFeedbacks = useMemo(
    () => [...activeFeedbacks.feedbacks, ...archivedFeedbacks.feedbacks],
    [activeFeedbacks.feedbacks, archivedFeedbacks.feedbacks]
  )

  const selectedFeedback = useMemo(
    () => allFeedbacks.find((feedback) => feedback.id === selectedFeedbackId) ?? null,
    [allFeedbacks, selectedFeedbackId]
  )

  const editingFeedback = useMemo(
    () => allFeedbacks.find((feedback) => feedback.id === editingFeedbackId) ?? null,
    [allFeedbacks, editingFeedbackId]
  )

  const visibleFeedbacks = useMemo(() => {
    const source = activeView === 'archived' ? archivedFeedbacks.feedbacks : allFeedbacks
    return searchFeedbacks(filterFeedbacksForView(source, activeView), query)
  }, [activeView, allFeedbacks, archivedFeedbacks.feedbacks, query])

  const quickStats = useMemo(() => getFeedbackQuickStats(allFeedbacks), [allFeedbacks])
  const isLoading = activeFeedbacks.isLoading || archivedFeedbacks.isLoading
  const error = activeFeedbacks.error ?? archivedFeedbacks.error

  function openCreateForm() {
    setEditingFeedbackId(null)
    setIsFormOpen(true)
  }

  function openEditForm(feedback: Feedback) {
    setEditingFeedbackId(feedback.id)
    setIsDetailOpen(false)
    setIsFormOpen(true)
  }

  function selectFeedback(feedback: Feedback) {
    setSelectedFeedbackId(feedback.id)
    setIsDetailOpen(true)
  }

  async function convertToNote(feedback: Feedback): Promise<Feedback> {
    if (feedback.relatedNoteId) return feedback
    const note = await createStrategicNote(convertFeedbackToNotePayload(feedback))
    return actions.updateFeedback(feedback.id, {
      relatedNoteId: note.id,
      status: 'converted_to_note',
    })
  }

  async function convertToTask(feedback: Feedback): Promise<Feedback> {
    if (feedback.relatedTaskId) return feedback
    const task = await createTask(convertFeedbackToTaskPayload(feedback))
    return actions.updateFeedback(feedback.id, {
      relatedTaskId: task.id,
      status: 'converted_to_task',
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-6 py-8 lg:px-8">
      <header className="rounded-2xl border border-border-subtle bg-[radial-gradient(circle_at_top_left,rgba(83,50,234,0.20),transparent_34%),linear-gradient(135deg,rgba(24,22,35,0.92),rgba(15,14,23,0.94))] p-5 shadow-md-token">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/25 bg-primary-muted text-primary">
                <TrendingUp className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-text">
                  Feedbacks
                </h1>
                <p className="mt-1 text-sm text-text-muted">
                  Dores, objecoes e sinais reais do mercado
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 sm:w-[360px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar dor, tag, lead, sinal..."
                aria-label="Buscar feedbacks"
                className="pl-9"
              />
            </div>
            <Button onClick={openCreateForm}>
              <Plus aria-hidden /> Novo feedback
            </Button>
          </div>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Novos" value={quickStats.new} icon={Inbox} />
        <StatCard label="Alto impacto" value={quickStats.highImpact} icon={Target} tone="warning" />
        <StatCard label="Recorrentes" value={quickStats.recurring} icon={Repeat2} tone="info" />
        <StatCard label="Risco de churn" value={quickStats.churnRisks} icon={AlertTriangle} tone="danger" />
        <StatCard label="Sinais de produto" value={quickStats.productSignals} icon={Bug} tone="success" />
      </section>

      <main className="grid min-h-0 gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-border-subtle bg-surface/55 p-3 shadow-sm-token">
          <div className="px-2 pb-2 pt-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
              Triagem
            </p>
          </div>
          <nav className="space-y-1" aria-label="Filtros de feedback">
            {views.map((view) => {
              const Icon = view.icon
              const active = activeView === view.id
              const count = filterFeedbacksForView(
                view.id === 'archived' ? archivedFeedbacks.feedbacks : allFeedbacks,
                view.id
              ).length
              return (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => setActiveView(view.id)}
                  aria-pressed={active}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm',
                    'transition-all duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                    active
                      ? 'bg-primary-muted text-text shadow-sm-token'
                      : 'text-text-secondary hover:bg-surface-elevated hover:text-text'
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                    <span className="truncate">{view.label}</span>
                  </span>
                  <Badge variant={active ? 'default' : 'secondary'}>{count}</Badge>
                </button>
              )
            })}
          </nav>
        </aside>

        <section className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-text">
                {visibleFeedbacks.length} sinal{visibleFeedbacks.length === 1 ? '' : 's'}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Revisao operacional para transformar aprendizado em acao.
              </p>
            </div>
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-xs font-medium text-text-muted transition-colors duration-fast hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Limpar busca
              </button>
            )}
          </div>

          {error ? (
            <div className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
              Nao foi possivel carregar os feedbacks: {error.message}
            </div>
          ) : isLoading ? (
            <FeedbacksSkeleton />
          ) : visibleFeedbacks.length > 0 ? (
            <div className="grid gap-3">
              {visibleFeedbacks.map((feedback) => (
                <FeedbackCard
                  key={feedback.id}
                  feedback={feedback}
                  leads={leads}
                  onSelect={selectFeedback}
                />
              ))}
            </div>
          ) : (
            <EmptyFeedbackState query={query} view={activeView} onCreate={openCreateForm} />
          )}
        </section>
      </main>

      <FeedbackFormSheet
        open={isFormOpen}
        feedback={editingFeedback}
        leads={leads}
        onOpenChange={setIsFormOpen}
        onCreate={actions.createFeedback}
        onUpdate={actions.updateFeedback}
        onSaved={(feedback) => {
          setSelectedFeedbackId(feedback.id)
        }}
      />

      <FeedbackDetailSheet
        open={isDetailOpen}
        feedback={selectedFeedback}
        leads={leads}
        onOpenChange={setIsDetailOpen}
        onEdit={openEditForm}
        onResolve={actions.resolveFeedback}
        onReopen={actions.reopenFeedback}
        onArchive={actions.archiveFeedback}
        onRestore={actions.unarchiveFeedback}
        onPin={actions.pinFeedback}
        onUnpin={actions.unpinFeedback}
        onConvertToNote={convertToNote}
        onConvertToTask={convertToTask}
      />
    </div>
  )
}
