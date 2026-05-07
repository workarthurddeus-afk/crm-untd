'use client'

import { Edit3, Flag, ShieldAlert, Sparkles, Target, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { ICPProfile } from '@/lib/types'

interface Props {
  profile: ICPProfile
  onEdit: () => void
}

function Section({
  icon: Icon,
  title,
  items,
  tone,
}: {
  icon: React.ElementType
  title: string
  items: string[]
  tone: string
}) {
  return (
    <div className="rounded-lg border border-border-subtle bg-background/30 p-4">
      <div className="flex items-center gap-2">
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${tone}`}>
          <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </span>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-text-secondary">
          {title}
        </p>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {items.length > 0 ? (
          items.slice(0, 6).map((item) => (
            <Badge key={item} variant="outline" className="max-w-full overflow-hidden text-ellipsis">
              {item}
            </Badge>
          ))
        ) : (
          <span className="text-sm text-text-secondary">Ainda nao definido</span>
        )}
      </div>
    </div>
  )
}

function getPriorityNiches(profile: ICPProfile): string[] {
  const nicheCriterion = profile.criteria.find((criterion) => criterion.field === 'niche')
  const values = nicheCriterion?.config.values
  return Array.isArray(values) ? values.map(String) : []
}

function getRedFlags(profile: ICPProfile): string[] {
  const criterionFlags = profile.criteria
    .filter((criterion) => criterion.weight < 0)
    .map((criterion) => criterion.name.replace(/^Red flag:\s*/i, ''))
  return [...criterionFlags, ...profile.persona.objections].slice(0, 8)
}

export function ICPTargetCard({ profile, onEdit }: Props) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <Badge variant="default" className="border-primary/20 bg-primary-muted text-primary">
            ICP alvo
          </Badge>
          <h2 className="mt-3 font-display text-2xl font-bold leading-tight text-text">
            {profile.persona.name}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary sm:text-base">
            {profile.persona.description}
          </p>
        </div>
        <Button variant="primary" onClick={onEdit} className="shrink-0">
          <Edit3 aria-hidden />
          Editar ICP
        </Button>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        <Section
          icon={Target}
          title="Nichos prioritarios"
          tone="bg-primary-muted text-primary"
          items={getPriorityNiches(profile)}
        />
        <Section
          icon={Zap}
          title="Sinais de compra"
          tone="bg-warning/10 text-warning"
          items={profile.persona.purchaseTriggers}
        />
        <Section
          icon={ShieldAlert}
          title="Red flags"
          tone="bg-danger/10 text-danger"
          items={getRedFlags(profile)}
        />
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-border-subtle bg-background/30 p-4">
          <div className="flex items-center gap-2 text-success">
            <Sparkles className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em]">
              Potencial de recorrencia
            </p>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            {profile.persona.desires.slice(0, 2).join(' / ') || 'Recorrencia ainda nao descrita.'}
          </p>
        </div>
        <div className="rounded-lg border border-primary/20 bg-primary-muted/30 p-4">
          <div className="flex items-center gap-2 text-primary">
            <Flag className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em]">
              Oferta principal
            </p>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-text">
            {profile.persona.likelyOffer ?? 'Oferta ainda nao definida.'}
          </p>
        </div>
      </div>
    </Card>
  )
}
