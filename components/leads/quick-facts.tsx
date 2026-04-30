'use client'

import { useState } from 'react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { Check, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'
import type { Lead } from '@/lib/types'

interface Props {
  lead: Lead
}

function relative(iso: string): string {
  try {
    return formatDistanceToNow(parseISO(iso), { locale: ptBR, addSuffix: true })
  } catch {
    return '—'
  }
}

export function QuickFacts({ lead }: Props) {
  const [copied, setCopied] = useState(false)

  async function copyId() {
    try {
      await navigator.clipboard.writeText(lead.id)
      setCopied(true)
      toast.success('ID copiado')
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      toast.error('Não foi possível copiar.')
    }
  }

  const shortId = lead.id.slice(-6)

  return (
    <Card>
      <CardHeader className="pb-3">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Resumo
        </h3>
      </CardHeader>
      <CardContent className="pt-0">
        <dl className="space-y-3">
          <div className="grid grid-cols-[110px_1fr] items-baseline gap-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Lead ID
            </dt>
            <dd className="flex items-center gap-1.5 min-w-0">
              <code className="font-mono text-xs tabular-nums text-text-secondary">
                …{shortId}
              </code>
              <button
                type="button"
                onClick={copyId}
                aria-label="Copiar ID completo"
                className={cn(
                  'inline-flex h-6 w-6 items-center justify-center rounded-sm',
                  'text-text-muted transition-colors duration-fast',
                  'hover:bg-primary-muted hover:text-text',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'
                )}
              >
                {copied ? (
                  <Check className="h-3 w-3 text-success" strokeWidth={2} aria-hidden />
                ) : (
                  <Copy className="h-3 w-3" strokeWidth={1.5} aria-hidden />
                )}
              </button>
            </dd>
          </div>
          <div className="grid grid-cols-[110px_1fr] items-baseline gap-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Owner
            </dt>
            <dd className="text-sm text-text capitalize">{lead.ownerId}</dd>
          </div>
          <div className="grid grid-cols-[110px_1fr] items-baseline gap-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Criado
            </dt>
            <dd className="text-sm text-text-secondary">
              {relative(lead.createdAt)}
            </dd>
          </div>
          <div className="grid grid-cols-[110px_1fr] items-baseline gap-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Atualizado
            </dt>
            <dd className="text-sm text-text-secondary">
              {relative(lead.updatedAt)}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}
