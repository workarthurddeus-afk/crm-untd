'use client'

import {
  History,
  MessageSquareText,
  NotebookPen,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/shared/empty-state'
import { LeadOverview } from './lead-overview'
import type { Lead, PipelineStage } from '@/lib/types'

interface Props {
  lead: Lead
  stage?: PipelineStage
}

export function LeadDetailTabs({ lead, stage }: Props) {
  return (
    <Tabs defaultValue="visao-geral" className="w-full">
      <TabsList>
        <TabsTrigger value="visao-geral">Visão geral</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
        <TabsTrigger value="notas">Notas</TabsTrigger>
        <TabsTrigger value="feedbacks">Feedbacks</TabsTrigger>
      </TabsList>
      <TabsContent value="visao-geral">
        <LeadOverview lead={lead} stage={stage} />
      </TabsContent>
      <TabsContent value="timeline">
        <EmptyState
          icon={History}
          title="Timeline em construção"
          description="As interações com esse lead aparecerão aqui na próxima task."
        />
      </TabsContent>
      <TabsContent value="notas">
        <EmptyState
          icon={NotebookPen}
          title="Notas em construção"
          description="Anotações livres relacionadas a esse lead chegam na Phase 2."
        />
      </TabsContent>
      <TabsContent value="feedbacks">
        <EmptyState
          icon={MessageSquareText}
          title="Feedbacks em construção"
          description="Os feedbacks recebidos virão na Phase 3."
        />
      </TabsContent>
    </Tabs>
  )
}
