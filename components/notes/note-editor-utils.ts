import { NOTE_COLORS, NOTE_TYPES } from '@/lib/types'
import type {
  Note,
  NoteColor,
  NoteEffort,
  NoteImpact,
  NoteInput,
  NotePriority,
  NoteStatus,
  NoteType,
} from '@/lib/types'
import { normalizeTag } from '@/lib/utils/notes'

export const NO_NOTE_FOLDER_VALUE = '__none__'

const NOTE_EDITOR_STATUSES = [
  'draft',
  'active',
  'in_review',
  'approved',
  'in_progress',
  'executed',
  'archived',
] as const

type NoteEditorStatus = (typeof NOTE_EDITOR_STATUSES)[number]

export const NOTE_TYPE_OPTIONS: Array<{ value: NoteType; label: string }> = [
  { value: 'insight', label: 'Insight' },
  { value: 'idea', label: 'Ideia' },
  { value: 'meeting', label: 'Reuniao' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'strategy', label: 'Estrategia' },
  { value: 'product', label: 'Produto' },
  { value: 'ui', label: 'UI' },
  { value: 'feature', label: 'Feature' },
  { value: 'campaign', label: 'Campanha' },
  { value: 'copy', label: 'Copy' },
  { value: 'offer', label: 'Oferta' },
  { value: 'sales', label: 'Vendas' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'brandkit', label: 'BrandKit' },
  { value: 'prompt', label: 'Prompt' },
  { value: 'reference', label: 'Referencia' },
  { value: 'bug', label: 'Bug' },
  { value: 'improvement', label: 'Melhoria' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'market', label: 'Mercado' },
  { value: 'decision', label: 'Decisao' },
  { value: 'general', label: 'Geral' },
]

export const NOTE_STATUS_OPTIONS: Array<{ value: NoteEditorStatus; label: string }> = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'active', label: 'Ativa' },
  { value: 'in_review', label: 'Em revisao' },
  { value: 'approved', label: 'Aprovada' },
  { value: 'in_progress', label: 'Em progresso' },
  { value: 'executed', label: 'Executada' },
  { value: 'archived', label: 'Arquivada' },
]

export const NOTE_PRIORITY_OPTIONS: Array<{ value: NotePriority; label: string }> = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
]

export const NOTE_IMPACT_OPTIONS: Array<{ value: NoteImpact; label: string }> = [
  { value: 'low', label: 'Baixo' },
  { value: 'medium', label: 'Medio' },
  { value: 'high', label: 'Alto' },
]

export const NOTE_EFFORT_OPTIONS: Array<{ value: NoteEffort; label: string }> = [
  { value: 'low', label: 'Baixo' },
  { value: 'medium', label: 'Medio' },
  { value: 'high', label: 'Alto' },
]

export const NOTE_COLOR_OPTIONS: Array<{ value: NoteColor; label: string; className: string }> = [
  { value: 'default', label: 'Padrao', className: 'bg-text-muted' },
  { value: 'purple', label: 'Roxo', className: 'bg-primary' },
  { value: 'violet', label: 'Violeta', className: 'bg-violet-400' },
  { value: 'blue', label: 'Azul', className: 'bg-blue-400' },
  { value: 'cyan', label: 'Ciano', className: 'bg-cyan-400' },
  { value: 'green', label: 'Verde', className: 'bg-success' },
  { value: 'yellow', label: 'Amarelo', className: 'bg-warning' },
  { value: 'orange', label: 'Laranja', className: 'bg-orange-400' },
  { value: 'red', label: 'Vermelho', className: 'bg-danger' },
  { value: 'pink', label: 'Rosa', className: 'bg-pink-400' },
  { value: 'slate', label: 'Slate', className: 'bg-slate-400' },
]

export interface NoteEditorFormState {
  title: string
  content: string
  type: NoteType
  status: NoteEditorStatus
  priority: NotePriority
  impact: NoteImpact
  effort: NoteEffort
  color: NoteColor
  folderId: string
  tags: string
  isPinned: boolean
  isFavorite: boolean
}

export type MarkdownAction =
  | 'bold'
  | 'italic'
  | 'highlight'
  | 'heading'
  | 'bullet'
  | 'numbered'
  | 'quote'
  | 'divider'
  | 'insight'
  | 'attention'
  | 'idea'

export type MarkdownBlock =
  | { type: 'heading'; text: string; level: 1 | 2 | 3 }
  | { type: 'paragraph'; text: string }
  | { type: 'bullet'; text: string }
  | { type: 'numbered'; text: string; index: number }
  | { type: 'quote'; text: string }
  | { type: 'callout'; text: string; tone: 'insight' | 'attention' | 'idea' }
  | { type: 'divider' }

export interface MarkdownFormatResult {
  content: string
  selectionStart: number
  selectionEnd: number
}

export function getDefaultNoteEditorState(): NoteEditorFormState {
  return {
    title: '',
    content: '',
    type: 'idea',
    status: 'draft',
    priority: 'medium',
    impact: 'medium',
    effort: 'medium',
    color: 'purple',
    folderId: NO_NOTE_FOLDER_VALUE,
    tags: '',
    isPinned: false,
    isFavorite: false,
  }
}

export function noteToEditorState(note: Note | null | undefined): NoteEditorFormState {
  if (!note) return getDefaultNoteEditorState()

  return {
    title: note.title,
    content: note.content,
    type: normalizeNoteType(note.type),
    status: normalizeNoteStatus(note.status),
    priority: note.priority,
    impact: note.impact,
    effort: note.effort,
    color: normalizeNoteColor(note.color),
    folderId: note.folderId ?? NO_NOTE_FOLDER_VALUE,
    tags: note.tags.join(', '),
    isPinned: note.isPinned,
    isFavorite: note.isFavorite,
  }
}

export function buildNotePayloadFromForm(form: NoteEditorFormState): NoteInput {
  return {
    title: form.title.trim(),
    content: form.content.trim(),
    type: form.type,
    status: form.status,
    priority: form.priority,
    impact: form.impact,
    effort: form.effort,
    color: form.color,
    tags: parseNoteTags(form.tags),
    folderId: form.folderId === NO_NOTE_FOLDER_VALUE ? null : form.folderId,
    isPinned: form.isPinned,
    isFavorite: form.isFavorite,
    isArchived: form.status === 'archived',
    source: 'manual',
  }
}

export function parseNoteTags(value: string): string[] {
  const seen = new Set<string>()
  const tags: string[] = []

  for (const rawTag of value.split(',')) {
    const tag = normalizeTag(rawTag.replace(/^#/, ''))
    if (!tag || seen.has(tag)) continue
    seen.add(tag)
    tags.push(tag)
  }

  return tags
}

export function applyMarkdownFormat(
  content: string,
  selectionStart: number,
  selectionEnd: number,
  action: MarkdownAction
): MarkdownFormatResult {
  if (action === 'divider') {
    const insert = `${selectionEnd > 0 && !content.endsWith('\n') ? '\n\n' : ''}---\n\n`
    return replaceRange(content, selectionEnd, selectionEnd, insert, selectionEnd + insert.length)
  }

  if (action === 'heading') return applyLinePrefix(content, selectionStart, selectionEnd, '## ')
  if (action === 'bullet') return applyLinePrefix(content, selectionStart, selectionEnd, '- ')
  if (action === 'quote') return applyLinePrefix(content, selectionStart, selectionEnd, '> ')
  if (action === 'numbered') return applyNumberedPrefix(content, selectionStart, selectionEnd)

  if (action === 'insight') return applyCallout(content, selectionStart, selectionEnd, 'INSIGHT')
  if (action === 'attention') return applyCallout(content, selectionStart, selectionEnd, 'ATENCAO')
  if (action === 'idea') return applyCallout(content, selectionStart, selectionEnd, 'IDEIA')

  const selected = content.slice(selectionStart, selectionEnd)
  const fallback = action === 'bold' ? 'texto forte' : action === 'italic' ? 'texto' : 'destaque'
  const text = selected || fallback
  const marker = action === 'bold' ? '**' : action === 'italic' ? '*' : '=='
  const insert = `${marker}${text}${marker}`
  return replaceRange(
    content,
    selectionStart,
    selectionEnd,
    insert,
    selectionStart + marker.length,
    selectionStart + marker.length + text.length
  )
}

export function parseNoteMarkdown(content: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = []

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) continue

    const callout = /^>\s*\[!(INSIGHT|ATENCAO|IDEIA)\]\s*(.*)$/i.exec(line)
    if (callout) {
      blocks.push({
        type: 'callout',
        tone: calloutTone(callout[1]!),
        text: callout[2]?.trim() ?? '',
      })
      continue
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(line)
    if (heading) {
      blocks.push({
        type: 'heading',
        level: heading[1]!.length as 1 | 2 | 3,
        text: heading[2]!.trim(),
      })
      continue
    }

    const numbered = /^(\d+)\.\s+(.+)$/.exec(line)
    if (numbered) {
      blocks.push({
        type: 'numbered',
        index: Number(numbered[1]),
        text: numbered[2]!.trim(),
      })
      continue
    }

    const bullet = /^[-*]\s+(.+)$/.exec(line)
    if (bullet) {
      blocks.push({ type: 'bullet', text: bullet[1]!.trim() })
      continue
    }

    const quote = /^>\s+(.+)$/.exec(line)
    if (quote) {
      blocks.push({ type: 'quote', text: quote[1]!.trim() })
      continue
    }

    if (/^---+$/.test(line)) {
      blocks.push({ type: 'divider' })
      continue
    }

    blocks.push({ type: 'paragraph', text: line })
  }

  return blocks
}

function normalizeNoteType(type: NoteType): NoteType {
  return (NOTE_TYPES as readonly string[]).includes(type) ? type : 'general'
}

function normalizeNoteStatus(status: NoteStatus): NoteEditorStatus {
  if (status === 'review') return 'in_review'
  if (status === 'in-progress') return 'in_progress'
  return (NOTE_EDITOR_STATUSES as readonly string[]).includes(status) ? status : 'draft'
}

function normalizeNoteColor(color: NoteColor): NoteColor {
  return (NOTE_COLORS as readonly string[]).includes(color) ? color : 'default'
}

function replaceRange(
  content: string,
  start: number,
  end: number,
  insert: string,
  selectionStart: number,
  selectionEnd = selectionStart
): MarkdownFormatResult {
  return {
    content: `${content.slice(0, start)}${insert}${content.slice(end)}`,
    selectionStart,
    selectionEnd,
  }
}

function applyLinePrefix(
  content: string,
  selectionStart: number,
  selectionEnd: number,
  prefix: string
): MarkdownFormatResult {
  const lineStart = content.lastIndexOf('\n', Math.max(0, selectionStart - 1)) + 1
  const selected = content.slice(lineStart, selectionEnd)
  const replacement = selected
    .split('\n')
    .map((line) => (line.startsWith(prefix) ? line : `${prefix}${line || 'texto'}`))
    .join('\n')

  const contentNext = `${content.slice(0, lineStart)}${replacement}${content.slice(selectionEnd)}`
  const added = replacement.length - selected.length
  return {
    content: contentNext,
    selectionStart: selectionStart + prefix.length,
    selectionEnd: selectionEnd + added,
  }
}

function applyNumberedPrefix(
  content: string,
  selectionStart: number,
  selectionEnd: number
): MarkdownFormatResult {
  const lineStart = content.lastIndexOf('\n', Math.max(0, selectionStart - 1)) + 1
  const selected = content.slice(lineStart, selectionEnd)
  const replacement = selected
    .split('\n')
    .map((line, index) => (/^\d+\.\s/.test(line) ? line : `${index + 1}. ${line || 'texto'}`))
    .join('\n')
  const added = replacement.length - selected.length

  return {
    content: `${content.slice(0, lineStart)}${replacement}${content.slice(selectionEnd)}`,
    selectionStart: selectionStart + 3,
    selectionEnd: selectionEnd + added,
  }
}

function applyCallout(
  content: string,
  selectionStart: number,
  selectionEnd: number,
  label: 'INSIGHT' | 'ATENCAO' | 'IDEIA'
): MarkdownFormatResult {
  const selected = content.slice(selectionStart, selectionEnd) || 'Descreva o bloco'
  const prefix = `> [!${label}] `
  const insert = `${prefix}${selected}`

  return replaceRange(
    content,
    selectionStart,
    selectionEnd,
    insert,
    selectionStart + prefix.length,
    selectionStart + prefix.length + selected.length
  )
}

function calloutTone(value: string): 'insight' | 'attention' | 'idea' {
  const normalized = value.toUpperCase()
  if (normalized === 'ATENCAO') return 'attention'
  if (normalized === 'IDEIA') return 'idea'
  return 'insight'
}
