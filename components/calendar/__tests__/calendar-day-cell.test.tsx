import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { CalendarDayCell } from '../calendar-day-cell'
import type { CalendarEvent } from '@/lib/types'

const event: CalendarEvent = {
  id: 'cal-test',
  title: 'Follow-up com lead quente',
  startAt: '2026-05-05T14:00:00.000Z',
  endAt: '2026-05-05T14:30:00.000Z',
  allDay: false,
  type: 'follow_up',
  status: 'scheduled',
  priority: 'high',
  importance: 'high',
  color: 'green',
  attendees: [],
  tags: ['vendas'],
  relatedLeadId: null,
  relatedTaskId: null,
  relatedNoteId: null,
  relatedFeedbackId: null,
  relatedProjectId: null,
  source: 'manual',
  isReminder: true,
  reminderAt: '2026-05-05T13:30:00.000Z',
  completedAt: null,
  createdAt: '2026-05-01T00:00:00.000Z',
  updatedAt: '2026-05-01T00:00:00.000Z',
}

describe('CalendarDayCell', () => {
  it('does not nest event buttons inside a day button', () => {
    const html = renderToStaticMarkup(
      <CalendarDayCell
        date={new Date('2026-05-05T00:00:00.000Z')}
        isCurrentMonth
        isToday
        isSelected
        events={[event]}
        onSelectDay={vi.fn()}
        onSelectEvent={vi.fn()}
        selectedEventId={null}
        today={new Date('2026-05-05T00:00:00.000Z')}
      />
    )

    expect(html).not.toMatch(/<button[\s\S]*<button/)
  })
})
