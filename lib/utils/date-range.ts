export function parseDate(value: string | Date): Date {
  return value instanceof Date ? new Date(value.getTime()) : new Date(value)
}

export function toIso(value: string | Date): string {
  return parseDate(value).toISOString()
}

export function getStartOfDay(value: string | Date): Date {
  const date = parseDate(value)
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

export function getEndOfDay(value: string | Date): Date {
  const start = getStartOfDay(value)
  return new Date(start.getTime() + 86_400_000 - 1)
}

export function isSameDay(a: string | Date, b: string | Date): boolean {
  return getStartOfDay(a).getTime() === getStartOfDay(b).getTime()
}

export function getStartOfWeek(value: string | Date): Date {
  const start = getStartOfDay(value)
  const day = start.getUTCDay()
  const diff = day === 0 ? 6 : day - 1
  return new Date(start.getTime() - diff * 86_400_000)
}

export function getEndOfWeek(value: string | Date): Date {
  return new Date(getStartOfWeek(value).getTime() + 7 * 86_400_000 - 1)
}

export function getStartOfMonth(value: string | Date): Date {
  const date = parseDate(value)
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
}

export function getEndOfMonth(value: string | Date): Date {
  const date = parseDate(value)
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1) - 1)
}

export function isWithinRange(value: string | Date, start: string | Date, end: string | Date): boolean {
  const time = parseDate(value).getTime()
  return time >= parseDate(start).getTime() && time <= parseDate(end).getTime()
}

export function getDateKey(value: string | Date): string {
  return getStartOfDay(value).toISOString().slice(0, 10)
}
