import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { DashboardHeader } from '../dashboard-header'
import { GrowthSignals } from '../growth-signals'
import { TopMetricCard } from '../top-metric-card'
import { dashboardChartTokens } from '../dashboard-chart-tokens'
import { tokens } from '@/lib/theme/tokens'
import { Users } from 'lucide-react'
import type { Lead, Note, Task } from '@/lib/types'

let container: HTMLDivElement
let root: Root

const lead: Lead = {
  id: 'lead-test',
  name: 'Marina Alves',
  company: 'Studio Marina',
  niche: 'social media',
  origin: 'cold-dm',
  pipelineStageId: 'stage-001',
  temperature: 'hot',
  icpScore: 86,
  ownerId: 'arthur',
  tagIds: ['social-media'],
  result: 'open',
  createdAt: '2026-05-01T10:00:00.000Z',
  updatedAt: '2026-05-01T10:00:00.000Z',
}

const task: Task = {
  id: 'task-test',
  title: 'Enviar proposta para Marina',
  description: 'Preparar follow-up com escopo enxuto',
  dueDate: '2026-05-06T12:00:00.000Z',
  importance: 'high',
  status: 'pending',
  category: 'follow-up',
  relatedLeadId: 'lead-test',
  source: 'dashboard',
  color: 'purple',
  tagIds: ['proposta'],
  createdAt: '2026-05-01T10:00:00.000Z',
  updatedAt: '2026-05-01T10:00:00.000Z',
}

const note: Note = {
  id: 'note-test',
  title: 'Insight sobre Social Media',
  content: 'Agencias precisam de consistencia visual sem aumentar o time.',
  excerpt: 'Agencias precisam de consistencia visual',
  type: 'insight',
  status: 'active',
  priority: 'high',
  impact: 'high',
  effort: 'low',
  color: 'purple',
  tags: ['social-media'],
  folderId: null,
  isPinned: false,
  isFavorite: true,
  isArchived: false,
  source: 'dashboard',
  createdAt: '2026-05-01T10:00:00.000Z',
  updatedAt: '2026-05-01T10:00:00.000Z',
  tagIds: ['social-media'],
  relatedTo: 'sales',
  pinned: false,
  favorited: true,
}

function renderHeader() {
  act(() => {
    root.render(
      <DashboardHeader
        today={new Date('2026-05-06T12:00:00.000Z')}
        onCreateLead={vi.fn()}
        onCreateTask={vi.fn()}
        onCreateNote={vi.fn()}
        leads={[lead]}
        tasks={[task]}
        notes={[note]}
      />
    )
  })
}

describe('dashboard audit hardening', () => {
  beforeAll(() => {
    ;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  })

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
  })

  it('keeps header actions responsive and exposes search as a keyboard-aware combobox', () => {
    renderHeader()

    const actions = container.querySelector('[data-dashboard-header-actions]')
    expect(actions?.className).toContain('flex-wrap')

    const input = container.querySelector<HTMLInputElement>('input[aria-label="Busca global do Dashboard"]')
    expect(input).toBeTruthy()
    expect(input?.getAttribute('role')).toBe('combobox')
    expect(input?.getAttribute('aria-expanded')).toBe('false')

    act(() => {
      const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
      setValue?.call(input, 'marina')
      input!.dispatchEvent(new InputEvent('input', { bubbles: true, data: 'marina' }))
    })

    expect(input?.getAttribute('aria-expanded')).toBe('true')
    expect(container.querySelector('[role="listbox"]')).toBeTruthy()

    act(() => {
      input!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    })

    expect(input?.getAttribute('aria-expanded')).toBe('false')
  })

  it('keeps social and ads dashboard signals passive until the modules are ready', () => {
    const markup = renderToStaticMarkup(
      <GrowthSignals
        social={{ reach7d: 24000, engagementRate: 6.4, growth: 11.2, bestPostTitle: 'Antes e depois premium' }}
        ads={{ investment: 850, leadsGenerated: 18, cpl: 47.22, bestCampaign: 'Primeiros 10 clientes' }}
      />
    )

    expect(markup).not.toContain('href="/social-media"')
    expect(markup).not.toContain('href="/meta-ads"')
    expect(markup).toContain('Integração futura')
  })

  it('uses design tokens for dashboard chart colors', () => {
    expect(dashboardChartTokens.primary).toBe(tokens.colors.primary)
    expect(dashboardChartTokens.border).toBe(tokens.colors.border)
    expect(dashboardChartTokens.textMuted).toBe(tokens.colors.textMuted)
  })

  it('removes repeated radial glow from top metric cards', () => {
    const markup = renderToStaticMarkup(
      <TopMetricCard label="MRR Atual" value="R$ 12.000" Icon={Users} accent="primary" />
    )

    expect(markup).not.toContain('radial-gradient')
  })
})
