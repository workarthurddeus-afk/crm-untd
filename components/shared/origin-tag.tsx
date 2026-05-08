import { Badge } from '@/components/ui/badge'
import type { LeadOrigin } from '@/lib/types'

type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'outline'

const labels: Record<LeadOrigin, string> = {
  'cold-dm': 'DM fria',
  'cold-email': 'Cold email',
  'in-person': 'Presencial',
  referral: 'Indicação',
  'paid-traffic': 'Tráfego pago',
  social: 'Rede social',
  community: 'Comunidade',
  event: 'Evento',
  manual: 'Manual',
  'manual-search': 'Busca manual',
  other: 'Outro',
}

const variants: Record<LeadOrigin, BadgeVariant> = {
  'cold-dm': 'default',
  'cold-email': 'info',
  'in-person': 'success',
  referral: 'warning',
  'paid-traffic': 'danger',
  social: 'secondary',
  community: 'secondary',
  event: 'outline',
  manual: 'outline',
  'manual-search': 'outline',
  other: 'outline',
}

export function OriginTag({ origin }: { origin: LeadOrigin }) {
  return <Badge variant={variants[origin]}>{labels[origin]}</Badge>
}
