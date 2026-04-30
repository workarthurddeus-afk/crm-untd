import * as React from 'react'
import { cn } from '@/lib/utils/cn'

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[80px] w-full resize-y rounded-md border border-border bg-surface px-3 py-2',
      'text-sm text-text placeholder:text-text-muted leading-relaxed',
      'transition-colors duration-fast',
      'focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30',
      'aria-invalid:border-danger aria-invalid:ring-2 aria-invalid:ring-danger/30',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  />
))
Textarea.displayName = 'Textarea'
