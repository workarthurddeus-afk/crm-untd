import type { Lead, PipelineStage } from '@/lib/types'

export interface NextAction {
  tone: 'urgent' | 'recommended' | 'info' | 'closed'
  title: string
  description: string
  ctaLabel: string
  ctaIntent: 'log-interaction' | 'mark-meeting' | 'send-proposal' | 'reopen' | 'edit'
}

/**
 * Suggests the most useful next move for a lead based on its
 * follow-up date, pipeline stage, and result. Pure — does not
 * touch storage. Today is injected so callers can stub for tests.
 */
export function computeNextAction(
  lead: Lead,
  stages: PipelineStage[],
  today: Date,
): NextAction {
  if (lead.result === 'won') {
    return {
      tone: 'closed',
      title: 'Cliente fechado',
      description:
        'Lead convertido. Continue acompanhando para upsell e renovação.',
      ctaLabel: 'Adicionar nota',
      ctaIntent: 'log-interaction',
    }
  }

  if (lead.result === 'lost' || lead.result === 'no-fit') {
    return {
      tone: 'closed',
      title: 'Lead encerrado',
      description:
        lead.result === 'no-fit'
          ? 'Sem fit. Mantenha registrado para análise futura.'
          : 'Lead perdido. Mantenha registrado para análise futura.',
      ctaLabel: 'Reabrir lead',
      ctaIntent: 'reopen',
    }
  }

  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  ).getTime()

  if (lead.nextFollowUpAt) {
    const due = new Date(lead.nextFollowUpAt).getTime()
    const daysDelta = Math.floor((due - todayStart) / 86_400_000)

    if (daysDelta < 0) {
      const overdue = Math.abs(daysDelta)
      return {
        tone: 'urgent',
        title:
          overdue === 1
            ? 'Follow-up atrasado há 1 dia'
            : `Follow-up atrasado há ${overdue} dias`,
        description:
          'Esse lead estava esperando retorno. Recupere o contato hoje.',
        ctaLabel: 'Registrar follow-up',
        ctaIntent: 'log-interaction',
      }
    }
    if (daysDelta === 0) {
      return {
        tone: 'urgent',
        title: 'Follow-up hoje',
        description: 'Hora de retomar o contato com esse lead.',
        ctaLabel: 'Registrar follow-up',
        ctaIntent: 'log-interaction',
      }
    }
    if (daysDelta <= 2) {
      return {
        tone: 'recommended',
        title:
          daysDelta === 1 ? 'Follow-up amanhã' : `Follow-up em ${daysDelta} dias`,
        description: 'Prepare o contexto antes do próximo contato.',
        ctaLabel: 'Adicionar interação',
        ctaIntent: 'log-interaction',
      }
    }
  }

  const stage = stages.find((s) => s.id === lead.pipelineStageId)
  if (stage?.id === 'stage-replied') {
    return {
      tone: 'recommended',
      title: 'Marcar reunião',
      description:
        'O lead respondeu. Avance para diagnóstico agendando uma conversa.',
      ctaLabel: 'Marcar reunião',
      ctaIntent: 'mark-meeting',
    }
  }
  if (stage?.id === 'stage-diagnosis' || stage?.id === 'stage-meeting-set') {
    return {
      tone: 'recommended',
      title: 'Enviar proposta',
      description: 'Conversa concluída. Hora de formalizar a proposta.',
      ctaLabel: 'Registrar envio',
      ctaIntent: 'send-proposal',
    }
  }

  return {
    tone: 'info',
    title: 'Sem ação urgente',
    description: 'Continue alimentando o lead até a próxima oportunidade.',
    ctaLabel: 'Adicionar interação',
    ctaIntent: 'log-interaction',
  }
}
