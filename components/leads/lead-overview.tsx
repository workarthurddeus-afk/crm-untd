'use client'

import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import {
  Calendar,
  ExternalLink,
  Mail,
  MessageSquareQuote,
  TrendingUp,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ICPScoreRing } from '@/components/shared/icp-score-ring'
import { TemperatureBadge } from '@/components/shared/temperature-badge'
import { OriginTag } from '@/components/shared/origin-tag'
import { StaggerList, StaggerItem } from '@/components/motion/stagger'
import { cn } from '@/lib/utils/cn'
import type { Lead, LeadResult, PipelineStage } from '@/lib/types'

interface Props {
  lead: Lead
  stage?: PipelineStage
}

interface SectionProps {
  icon: LucideIcon
  title: string
  children: React.ReactNode
}

function Section({ icon: Icon, title, children }: SectionProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Icon
            className="h-4 w-4 text-text-muted"
            strokeWidth={1.5}
            aria-hidden
          />
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-text-secondary">
            {title}
          </h3>
        </div>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  )
}

interface RowProps {
  label: string
  children: React.ReactNode
  className?: string
}

function Row({ label, children, className }: RowProps) {
  return (
    <div className={cn('grid grid-cols-[110px_1fr] items-baseline gap-3', className)}>
      <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </dt>
      <dd className="text-sm text-text break-words min-w-0">{children}</dd>
    </div>
  )
}

const muted = <span className="text-text-muted">—</span>

function fmtDate(iso?: string): React.ReactNode {
  if (!iso) return muted
  try {
    return format(parseISO(iso), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  } catch {
    return muted
  }
}

function instagramHref(handle: string): string {
  return `https://instagram.com/${handle.replace(/^@/, '')}`
}

const resultConfig: Record<
  LeadResult,
  { label: string; variant: 'default' | 'success' | 'danger' | 'warning' | 'secondary' | 'info' }
> = {
  open: { label: 'Aberto', variant: 'info' },
  won: { label: 'Ganho', variant: 'success' },
  lost: { label: 'Perdido', variant: 'danger' },
  'no-response': { label: 'Sem resposta', variant: 'warning' },
  'no-fit': { label: 'Sem fit', variant: 'secondary' },
}

function overdueDays(iso?: string): number | null {
  if (!iso) return null
  const today = new Date()
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  ).getTime()
  const due = parseISO(iso).getTime()
  const delta = Math.floor((due - todayStart) / 86_400_000)
  return delta < 0 ? Math.abs(delta) : null
}

export function LeadOverview({ lead, stage }: Props) {
  const overdue = overdueDays(lead.nextFollowUpAt)
  const location = [lead.location?.city, lead.location?.country]
    .filter(Boolean)
    .join(', ')
  const result = resultConfig[lead.result]

  return (
    <StaggerList className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* CONTATO */}
      <StaggerItem>
        <Section icon={Mail} title="Contato">
          <dl className="space-y-3">
            <Row label="Email">
              {lead.email ? (
                <a
                  href={`mailto:${lead.email}`}
                  className="text-text hover:text-primary transition-colors duration-fast break-all"
                >
                  {lead.email}
                </a>
              ) : (
                muted
              )}
            </Row>
            <Row label="Telefone">
              {lead.phone ? (
                <a
                  href={`tel:${lead.phone.replace(/\s+/g, '')}`}
                  className="font-mono tabular-nums text-text hover:text-primary transition-colors duration-fast"
                >
                  {lead.phone}
                </a>
              ) : (
                muted
              )}
            </Row>
            <Row label="Instagram">
              {lead.instagram ? (
                <a
                  href={instagramHref(lead.instagram)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-text hover:text-primary transition-colors duration-fast"
                >
                  {lead.instagram}
                  <ExternalLink className="h-3 w-3" strokeWidth={1.5} aria-hidden />
                </a>
              ) : (
                muted
              )}
            </Row>
            <Row label="LinkedIn">
              {lead.linkedin ? (
                <a
                  href={lead.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-text hover:text-primary transition-colors duration-fast break-all"
                >
                  Perfil
                  <ExternalLink className="h-3 w-3" strokeWidth={1.5} aria-hidden />
                </a>
              ) : (
                muted
              )}
            </Row>
            <Row label="Website">
              {lead.website ? (
                <a
                  href={lead.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-text hover:text-primary transition-colors duration-fast break-all"
                >
                  {lead.website.replace(/^https?:\/\//, '')}
                  <ExternalLink className="h-3 w-3" strokeWidth={1.5} aria-hidden />
                </a>
              ) : (
                muted
              )}
            </Row>
            <Row label="Localização">{location || muted}</Row>
          </dl>
        </Section>
      </StaggerItem>

      {/* COMERCIAL */}
      <StaggerItem>
        <Section icon={TrendingUp} title="Comercial">
          <dl className="space-y-3">
            <Row label="Nicho">{lead.niche || muted}</Row>
            <Row label="Origem">
              <OriginTag origin={lead.origin} />
            </Row>
            <Row label="Temperatura">
              <TemperatureBadge value={lead.temperature} />
            </Row>
            <Row label="Etapa">
              {stage ? (
                <Badge
                  variant="outline"
                  style={{ color: stage.color, borderColor: 'var(--border)' }}
                >
                  <span
                    aria-hidden
                    className="mr-1 inline-block h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  {stage.name}
                </Badge>
              ) : (
                muted
              )}
            </Row>
            <Row label="Receita">
              {typeof lead.revenuePotential === 'number' ? (
                <span className="font-mono tabular-nums text-text">
                  R$ {lead.revenuePotential.toLocaleString('pt-BR')}
                </span>
              ) : (
                muted
              )}
            </Row>
            <Row label="Resultado">
              <Badge variant={result.variant}>{result.label}</Badge>
            </Row>
            <Row label="Score ICP">
              <span className="inline-flex items-center gap-2">
                <ICPScoreRing
                  score={lead.icpScore}
                  size={32}
                  strokeWidth={3}
                  showLabel={false}
                />
                <span className="font-mono tabular-nums text-sm text-text">
                  {lead.icpScore}/100
                </span>
              </span>
            </Row>
          </dl>
        </Section>
      </StaggerItem>

      {/* DATAS */}
      <StaggerItem>
        <Section icon={Calendar} title="Datas">
          <dl className="space-y-3">
            <Row label="Criado">{fmtDate(lead.createdAt)}</Row>
            <Row label="1º contato">{fmtDate(lead.firstContactAt)}</Row>
            <Row label="Último contato">{fmtDate(lead.lastContactAt)}</Row>
            <Row label="Follow-up">
              {lead.nextFollowUpAt ? (
                <span className="flex flex-wrap items-center gap-2">
                  <span className={cn(overdue !== null && 'text-danger')}>
                    {fmtDate(lead.nextFollowUpAt)}
                  </span>
                  {overdue !== null && (
                    <Badge variant="danger">
                      {overdue === 1
                        ? 'Atrasado por 1 dia'
                        : `Atrasado por ${overdue} dias`}
                    </Badge>
                  )}
                </span>
              ) : (
                muted
              )}
            </Row>
          </dl>
        </Section>
      </StaggerItem>

      {/* NOTAS / DOR */}
      <StaggerItem>
        <Section icon={MessageSquareQuote} title="Notas e dor">
          <div className="flex flex-col gap-4">
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-text-muted mb-1.5">
                Dor principal
              </div>
              {lead.pain ? (
                <p className="text-sm text-text-secondary leading-relaxed">
                  {lead.pain}
                </p>
              ) : (
                <p className="text-sm italic text-text-muted">
                  Sem dor mapeada.
                </p>
              )}
            </div>

            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-text-muted mb-1.5">
                Notas internas
              </div>
              {lead.internalNotes ? (
                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {lead.internalNotes}
                </p>
              ) : (
                <p className="text-sm italic text-text-muted">
                  Nenhuma nota registrada.
                </p>
              )}
            </div>

            {lead.objections && lead.objections.length > 0 && (
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-text-muted mb-1.5">
                  Objeções
                </div>
                <ul className="flex flex-col gap-1">
                  {lead.objections.map((obj, i) => (
                    <li
                      key={i}
                      className="text-sm text-text-secondary flex gap-2"
                    >
                      <span className="text-text-muted shrink-0">·</span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Section>
      </StaggerItem>
    </StaggerList>
  )
}
