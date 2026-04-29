'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export const Sheet = DialogPrimitive.Root
export const SheetTrigger = DialogPrimitive.Trigger
export const SheetClose = DialogPrimitive.Close
export const SheetPortal = DialogPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-background/70 backdrop-blur-sm',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
      'data-[state=open]:duration-300 data-[state=closed]:duration-200',
      className
    )}
    {...props}
  />
))
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName

const sheetVariants = cva(
  [
    'fixed z-50 bg-surface-elevated shadow-lg-token',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=open]:duration-[350ms] data-[state=closed]:duration-300',
    'data-[state=open]:ease-[cubic-bezier(0,0,0.2,1)]',
    'focus:outline-none flex flex-col',
  ].join(' '),
  {
    variants: {
      side: {
        right:
          'inset-y-0 right-0 h-full w-[380px] max-w-[90vw] border-l border-border data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right',
        left:
          'inset-y-0 left-0 h-full w-[380px] max-w-[90vw] border-r border-border data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left',
        top:
          'inset-x-0 top-0 w-full border-b border-border data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top',
        bottom:
          'inset-x-0 bottom-0 w-full border-t border-border data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom',
      },
    },
    defaultVariants: { side: 'right' },
  }
)

export interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ side = 'right', className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        aria-label="Fechar"
        className={cn(
          'absolute right-4 top-4 inline-flex h-7 w-7 items-center justify-center',
          'rounded-sm text-text-muted hover:text-text hover:bg-primary-muted',
          'transition-colors duration-fast',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'
        )}
      >
        <X className="h-4 w-4" strokeWidth={1.5} />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = 'SheetContent'

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1.5 p-6 pb-4 border-b border-border-subtle',
        className
      )}
      {...props}
    />
  )
}

export function SheetBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex-1 overflow-y-auto p-6', className)} {...props} />
}

export function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse sm:flex-row sm:justify-end gap-2 p-6 pt-4 border-t border-border-subtle',
        className
      )}
      {...props}
    />
  )
}

export const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('font-display text-lg font-semibold tracking-tight text-text', className)}
    {...props}
  />
))
SheetTitle.displayName = DialogPrimitive.Title.displayName

export const SheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-text-muted leading-relaxed', className)}
    {...props}
  />
))
SheetDescription.displayName = DialogPrimitive.Description.displayName
