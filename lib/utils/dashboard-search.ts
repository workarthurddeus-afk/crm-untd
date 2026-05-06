import type { Lead, Note, Task } from '@/lib/types'

export type DashboardSearchResultType = 'lead' | 'task' | 'note'

export interface DashboardSearchResult {
  id: string
  type: DashboardSearchResultType
  title: string
  description: string
  href: string
}

interface DashboardSearchInput {
  query: string
  leads: Lead[]
  tasks: Task[]
  notes: Note[]
  limit?: number
}

function haystack(values: Array<string | undefined | null>): string {
  return values.filter(Boolean).join(' ').toLowerCase()
}

function matches(query: string, values: Array<string | undefined | null>): boolean {
  return haystack(values).includes(query)
}

export function buildDashboardSearchResults({
  query,
  leads,
  tasks,
  notes,
  limit = 6,
}: DashboardSearchInput): DashboardSearchResult[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return []

  const leadResults = leads
    .filter((lead) =>
      matches(normalized, [
        lead.name,
        lead.company,
        lead.role,
        lead.niche,
        lead.email,
        lead.instagram,
        lead.internalNotes,
        ...lead.tagIds,
      ])
    )
    .map((lead): DashboardSearchResult => ({
      id: lead.id,
      type: 'lead',
      title: lead.name,
      description: `${lead.company} · ${lead.niche}`,
      href: `/leads/${lead.id}`,
    }))

  const taskResults = tasks
    .filter((task) =>
      matches(normalized, [task.title, task.description, task.category, ...task.tagIds])
    )
    .map((task): DashboardSearchResult => ({
      id: task.id,
      type: 'task',
      title: task.title,
      description: task.description || 'Tarefa operacional',
      href: '/tasks',
    }))

  const noteResults = notes
    .filter((note) =>
      matches(normalized, [note.title, note.content, note.excerpt, note.type, ...note.tags])
    )
    .map((note): DashboardSearchResult => ({
      id: note.id,
      type: 'note',
      title: note.title,
      description: note.excerpt || note.content || 'Nota estratégica',
      href: '/notes',
    }))

  return [...leadResults, ...taskResults, ...noteResults].slice(0, limit)
}
