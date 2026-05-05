import type {
  NoteColor,
  NoteEffort,
  NoteImpact,
  NotePriority,
  NoteStatus,
  NoteType,
} from '@/lib/types'

/**
 * UI-only mapping helpers for the Notes module.
 * Pure data — no JSX, no React. Components import from here for labels,
 * tints and icon keys.
 */

export const noteTypeLabel: Record<string, string> = {
  insight: 'Insight',
  idea: 'Ideia',
  meeting: 'Reunião',
  feedback: 'Feedback',
  strategy: 'Estratégia',
  product: 'Produto',
  ui: 'UI',
  feature: 'Feature',
  campaign: 'Campanha',
  copy: 'Copy',
  offer: 'Oferta',
  sales: 'Vendas',
  pricing: 'Pricing',
  brandkit: 'BrandKit',
  prompt: 'Prompt',
  reference: 'Referência',
  bug: 'Bug',
  improvement: 'Melhoria',
  onboarding: 'Onboarding',
  market: 'Mercado',
  decision: 'Decisão',
  general: 'Geral',
  // legacy fallbacks
  'product-idea': 'Produto',
  'ui-idea': 'UI',
  'feature-idea': 'Feature',
  'campaign-idea': 'Campanha',
  'copy-idea': 'Copy',
  'offer-idea': 'Oferta',
  'client-feedback': 'Feedback',
  'market-insight': 'Mercado',
  'sales-learning': 'Vendas',
  'strategic-decision': 'Decisão',
  'useful-prompt': 'Prompt',
  'visual-reference': 'Referência',
  'bug-improvement': 'Bug',
  'onboarding-idea': 'Onboarding',
  'pricing-idea': 'Pricing',
  'brandkit-idea': 'BrandKit',
  other: 'Outro',
}

export function getNoteTypeLabel(type: NoteType): string {
  return noteTypeLabel[type] ?? type
}

export const noteStatusLabel: Record<NoteStatus, string> = {
  draft: 'Rascunho',
  active: 'Ativa',
  in_review: 'Em revisão',
  approved: 'Aprovada',
  in_progress: 'Em progresso',
  executed: 'Executada',
  archived: 'Arquivada',
  review: 'Em revisão',
  'in-progress': 'Em progresso',
}

export const notePriorityLabel: Record<NotePriority, string> = {
  high: 'Prioridade alta',
  medium: 'Prioridade média',
  low: 'Prioridade baixa',
}

export const noteImpactLabel: Record<NoteImpact, string> = {
  high: 'Impacto alto',
  medium: 'Impacto médio',
  low: 'Impacto baixo',
}

export const noteEffortLabel: Record<NoteEffort, string> = {
  high: 'Esforço alto',
  medium: 'Esforço médio',
  low: 'Esforço baixo',
}

/**
 * Each note color maps to:
 *   - dot: hex/rgb fill for the small color indicator (NoteColorDot)
 *   - accent: a thin border / left-rail tint applied to NoteCard
 *   - chip: a soft pill background used inside the detail view
 *
 * Colors stay subtle on the dark UNTD canvas — never saturated fills.
 */
export interface NoteColorTokens {
  dot: string
  accent: string
  chipBg: string
  chipText: string
  glow: string
}

export const noteColorTokens: Record<NoteColor, NoteColorTokens> = {
  default: {
    dot: 'bg-text-muted/60',
    accent: 'before:bg-text-muted/30',
    chipBg: 'bg-text-muted/10',
    chipText: 'text-text-secondary',
    glow: 'rgba(110, 107, 135, 0.18)',
  },
  purple: {
    dot: 'bg-primary',
    accent: 'before:bg-primary/70',
    chipBg: 'bg-primary/15',
    chipText: 'text-primary',
    glow: 'rgba(83, 50, 234, 0.28)',
  },
  violet: {
    dot: 'bg-[#8b5cf6]',
    accent: 'before:bg-[#8b5cf6]/70',
    chipBg: 'bg-[#8b5cf6]/15',
    chipText: 'text-[#a78bfa]',
    glow: 'rgba(139, 92, 246, 0.28)',
  },
  blue: {
    dot: 'bg-info',
    accent: 'before:bg-info/70',
    chipBg: 'bg-info/15',
    chipText: 'text-info',
    glow: 'rgba(96, 165, 250, 0.28)',
  },
  cyan: {
    dot: 'bg-[#22d3ee]',
    accent: 'before:bg-[#22d3ee]/70',
    chipBg: 'bg-[#22d3ee]/15',
    chipText: 'text-[#67e8f9]',
    glow: 'rgba(34, 211, 238, 0.28)',
  },
  green: {
    dot: 'bg-success',
    accent: 'before:bg-success/70',
    chipBg: 'bg-success/15',
    chipText: 'text-success',
    glow: 'rgba(52, 211, 153, 0.25)',
  },
  yellow: {
    dot: 'bg-warning',
    accent: 'before:bg-warning/70',
    chipBg: 'bg-warning/15',
    chipText: 'text-warning',
    glow: 'rgba(251, 191, 36, 0.22)',
  },
  orange: {
    dot: 'bg-[#fb923c]',
    accent: 'before:bg-[#fb923c]/70',
    chipBg: 'bg-[#fb923c]/15',
    chipText: 'text-[#fdba74]',
    glow: 'rgba(251, 146, 60, 0.22)',
  },
  red: {
    dot: 'bg-danger',
    accent: 'before:bg-danger/70',
    chipBg: 'bg-danger/15',
    chipText: 'text-danger',
    glow: 'rgba(248, 113, 113, 0.22)',
  },
  pink: {
    dot: 'bg-[#f472b6]',
    accent: 'before:bg-[#f472b6]/70',
    chipBg: 'bg-[#f472b6]/15',
    chipText: 'text-[#f9a8d4]',
    glow: 'rgba(244, 114, 182, 0.22)',
  },
  slate: {
    dot: 'bg-[#94a3b8]',
    accent: 'before:bg-[#94a3b8]/50',
    chipBg: 'bg-[#94a3b8]/12',
    chipText: 'text-[#cbd5e1]',
    glow: 'rgba(148, 163, 184, 0.18)',
  },
}

export function getNoteColorTokens(color: NoteColor): NoteColorTokens {
  return noteColorTokens[color] ?? noteColorTokens.default
}

export function impactBadgeVariant(impact: NoteImpact): 'success' | 'warning' | 'secondary' {
  if (impact === 'high') return 'success'
  if (impact === 'medium') return 'warning'
  return 'secondary'
}

export function priorityBadgeVariant(priority: NotePriority): 'danger' | 'warning' | 'secondary' {
  if (priority === 'high') return 'danger'
  if (priority === 'medium') return 'warning'
  return 'secondary'
}

export function statusBadgeVariant(
  status: NoteStatus
): 'default' | 'info' | 'success' | 'warning' | 'secondary' {
  if (status === 'approved' || status === 'executed') return 'success'
  if (status === 'in_progress' || status === 'in-progress') return 'info'
  if (status === 'in_review' || status === 'review') return 'warning'
  if (status === 'archived') return 'secondary'
  return 'default'
}

export const memoryTypeLabel: Record<string, string> = {
  daily_insight: 'Insight do dia',
  forgotten_idea: 'Ideia esquecida',
  high_impact: 'Alto impacto',
  sales_learning: 'Aprendizado de vendas',
  product_signal: 'Sinal de produto',
  feedback_pattern: 'Padrão de feedback',
}
