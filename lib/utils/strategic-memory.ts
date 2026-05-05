import type { Note } from '@/lib/types'

export interface StrategicMemoryPick {
  note: Note
  reason: string
}

export function getStrategicMemory(notes: Note[], today: Date): StrategicMemoryPick | null {
  if (notes.length === 0) return null

  const pinned = notes.filter(n => n.pinned)
  if (pinned.length > 0) {
    const pick = [...pinned].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]!
    return { note: pick, reason: 'Fixada por você' }
  }

  const favorited = notes.filter(n => n.favorited)
  if (favorited.length > 0) {
    const pick = [...favorited].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]!
    return { note: pick, reason: 'Marcada como favorita' }
  }

  const highImpactOld = [...notes]
    .filter(n => n.expectedImpact === 'high' && n.status !== 'archived')
    .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))
  if (highImpactOld.length > 0) {
    const pick = highImpactOld[0]!
    const days = Math.floor((today.getTime() - new Date(pick.updatedAt).getTime()) / 86_400_000)
    return { note: pick, reason: days > 7 ? `Alto impacto sem revisão há ${days} dias` : 'Selecionada por alto impacto' }
  }

  const strategic = notes.filter(n => n.type === 'strategic-decision' || n.type === 'sales-learning')
  if (strategic.length > 0) {
    const pick = [...strategic].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]!
    return { note: pick, reason: 'Decisão estratégica recente' }
  }

  const pick = [...notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]!
  return { note: pick, reason: 'Última anotação' }
}
