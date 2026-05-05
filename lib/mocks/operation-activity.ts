import type { OperationActivityPoint } from '@/lib/types/operation-activity'

const DAYS = 90

function pad(n: number) { return String(n).padStart(2, '0') }
function isoDate(d: Date) {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
}

const today = new Date()
today.setUTCHours(0, 0, 0, 0)

export const operationActivitySeed: OperationActivityPoint[] = Array.from({ length: DAYS }, (_, i) => {
  const d = new Date(today)
  d.setUTCDate(d.getUTCDate() - (DAYS - 1 - i))
  const phase = i / DAYS
  const wave = Math.sin(i * 0.4) * 0.5 + 0.5
  const trend = phase * 0.6 + 0.4
  return {
    date: isoDate(d),
    leads: Math.round(2 + wave * 4 * trend),
    followUps: Math.round(1 + wave * 7 * trend),
    meetings: Math.round(wave * 3 * trend),
    pipelineMoves: Math.round(1 + wave * 4 * trend),
  }
})
