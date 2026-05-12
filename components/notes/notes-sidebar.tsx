'use client'

import { useMemo } from 'react'
import {
  Archive,
  Brain,
  Hash,
  Heart,
  Layers,
  Pin,
  TrendingUp,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { getFolderIcon } from './folder-icon'
import { NoteColorDot } from './note-color-dot'
import type { NoteFolderWithCount } from '@/lib/services/note-folders.service'

export type NotesActiveFilter =
  | { kind: 'all' }
  | { kind: 'pinned' }
  | { kind: 'favorites' }
  | { kind: 'high-impact' }
  | { kind: 'forgotten' }
  | { kind: 'archived' }
  | { kind: 'folder'; folderId: string }
  | { kind: 'tag'; tag: string }

interface Props {
  active: NotesActiveFilter
  onChange: (filter: NotesActiveFilter) => void
  folders: NoteFolderWithCount[]
  foldersLoading: boolean
  tagCloud: Array<{ tag: string; count: number }>
  counts: {
    all: number
    pinned: number
    favorites: number
    highImpact: number
    forgotten: number
    archived: number
  }
  topSlot?: React.ReactNode
  onDeleteFolder?: (folder: NoteFolderWithCount) => void
}

interface QuickItem {
  kind: NotesActiveFilter['kind']
  label: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  count: number
  accent?: string
}

function isSameFilter(a: NotesActiveFilter, b: NotesActiveFilter): boolean {
  if (a.kind !== b.kind) return false
  if (a.kind === 'folder' && b.kind === 'folder') return a.folderId === b.folderId
  if (a.kind === 'tag' && b.kind === 'tag') return a.tag === b.tag
  return true
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2 pt-5 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted/80">
      {children}
    </div>
  )
}

function Row({
  active,
  icon: Icon,
  label,
  count,
  iconAccent,
  onClick,
  trailing,
}: {
  active: boolean
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
  count?: number
  iconAccent?: string
  onClick: () => void
  trailing?: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-sm',
        'transition-colors duration-fast',
        active
          ? 'bg-primary/12 text-text shadow-[inset_0_0_0_1px_rgba(83,50,234,0.25)]'
          : 'text-text-secondary hover:bg-surface-elevated/60 hover:text-text'
      )}
    >
      {trailing ?? (
        <Icon
          className={cn(
            'h-3.5 w-3.5 shrink-0',
            active ? 'text-primary' : iconAccent ?? 'text-text-muted'
          )}
          strokeWidth={1.75}
          aria-hidden
        />
      )}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {typeof count === 'number' && (
        <span
          className={cn(
            'font-mono text-[11px] tabular-nums',
            active ? 'text-primary' : 'text-text-muted'
          )}
        >
          {count}
        </span>
      )}
    </button>
  )
}

export function NotesSidebar({
  active,
  onChange,
  folders,
  foldersLoading,
  tagCloud,
  counts,
  topSlot,
  onDeleteFolder,
}: Props) {
  const quickItems = useMemo<QuickItem[]>(
    () => [
      { kind: 'all', label: 'Todas as notas', icon: Layers, count: counts.all },
      { kind: 'pinned', label: 'Fixadas', icon: Pin, count: counts.pinned, accent: 'text-primary' },
      { kind: 'favorites', label: 'Favoritas', icon: Heart, count: counts.favorites, accent: 'text-warning' },
      { kind: 'high-impact', label: 'Alto impacto', icon: TrendingUp, count: counts.highImpact, accent: 'text-success' },
      { kind: 'forgotten', label: 'Ideias esquecidas', icon: Brain, count: counts.forgotten, accent: 'text-info' },
      { kind: 'archived', label: 'Arquivadas', icon: Archive, count: counts.archived },
    ],
    [counts]
  )

  return (
    <aside className="hidden h-full w-[260px] shrink-0 border-r border-border bg-surface/40 lg:block">
      <ScrollArea className="h-full">
        <div className="px-3 py-4">
          {topSlot && <div className="px-1 pb-1">{topSlot}</div>}
          <SectionLabel>Atalhos</SectionLabel>
          <div className="flex flex-col gap-0.5">
            {quickItems.map((item) => (
              <Row
                key={item.kind}
                active={isSameFilter(active, { kind: item.kind } as NotesActiveFilter)}
                icon={item.icon}
                iconAccent={item.accent}
                label={item.label}
                count={item.count}
                onClick={() => onChange({ kind: item.kind } as NotesActiveFilter)}
              />
            ))}
          </div>

          <SectionLabel>Pastas</SectionLabel>
          <div className="flex flex-col gap-0.5">
            {foldersLoading && folders.length === 0 ? (
              <div className="space-y-1.5 px-2 py-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-7 w-full" />
                ))}
              </div>
            ) : folders.length === 0 ? (
              <p className="px-2 py-2 text-xs text-text-muted">Nenhuma pasta criada.</p>
            ) : (
              folders.map((folder) => {
                const Icon = getFolderIcon(folder.icon)
                const isActive =
                  active.kind === 'folder' && active.folderId === folder.id
                return (
                  <div key={folder.id} className="group/folder flex items-center gap-1">
                    <div className="min-w-0 flex-1">
                      <Row
                        active={isActive}
                        icon={Icon}
                        label={folder.name}
                        count={folder.activeNoteCount}
                        onClick={() => onChange({ kind: 'folder', folderId: folder.id })}
                        trailing={
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                            <NoteColorDot color={folder.color} size="sm" />
                          </span>
                        }
                      />
                    </div>
                    {onDeleteFolder && (
                      <button
                        type="button"
                        onClick={() => onDeleteFolder(folder)}
                        aria-label={`Excluir pasta ${folder.name}`}
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-muted',
                          'opacity-0 transition-all duration-fast hover:bg-danger/10 hover:text-danger',
                          'focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                          'group-hover/folder:opacity-100'
                        )}
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                      </button>
                    )}
                  </div>
                )
              })
            )}
          </div>

          <SectionLabel>Tags</SectionLabel>
          {tagCloud.length === 0 ? (
            <p className="px-2 py-2 text-xs text-text-muted">Sem tags ainda.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5 px-1.5 pb-2">
              {tagCloud.slice(0, 22).map(({ tag, count }) => {
                const isActive = active.kind === 'tag' && active.tag === tag
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => onChange({ kind: 'tag', tag })}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]',
                      'transition-colors duration-fast',
                      isActive
                        ? 'border-primary/40 bg-primary/15 text-primary'
                        : 'border-border bg-surface text-text-secondary hover:border-border hover:bg-surface-elevated hover:text-text'
                    )}
                  >
                    <Hash className="h-2.5 w-2.5 opacity-60" strokeWidth={2} aria-hidden />
                    <span>{tag}</span>
                    <span
                      className={cn(
                        'font-mono tabular-nums',
                        isActive ? 'text-primary/70' : 'text-text-muted'
                      )}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  )
}
