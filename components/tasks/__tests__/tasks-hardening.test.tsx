import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { TaskCheckbox } from '../task-checkbox'
import { TaskRow } from '../task-row'
import { TasksFilterChips } from '../tasks-filter-chips'
import type { Lead, Task } from '@/lib/types'

const baseTask: Task = {
  id: 'task-hardening',
  title: 'Enviar proposta com contexto comercial bem definido',
  description: 'Preparar uma proposta objetiva para o lead, com escopo e próximo passo.',
  dueDate: '2026-05-07T14:00:00.000Z',
  importance: 'high',
  status: 'pending',
  category: 'follow-up',
  relatedLeadId: 'lead-hardening',
  tagIds: ['proposta', 'follow-up'],
  source: 'manual',
  color: 'purple',
  createdAt: '2026-05-05T10:00:00.000Z',
  updatedAt: '2026-05-05T10:00:00.000Z',
}

const lead: Lead = {
  id: 'lead-hardening',
  name: 'Marina Alves',
  company: 'Studio Marina',
  niche: 'Agência de social media',
  origin: 'cold-dm',
  pipelineStageId: 'stage-replied',
  temperature: 'hot',
  icpScore: 86,
  ownerId: 'arthur',
  tagIds: [],
  result: 'open',
  createdAt: '2026-05-05T10:00:00.000Z',
  updatedAt: '2026-05-05T10:00:00.000Z',
}

describe('tasks hardening', () => {
  it('does not expose a nested interactive row wrapper around checkbox and lead link', () => {
    const html = renderToStaticMarkup(
      <TaskRow
        task={baseTask}
        now={new Date('2026-05-07T12:00:00.000Z')}
        leadById={new Map([[lead.id, lead]])}
        isPending={false}
        onToggle={vi.fn()}
        onOpen={vi.fn()}
      />
    )

    expect(html).not.toContain('role="button"')
    expect(html).toContain('aria-label="Editar tarefa')
    expect(html).toContain('href="/leads/lead-hardening"')
    expect(html).not.toContain('rgba(')
  })

  it('keeps checkbox and quick filters touch-friendly', () => {
    const checkboxHtml = renderToStaticMarkup(
      <TaskCheckbox status="pending" title="Enviar proposta" onToggle={vi.fn()} />
    )
    const chipsHtml = renderToStaticMarkup(
      <TasksFilterChips
        tasks={[baseTask]}
        active="todas"
        today={new Date('2026-05-07T12:00:00.000Z')}
        onChange={vi.fn()}
      />
    )

    expect(checkboxHtml).toContain('h-11')
    expect(checkboxHtml).toContain('w-11')
    expect(chipsHtml).toContain('min-h-11')
  })
})
