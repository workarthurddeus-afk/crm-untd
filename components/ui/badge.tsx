import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-xs font-medium leading-none whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary-muted text-primary',
        secondary: 'border-border bg-surface text-text-secondary',
        success: 'border-transparent bg-success/15 text-success',
        warning: 'border-transparent bg-warning/15 text-warning',
        danger: 'border-transparent bg-danger/15 text-danger',
        info: 'border-transparent bg-info/15 text-info',
        outline: 'border-border bg-transparent text-text-secondary',
        'pipeline-prospect': 'border-transparent bg-pipe-prospect/15 text-pipe-prospect',
        'pipeline-contacted': 'border-transparent bg-pipe-contacted/15 text-pipe-contacted',
        'pipeline-replied': 'border-transparent bg-pipe-replied/15 text-pipe-replied',
        'pipeline-followup': 'border-transparent bg-pipe-followup/15 text-pipe-followup',
        'pipeline-proposal': 'border-transparent bg-pipe-proposal/15 text-pipe-proposal',
        'pipeline-won': 'border-transparent bg-pipe-won/15 text-pipe-won',
        'pipeline-lost': 'border-transparent bg-pipe-lost/20 text-pipe-lost',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { badgeVariants }
