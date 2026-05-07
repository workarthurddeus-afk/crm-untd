'use client'

import * as React from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils/cn'

interface Props {
  label: string
  htmlFor: string
  required?: boolean
  error?: string
  hint?: string
  className?: string
  children: React.ReactNode
}

/**
 * Field-level scaffolding for the lead form.
 *
 * Owns:
 * - Label + optional required asterisk
 * - Error / hint slot with reserved height (no layout shift on validation)
 * - aria wiring (the consumer is responsible for forwarding aria-describedby
 *   if it wants the message to be announced)
 */
export function FormField({
  label,
  htmlFor,
  required,
  error,
  hint,
  className,
  children,
}: Props) {
  const errorId = error ? `${htmlFor}-error` : undefined
  const hintId = hint && !error ? `${htmlFor}-hint` : undefined
  const describedBy = errorId ?? hintId
  const enhancedChild = React.isValidElement(children)
    ? React.cloneElement(children, {
        'aria-describedby': describedBy,
        ...(errorId ? { 'aria-errormessage': errorId } : {}),
      } as React.AriaAttributes)
    : children

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label
        htmlFor={htmlFor}
        className="text-xs font-medium text-text-secondary"
      >
        {label}
        {required && (
          <span className="ml-0.5 text-danger" aria-hidden="true">
            *
          </span>
        )}
      </Label>
      {enhancedChild}
      <div className="min-h-[1.1rem] text-[11px] leading-tight">
        {error ? (
          <span id={errorId} role="alert" className="text-danger">
            {error}
          </span>
        ) : hint ? (
          <span id={hintId} className="text-text-secondary">
            {hint}
          </span>
        ) : null}
      </div>
    </div>
  )
}
