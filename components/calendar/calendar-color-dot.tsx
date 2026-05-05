import { cn } from '@/lib/utils/cn'
import { getCalendarColorTokens } from '@/lib/utils/calendar-display'
import type { CalendarColor } from '@/lib/types'

interface Props {
  color: CalendarColor
  size?: 'xs' | 'sm' | 'md'
  className?: string
}

const sizeMap = {
  xs: 'h-1.5 w-1.5',
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
}

export function CalendarColorDot({ color, size = 'sm', className }: Props) {
  const tokens = getCalendarColorTokens(color)
  return (
    <span
      aria-hidden
      className={cn('inline-block rounded-full', sizeMap[size], tokens.dot, className)}
    />
  )
}
