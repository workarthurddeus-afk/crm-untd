'use client'

import { useState, useMemo, useCallback } from 'react'
import { useReducedMotion } from 'framer-motion'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { Users, TrendingUp, Trophy, Workflow, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'

import { leadsRepo } from '@/lib/repositories/leads.repository'
import { PipelineColumn } from './pipeline-column'
import { PipelineCard } from './pipeline-card'
import type { Lead, PipelineStage } from '@/lib/types'

interface Props {
  leads: Lead[]
  stages: PipelineStage[]
  onNewLead?: () => void
}

export function PipelineBoard({ leads, stages, onNewLead }: Props) {
  const prefersReducedMotion = useReducedMotion()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [optimisticOverrides, setOptimisticOverrides] = useState<Map<string, string>>(new Map())

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const sortedStages = useMemo(
    () => [...stages].sort((a, b) => a.order - b.order),
    [stages],
  )

  const effectiveLeads = useMemo(() => {
    if (optimisticOverrides.size === 0) return leads
    return leads.map((l) => {
      const override = optimisticOverrides.get(l.id)
      if (override === undefined) return l
      return { ...l, pipelineStageId: override }
    })
  }, [leads, optimisticOverrides])

  const columnLeads = useMemo(() => {
    const map = new Map<string, Lead[]>()
    for (const stage of sortedStages) {
      map.set(stage.id, [])
    }
    for (const lead of effectiveLeads) {
      const bucket = map.get(lead.pipelineStageId)
      if (bucket) bucket.push(lead)
    }
    for (const [, bucket] of map) {
      bucket.sort((a, b) => {
        const aTime = a.lastContactAt ?? a.createdAt
        const bTime = b.lastContactAt ?? b.createdAt
        return bTime.localeCompare(aTime)
      })
    }
    return map
  }, [effectiveLeads, sortedStages])

  const activeLead = useMemo(
    () => (activeId ? leads.find((l) => l.id === activeId) ?? null : null),
    [activeId, leads],
  )

  const activeLeadStageId = useMemo(() => {
    if (!activeId) return null
    return optimisticOverrides.get(activeId) ?? leads.find((l) => l.id === activeId)?.pipelineStageId ?? null
  }, [activeId, leads, optimisticOverrides])

  const openLeads = useMemo(() => leads.filter((l) => l.result === 'open'), [leads])
  const totalRevenue = useMemo(
    () => openLeads.reduce((sum, l) => sum + (l.revenuePotential ?? 0), 0),
    [openLeads],
  )
  const wonThisMonth = useMemo(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth()
    return leads.filter((l) => {
      if (l.result !== 'won') return false
      const d = new Date(l.updatedAt)
      return d.getFullYear() === y && d.getMonth() === m
    }).length
  }, [leads])

  const onDragStart = useCallback(({ active }: DragStartEvent) => {
    setActiveId(active.id as string)
  }, [])

  const onDragEnd = useCallback(
    async ({ active, over }: DragEndEvent) => {
      setActiveId(null)

      if (!over) return

      const leadId = active.id as string
      const newStageId = over.id as string
      const lead = leads.find((l) => l.id === leadId)
      if (!lead) return

      const currentStageId = lead.pipelineStageId
      if (newStageId === currentStageId) return

      const newStage = sortedStages.find((s) => s.id === newStageId)
      if (!newStage) return

      setOptimisticOverrides((prev) => {
        const next = new Map(prev)
        next.set(leadId, newStageId)
        return next
      })

      const updatePayload: Partial<Lead> = { pipelineStageId: newStageId }
      if (newStage.isFinalWon) updatePayload.result = 'won'
      else if (newStage.isFinalLost) updatePayload.result = 'lost'

      try {
        await leadsRepo.update(leadId, updatePayload)
        toast.success(`${lead.name} movido para ${newStage.name}`)
      } catch (err) {
        setOptimisticOverrides((prev) => {
          const next = new Map(prev)
          next.delete(leadId)
          return next
        })
        toast.error('Falha ao mover lead', {
          description: err instanceof Error ? err.message : String(err),
        })
      } finally {
        setOptimisticOverrides((prev) => {
          const next = new Map(prev)
          next.delete(leadId)
          return next
        })
      }
    },
    [leads, sortedStages],
  )

  const onDragCancel = useCallback(() => {
    setActiveId(null)
  }, [])

  if (stages.length === 0) {
    return (
      <div className="px-8 py-12">
        <EmptyState
          icon={Workflow}
          title="Nenhuma etapa configurada."
          description="Configure as etapas do pipeline para começar."
        />
      </div>
    )
  }

  if (leads.length === 0) {
    return (
      <div className="px-8 py-12">
        <EmptyState
          icon={Workflow}
          title="Pipeline vazio."
          description="Crie seu primeiro lead para começar."
          action={
            onNewLead && (
              <Button variant="primary" size="sm" onClick={onNewLead}>
                <Plus aria-hidden />
                Novo lead
              </Button>
            )
          }
        />
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <div className="border-b border-border">
        <div data-pipeline-summary className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 text-xs sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-text-muted">
            <Users className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
            <span className="text-text-secondary">Abertos</span>
            <Badge variant="secondary" className="font-mono tabular-nums" aria-label={`${openLeads.length} leads abertos`}>
              {openLeads.length}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-text-muted">
            <TrendingUp className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
            <span className="text-text-secondary">Valor aberto</span>
            <span className="font-mono tabular-nums text-text">
              R$ {totalRevenue.toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-text-muted">
            <Trophy className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
            <span className="text-text-secondary">Ganhos no mês</span>
            <Badge variant="success" className="font-mono tabular-nums" aria-label={`${wonThisMonth} ganhos no mês`}>
              {wonThisMonth}
            </Badge>
          </div>
        </div>
      </div>

      <div
        data-pipeline-board-scroll
        aria-label="Quadro do pipeline por etapas"
        className="flex gap-4 overflow-x-auto px-4 pb-8 pt-6 min-h-[calc(100vh-180px)] sm:px-6 lg:px-8"
      >
        {sortedStages.map((stage) => (
          <PipelineColumn
            key={stage.id}
            stage={stage}
            leads={columnLeads.get(stage.id) ?? []}
            activeLeadStageId={activeLeadStageId}
          />
        ))}
      </div>

      <DragOverlay
        dropAnimation={
          prefersReducedMotion
            ? null
            : {
                duration: 150,
                easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
              }
        }
      >
        {activeLead ? (
          <PipelineCard lead={activeLead} isOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
