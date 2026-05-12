'use client'

import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface DestructiveConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  confirmationText?: string
  children?: React.ReactNode
  onConfirm: () => Promise<void> | void
}

export function DestructiveConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Excluir',
  confirmationText,
  children,
  onConfirm,
}: DestructiveConfirmDialogProps) {
  const [typed, setTyped] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requiresText = Boolean(confirmationText)
  const canConfirm = !requiresText || typed.trim() === confirmationText

  async function handleConfirm() {
    if (!canConfirm || isSubmitting) return
    setIsSubmitting(true)
    setError(null)
    try {
      await onConfirm()
      setTyped('')
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isSubmitting) return
        onOpenChange(next)
        if (!next) {
          setTyped('')
          setError(null)
        }
      }}
    >
      <DialogContent className="max-w-md border-danger/25 bg-[linear-gradient(180deg,rgba(239,68,68,0.08),rgba(24,22,35,0.98)_38%)]">
        <DialogHeader>
          <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg border border-danger/25 bg-danger/12 text-danger">
            <AlertTriangle className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {children}

        {confirmationText && (
          <div className="space-y-2">
            <p className="text-xs text-text-muted">
              Digite <span className="font-mono text-text">{confirmationText}</span> para confirmar.
            </p>
            <Input
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              placeholder={confirmationText}
              autoComplete="off"
            />
          </div>
        )}

        {error && (
          <p role="alert" className="rounded-md border border-danger/25 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => void handleConfirm()}
            disabled={!canConfirm || isSubmitting}
          >
            {isSubmitting && <Loader2 className="animate-spin" aria-hidden />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
