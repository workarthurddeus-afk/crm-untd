'use client'

import * as React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

type DivProps = React.HTMLAttributes<HTMLDivElement>

/**
 * Card has two modes:
 *  - Static (default): subtle border/color shift on hover, no scale.
 *    Used for purely informational surfaces (KPI tiles, dashboards).
 *  - Interactive (`interactive`): full scale-up + border glow on hover,
 *    spring-eased per DESIGN.md motion spec. Used when the entire card
 *    is the affordance (lead row, kanban card, calendar item).
 */
export interface CardProps extends DivProps {
  interactive?: boolean
}

const baseCard =
  'rounded-lg border border-border bg-surface text-text shadow-sm-token'

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive = false, ...props }, ref) => {
    if (interactive) {
      const motionProps = props as unknown as HTMLMotionProps<'div'>
      return (
        <motion.div
          ref={ref}
          className={cn(
            baseCard,
            'cursor-pointer will-change-transform',
            'transition-shadow duration-base',
            className
          )}
          whileHover={{
            scale: 1.015,
            borderColor: 'rgba(83, 50, 234, 0.3)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.45)',
          }}
          transition={{ duration: 0.22, ease: [0.34, 1.56, 0.64, 1] }}
          {...motionProps}
        />
      )
    }
    return (
      <div
        ref={ref}
        className={cn(
          baseCard,
          'transition-[background-color,border-color,box-shadow] duration-base',
          'hover:border-border hover:bg-surface',
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = 'Card'

export const CardHeader = React.forwardRef<HTMLDivElement, DivProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col gap-1.5 p-5', className)} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-display text-lg font-semibold leading-tight tracking-tight', className)}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-text-muted leading-relaxed', className)} {...props} />
))
CardDescription.displayName = 'CardDescription'

export const CardContent = React.forwardRef<HTMLDivElement, DivProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-5 pt-0', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

export const CardFooter = React.forwardRef<HTMLDivElement, DivProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center gap-2 p-5 pt-0', className)}
      {...props}
    />
  )
)
CardFooter.displayName = 'CardFooter'
