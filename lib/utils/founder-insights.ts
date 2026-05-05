import { Snowflake, Zap, Trophy, Lightbulb, Megaphone, type LucideIcon } from 'lucide-react'
import type { Lead, Task, Note, ICPProfile } from '@/lib/types'
import { calculateICPScore } from '@/lib/services/scoring.service'

export interface FounderInsight {
  id: string
  Icon: LucideIcon
  title: string
  description: string
  href?: string
  ctaLabel?: string
}

const originLabels: Record<string, string> = {
  'cold-dm': 'DM fria',
  'cold-email': 'Cold email',
  'in-person': 'Presencial',
  referral: 'Indicação',
  'paid-traffic': 'Tráfego pago',
  social: 'Rede social',
  community: 'Comunidade',
  event: 'Evento',
  'manual-search': 'Busca manual',
  other: 'Outro',
}

export function getFounderInsights(input: {
  leads: Lead[]
  tasks: Task[]
  notes: Note[]
  profile: ICPProfile | null
}): FounderInsight[] {
  const insights: FounderInsight[] = []
  const { leads, tasks, notes, profile } = input
  const open = leads.filter(l => l.result === 'open')

  if (profile) {
    const highIcpNoProposal = open.filter(l => {
      const score = calculateICPScore(l, profile).total
      return score >= 80 && l.pipelineStageId !== 'stage-proposal' && l.pipelineStageId !== 'stage-pilot'
    })
    if (highIcpNoProposal.length > 0) {
      insights.push({
        id: 'high-icp-no-proposal',
        Icon: Zap,
        title: `${highIcpNoProposal.length} ${highIcpNoProposal.length === 1 ? 'lead' : 'leads'} de alto ICP sem proposta`,
        description: 'Score ≥ 80 ainda esperando o próximo passo comercial.',
        href: '/leads',
        ctaLabel: 'Ver leads',
      })
    }
  }

  const byOrigin = new Map<string, number[]>()
  for (const l of open) {
    if (!byOrigin.has(l.origin)) byOrigin.set(l.origin, [])
    byOrigin.get(l.origin)!.push(l.icpScore)
  }
  let bestOrigin: { origin: string; avg: number; count: number } | null = null
  for (const [origin, scores] of byOrigin) {
    if (scores.length < 2) continue
    const avg = scores.reduce((s, x) => s + x, 0) / scores.length
    if (!bestOrigin || avg > bestOrigin.avg) bestOrigin = { origin, avg, count: scores.length }
  }
  if (bestOrigin) {
    insights.push({
      id: 'best-origin',
      Icon: Trophy,
      title: `Melhor canal: ${originLabels[bestOrigin.origin] ?? bestOrigin.origin}`,
      description: `Score ICP médio de ${Math.round(bestOrigin.avg)}/100 entre ${bestOrigin.count} leads desse canal.`,
    })
  }

  const orphanNotes = notes.filter(n =>
    n.expectedImpact === 'high' && n.status !== 'archived' &&
    !tasks.some(t => t.relatedNoteId === n.id)
  )
  if (orphanNotes.length > 0) {
    insights.push({
      id: 'orphan-impact-notes',
      Icon: Lightbulb,
      title: `${orphanNotes.length} ${orphanNotes.length === 1 ? 'ideia' : 'ideias'} de alto impacto sem tarefa`,
      description: 'Anotações marcadas como alto impacto que ainda não viraram ação.',
      href: '/notes',
      ctaLabel: 'Revisar',
    })
  }

  const cold = open.filter(l => l.temperature === 'cold').length
  const total = open.length
  if (total >= 5 && cold / total > 0.5) {
    insights.push({
      id: 'cold-pipeline',
      Icon: Snowflake,
      title: 'Pipeline majoritariamente frio',
      description: `${Math.round(cold / total * 100)}% dos leads ativos estão classificados como frios.`,
      href: '/leads',
      ctaLabel: 'Reativar',
    })
  }

  const offerIdeas = notes.filter(n =>
    (n.type === 'offer-idea' || n.type === 'pricing-idea') &&
    n.status !== 'archived' && n.status !== 'in-progress'
  )
  if (offerIdeas.length > 0) {
    insights.push({
      id: 'offer-ideas',
      Icon: Megaphone,
      title: `${offerIdeas.length} ${offerIdeas.length === 1 ? 'ideia' : 'ideias'} de oferta para testar`,
      description: 'Hipóteses de pricing/offer salvas e ainda não validadas.',
      href: '/notes',
      ctaLabel: 'Ver ideias',
    })
  }

  return insights.slice(0, 5)
}
