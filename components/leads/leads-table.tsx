'use client'

import { useMemo, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { motion, useReducedMotion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import type { Lead, PipelineStage } from '@/lib/types'
import { ICPScoreRing } from '@/components/shared/icp-score-ring'
import { TemperatureBadge } from '@/components/shared/temperature-badge'
import { OriginTag } from '@/components/shared/origin-tag'
import { Badge } from '@/components/ui/badge'
import { tokens } from '@/lib/theme/tokens'
import { cn } from '@/lib/utils/cn'

interface Props {
  leads: Lead[]
  stages: PipelineStage[]
}

const STAGE_VARIANTS: Record<string, string> = {
  'stage-prospect': 'pipeline-prospect',
  'stage-contacted': 'pipeline-contacted',
  'stage-replied': 'pipeline-replied',
  'stage-followup': 'pipeline-followup',
  'stage-proposal': 'pipeline-proposal',
  'stage-won': 'pipeline-won',
  'stage-lost': 'pipeline-lost',
}

const MAX_STAGGER_ROWS = 12

function SortIcon<T>({ column }: { column: Column<T> }) {
  const sort = column.getIsSorted()
  const cls = 'h-3 w-3 shrink-0'
  if (sort === 'asc') return <ArrowUp className={cn(cls, 'text-text')} strokeWidth={2} />
  if (sort === 'desc') return <ArrowDown className={cn(cls, 'text-text')} strokeWidth={2} />
  return <ArrowUpDown className={cn(cls, 'opacity-60')} strokeWidth={1.75} />
}

function SortableHeader<T>({
  column,
  label,
  align = 'left',
}: {
  column: Column<T>
  label: string
  align?: 'left' | 'right' | 'center'
}) {
  return (
    <button
      type="button"
      onClick={() => column.toggleSorting()}
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide',
        'text-text-muted transition-colors duration-fast hover:text-text',
        'focus-visible:outline-none focus-visible:text-text',
        align === 'right' && 'flex-row-reverse',
      )}
    >
      <span>{label}</span>
      <SortIcon column={column} />
    </button>
  )
}

export function LeadsTable({ leads, stages }: Props) {
  const router = useRouter()
  const reduced = useReducedMotion()
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'icpScore', desc: true },
  ])

  const stageMap = useMemo(
    () => new Map(stages.map((s) => [s.id, s])),
    [stages]
  )

  const navigateTo = useCallback(
    (id: string) => {
      router.push(`/leads/${id}`)
    },
    [router]
  )

  const columns = useMemo<ColumnDef<Lead>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => <SortableHeader column={column} label="Lead" />,
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="truncate font-medium text-text">
              {row.original.name}
            </div>
            <div className="truncate text-xs text-text-muted">
              {row.original.company}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'niche',
        header: ({ column }) => (
          <SortableHeader column={column} label="Nicho" />
        ),
        cell: ({ getValue }) => (
          <span className="text-sm text-text-secondary">
            {getValue() as string}
          </span>
        ),
      },
      {
        id: 'origin',
        accessorKey: 'origin',
        header: () => (
          <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
            Origem
          </span>
        ),
        cell: ({ row }) => <OriginTag origin={row.original.origin} />,
        enableSorting: false,
      },
      {
        id: 'pipelineStageId',
        accessorKey: 'pipelineStageId',
        header: () => (
          <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
            Etapa
          </span>
        ),
        cell: ({ row }) => {
          const stage = stageMap.get(row.original.pipelineStageId)
          if (!stage) {
            return <span className="text-xs text-text-muted">—</span>
          }
          const variant =
            (STAGE_VARIANTS[stage.id] as
              | 'pipeline-prospect'
              | 'pipeline-contacted'
              | 'pipeline-replied'
              | 'pipeline-followup'
              | 'pipeline-proposal'
              | 'pipeline-won'
              | 'pipeline-lost'
              | undefined) ?? 'pipeline-prospect'
          return <Badge variant={variant}>{stage.name}</Badge>
        },
        enableSorting: false,
      },
      {
        id: 'temperature',
        accessorKey: 'temperature',
        header: () => (
          <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
            Temp
          </span>
        ),
        cell: ({ row }) => <TemperatureBadge value={row.original.temperature} />,
        enableSorting: false,
      },
      {
        accessorKey: 'icpScore',
        header: ({ column }) => (
          <SortableHeader column={column} label="ICP" />
        ),
        cell: ({ row }) => (
          <span className="inline-flex items-center">
            <ICPScoreRing
              score={row.original.icpScore}
              size={36}
              strokeWidth={3}
            />
          </span>
        ),
        size: 80,
      },
      {
        accessorKey: 'nextFollowUpAt',
        header: ({ column }) => (
          <SortableHeader column={column} label="Próx. follow-up" />
        ),
        cell: ({ row }) => {
          const value = row.original.nextFollowUpAt
          if (!value) {
            return <span className="font-mono text-sm text-text-muted">—</span>
          }
          const date = parseISO(value)
          const overdue = date < new Date()
          return (
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'font-mono text-sm tabular-nums',
                  overdue ? 'text-danger' : 'text-text-secondary'
                )}
              >
                {format(date, 'dd/MM', { locale: ptBR })}
              </span>
              {overdue && (
                <Badge variant="danger" className="text-[10px]">
                  Atrasado
                </Badge>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'lastContactAt',
        header: ({ column }) => (
          <SortableHeader column={column} label="Último" />
        ),
        cell: ({ row }) => {
          const value = row.original.lastContactAt
          if (!value) {
            return <span className="font-mono text-sm text-text-muted">—</span>
          }
          return (
            <span className="font-mono text-sm tabular-nums text-text-secondary">
              {format(parseISO(value), 'dd/MM', { locale: ptBR })}
            </span>
          )
        },
      },
    ],
    [stageMap]
  )

  const table = useReactTable({
    data: leads,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const rows = table.getRowModel().rows

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm-token">
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0">
          <thead className="sticky top-0 z-10 bg-surface-elevated/80 backdrop-blur-sm">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    style={
                      header.column.columnDef.size
                        ? { width: header.column.columnDef.size }
                        : undefined
                    }
                    className="border-b border-border px-4 py-3 text-left align-middle"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.map((row) => {
              const staggerIndex = Math.min(row.index, MAX_STAGGER_ROWS)
              const transition = reduced
                ? { duration: 0 }
                : {
                    delay: staggerIndex * 0.03,
                    duration: 0.22,
                    ease: tokens.easing.enter,
                  }
              return (
                <motion.tr
                  key={row.id}
                  role="link"
                  tabIndex={0}
                  initial={reduced ? false : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={transition}
                  onClick={() => navigateTo(row.original.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      navigateTo(row.original.id)
                    }
                  }}
                  className={cn(
                    'group cursor-pointer outline-none',
                    'transition-colors duration-fast',
                    'hover:bg-surface-elevated/50',
                    'focus-visible:bg-surface-elevated/60',
                    'focus-visible:shadow-[inset_0_0_0_1px_rgba(83,50,234,0.45)]'
                  )}
                  aria-label={`Abrir lead ${row.original.name}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="border-b border-border-subtle px-4 py-3 align-middle group-hover:shadow-[inset_0_0_0_1px_rgba(83,50,234,0.12)] group-last:border-b-0"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
