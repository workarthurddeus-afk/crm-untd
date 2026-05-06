import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { CalendarToolbar, DEFAULT_FILTERS } from '../calendar-toolbar'

describe('CalendarToolbar', () => {
  it('does not expose incomplete calendar views', () => {
    const html = renderToStaticMarkup(
      <CalendarToolbar
        cursor={new Date('2026-05-01T00:00:00.000Z')}
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onToday={vi.fn()}
        filters={DEFAULT_FILTERS}
        onFilterChange={vi.fn()}
      />
    )

    expect(html).not.toContain('>Semana<')
    expect(html).not.toContain('>Dia<')
    expect(html).not.toContain('>Agenda<')
  })
})
