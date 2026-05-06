import type { NoteColor, NoteFolderInput } from '@/lib/types'

export const NOTE_FOLDER_ICON_OPTIONS = [
  { value: 'folder', label: 'Pasta' },
  { value: 'inbox', label: 'Inbox' },
  { value: 'target', label: 'Estrategia' },
  { value: 'box', label: 'Produto' },
  { value: 'handshake', label: 'Vendas' },
  { value: 'message-square', label: 'Feedback' },
  { value: 'lightbulb', label: 'Ideia' },
  { value: 'star', label: 'Destaque' },
] as const

export const NOTE_FOLDER_COLOR_OPTIONS: Array<{
  value: NoteColor
  label: string
  className: string
}> = [
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

export interface NoteFolderFormState {
  name: string
  description: string
  color: NoteColor
  icon: string
}

export function getDefaultNoteFolderFormState(): NoteFolderFormState {
  return {
    name: '',
    description: '',
    color: 'purple',
    icon: 'folder',
  }
}

export function buildNoteFolderPayloadFromForm(
  form: NoteFolderFormState,
  order: number
): NoteFolderInput {
  const description = form.description.trim()

  return {
    name: form.name.trim(),
    description: description || undefined,
    color: form.color,
    icon: form.icon || 'folder',
    parentId: null,
    order,
    isArchived: false,
  }
}
