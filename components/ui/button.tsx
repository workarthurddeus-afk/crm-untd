'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap select-none',
    'rounded-md text-sm font-medium',
    'transition-[background-color,color,border-color,box-shadow,transform] duration-base',
    'ease-[cubic-bezier(0.34,1.56,0.64,1)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-white shadow-sm-token hover:bg-primary-hover hover:shadow-glow-primary-sm',
        secondary:
          'bg-surface text-text-secondary border border-border hover:bg-surface-elevated hover:text-text hover:border-border',
        ghost:
          'bg-transparent text-text-secondary hover:bg-primary-muted hover:text-text',
        destructive:
          'bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25 hover:border-danger/50',
        outline:
          'border border-border bg-transparent text-text hover:bg-surface hover:border-border',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4',
        lg: 'h-10 px-5 text-[0.9375rem]',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

/**
 * Button: framer-motion adds the tactile `whileTap` scale,
 * but motion.button + Radix Slot fight over the ref/element type.
 * When `asChild` is set we render a plain Slot — the consumer
 * (e.g. an <a>) gets its own press affordance.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size }), className)

    if (asChild) {
      return <Slot ref={ref} className={classes} {...props} />
    }

    const motionProps = props as HTMLMotionProps<'button'>
    return (
      <motion.button
        ref={ref}
        type={type ?? 'button'}
        className={classes}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.12, ease: [0.34, 1.56, 0.64, 1] }}
        {...motionProps}
      />
    )
  }
)
Button.displayName = 'Button'

export { buttonVariants }
