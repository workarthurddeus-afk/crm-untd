import type { Note } from '@/lib/types'
import { calculateNoteStrategicScore, normalizeNote, sortNotes } from '@/lib/utils/notes'

export type StrategicMemoryType =
  | 'daily_insight'
  | 'forgotten_idea'
  | 'high_impact'
  | 'sales_learning'
  | 'product_signal'
  | 'feedback_pattern'

export interface StrategicMemoryPick {
  note: Note
  memoryType: StrategicMemoryType
  reason: string
  score: number
}

const productTypes = new Set(['product', 'feature', 'ui', 'brandkit', 'onboarding', 'improvement'])

function daysSince(value: string | null | undefined, currentDate: Date): number {
  if (!value) return Number.POSITIVE_INFINITY
  return Math.floor((currentDate.getTime() - new Date(value).getTime()) / 86_400_000)
}

function getMemoryType(note: Note, currentDate: Date): StrategicMemoryType {
  const stale = daysSince(note.lastViewedAt ?? note.updatedAt, currentDate) >= 30
  if (stale && (note.type === 'idea' || note.impact === 'high')) return 'forgotten_idea'
  if (note.type === 'sales') return 'sales_learning'
  if (productTypes.has(note.type)) return 'product_signal'
  if (note.type === 'feedback') return 'feedback_pattern'
  if (note.impact === 'high') return 'high_impact'
  return 'daily_insight'
}

function getReason(note: Note, memoryType: StrategicMemoryType): string {
  if (memoryType === 'forgotten_idea') {
    return 'Ideia antiga de alto impacto voltou para revisao estrategica.'
  }
  if (memoryType === 'sales_learning') {
    return 'Aprendizado comercial com potencial de melhorar prospeccao e follow-up.'
  }
  if (memoryType === 'product_signal') {
    return 'Sinal de produto relevante para evoluir a experiencia do UNTD OS.'
  }
  if (memoryType === 'feedback_pattern') {
    return 'Padrao de feedback que pode virar melhoria ou oportunidade comercial.'
  }
  if (memoryType === 'high_impact') {
    return 'Nota de alto impacto priorizada para decisao ou execucao.'
  }
  if (note.isPinned) return 'Nota fixada para permanecer visivel no dashboard.'
  if (note.isFavorite) return 'Nota favorita com valor estrategico recorrente.'
  return 'Memoria estrategica selecionada para manter contexto vivo.'
}

export function getStrategicMemory(notes: Note[], currentDate = new Date()): StrategicMemoryPick | null {
  const candidates = notes
    .map(normalizeNote)
    .filter((note) => !note.isArchived && !note.isDeleted)
    .map((note) => ({
      note,
      score: calculateNoteStrategicScore(note, currentDate),
    }))
    .filter((pick) => Number.isFinite(pick.score))
    .sort((a, b) => {
      const scoreDelta = b.score - a.score
      if (scoreDelta !== 0) return scoreDelta
      return sortNotes([a.note, b.note])[0]?.id === a.note.id ? -1 : 1
    })

  const best = candidates[0]
  if (!best) return null

  const memoryType = getMemoryType(best.note, currentDate)
  return {
    note: best.note,
    memoryType,
    reason: getReason(best.note, memoryType),
    score: best.score,
  }
}
