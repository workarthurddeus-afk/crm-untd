import type { ICPProfile } from '@/lib/types'
import { nowIso } from '@/lib/utils/date'

const now = nowIso()

export const icpProfileSeed = {
  id: 'icp-default',
  name: 'ICP UNTD Studio',
  description:
    'Perfil ideal: agencias e empresas com alto volume de criativos, dor clara de design e potencial de recorrencia.',
  criteria: [
    {
      id: 'crit-niche',
      name: 'Nicho prioritario',
      weight: 20,
      field: 'niche',
      evaluator: 'array-includes',
      config: {
        values: [
          'Agencia de social media',
          'Agencia de trafego',
          'E-commerce de moda',
          'Infoprodutor de financas',
          'Clinica estetica',
          'Marca de moda autoral',
        ],
      },
    },
    {
      id: 'crit-paid',
      name: 'Investe em trafego pago',
      weight: 15,
      field: 'origin',
      evaluator: 'enum-match',
      config: { value: 'paid-traffic' },
    },
    {
      id: 'crit-revenue',
      name: 'Potencial de receita acima de R$ 3000',
      weight: 20,
      field: 'revenuePotential',
      evaluator: 'numeric-range',
      config: { min: 3000, max: Number.MAX_SAFE_INTEGER },
    },
    {
      id: 'crit-pain',
      name: 'Dor explicita com criativos/design',
      weight: 20,
      field: 'pain',
      evaluator: 'string-not-empty',
      config: {},
    },
    {
      id: 'crit-temp',
      name: 'Temperatura warm/hot',
      weight: 10,
      field: 'temperature',
      evaluator: 'array-includes',
      config: { values: ['warm', 'hot'] },
    },
    {
      id: 'crit-instagram',
      name: 'Tem Instagram ativo',
      weight: 10,
      field: 'instagram',
      evaluator: 'string-not-empty',
      config: {},
    },
    {
      id: 'crit-website',
      name: 'Tem site proprio',
      weight: 5,
      field: 'website',
      evaluator: 'string-not-empty',
      config: {},
    },
  ],
  persona: {
    name: 'Agencia local em crescimento',
    description:
      'Agencia ou marca digital que cresceu ate um ponto em que a demanda por criativos excede a capacidade interna.',
    pains: [
      'Volume alto de criativos para multiplos clientes ou produtos',
      'Designer interno sobrecarregado',
      'Anuncios com baixa performance por criativo fraco',
      'Inconsistencia visual entre canais',
    ],
    desires: [
      'Velocidade de producao sem perder qualidade',
      'Manter identidade de marca em escala',
      'Reduzir custo por criativo',
    ],
    objections: [
      'Ja tem designer interno',
      'Nao confia em IA para gerar imagens fieis a marca',
      'Preco',
    ],
    purchaseTriggers: [
      'Lancamento proximo com prazo apertado',
      'Aumento de clientes ou produtos',
      'Frustracao recente com designer freelancer',
    ],
    bestMessage:
      'Imagens fieis a sua marca em minutos, com BrandKit fixo e edicao em canvas para liberar o designer interno.',
    likelyOffer: 'Plano mensal com volume e BrandKit ilimitado',
    foundOnChannels: ['Instagram', 'LinkedIn', 'Indicacao de cliente atual', 'Eventos de marketing'],
  },
  createdAt: now,
  updatedAt: now,
} satisfies ICPProfile
