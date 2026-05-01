import { formatDistanceToNow, parseISO, isToday, isTomorrow, isPast } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export type FollowUpTone = 'overdue' | 'today' | 'tomorrow' | 'future'

export interface FollowUpStatus {
  tone: FollowUpTone
  label: string
}

export function nextFollowUpStatus(iso: string): FollowUpStatus {
  const date = parseISO(iso)

  if (isToday(date)) {
    return { tone: 'today', label: 'Follow-up hoje' }
  }

  if (isTomorrow(date)) {
    return { tone: 'tomorrow', label: 'Follow-up amanhã' }
  }

  if (isPast(date)) {
    return {
      tone: 'overdue',
      label: `Atrasado ${formatDistanceToNow(date, { locale: ptBR, addSuffix: true })}`,
    }
  }

  return {
    tone: 'future',
    label: formatDistanceToNow(date, { locale: ptBR, addSuffix: true }),
  }
}
