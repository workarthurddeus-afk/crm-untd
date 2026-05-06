import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { StrategicMemoryCard } from '../strategic-memory-card'
import type { StrategicMemoryPick } from '@/lib/utils/strategic-memory'

const pick = {
  memoryType: 'high_impact',
  reason: 'Impacto alto para o produto',
  score: 80,
  note: {
    id: 'note-1',
    title: 'Insight de vendas',
    content: 'Social medias precisam transformar aprendizados em ação.',
    type: 'insight',
    status: 'active',
    priority: 'high',
    impact: 'high',
    effort: 'low',
    color: 'purple',
    tags: ['vendas'],
    isPinned: false,
    isFavorite: true,
    isArchived: false,
    relatedTaskId: null,
    createdAt: '2026-05-01T00:00:00.000Z',
    updatedAt: '2026-05-01T00:00:00.000Z',
    tagIds: ['vendas'],
    relatedTo: 'sales',
    pinned: false,
    favorited: true,
  },
} satisfies StrategicMemoryPick

describe('StrategicMemoryCard', () => {
  it('does not render a coming-soon task action', () => {
    const html = renderToStaticMarkup(
      <StrategicMemoryCard pick={pick} onTransformToTask={vi.fn()} />
    )

    expect(html).not.toContain('em breve')
    expect(html).toContain('Virar tarefa')
  })
})
