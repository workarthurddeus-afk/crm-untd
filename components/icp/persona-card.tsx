'use client'

import {
  HeartCrack,
  Sparkles,
  ShieldAlert,
  Zap,
  Quote,
  Radio,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { ICPPersona } from '@/lib/types'

interface Props {
  persona: ICPPersona
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
      {children}
    </p>
  )
}

interface PersonaSectionProps {
  icon: React.ElementType
  iconBg: string
  title: string
  items: string[]
}

function PersonaSection({ icon: Icon, iconBg, title, items }: PersonaSectionProps) {
  if (items.length === 0) return null

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 ${iconBg}`}
        >
          <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden />
        </div>
        <SectionLabel>{title}</SectionLabel>
      </div>
      <ul className="space-y-1.5 pl-9">
        {items.map((item) => (
          <li key={item} className="text-sm text-text-secondary leading-snug">
            <span className="text-text-muted mr-1.5">·</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function PersonaCard({ persona }: Props) {
  return (
    <Card className="p-5">
      <SectionLabel>Persona</SectionLabel>
      <p className="mt-2 font-display text-lg font-semibold text-text">
        {persona.name}
      </p>
      <p className="mt-1.5 text-sm text-text-secondary leading-relaxed">
        {persona.description}
      </p>

      <Separator className="my-5" />

      <div className="space-y-5">
        <PersonaSection
          icon={HeartCrack}
          iconBg="bg-danger/10 text-danger"
          title="Dores"
          items={persona.pains}
        />
        <PersonaSection
          icon={Sparkles}
          iconBg="bg-success/10 text-success"
          title="Desejos"
          items={persona.desires}
        />
        <PersonaSection
          icon={ShieldAlert}
          iconBg="bg-info/10 text-info"
          title="Objeções"
          items={persona.objections}
        />
        <PersonaSection
          icon={Zap}
          iconBg="bg-warning/10 text-warning"
          title="Gatilhos de compra"
          items={persona.purchaseTriggers}
        />
      </div>

      <Separator className="my-5" />

      {persona.bestMessage && (
        <div>
          <div className="flex items-center gap-2">
            <Quote className="h-4 w-4 text-primary shrink-0" strokeWidth={1.5} aria-hidden />
            <SectionLabel>Mensagem-chave</SectionLabel>
          </div>
          <blockquote className="mt-2 border-l-2 border-primary/40 pl-3 text-sm italic text-text leading-relaxed">
            {persona.bestMessage}
          </blockquote>
        </div>
      )}

      {persona.likelyOffer && (
        <div className="mt-4">
          <SectionLabel>Oferta provável</SectionLabel>
          <p className="mt-1 text-sm text-text-secondary">{persona.likelyOffer}</p>
        </div>
      )}

      <Separator className="my-5" />

      <div>
        <div className="flex items-center gap-2 mb-2">
          <Radio className="h-4 w-4 text-text-muted shrink-0" strokeWidth={1.5} aria-hidden />
          <SectionLabel>Onde encontrar</SectionLabel>
        </div>
        <div className="flex flex-wrap gap-1.5 pl-6 mt-2">
          {persona.foundOnChannels.map((channel) => (
            <Badge key={channel} variant="outline">
              {channel}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  )
}
