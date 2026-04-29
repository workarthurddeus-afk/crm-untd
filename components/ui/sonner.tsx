'use client'

import * as React from 'react'
import { Toaster as SonnerToaster, type ToasterProps } from 'sonner'

/**
 * Sonner styled to UNTD tokens. Sonner ships its own slide-from-right
 * animation which already matches DESIGN.md ("slide da direita + fade").
 * Tokens are passed via inline CSS vars so we honor user theme overrides
 * later without reaching into sonner internals.
 */
export function Toaster(props: ToasterProps) {
  return (
    <SonnerToaster
      theme="dark"
      position="top-right"
      duration={4000}
      closeButton
      richColors={false}
      toastOptions={{
        classNames: {
          toast:
            'group pointer-events-auto flex items-center gap-3 w-full p-4 rounded-md border border-border bg-surface-elevated text-text shadow-lg-token',
          title: 'text-sm font-medium text-text leading-tight',
          description: 'text-xs text-text-muted leading-relaxed',
          actionButton: 'bg-primary text-white text-xs font-medium px-2.5 py-1 rounded-sm',
          cancelButton: 'bg-surface text-text-secondary text-xs font-medium px-2.5 py-1 rounded-sm',
          closeButton:
            'bg-surface border-border text-text-muted hover:text-text hover:bg-surface-elevated',
          success: '[&_[data-icon]]:text-success',
          error: '[&_[data-icon]]:text-danger',
          warning: '[&_[data-icon]]:text-warning',
          info: '[&_[data-icon]]:text-info',
        },
      }}
      style={
        {
          '--normal-bg': 'var(--surface-elevated)',
          '--normal-text': 'var(--text-default)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}
