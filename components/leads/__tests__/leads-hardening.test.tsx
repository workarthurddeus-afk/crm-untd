import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { Input } from '@/components/ui/input'
import { FormField } from '../_form-field'
import { LeadsTable } from '../leads-table'
import { LeadsToolbar } from '../leads-toolbar'
import type { Lead, PipelineStage } from '@/lib/types'

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

let container: HTMLDivElement
let root: Root

const stage: PipelineStage = {
  id: 'stage-prospect',
  name: 'Prospecção',
  order: 1,
  color: '#a78bfa',
}

const lead: Lead = {
  id: 'lead-marina',
  name: 'Marina Alves',
  company: 'Studio Marina',
  role: 'Founder',
  niche: 'social media',
  origin: 'cold-dm',
  pipelineStageId: 'stage-prospect',
  temperature: 'hot',
  icpScore: 91,
  revenuePotential: 4500,
  nextFollowUpAt: '2026-05-10T12:00:00.000Z',
  lastContactAt: '2026-05-05T12:00:00.000Z',
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

describe('leads hardening and polish', () => {
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

  it('connects form hints and errors to the controlled field', () => {
    render(
      <FormField label="Website" htmlFor="lead-website" hint="Use https://" error="URL inválida">
        <Input id="lead-website" aria-invalid />
      </FormField>
    )

    const input = container.querySelector<HTMLInputElement>('#lead-website')
    expect(input?.getAttribute('aria-describedby')).toBe('lead-website-error')
    expect(input?.getAttribute('aria-errormessage')).toBe('lead-website-error')
  })

  it('renders real lead links and announces sort state from table headers', () => {
    render(<LeadsTable leads={[lead]} stages={[stage]} />)

    expect(container.querySelector('tr[role="link"]')).toBeNull()
    const link = container.querySelector<HTMLAnchorElement>('a[href="/leads/lead-marina"]')
    expect(link?.textContent).toContain('Marina Alves')

    const sortedHeader = Array.from(container.querySelectorAll('th')).find((item) =>
      item.textContent?.includes('ICP')
    )
    expect(sortedHeader?.getAttribute('aria-sort')).toBe('descending')
  })

  it('uses responsive toolbar spacing and keeps the primary action reachable', () => {
    const markup = renderToStaticMarkup(<LeadsToolbar onCreate={vi.fn()} />)

    expect(markup).toContain('data-leads-toolbar')
    expect(markup).toContain('px-4')
    expect(markup).toContain('sm:px-6')
    expect(markup).toContain('data-leads-search')
    expect(markup).toContain('Novo lead')
  })

  it('does not rely on hard-coded rgba shadows for row focus', () => {
    const markup = renderToStaticMarkup(<LeadsTable leads={[lead]} stages={[stage]} />)

    expect(markup).not.toContain('rgba(83,50,234')
  })

  it('offers a mobile card list instead of only a horizontal table', () => {
    render(<LeadsTable leads={[lead]} stages={[stage]} />)

    const mobileList = container.querySelector<HTMLElement>('[data-leads-mobile-list]')
    const tableShell = container.querySelector<HTMLElement>('[data-leads-table-shell]')

    expect(mobileList?.className).toContain('md:hidden')
    expect(mobileList?.textContent).toContain('Marina Alves')
    expect(mobileList?.querySelector('a[href="/leads/lead-marina"]')).toBeTruthy()
    expect(tableShell?.className).toContain('hidden')
    expect(tableShell?.className).toContain('md:block')
  })
})
