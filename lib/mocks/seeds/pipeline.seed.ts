import type { PipelineStage } from '@/lib/types'

export const pipelineStagesSeed = [
  { id: 'stage-research', name: 'Pesquisa / Mapeamento', order: 0, color: 'var(--text-muted)' },
  { id: 'stage-identified', name: 'Lead Identificado', order: 1, color: 'var(--pipe-prospect)' },
  { id: 'stage-first', name: 'Primeiro Contato', order: 2, color: 'var(--pipe-contacted)' },
  { id: 'stage-replied', name: 'Respondeu', order: 3, color: 'var(--pipe-replied)' },
  { id: 'stage-followup', name: 'Follow-up', order: 4, color: 'var(--pipe-followup)' },
  { id: 'stage-meeting-set', name: 'Reuniao Marcada', order: 5, color: 'var(--info)' },
  { id: 'stage-diagnosis', name: 'Diagnostico / Conversa', order: 6, color: 'var(--info)' },
  { id: 'stage-proposal', name: 'Proposta Enviada', order: 7, color: 'var(--pipe-proposal)' },
  { id: 'stage-pilot', name: 'Teste / Piloto', order: 8, color: 'var(--warning)' },
  { id: 'stage-won', name: 'Cliente Pagante', order: 9, color: 'var(--pipe-won)', isFinalWon: true },
  { id: 'stage-lost', name: 'Perdido / Sem Fit', order: 10, color: 'var(--pipe-lost)', isFinalLost: true },
] satisfies PipelineStage[]
