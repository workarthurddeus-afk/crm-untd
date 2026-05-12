import type { KeyboardCoordinateGetter } from '@dnd-kit/core'

/**
 * Keyboard coordinate getter for the pipeline.
 *
 * We use `useDraggable` + `useDroppable` (not the sortable strategy), so the
 * `sortableKeyboardCoordinates` helper from `@dnd-kit/sortable` doesn't
 * apply. Default arrow stepping moves 25px per press — useless across
 * 280px-wide columns.
 *
 * This getter:
 * - ArrowLeft / ArrowRight: snaps the pointer to the *center* of the
 *   adjacent `[data-pipeline-column]` so the dragged lead lands inside the
 *   neighboring dropzone in one keystroke.
 * - ArrowUp / ArrowDown: falls back to a small vertical step so users can
 *   nudge the card up/down within a column for visual confirmation.
 *
 * Returning `undefined` cancels the move (e.g. trying to move past the
 * first/last column).
 */
const VERTICAL_STEP_PX = 32

export const pipelineKeyboardCoordinates: KeyboardCoordinateGetter = (
  event,
  { currentCoordinates }
) => {
  const { code } = event

  if (code === 'ArrowUp') {
    event.preventDefault()
    return { x: currentCoordinates.x, y: currentCoordinates.y - VERTICAL_STEP_PX }
  }

  if (code === 'ArrowDown') {
    event.preventDefault()
    return { x: currentCoordinates.x, y: currentCoordinates.y + VERTICAL_STEP_PX }
  }

  if (code === 'ArrowLeft' || code === 'ArrowRight') {
    if (typeof document === 'undefined') return undefined

    const columns = Array.from(
      document.querySelectorAll<HTMLElement>('[data-pipeline-column]')
    )
    if (columns.length === 0) return undefined

    // Find the column whose horizontal center is closest to the current
    // pointer. Walking from a snapped center each time keeps movement
    // deterministic regardless of where the pointer was lifted.
    const centers = columns.map((el) => {
      const rect = el.getBoundingClientRect()
      return { el, centerX: rect.left + rect.width / 2 }
    })

    let nearestIdx = 0
    let nearestDelta = Infinity
    for (let i = 0; i < centers.length; i += 1) {
      const delta = Math.abs((centers[i]?.centerX ?? 0) - currentCoordinates.x)
      if (delta < nearestDelta) {
        nearestDelta = delta
        nearestIdx = i
      }
    }

    const targetIdx = code === 'ArrowRight' ? nearestIdx + 1 : nearestIdx - 1
    const target = centers[targetIdx]
    if (!target) return undefined

    event.preventDefault()
    const targetRect = target.el.getBoundingClientRect()
    return {
      x: target.centerX,
      y: targetRect.top + Math.min(80, targetRect.height / 4),
    }
  }

  return undefined
}
