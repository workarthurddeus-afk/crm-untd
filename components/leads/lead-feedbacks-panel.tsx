'use client'

import { MessageSquareText, Plus } from 'lucide-react'
import { FeedbackCard } from '@/components/feedbacks/feedback-card'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import type { Feedback, Lead } from '@/lib/types'

interface Props {
  feedbacks: Feedback[]
  lead: Lead
  isLoading: boolean
  onCreate: () => void
  onSelect: (feedback: Feedback) => void
}

export function LeadFeedbacksPanel({ feedbacks, lead, isLoading, onCreate, onSelect }: Props) {
  if (isLoading) {
    return (
      <div className="grid gap-3 pt-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="p-4">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-3/4" />
          </Card>
        ))}
      </div>
    )
  }

  if (feedbacks.length === 0) {
    return (
      <EmptyState
        icon={MessageSquareText}
        title="Nenhum feedback deste lead"
        description="Registre dores, objecoes e pedidos para transformar conversa em aprendizado operacional."
        action={
          <Button variant="primary" onClick={onCreate}>
            <Plus aria-hidden /> Novo feedback
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-3 pt-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-text">
            {feedbacks.length} sinal{feedbacks.length === 1 ? '' : 's'} capturado{feedbacks.length === 1 ? '' : 's'}
          </p>
          <p className="mt-1 text-xs text-text-muted">Dores, objecoes e sinais vindos deste relacionamento.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={onCreate}>
          <Plus aria-hidden /> Novo feedback
        </Button>
      </div>

      <div className="grid gap-3">
        {feedbacks.map((feedback) => (
          <FeedbackCard
            key={feedback.id}
            feedback={feedback}
            leads={[lead]}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}
