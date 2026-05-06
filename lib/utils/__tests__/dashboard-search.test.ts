import { describe, expect, it } from 'vitest'
import { buildDashboardSearchResults } from '../dashboard-search'
import type { Lead, Note, Task } from '@/lib/types'

const lead = {
  id: 'lead-1',
  name: 'Marina Torres',
  company: 'Clínica Aurora',
  niche: 'Estética',
  origin: 'cold-dm',
  pipelineStageId: 'stage-replied',
  temperature: 'hot',
  icpScore: 87,
  ownerId: 'arthur',
  tagIds: ['clinica'],
  result: 'open',
  createdAt: '2026-05-01T00:00:00.000Z',
  updatedAt: '2026-05-01T00:00:00.000Z',
} satisfies Lead

const task = {
  id: 'task-1',
  title: 'Enviar proposta para agência',
  description: 'Retomar negociação com social media',
  importance: 'high',
  status: 'pending',
  category: 'follow-up',
  tagIds: ['proposta'],
  createdAt: '2026-05-01T00:00:00.000Z',
  updatedAt: '2026-05-01T00:00:00.000Z',
} satisfies Task

const note = {
  id: 'note-1',
  title: 'Insight sobre BrandKit',
  content: 'Leads querem consistência visual sem perder identidade.',
  type: 'insight',
  status: 'active',
  priority: 'high',
  impact: 'high',
  effort: 'low',
  color: 'purple',
  tags: ['brandkit'],
  isPinned: false,
  isFavorite: true,
  isArchived: false,
  createdAt: '2026-05-01T00:00:00.000Z',
  updatedAt: '2026-05-01T00:00:00.000Z',
  tagIds: ['brandkit'],
  relatedTo: 'product',
  pinned: false,
  favorited: true,
} satisfies Note

describe('buildDashboardSearchResults', () => {
  it('returns matched leads, tasks and notes with module hrefs', () => {
    const results = buildDashboardSearchResults({
      query: 'brandkit',
      leads: [lead],
      tasks: [task],
      notes: [note],
    })

    expect(results).toEqual([
      expect.objectContaining({
        id: 'note-1',
        type: 'note',
        title: 'Insight sobre BrandKit',
        href: '/notes',
      }),
    ])
  })

  it('limits empty or whitespace queries to no results', () => {
    expect(
      buildDashboardSearchResults({
        query: ' ',
        leads: [lead],
        tasks: [task],
        notes: [note],
      })
    ).toEqual([])
  })
})
