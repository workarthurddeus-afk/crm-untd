'use client'

import { HeartCrack, Quote, Radio, ShieldAlert, Sparkles, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import type { ICPPersona } from '@/lib/types'

interface Props {
  persona: ICPPersona
}

interface BriefSectionProps {
  icon: React.ElementType
  title: string
  items: string[]
  tone: string
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-text-secondary">
      {children}
    </p>
  )
}

function BriefSection({ icon: Icon, title, items, tone }: BriefSectionProps) {
  if (items.length === 0) return null

  return (
    <div className="rounded-md border border-border-subtle bg-background/30 p-3">
      <div className="flex items-center gap-2">
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${tone}`}>
          <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden />
        </div>
        <SectionLabel>{title}</SectionLabel>
      </div>
      <ul className="mt-3 space-y-2">
        {items.slice(0, 3).map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-snug text-text-secondary">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
            <span className="min-w-0">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function PersonaCard({ persona }: Props) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <SectionLabel>Brief comercial</SectionLabel>
          <h2 className="mt-2 font-display text-xl font-semibold leading-tight text-text">
            {persona.name}
          </h2>
        </div>
        <Badge variant="secondary" className="shrink-0">
          ICP vivo
        </Badge>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        {persona.description}
      </p>

      {persona.bestMessage && (
        <div className="mt-5 rounded-lg border border-primary/20 bg-primary-muted p-4">
          <div className="flex items-center gap-2 text-primary">
            <Quote className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            <SectionLabel>Mensagem de entrada</SectionLabel>
          </div>
          <blockquote className="mt-2 text-sm font-medium leading-relaxed text-text">
            {persona.bestMessage}
          </blockquote>
        </div>
      )}

      <div className="mt-4 grid gap-3">
        <BriefSection
          icon={HeartCrack}
          tone="bg-danger/10 text-danger"
          title="Dor dominante"
          items={persona.pains}
        />
        <BriefSection
          icon={Zap}
          tone="bg-warning/10 text-warning"
          title="Sinal de compra"
          items={persona.purchaseTriggers}
        />
        <BriefSection
          icon={ShieldAlert}
          tone="bg-info/10 text-info"
          title="Objeção provável"
          items={persona.objections}
        />
        <BriefSection
          icon={Sparkles}
          tone="bg-success/10 text-success"
          title="Desejo ativo"
          items={persona.desires}
        />
      </div>

      {persona.likelyOffer && (
        <div className="mt-4 rounded-md border border-border-subtle bg-background/30 p-3">
          <SectionLabel>Oferta mais provável</SectionLabel>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            {persona.likelyOffer}
          </p>
        </div>
      )}

      {persona.foundOnChannels.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-text-secondary" strokeWidth={1.5} aria-hidden />
            <SectionLabel>Onde encontrar</SectionLabel>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {persona.foundOnChannels.map((channel) => (
              <Badge key={channel} variant="outline" className="max-w-full overflow-hidden text-ellipsis">
                {channel}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
