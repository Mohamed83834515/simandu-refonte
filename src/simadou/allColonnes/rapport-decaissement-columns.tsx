import { type ColumnDef } from '@tanstack/react-table'
import { buildColumns } from '@/Global/Tableaux/column-builder'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { RapportMontantCell } from '@/simadou/allColonnes/RapportMontantCell'
import {
  computeTauxDecaissement,
  formatRapportTaux,
} from '@/simadou/allColonnes/rapport-format-utils'
import { resolvePtbaActiviteId } from '@/simadou/allfonctionalities/rapport/rapportTableUtils'
import type { Ptba } from '../allTypes'

type RapportDecaissementColumnsProps = {
  decaissementByActivite: Map<number, number>
  currencyCode?: string
}

export function buildRapportDecaissementColumns({
  decaissementByActivite,
  currencyCode,
}: RapportDecaissementColumnsProps): ColumnDef<Ptba>[] {
  const baseColumns = buildColumns<Ptba>([
    {
      type: 'text',
      key: 'code_activite_ptba',
      title: 'Code',
      sticky: true,
    },
    {
      type: 'text',
      key: 'intitule_activite_ptba',
      title: 'Activité',
      maxWidth: 'max-w-md',
    },
    { type: 'plain', key: 'version_ptba', title: 'Version PTBA' },
  ])

  const montantColumn: ColumnDef<Ptba> = {
    id: 'montant_activite',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={
          currencyCode
            ? `Montant de l'activité (${currencyCode})`
            : "Montant de l'activité"
        }
        className='w-full text-center'
      />
    ),
    cell: ({ row }) => (
      <RapportMontantCell value={row.original.cout_total_ptba} />
    ),
    meta: { thClassName: 'text-center', className: 'text-center' },
    enableSorting: true,
    sortDescFirst: true,
    enableHiding: false,
  }

  const decaissementColumn: ColumnDef<Ptba> = {
    id: 'decaissement',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={
          currencyCode ? `Décaissement (${currencyCode})` : 'Décaissement'
        }
        className='w-full text-center'
      />
    ),
    cell: ({ row }) => {
      const activiteId = resolvePtbaActiviteId(row.original)
      return (
        <RapportMontantCell
          value={activiteId != null ? decaissementByActivite.get(activiteId) : undefined}
        />
      )
    },
    meta: { thClassName: 'text-center', className: 'text-center' },
    enableSorting: false,
    enableHiding: false,
  }

  const tauxColumn: ColumnDef<Ptba> = {
    id: 'taux_decaissement',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Taux'
        className='w-full text-center'
      />
    ),
    cell: ({ row }) => {
      const activiteId = resolvePtbaActiviteId(row.original)
      const decaissement =
        activiteId != null ? decaissementByActivite.get(activiteId) : undefined
      const taux = computeTauxDecaissement(
        row.original.cout_total_ptba,
        decaissement
      )

      if (taux == null) {
        return (
          <div className='flex justify-center'>
            <span className='text-sm text-muted-foreground'>—</span>
          </div>
        )
      }

      return (
        <div className='flex justify-center'>
          <span className='inline-flex min-w-10 items-center justify-center rounded-full bg-violet-50 px-2.5 py-0.5 text-sm font-semibold tabular-nums text-violet-700 dark:bg-violet-950/30 dark:text-violet-400'>
            {formatRapportTaux(taux)}%
          </span>
        </div>
      )
    },
    meta: { thClassName: 'text-center', className: 'text-center' },
    enableSorting: false,
    enableHiding: false,
  }

  return [...baseColumns, montantColumn, decaissementColumn, tauxColumn]
}
