import type {
  Feedback,
  FeedbackFilters,
  FeedbackFrequency,
  FeedbackImpact,
  FeedbackInput,
  FeedbackPriority,
  FeedbackSentiment,
  FeedbackSource,
  FeedbackStatus,
  FeedbackType,
  Lead,
} from '@/lib/types'
import { normalizeFeedbackTag } from '@/lib/utils/feedbacks'

export const NO_FEEDBACK_RELATION_VALUE = '__none__'

export type FeedbackView =
  | 'inbox'
  | 'high-impact'
  | 'recurring'
  | 'sales'
  | 'product'
  | 'churn'
  | 'resolved'
  | 'archived'

export const FEEDBACK_TYPE_OPTIONS: Array<{ value: FeedbackType; label: string }> = [
  { value: 'pain', label: 'Dor' },
  { value: 'objection', label: 'Objecao' },
  { value: 'feature_request', label: 'Pedido de feature' },
  { value: 'complaint', label: 'Reclamacao' },
  { value: 'compliment', label: 'Elogio' },
  { value: 'bug', label: 'Bug' },
  { value: 'improvement', label: 'Melhoria' },
  { value: 'sales_insight', label: 'Insight comercial' },
  { value: 'product_insight', label: 'Sinal de produto' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'support', label: 'Suporte' },
  { value: 'churn_risk', label: 'Risco de churn' },
  { value: 'other', label: 'Outro' },
]

export const FEEDBACK_SOURCE_OPTIONS: Array<{ value: FeedbackSource; label: string }> = [
  { value: 'lead', label: 'Lead' },
  { value: 'customer', label: 'Cliente' },
  { value: 'call', label: 'Call' },
  { value: 'meeting', label: 'Reuniao' },
  { value: 'dm', label: 'DM' },
  { value: 'email', label: 'Email' },
  { value: 'social', label: 'Social' },
  { value: 'support', label: 'Suporte' },
  { value: 'internal', label: 'Interno' },
  { value: 'ai', label: 'IA' },
  { value: 'manual', label: 'Manual' },
]

export const FEEDBACK_STATUS_OPTIONS: Array<{ value: FeedbackStatus; label: string }> = [
  { value: 'new', label: 'Novo' },
  { value: 'reviewing', label: 'Em revisao' },
  { value: 'planned', label: 'Planejado' },
  { value: 'converted_to_task', label: 'Virou tarefa' },
  { value: 'converted_to_note', label: 'Virou nota' },
  { value: 'resolved', label: 'Resolvido' },
  { value: 'archived', label: 'Arquivado' },
]

export const FEEDBACK_IMPACT_OPTIONS: Array<{ value: FeedbackImpact; label: string }> = [
  { value: 'low', label: 'Baixo' },
  { value: 'medium', label: 'Medio' },
  { value: 'high', label: 'Alto' },
  { value: 'critical', label: 'Critico' },
]

export const FEEDBACK_FREQUENCY_OPTIONS: Array<{ value: FeedbackFrequency; label: string }> = [
  { value: 'one_off', label: 'Pontual' },
  { value: 'recurring', label: 'Recorrente' },
  { value: 'very_recurring', label: 'Muito recorrente' },
]

export const FEEDBACK_SENTIMENT_OPTIONS: Array<{ value: FeedbackSentiment; label: string }> = [
  { value: 'negative', label: 'Negativo' },
  { value: 'neutral', label: 'Neutro' },
  { value: 'positive', label: 'Positivo' },
  { value: 'mixed', label: 'Misto' },
]

export const FEEDBACK_PRIORITY_OPTIONS: Array<{ value: FeedbackPriority; label: string }> = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' },
]

const productTypes: FeedbackType[] = ['feature_request', 'bug', 'improvement', 'product_insight']
const salesTypes: FeedbackType[] = ['objection', 'sales_insight', 'pricing', 'churn_risk']
const openStatuses: FeedbackStatus[] = ['new', 'reviewing', 'planned', 'converted_to_note', 'converted_to_task']

export interface FeedbackFormState {
  title: string
  content: string
  type: FeedbackType
  source: FeedbackSource
  status: FeedbackStatus
  impact: FeedbackImpact
  frequency: FeedbackFrequency
  sentiment: FeedbackSentiment
  priority: FeedbackPriority
  tags: string
  relatedLeadId: string
  capturedDate: string
  capturedTime: string
  isPinned: boolean
}

export function getDefaultFeedbackFormState(currentDate = new Date()): FeedbackFormState {
  return {
    title: '',
    content: '',
    type: 'pain',
    source: 'manual',
    status: 'new',
    impact: 'medium',
    frequency: 'one_off',
    sentiment: 'neutral',
    priority: 'medium',
    tags: '',
    relatedLeadId: NO_FEEDBACK_RELATION_VALUE,
    capturedDate: currentDate.toISOString().slice(0, 10),
    capturedTime: currentDate.toISOString().slice(11, 16),
    isPinned: false,
  }
}

export function feedbackToFormState(feedback: Feedback | null | undefined): FeedbackFormState {
  if (!feedback) return getDefaultFeedbackFormState()

  return {
    title: feedback.title,
    content: feedback.content,
    type: feedback.type,
    source: feedback.source,
    status: feedback.status,
    impact: feedback.impact,
    frequency: feedback.frequency,
    sentiment: feedback.sentiment,
    priority: feedback.priority,
    tags: feedback.tags.join(', '),
    relatedLeadId: feedback.relatedLeadId ?? NO_FEEDBACK_RELATION_VALUE,
    capturedDate: feedback.capturedAt.slice(0, 10),
    capturedTime: feedback.capturedAt.slice(11, 16),
    isPinned: feedback.isPinned,
  }
}

export function buildFeedbackPayloadFromForm(form: FeedbackFormState): FeedbackInput {
  return {
    title: form.title.trim(),
    content: form.content.trim(),
    type: form.type,
    source: form.source,
    status: form.status,
    impact: form.impact,
    frequency: form.frequency,
    sentiment: form.sentiment,
    priority: form.priority,
    tags: parseFeedbackTags(form.tags),
    relatedLeadId:
      form.relatedLeadId === NO_FEEDBACK_RELATION_VALUE ? undefined : form.relatedLeadId,
    isArchived: form.status === 'archived',
    isPinned: form.isPinned,
    capturedAt: combineDateTimeUtc(form.capturedDate, form.capturedTime),
  }
}

export function parseFeedbackTags(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(',')
        .map((tag) => normalizeFeedbackTag(tag))
        .filter(Boolean)
    )
  )
}

export function filterFeedbacksForView(feedbacks: Feedback[], view: FeedbackView): Feedback[] {
  return feedbacks.filter((feedback) => {
    if (view === 'archived') return feedback.isArchived
    if (feedback.isArchived) return false
    if (view === 'inbox') return openStatuses.includes(feedback.status)
    if (view === 'high-impact') return feedback.impact === 'high' || feedback.impact === 'critical'
    if (view === 'recurring') {
      return feedback.frequency === 'recurring' || feedback.frequency === 'very_recurring'
    }
    if (view === 'sales') return salesTypes.includes(feedback.type)
    if (view === 'product') return productTypes.includes(feedback.type)
    if (view === 'churn') return feedback.type === 'churn_risk'
    if (view === 'resolved') return feedback.status === 'resolved'
    return true
  })
}

export function searchFeedbacks(feedbacks: Feedback[], query: string): Feedback[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return feedbacks

  return feedbacks.filter((feedback) => {
    const haystack = [
      feedback.title,
      feedback.content,
      feedback.type,
      feedback.source,
      feedback.status,
      feedback.impact,
      feedback.priority,
      feedback.frequency,
      feedback.sentiment,
      ...feedback.tags,
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(normalized)
  })
}

export function getFeedbackQuickStats(feedbacks: Feedback[]) {
  const active = feedbacks.filter((feedback) => !feedback.isArchived)
  return {
    new: active.filter((feedback) => feedback.status === 'new').length,
    highImpact: active.filter(
      (feedback) => feedback.impact === 'high' || feedback.impact === 'critical'
    ).length,
    recurring: active.filter(
      (feedback) =>
        feedback.frequency === 'recurring' || feedback.frequency === 'very_recurring'
    ).length,
    churnRisks: active.filter((feedback) => feedback.type === 'churn_risk').length,
    productSignals: active.filter((feedback) => productTypes.includes(feedback.type)).length,
  }
}

export function getFeedbackFiltersForView(view: FeedbackView): FeedbackFilters | undefined {
  if (view === 'archived') return { isArchived: true }
  return undefined
}

export function getLeadLabel(leadId: string | null | undefined, leads: Array<Pick<Lead, 'id' | 'name' | 'company'>>): string | null {
  if (!leadId) return null
  const lead = leads.find((item) => item.id === leadId)
  if (!lead) return 'Lead relacionado'
  return `${lead.name} · ${lead.company}`
}

export function getFeedbackTypeLabel(type: FeedbackType): string {
  return FEEDBACK_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type
}

export function getFeedbackStatusLabel(status: FeedbackStatus): string {
  return FEEDBACK_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status
}

export function getFeedbackImpactLabel(impact: FeedbackImpact): string {
  return FEEDBACK_IMPACT_OPTIONS.find((option) => option.value === impact)?.label ?? impact
}

export function getFeedbackPriorityLabel(priority: FeedbackPriority): string {
  return FEEDBACK_PRIORITY_OPTIONS.find((option) => option.value === priority)?.label ?? priority
}

export function getFeedbackFrequencyLabel(frequency: FeedbackFrequency): string {
  return FEEDBACK_FREQUENCY_OPTIONS.find((option) => option.value === frequency)?.label ?? frequency
}

export function getFeedbackSentimentLabel(sentiment: FeedbackSentiment): string {
  return FEEDBACK_SENTIMENT_OPTIONS.find((option) => option.value === sentiment)?.label ?? sentiment
}

export function getFeedbackSourceLabel(source: FeedbackSource): string {
  return FEEDBACK_SOURCE_OPTIONS.find((option) => option.value === source)?.label ?? source
}

export function getFeedbackTone(feedback: Pick<Feedback, 'impact' | 'sentiment' | 'type'>) {
  if (feedback.type === 'churn_risk' || feedback.impact === 'critical') return 'danger'
  if (feedback.impact === 'high') return 'warning'
  if (feedback.sentiment === 'positive') return 'success'
  if (productTypes.includes(feedback.type)) return 'info'
  return 'default'
}

export function formatFeedbackDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function combineDateTimeUtc(date: string, time: string): string {
  const safeDate = date || new Date().toISOString().slice(0, 10)
  const safeTime = time || '09:00'
  return new Date(`${safeDate}T${safeTime}:00.000Z`).toISOString()
}
