import type { LeadInteraction } from '@/lib/types'

export const interactionsSeed = [
  {
    id: 'interaction-001-01',
    leadId: 'lead-001',
    type: 'first-contact-sent',
    description:
      'Arthur enviou DM para Juliana apontando gargalo de criativos em multiplas contas e sugerindo um teste com BrandKit.',
    occurredAt: '2026-04-17T13:20:00.000Z',
    createdAt: '2026-04-17T13:20:00.000Z',
  },
  {
    id: 'interaction-001-02',
    leadId: 'lead-001',
    type: 'replied',
    description:
      'Juliana respondeu que a equipe interna esta sobrecarregada e pediu exemplos de criativos para agencias.',
    occurredAt: '2026-04-19T10:45:00.000Z',
    createdAt: '2026-04-19T10:45:00.000Z',
  },
  {
    id: 'interaction-001-03',
    leadId: 'lead-001',
    type: 'note',
    description:
      'Dor principal: velocidade sem perder consistencia visual entre clientes. Objecao provavel: designer interno.',
    occurredAt: '2026-04-20T16:10:00.000Z',
    createdAt: '2026-04-20T16:10:00.000Z',
  },
  {
    id: 'interaction-001-04',
    leadId: 'lead-001',
    type: 'follow-up-sent',
    description:
      'Follow-up enviado com sugestao de piloto para 3 clientes da agencia e promessa de setup em 1 dia.',
    occurredAt: '2026-04-26T14:05:00.000Z',
    createdAt: '2026-04-26T14:05:00.000Z',
  },
  {
    id: 'interaction-001-05',
    leadId: 'lead-001',
    type: 'meeting-scheduled',
    description: 'Reuniao marcada para revisar fluxo de criativos e avaliar volume mensal ideal.',
    occurredAt: '2026-04-29T09:30:00.000Z',
    createdAt: '2026-04-29T09:30:00.000Z',
  },
  {
    id: 'interaction-002-01',
    leadId: 'lead-002',
    type: 'first-contact-sent',
    description:
      'Conversa presencial iniciada no restaurante sobre posts inconsistentes e baixa frequencia no Instagram.',
    occurredAt: '2026-04-24T18:20:00.000Z',
    createdAt: '2026-04-24T18:20:00.000Z',
  },
  {
    id: 'interaction-002-02',
    leadId: 'lead-002',
    type: 'note',
    description:
      'Marcos precisa enxergar ROI rapido. Melhor abordagem: pacote enxuto com antes/depois visual dos pratos.',
    occurredAt: '2026-04-24T19:10:00.000Z',
    createdAt: '2026-04-24T19:10:00.000Z',
  },
  {
    id: 'interaction-002-03',
    leadId: 'lead-002',
    type: 'follow-up-sent',
    description:
      'Mensagem enviada com proposta de 10 criativos para campanha de almoco executivo e datas comemorativas.',
    occurredAt: '2026-04-26T11:00:00.000Z',
    createdAt: '2026-04-26T11:00:00.000Z',
  },
  {
    id: 'interaction-002-04',
    leadId: 'lead-002',
    type: 'replied',
    description:
      'Marcos pediu valores e perguntou se os criativos tambem servem para cardapio digital e stories.',
    occurredAt: '2026-04-27T15:35:00.000Z',
    createdAt: '2026-04-27T15:35:00.000Z',
  },
  {
    id: 'interaction-003-01',
    leadId: 'lead-003',
    type: 'first-contact-sent',
    description:
      'Lead veio por trafego pago. Arthur respondeu com diagnostico inicial sobre criativos genericos em estetica.',
    occurredAt: '2026-04-10T12:00:00.000Z',
    createdAt: '2026-04-10T12:00:00.000Z',
  },
  {
    id: 'interaction-003-02',
    leadId: 'lead-003',
    type: 'replied',
    description:
      'Camila confirmou que campanhas de harmonizacao e skincare cairam em performance nas ultimas semanas.',
    occurredAt: '2026-04-11T08:40:00.000Z',
    createdAt: '2026-04-11T08:40:00.000Z',
  },
  {
    id: 'interaction-003-03',
    leadId: 'lead-003',
    type: 'meeting-scheduled',
    description:
      'Reuniao marcada para entender restricoes de imagem, promessas medicas e linha visual premium da clinica.',
    occurredAt: '2026-04-28T17:00:00.000Z',
    createdAt: '2026-04-28T17:00:00.000Z',
  },
  {
    id: 'interaction-003-04',
    leadId: 'lead-003',
    type: 'meeting-held',
    description:
      'Reuniao realizada. Decisores querem piloto focado em criativos para Meta Ads antes de contrato mensal.',
    occurredAt: '2026-04-29T14:00:00.000Z',
    createdAt: '2026-04-29T14:00:00.000Z',
  },
  {
    id: 'interaction-004-01',
    leadId: 'lead-004',
    type: 'first-contact-sent',
    description:
      'Cold email enviado para Rafael com analise de lancamentos semanais e necessidade de variacoes de produto.',
    occurredAt: '2026-04-15T09:05:00.000Z',
    createdAt: '2026-04-15T09:05:00.000Z',
  },
  {
    id: 'interaction-004-02',
    leadId: 'lead-004',
    type: 'replied',
    description:
      'Rafael respondeu que o gargalo aparece toda sexta, quando chegam fotos de produto para campanha.',
    occurredAt: '2026-04-18T13:10:00.000Z',
    createdAt: '2026-04-18T13:10:00.000Z',
  },
  {
    id: 'interaction-004-03',
    leadId: 'lead-004',
    type: 'follow-up-sent',
    description:
      'Follow-up enviado com ideia de sprint semanal: transformar fotos de produto em 20 variacoes de campanha.',
    occurredAt: '2026-04-23T10:30:00.000Z',
    createdAt: '2026-04-23T10:30:00.000Z',
  },
  {
    id: 'interaction-004-04',
    leadId: 'lead-004',
    type: 'note',
    description:
      'Alta chance de fit se houver prova visual. Preparar exemplo com produto de moda e fundo editorial.',
    occurredAt: '2026-04-24T16:45:00.000Z',
    createdAt: '2026-04-24T16:45:00.000Z',
  },
  {
    id: 'interaction-005-01',
    leadId: 'lead-005',
    type: 'first-contact-sent',
    description:
      'Indicacao recebida. Arthur iniciou conversa posicionando UNTD como apoio visual para lancamentos.',
    occurredAt: '2026-04-05T11:15:00.000Z',
    createdAt: '2026-04-05T11:15:00.000Z',
  },
  {
    id: 'interaction-005-02',
    leadId: 'lead-005',
    type: 'meeting-held',
    description:
      'Reuniao feita com Lara. Ela precisa de consistencia visual para webinario, carrinho e remarketing.',
    occurredAt: '2026-04-12T15:00:00.000Z',
    createdAt: '2026-04-12T15:00:00.000Z',
  },
  {
    id: 'interaction-005-03',
    leadId: 'lead-005',
    type: 'proposal-sent',
    description:
      'Proposta enviada: plano mensal com BrandKit, volume para lancamento e suporte na semana de carrinho.',
    occurredAt: '2026-04-26T18:30:00.000Z',
    createdAt: '2026-04-26T18:30:00.000Z',
  },
] satisfies LeadInteraction[]
