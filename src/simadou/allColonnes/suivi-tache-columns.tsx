import { type ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { cn } from '@/lib/utils'
import type { TacheActivitePtba } from '@/simadou/allTypes'
import {
  findSuiviForTache,
  type SuiviTacheActivite,
} from '@/simadou/allTypes/suiviTacheActivite'

export type SuiviTacheTableRow = TacheActivitePtba

export type SuiviTacheColumnHandlers = {
  onSuivre: (tache: TacheActivitePtba, suivi?: SuiviTacheActivite) => void
  suivis: SuiviTacheActivite[]
}

const colWide = 'max-w-[220px] whitespace-normal'

function formatDateRealisation(value: string | undefined | null): string {
  if (!value?.trim()) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function buildSuiviTacheColumns(
  handlers: SuiviTacheColumnHandlers
): ColumnDef<SuiviTacheTableRow>[] {
  const { onSuivre, suivis } = handlers

  const tacheColumn: ColumnDef<SuiviTacheTableRow> = {
    id: 'intutile_tache_gt',
    accessorKey: 'intutile_tache_gt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tâche' />
    ),
    cell: ({ row }) => {
      const tache = row.original
      return (
        <div className={cn('flex items-start gap-2.5', colWide)}>
          <span className='mt-0.5 shrink-0 text-sm font-semibold text-muted-foreground'>
            {row.index + 1}.
          </span>
          <div className='min-w-0 space-y-0.5'>
            <p className='font-medium leading-snug'>{tache.intutile_tache_gt}</p>
            {tache.code_tache_gt && (
              <p className='text-xs text-muted-foreground'>
                {tache.code_tache_gt}
              </p>
            )}
          </div>
        </div>
      )
    },
    meta: { thClassName: 'ps-4', className: 'ps-4' },
    enableSorting: false,
    enableHiding: false,
  }

  const lotColumn: ColumnDef<SuiviTacheTableRow> = {
    id: 'lot',
    accessorKey: 'n_lot_gt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Lot' />
    ),
    cell: ({ row }) => (
      <span className='tabular-nums'>{row.original.n_lot_gt}</span>
    ),
    meta: { thClassName: 'text-center', className: 'text-center' },
    enableSorting: false,
    enableHiding: false,
  }

  const proportionColumn: ColumnDef<SuiviTacheTableRow> = {
    id: 'proportion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='P%' />
    ),
    cell: ({ row }) => {
      const raw = row.original.proportion_gt?.trim()
      if (!raw) {
        return <span className='text-muted-foreground'>—</span>
      }
      const label = raw.endsWith('%') ? raw : `${raw}%`
      return <span className='font-semibold tabular-nums'>{label}</span>
    },
    meta: { thClassName: 'text-center', className: 'text-center' },
    enableSorting: false,
    enableHiding: false,
  }

  const dateColumn: ColumnDef<SuiviTacheTableRow> = {
    id: 'date_realisation',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Date réalisation' />
    ),
    cell: ({ row }) => {
      const tache = row.original
      const suivi = findSuiviForTache(suivis, tache.id_groupe_tache)
      return (
        <span className='whitespace-nowrap text-muted-foreground'>
          {formatDateRealisation(suivi?.date_reele)}
        </span>
      )
    },
    meta: {
      thClassName: 'min-w-[120px] text-center',
      className: 'min-w-[120px] text-center',
    },
    enableSorting: false,
    enableHiding: false,
  }

  const valideColumn: ColumnDef<SuiviTacheTableRow> = {
    id: 'valide',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Validé' />
    ),
    cell: ({ row }) => {
      const suivi = findSuiviForTache(suivis, row.original.id_groupe_tache)
      if (!suivi) {
        return <span className='text-muted-foreground'>—</span>
      }
      return (
        <Badge
          variant={suivi.valide ? 'default' : 'secondary'}
          className='min-w-[48px] justify-center'
        >
          {suivi.valide ? 'Oui' : 'Non'}
        </Badge>
      )
    },
    meta: { thClassName: 'text-center', className: 'text-center' },
    enableSorting: false,
    enableHiding: false,
  }

  const suiviActionColumn: ColumnDef<SuiviTacheTableRow> = {
    id: 'suivi_action',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Suivi' />
    ),
    cell: ({ row }) => {
      const tache = row.original
      const suivi = findSuiviForTache(suivis, tache.id_groupe_tache)
      return (
        <Button
          variant='outline'
          size='sm'
          className='h-8 min-w-[84px] px-2.5'
          onClick={() => onSuivre(tache, suivi)}
        >
          {suivi ? 'Modifier' : 'Suivre'}
        </Button>
      )
    },
    meta: { thClassName: 'text-center', className: 'text-center' },
    enableSorting: false,
    enableHiding: false,
  }

  const observationColumn: ColumnDef<SuiviTacheTableRow> = {
    id: 'observation',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Observation' />
    ),
    cell: ({ row }) => {
      const suivi = findSuiviForTache(suivis, row.original.id_groupe_tache)
      const observation = suivi?.observation_suivi?.trim()
      return (
        <p
          className={cn(
            colWide,
            'line-clamp-3 text-muted-foreground leading-relaxed'
          )}
          title={observation}
        >
          {observation || '—'}
        </p>
      )
    },
    meta: { thClassName: 'pe-4', className: 'pe-4' },
    enableSorting: false,
    enableHiding: false,
  }

  return [
    tacheColumn,
    lotColumn,
    proportionColumn,
    dateColumn,
    valideColumn,
    suiviActionColumn,
    observationColumn,
  ]
}