import { format, differenceInCalendarDays, startOfDay, addDays, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { TaskCategory, TaskImportance } from '@/lib/types'

export const categoryLabel: Record<TaskCategory, string> = {
  prospecting: 'Prospecção',
  'follow-up': 'Follow-up',
  meeting: 'Reunião',
  product: 'Produto',
  design: 'Design',
  content: 'Conteúdo',
  social: 'Social',
  'meta-ads': 'Meta Ads',
  strategy: 'Estratégia',
  study: 'Estudo',
  ops: 'Operações',
  other: 'Outro',
}

export type CategoryTone =
  | 'followup'
  | 'meeting'
  | 'product'
  | 'content'
  | 'neutral'

export function categoryTone(category: TaskCategory): CategoryTone {
  if (category === 'prospecting' || category === 'follow-up') return 'followup'
  if (category === 'meeting') return 'meeting'
  if (category === 'product' || category === 'design') return 'product'
  if (category === 'content' || category === 'social' || category === 'meta-ads') return 'content'
  return 'neutral'
}

export const categoryToneClass: Record<CategoryTone, string> = {
  followup: 'bg-pipe-followup/10 text-pipe-followup border-transparent',
  meeting: 'bg-info/10 text-info border-transparent',
  product: 'bg-primary/10 text-primary border-transparent',
  content: 'bg-warning/10 text-warning border-transparent',
  neutral: 'bg-surface-elevated text-text-secondary border-border',
}

export const importanceAccentClass: Record<TaskImportance, string> = {
  high: 'bg-danger',
  medium: 'bg-warning',
  low: 'bg-text-muted/40',
}

export type DueTone = 'overdue' | 'today' | 'tomorrow' | 'future'

export interface DuePill {
  tone: DueTone
  label: string
}

export function computeDuePill(dueDateIso: string, now: Date): DuePill | null {
  const due = new Date(dueDateIso)
  const todayStart = startOfDay(now)
  const dueStart = startOfDay(due)
  const diff = differenceInCalendarDays(dueStart, todayStart)

  if (diff < 0) {
    const days = Math.abs(diff)
    const label =
      days === 1 ? 'Atrasada há 1 dia' : `Atrasada há ${days} dias`
    return { tone: 'overdue', label }
  }

  if (diff === 0) {
    return { tone: 'today', label: 'Hoje' }
  }

  if (diff === 1) {
    return { tone: 'tomorrow', label: 'Amanhã' }
  }

  if (diff < 7) {
    const label = format(due, "EEE, dd MMM", { locale: ptBR })
    return { tone: 'future', label }
  }

  const label = format(due, "dd MMM yyyy", { locale: ptBR })
  return { tone: 'future', label }
}

export const dueToneTextClass: Record<DueTone, string> = {
  overdue: 'text-danger',
  today: 'text-warning',
  tomorrow: 'text-info',
  future: 'text-text-muted',
}
