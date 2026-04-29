import * as React from 'react'
import { cn } from '@/lib/utils/cn'

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = 'text', ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      'flex h-9 w-full rounded-md border border-border bg-surface px-3 py-2',
      'text-sm text-text placeholder:text-text-muted',
      'transition-colors duration-fast',
      'focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30',
      'aria-invalid:border-danger aria-invalid:ring-2 aria-invalid:ring-danger/30',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-text',
      className
    )}
    {...props}
  />
))
Input.displayName = 'Input'
