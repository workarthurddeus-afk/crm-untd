'use client'

import { AlertTriangle, Lightbulb, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { parseNoteMarkdown, type MarkdownBlock } from './note-editor-utils'

interface Props {
  content: string
  className?: string
  emptyLabel?: string
}

const calloutStyles: Record<
  Extract<MarkdownBlock, { type: 'callout' }>['tone'],
  { icon: typeof Sparkles; label: string; className: string }
> = {
  insight: {
    icon: Sparkles,
    label: 'Insight',
    className: 'border-primary/30 bg-primary/10 text-primary',
  },
  attention: {
    icon: AlertTriangle,
    label: 'Atencao',
    className: 'border-warning/30 bg-warning/10 text-warning',
  },
  idea: {
    icon: Lightbulb,
    label: 'Ideia',
    className: 'border-success/30 bg-success/10 text-success',
  },
}

export function NoteMarkdownPreview({
  content,
  className,
  emptyLabel = 'A nota ainda nao tem conteudo.',
}: Props) {
  const blocks = parseNoteMarkdown(content)

  if (blocks.length === 0) {
    return (
      <div
        className={cn(
          'rounded-lg border border-dashed border-border-subtle bg-surface/30 px-4 py-6',
          'text-sm text-text-muted',
          className
        )}
      >
        {emptyLabel}
      </div>
    )
  }

  return (
    <div className={cn('space-y-3 break-words text-[15px] leading-[1.75] text-text-secondary', className)}>
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  )
}

function renderBlock(block: MarkdownBlock, index: number) {
  if (block.type === 'divider') {
    return <div key={index} className="my-5 h-px bg-border-subtle" aria-hidden />
  }

  if (block.type === 'heading') {
    const className =
      block.level === 1
        ? 'font-display text-2xl font-bold leading-tight text-text'
        : block.level === 2
          ? 'font-display text-xl font-semibold leading-snug text-text'
          : 'font-display text-base font-semibold leading-snug text-text'

    const Tag = block.level === 1 ? 'h1' : block.level === 2 ? 'h2' : 'h3'
    return (
      <Tag key={index} className={className}>
        {renderInlineText(block.text)}
      </Tag>
    )
  }

  if (block.type === 'bullet') {
    return (
      <div key={index} className="flex gap-2">
        <span className="mt-[0.72em] h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
        <p className="min-w-0">{renderInlineText(block.text)}</p>
      </div>
    )
  }

  if (block.type === 'numbered') {
    return (
      <div key={index} className="flex gap-2">
        <span className="mt-1 font-mono text-xs tabular-nums text-primary">{block.index}.</span>
        <p className="min-w-0">{renderInlineText(block.text)}</p>
      </div>
    )
  }

  if (block.type === 'quote') {
    return (
      <blockquote
        key={index}
        className="border-l border-primary/40 bg-primary/5 px-3 py-2 text-text-secondary"
      >
        {renderInlineText(block.text)}
      </blockquote>
    )
  }

  if (block.type === 'callout') {
    const style = calloutStyles[block.tone]
    const Icon = style.icon
    return (
      <div
        key={index}
        className={cn(
          'rounded-lg border px-3 py-2.5 text-sm leading-relaxed',
          'shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]',
          style.className
        )}
      >
        <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em]">
          <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          {style.label}
        </div>
        <p className="text-text-secondary">{renderInlineText(block.text)}</p>
      </div>
    )
  }

  return (
    <p key={index} className="text-text-secondary">
      {renderInlineText(block.text)}
    </p>
  )
}

function renderInlineText(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|==[^=]+==|\*[^*]+\*)/g).filter(Boolean)

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-text">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('==') && part.endsWith('==')) {
      return (
        <mark key={index} className="rounded-sm bg-warning/20 px-0.5 text-warning">
          {part.slice(2, -2)}
        </mark>
      )
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={index} className="italic text-text">
          {part.slice(1, -1)}
        </em>
      )
    }
    return <span key={index}>{part}</span>
  })
}
