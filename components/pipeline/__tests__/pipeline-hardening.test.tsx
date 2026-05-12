import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { PipelineBoard } from '../pipeline-board'
import { PipelineCard } from '../pipeline-card'
import { PipelineColumn } from '../pipeline-column'
import type { Lead, PipelineStage } from '@/lib/types'

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

let container: HTMLDivElement
let root: Root

const stages: PipelineStage[] = [
  {
    id: 'stage-prospect',
    name: 'Prospecção',
    color: '#a78bfa',
    order: 1,
    isFinalWon: false,
    isFinalLost: false,
  },
  {
    id: 'stage-follow-up',
    name: 'Follow-up',
    color: '#fbbf24',
    order: 2,
    isFinalWon: false,
    isFinalLost: false,
  },
]

const lead: Lead = {
  id: 'lead-marina',
  name: 'Marina Alves',
  company: 'Studio Marina',
  role: 'Founder',
  niche: 'social media',
  origin: 'cold-dm',
  pipelineStageId: 'stage-prospect',
  temperature: 'hot',
  icpScore: 88,
  revenuePotential: 4500,
  nextFollowUpAt: '2026-05-06T12:00:00.000Z',
  ownerId: 'arthur',
  tagIds: ['social-media'],
  result: 'open',
  createdAt: '2026-05-01T10:00:00.000Z',
  updatedAt: '2026-05-02T10:00:00.000Z',
}

function render(ui: React.ReactNode) {
  act(() => {
    root.render(ui)
  })
}

describe('pipeline hardening and polish', () => {
  beforeAll(() => {
    ;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  })

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    pushMock.mockClear()
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
  })

  it('opens a lead with keyboard while exposing a clear accessible label', () => {
    render(<PipelineCard lead={lead} />)

    const card = container.querySelector<HTMLElement>('[data-pipeline-card]')
    expect(card).toBeTruthy()
    expect(card?.getAttribute('role')).toBe('button')
    expect(card?.getAttribute('aria-label')).toContain('Abrir lead Marina Alves')
    expect(card?.getAttribute('aria-label')).toContain('Arraste para mover no pipeline')

    act(() => {
      card!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    })

    expect(pushMock).toHaveBeenCalledWith('/leads/lead-marina')
  })

  it('names columns and drop zones for assistive technology', () => {
    render(<PipelineColumn stage={stages[0]!} leads={[]} activeLeadStageId={null} />)

    const column = container.querySelector<HTMLElement>('[data-pipeline-column]')
    const dropZone = container.querySelector<HTMLElement>('[data-pipeline-dropzone]')
    const stageDot = container.querySelector<HTMLElement>('[data-pipeline-stage-dot]')

    expect(column?.getAttribute('role')).toBe('region')
    expect(column?.getAttribute('aria-label')).toContain('Etapa Prospecção')
    expect(dropZone?.getAttribute('role')).toBe('list')
    // Dropzone label intentionally short — the parent column already
    // announces "Etapa <name>", so repeating the stage name on entry was
    // verbose for screen readers (audit P3).
    expect(dropZone?.getAttribute('aria-label')).toContain('Soltar leads')
    expect(stageDot?.getAttribute('style')).toContain('--pipeline-stage-color')
    expect(container.textContent).toContain('Sem leads por aqui')
  })

  it('uses responsive board containers and a distilled summary strip', () => {
    render(<PipelineBoard leads={[lead]} stages={stages} />)

    const summary = container.querySelector<HTMLElement>('[data-pipeline-summary]')
    const scroll = container.querySelector<HTMLElement>('[data-pipeline-board-scroll]')

    expect(summary?.className).toContain('flex-wrap')
    expect(scroll?.className).toContain('px-4')
    expect(scroll?.getAttribute('aria-label')).toContain('Quadro do pipeline')
    expect(summary?.textContent).not.toContain('PipelinePipeline')
  })
})
