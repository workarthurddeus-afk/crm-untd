'use client'

import { useState } from 'react'
import {
  Send,
  MessageCircle,
  RefreshCw,
  CalendarPlus,
  CalendarCheck,
  FileText,
  MessageSquareQuote,
  Trophy,
  XCircle,
  StickyNote,
  History,
  Trash2,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { useReducedMotion } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { DestructiveConfirmDialog } from '@/components/shared/destructive-confirm-dialog'
import { StaggerList, StaggerItem } from '@/components/motion/stagger'
import { useInteractions } from '@/lib/hooks/use-interactions'
import type { InteractionType, LeadInteraction } from '@/lib/types'

const typeLabel: Record<InteractionType, string> = {
  'first-contact-sent': 'Primeiro contato enviado',
  'replied': 'Lead respondeu',
  'follow-up-sent': 'Follow-up enviado',
  'meeting-scheduled': 'Reunião agendada',
  'meeting-held': 'Reunião realizada',
  'proposal-sent': 'Proposta enviada',
  'feedback-received': 'Feedback recebido',
  'won': 'Lead ganho',
  'lost': 'Lead perdido',
  'note': 'Nota interna',
}

const typeConfig: Record<
  InteractionType,
  { icon: React.ElementType; bubbleCn: string; iconCn: string }
> = {
  'first-contact-sent': {
    icon: Send,
    bubbleCn: 'bg-primary/10',
    iconCn: 'text-primary',
  },
  'replied': {
    icon: MessageCircle,
    bubbleCn: 'bg-success/10',
    iconCn: 'text-success',
  },
  'follow-up-sent': {
    icon: RefreshCw,
    bubbleCn: 'bg-pipe-followup/10',
    iconCn: 'text-pipe-followup',
  },
  'meeting-scheduled': {
    icon: CalendarPlus,
    bubbleCn: 'bg-info/10',
    iconCn: 'text-info',
  },
  'meeting-held': {
    icon: CalendarCheck,
    bubbleCn: 'bg-success/10',
    iconCn: 'text-success',
  },
  'proposal-sent': {
    icon: FileText,
    bubbleCn: 'bg-primary/10',
    iconCn: 'text-primary',
  },
  'feedback-received': {
    icon: MessageSquareQuote,
    bubbleCn: 'bg-warning/10',
    iconCn: 'text-warning',
  },
  'won': {
    icon: Trophy,
    bubbleCn: 'bg-success/10',
    iconCn: 'text-success',
  },
  'lost': {
    icon: XCircle,
    bubbleCn: 'bg-danger/10',
    iconCn: 'text-danger',
  },
  'note': {
    icon: StickyNote,
    bubbleCn: 'bg-surface-elevated border border-border',
    iconCn: 'text-text-secondary',
  },
}

function formatDate(iso: string): string {
  return format(new Date(iso), "dd 'de' MMM 'de' yyyy 'às' HH:mm", {
    locale: ptBR,
  })
}

function TimelineItemSkeleton() {
  return (
    <div className="group flex gap-4">
      <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
      <div className="flex flex-1 flex-col gap-2 pt-1">
        <div className="flex items-baseline justify-between gap-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  )
}

function TimelineItem({
  interaction,
  onRequestDelete,
}: {
  interaction: LeadInteraction
  onRequestDelete: (interaction: LeadInteraction) => void
}) {
  const config = typeConfig[interaction.type]
  const Icon = config.icon

  return (
    <div className="flex gap-4">
      <div
        className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center ${config.bubbleCn}`}
      >
        <Icon className={`h-4 w-4 ${config.iconCn}`} strokeWidth={1.75} />
      </div>
      <div className="flex flex-1 flex-col min-w-0 pt-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-semibold text-text">
            {typeLabel[interaction.type]}
          </span>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="text-xs text-text-muted font-mono tabular-nums">
              {formatDate(interaction.occurredAt)}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Excluir interacao"
              onClick={() => onRequestDelete(interaction)}
              className="h-7 w-7 opacity-0 transition-opacity duration-fast group-hover:opacity-100 focus-visible:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
            </Button>
          </div>
        </div>
        {interaction.description && (
          <p className="text-sm text-text-secondary leading-relaxed mt-1">
            {interaction.description}
          </p>
        )}
      </div>
    </div>
  )
}

interface Props {
  leadId: string
}

export function LeadTimeline({ leadId }: Props) {
  const { interactions, isLoading, actions } = useInteractions(leadId)
  const reduced = useReducedMotion()
  const [interactionToDelete, setInteractionToDelete] = useState<LeadInteraction | null>(null)

  async function deleteInteraction() {
    if (!interactionToDelete) return
    await actions.deleteInteraction(interactionToDelete.id)
    toast.success('Interacao excluida')
    setInteractionToDelete(null)
  }

  if (isLoading) {
    return (
      <div className="pt-4 flex flex-col gap-5">
        <TimelineItemSkeleton />
        <TimelineItemSkeleton />
        <TimelineItemSkeleton />
        <TimelineItemSkeleton />
      </div>
    )
  }

  if (interactions.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="Nenhuma interação ainda"
        description="As interações com esse lead aparecerão aqui conforme o relacionamento avançar."
      />
    )
  }

  if (reduced) {
    return (
      <div className="relative pt-4">
        <div className="absolute left-[17px] top-4 bottom-0 w-px bg-border" />
        <div className="flex flex-col gap-5">
          {interactions.map((interaction) => (
            <TimelineItem
              key={interaction.id}
              interaction={interaction}
              onRequestDelete={setInteractionToDelete}
            />
          ))}
        </div>
        <DestructiveConfirmDialog
          open={Boolean(interactionToDelete)}
          onOpenChange={(open) => {
            if (!open) setInteractionToDelete(null)
          }}
          title="Excluir interacao?"
          description="Essa entrada sai da timeline do lead. A acao nao pode ser desfeita."
          confirmLabel="Excluir interacao"
          onConfirm={deleteInteraction}
        />
      </div>
    )
  }

  return (
    <div className="relative pt-4">
      <div className="absolute left-[17px] top-4 bottom-0 w-px bg-border" />
      <StaggerList className="flex flex-col gap-5">
        {interactions.map((interaction) => (
          <StaggerItem key={interaction.id}>
            <TimelineItem
              interaction={interaction}
              onRequestDelete={setInteractionToDelete}
            />
          </StaggerItem>
        ))}
      </StaggerList>
      <DestructiveConfirmDialog
        open={Boolean(interactionToDelete)}
        onOpenChange={(open) => {
          if (!open) setInteractionToDelete(null)
        }}
        title="Excluir interacao?"
        description="Essa entrada sai da timeline do lead. A acao nao pode ser desfeita."
        confirmLabel="Excluir interacao"
        onConfirm={deleteInteraction}
      />
    </div>
  )
}
