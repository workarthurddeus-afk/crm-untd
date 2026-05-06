import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { DashboardHeader } from '../dashboard-header'

let container: HTMLDivElement
let root: Root

function buttonByText(text: string): HTMLButtonElement {
  const button = Array.from(container.querySelectorAll('button')).find((item) =>
    item.textContent?.includes(text)
  )
  if (!button) throw new Error(`Button ${text} not found`)
  return button
}

describe('DashboardHeader', () => {
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

  it('calls real quick action handlers from the dashboard buttons', () => {
    const onCreateLead = vi.fn()
    const onCreateTask = vi.fn()
    const onCreateNote = vi.fn()

    act(() => {
      root.render(
        <DashboardHeader
          today={new Date('2026-05-06T12:00:00.000Z')}
          onCreateLead={onCreateLead}
          onCreateTask={onCreateTask}
          onCreateNote={onCreateNote}
        />
      )
    })

    act(() => buttonByText('Lead').click())
    act(() => buttonByText('Tarefa').click())
    act(() => buttonByText('Nota').click())

    expect(onCreateLead).toHaveBeenCalledTimes(1)
    expect(onCreateTask).toHaveBeenCalledTimes(1)
    expect(onCreateNote).toHaveBeenCalledTimes(1)
  })
})
