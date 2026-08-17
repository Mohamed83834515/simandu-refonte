import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { GenericRowActions } from '@/Global/Tableaux/GenericRowActions'
import type { ModePassation } from '@/simadou/allTypes/modePassation'
import type { NatureMarche } from '@/simadou/allTypes/natureMarche'
import type { Ppm } from '@/simadou/allTypes/ppm'
import type { TypeFinancementPPM } from '@/simadou/allTypes/typeFinancementPPM'
import { formatNumber } from '@/simadou/allSercices/montantFormater'
import { resolveRelationId } from '@/simadou/lib/resolveApiRelation'
import { ListChecks, Trash2, UserPen } from 'lucide-react'
import { Button } from '@/components/ui/button'

type PpmDialogType = 'add' | 'edit' | 'delete'

type PpmLookups = {
  modesById: Map<number, ModePassation>
  typesFinancementById: Map<number, TypeFinancementPPM>
  naturesById: Map<number, NatureMarche>
}

function resolveLabel(
  value: unknown,
  idKey: string,
  lookup: Map<number, { [key: string]: unknown }>,
  labelKeys: string[]
): string {
  if (typeof value === 'object' && value) {
    for (const key of labelKeys) {
      const label = (value as Record<string, unknown>)[key]
      if (typeof label === 'string' && label.trim()) return label
    }
  }

  const id = resolveRelationId(value, idKey)
  if (id == null) return '—'

  const found = lookup.get(id)
  if (!found) return String(id)

  for (const key of labelKeys) {
    const label = found[key]
    if (typeof label === 'string' && label.trim()) return label
  }

  return String(id)
}

export const buildPpmColumns = (
  setOpen: (dialog: PpmDialogType | null) => void,
  setCurrentRow: React.Dispatch<React.SetStateAction<Ppm | null>>,
  lookups: PpmLookups,
  onOpenEtapes: (ppm: Ppm) => void
): ColumnDef<Ppm>[] => [
    {
      id: 'intitule_ppm',
      accessorKey: 'intitule_ppm',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Intitulé' />
      ),
      cell: ({ row }) => <div>{row.original.intitule_ppm}</div>,
    },
    {
      id: 'code_budget',
      accessorKey: 'code_budget',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Code budget' />
      ),
      cell: ({ row }) => <div>{row.original.code_budget}</div>,
    },
    {
      id: 'montant_budget',
      accessorKey: 'montant_budget',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Montant budget'
          className='justify-center'
        />
      ),
      cell: ({ row }) => (
        <div className='w-full text-center font-mono tabular-nums'>
          {formatNumber(row.original.montant_budget)}
        </div>
      ),
      meta: { thClassName: 'text-center', className: 'text-center' },
    },

    {
      id: 'methode_passation',
      accessorKey: 'methode_passation',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Méthode de passation' />
      ),
      cell: ({ row }) => (
        <div>
          {resolveLabel(
            row.original.methode_passation,
            'id_mode_passation',
            lookups.modesById,
            ['intitule_mode_passation', 'code_mode_passation']
          )}
        </div>
      ),
    },
    {
      id: 'type_financement',
      accessorKey: 'type_financement',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Type de financement' />
      ),
      cell: ({ row }) => (
        <div>
          {resolveLabel(
            row.original.type_financement,
            'id_type_financement_ppm',
            lookups.typesFinancementById,
            ['intitule_type_financement_ppm', 'code_type_financement_ppm']
          )}
        </div>
      ),
    },
    {
      id: 'nature_marche',
      accessorKey: 'nature_marche',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Nature de marché' />
      ),
      cell: ({ row }) => (
        <div>
          {resolveLabel(
            row.original.nature_marche,
            'id_nature_marche',
            lookups.naturesById,
            ['intitule_nature_marche', 'code_nature_marche']
          )}
        </div>
      ),
    },
    {
      id: 'etapes',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Étapes'
          className='w-full text-center'
        />
      ),
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='gap-2 border-blue-200 bg-blue-50 text-blue-700 transition-all duration-200 hover:bg-blue-100 hover:text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-950/50'
            onClick={() => onOpenEtapes(row.original)}
            aria-label='Ouvrir les étapes de passation'
            title='Étapes de passation'
          >
            <ListChecks className='h-4 w-4' />
            <span className='text-xs font-medium'>Étapes</span>
          </Button>
        </div>
      ),
      meta: {
        thClassName: 'text-center w-[110px]',
        className: 'text-center align-middle',
      },
      size: 110,
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Actions' />
      ),
      cell: ({ row }) => (
        <GenericRowActions
          row={row}
          actions={[
            {
              label: 'Modifier',
              icon: <UserPen size={16} />,
              onClick: (item) => {
                setCurrentRow(item)
                setOpen('edit')
              },
            },
            {
              label: 'Supprimer',
              icon: <Trash2 size={16} />,
              className: 'text-red-500!',
              separator: true,
              onClick: (item) => {
                setCurrentRow(item)
                setOpen('delete')
              },
            },
          ]}
        />
      ),
    },
  ]
