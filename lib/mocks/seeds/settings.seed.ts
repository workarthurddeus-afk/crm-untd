import type { UntdSettings } from '@/lib/types/settings'

const now = '2026-05-06T09:00:00.000Z'

export const settingsSeed: UntdSettings = {
  id: 'settings-default',
  workspace: {
    workspaceName: 'UNTD OS',
    userName: 'Arthur',
    companyName: 'UNTD Studio',
    companyDescription:
      'Estudio de criativos, automacoes e sistemas para marcas que precisam vender com consistencia visual.',
    timezone: 'America/Sao_Paulo',
    language: 'pt-BR',
    currency: 'BRL',
  },
  businessMetrics: {
    currentMRR: 0,
    activeSubscribers: 0,
    newSubscribersThisMonth: 0,
    cancellationsThisMonth: 0,
    revenueReceivedThisMonth: 0,
    investmentThisMonth: 0,
    monthlyRevenueGoal: 10000,
    monthlyProspectingGoal: 120,
    monthlyCustomerGoal: 10,
  },
  crm: {
    staleLeadDays: 14,
    defaultFollowUpDays: 3,
    hotLeadIcpThreshold: 80,
    proposalReminderDays: 2,
    defaultRevenuePotential: 1500,
    dailyProspectingTarget: 12,
  },
  tasksCalendar: {
    defaultTaskImportance: 'medium',
    defaultTaskCategory: 'ops',
    defaultEventDurationMinutes: 60,
    workdayStart: '09:00',
    workdayEnd: '18:00',
    defaultCalendarView: 'month',
    showCompletedTasksByDefault: false,
  },
  productSales: {
    productName: 'UNTD Studio',
    productDescription:
      'Oferta de criativos premium e sistemas operacionais visuais para negócios que dependem de consistência e velocidade.',
    targetAudience:
      'Social medias, agências pequenas, restaurantes, clínicas e negócios locais que precisam produzir mais criativos com padrão de marca.',
    coreOffer:
      'Implementação concierge de BrandKit, criativos e fluxo comercial para os primeiros clientes.',
    mainObjections: ['Ja tenho designer', 'Nao confio em IA para marca', 'O preco mensal parece cedo'],
    keyBenefits: [
      'Consistencia visual sem depender de retrabalho',
      'Mais velocidade para testar ofertas',
      'Centralizacao de aprendizado comercial',
    ],
    salesNotes:
      'Priorizar prova visual, velocidade de entrega e clareza do primeiro resultado antes de falar de escala.',
  },
  integrations: [
    {
      key: 'meta_ads',
      name: 'Meta Ads',
      description: 'Campanhas, gasto, criativos e performance.',
      status: 'coming_soon',
    },
    {
      key: 'instagram',
      name: 'Instagram / Social Media',
      description: 'Conteudo, metricas sociais e calendario editorial.',
      status: 'coming_soon',
    },
    {
      key: 'google_calendar',
      name: 'Google Calendar',
      description: 'Sincronizacao futura de agenda e reunioes.',
      status: 'not_connected',
    },
    {
      key: 'stripe_asaas',
      name: 'Stripe / Asaas',
      description: 'Receita, assinaturas e pagamentos recebidos.',
      status: 'not_connected',
    },
    {
      key: 'email',
      name: 'Email',
      description: 'Follow-ups, respostas e sinais comerciais por inbox.',
      status: 'not_connected',
    },
  ],
  createdAt: now,
  updatedAt: now,
}
