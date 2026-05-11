import type { NoteColor, NoteFolder, NoteFolderInput } from '@/lib/types'

const DEFAULT_WORKSPACE_ID = 'default'
const DEFAULT_COLOR: NoteColor = 'default'

const noteColors = new Set<NoteColor>([
  'default',
  'purple',
  'violet',
  'blue',
  'cyan',
  'green',
  'yellow',
  'orange',
  'red',
  'pink',
  'slate',
])

export interface SupabaseNoteFolderRow {
  id: string
  user_id?: string | null
  workspace_id?: string | null
  name: string
  description?: string | null
  color?: string | null
  icon?: string | null
  parent_id?: string | null
  order_index?: number | null
  is_archived?: boolean | null
  created_at: string
  updated_at: string
}

export type SupabaseNoteFolderInsert = Omit<
  SupabaseNoteFolderRow,
  'id' | 'created_at' | 'updated_at'
>
export type SupabaseNoteFolderUpdate = Partial<SupabaseNoteFolderInsert>

function cleanString(value: string | null | undefined): string | undefined {
  const clean = value?.trim()
  return clean ? clean : undefined
}

function nullableString(value: string | null | undefined): string | null {
  return cleanString(value) ?? null
}

function requiredString(value: string | null | undefined, message: string): string {
  const clean = cleanString(value)
  if (!clean) throw new Error(message)
  return clean
}

function normalizeColor(value: string | null | undefined): NoteColor {
  return noteColors.has(value as NoteColor) ? (value as NoteColor) : DEFAULT_COLOR
}

function removeUndefined<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as Partial<T>
}

export function fromSupabaseNoteFolderRow(row: SupabaseNoteFolderRow): NoteFolder {
  return {
    id: row.id,
    name: row.name,
    description: cleanString(row.description),
    color: normalizeColor(row.color),
    icon: cleanString(row.icon),
    parentId: row.parent_id ?? null,
    order: row.order_index ?? 0,
    isArchived: row.is_archived ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function toSupabaseNoteFolderInsert(
  input: NoteFolderInput,
  userId?: string
): SupabaseNoteFolderInsert {
  return {
    user_id: userId,
    workspace_id: DEFAULT_WORKSPACE_ID,
    name: requiredString(input.name, 'Nome obrigatorio para criar pasta.'),
    description: nullableString(input.description),
    color: input.color ?? DEFAULT_COLOR,
    icon: nullableString(input.icon),
    parent_id: input.parentId ?? null,
    order_index: input.order ?? 0,
    is_archived: input.isArchived ?? false,
  }
}

export function toSupabaseNoteFolderUpdate(
  input: Partial<NoteFolder>,
  userId?: string
): SupabaseNoteFolderUpdate {
  return removeUndefined({
    user_id: userId,
    name: input.name === undefined ? undefined : requiredString(input.name, 'Nome obrigatorio para atualizar pasta.'),
    description: input.description === undefined ? undefined : nullableString(input.description),
    color: input.color,
    icon: input.icon === undefined ? undefined : nullableString(input.icon),
    parent_id: input.parentId === undefined ? undefined : input.parentId,
    order_index: input.order,
    is_archived: input.isArchived,
  }) as SupabaseNoteFolderUpdate
}
