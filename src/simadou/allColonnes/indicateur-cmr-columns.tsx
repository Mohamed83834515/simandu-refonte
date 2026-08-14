import { type ColumnDef } from '@tanstack/react-table'
import { ClipboardList } from 'lucide-react'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/others/long-text'
import { Button } from '@/components/ui/button'
import { buildEditDeleteActionsColumn } from '@/Global/Tableaux/buildEditDeleteActionsColumn'
import { resolveResultatCmrLabel } from '@/simadou/allfonctionalities/politique/indicateurs-cmr/indicateurCmrFormUtils'
import { resolveRelationCode } from '@/simadou/lib/resolveApiRelation'

export type IndicateurCmrTableRow = {
  id_ref_ind_cmr: number
  code_ref_ind: string
  intitule_ref_ind: string
  resultat_cmr?: unknown
  referentiel_cmr?: unknown
  annee_reference: number
  cible_cmr: string
  fonction_agregat_cmr: string
  responsable_collecte_cmr: string
  reference_cmr: string
}

function displayValue(value: string | null | undefined, fallback = '—'): string {
  if (value == null || value === '') return fallback
  return value
}

function resolveReferentielLabel(value: unknown): string {
  if (value == null) return '—'
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    const code = resolveRelationCode(value, 'code_ref_ind')
    const intitule =
      typeof record.intitule_ref_ind === 'string' ? record.intitule_ref_ind : null
    if (code && intitule) return `${code} — ${intitule}`
    if (intitule) return intitule
    if (code) return code
  }
  return String(value)
}

function resolveResultatFieldLabel(value: unknown): string {
  if (value != null && typeof value === 'object') {
    const record = value as Record<string, unknown>
    const niveau = record.niveau_cr ?? record.niveau
    if (niveau && typeof niveau === 'object' && 'libelle_ncr' in niveau) {
      const libelle = (niveau as { libelle_ncr?: string }).libelle_ncr
      if (libelle) return libelle
    }
  }
  return 'Résultat'
}

export function buildIndicateurCmrColumns<T extends IndicateurCmrTableRow>({
  onView,
  onEdit,
  onDeleteRequest,
  onOpenCibles,
  onSuivi,
  hideReferentielColumn = false,
}: {
  onView?: (row: T) => void
  onEdit?: (row: T) => void
  onDeleteRequest?: (row: T) => void
  onOpenCibles?: (row: T) => void
  onSuivi?: (row: T) => void
  hideReferentielColumn?: boolean
}): ColumnDef<T>[] {
  const actionsColumn =
    onView || onEdit || onDeleteRequest
      ? buildEditDeleteActionsColumn({
          onView,
          onEdit,
          onDeleteRequest,
        })
      : null

  const suiviColumn: ColumnDef<T> | null = onSuivi
    ? {
        id: 'suivi',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title='Suivi'
            className='text-center'
          />
        ),
        cell: ({ row }) => (
          <div className='flex justify-center'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='gap-2 border-yellow-200 bg-yellow-50 text-yellow-700 transition-all duration-200 hover:bg-yellow-100 hover:text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400 dark:hover:bg-yellow-950/50'
              onClick={() => onSuivi(row.original)}
              aria-label='Ouvrir le suivi'
              title="Suivi de l'indicateur"
            >
              <ClipboardList className='h-4 w-4' />
              <span className='text-xs font-medium'>Suivre</span>
            </Button>
          </div>
        ),
        meta: { thClassName: 'text-center', className: 'text-center' },
        size: 100,
        enableSorting: false,
        enableHiding: false,
      }
    : null

  return [
    {
      id: 'code_ref_ind',
      accessorKey: 'code_ref_ind',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Code' />
      ),
      cell: ({ row }) => (
        <span className='font-mono text-sm'>{row.original.code_ref_ind}</span>
      ),
      enableHiding: false,
    },
    {
      id: 'intitule_ref_ind',
      accessorKey: 'intitule_ref_ind',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Intitulé' />
      ),
      cell: ({ row }) => (
        <div className='max-w-xs'>
          <div className='font-medium'>{row.original.intitule_ref_ind}</div>
          {row.original.resultat_cmr != null ? (
            <p
              className='mt-1 truncate text-xs text-muted-foreground'
              title={resolveResultatCmrLabel(row.original.resultat_cmr)}
            >
              {resolveResultatFieldLabel(row.original.resultat_cmr)}:{' '}
              {resolveResultatCmrLabel(row.original.resultat_cmr)}
            </p>
          ) : null}
        </div>
      ),
      enableHiding: false,
    },
    ...(hideReferentielColumn
      ? []
      : [
        {
          id: 'referentiel_cmr',
          accessorKey: 'referentiel_cmr',
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Indicateur référentiel' />
          ),
          cell: ({ row }) => (
            <span className='text-sm'>
              {resolveReferentielLabel(row.original.referentiel_cmr)}
            </span>
          ),
          enableHiding: false,
        } satisfies ColumnDef<T>,
      ]),
    {
      id: 'annee_reference',
      accessorKey: 'annee_reference',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Année réf.' />
      ),
      cell: ({ row }) => (
        <span className='text-sm tabular-nums'>{row.original.annee_reference}</span>
      ),
      enableHiding: false,
    },
    ...(onOpenCibles
      ? []
      : [
        {
          id: 'cible_cmr',
          accessorKey: 'cible_cmr',
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Valeur Cible' />
          ),
          cell: ({ row }) => (
            <span className='text-sm'>{displayValue(row.original.cible_cmr)}</span>
          ),
          enableHiding: false,
        } satisfies ColumnDef<T>,
      ]),

    {
      id: 'reference_cmr',
      accessorKey: 'reference_cmr',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Valeur Ref.' />
      ),
      cell: ({ row }) => (
        <LongText className='max-w-xs text-sm'>
          {displayValue(row.original.reference_cmr)}
        </LongText>
      ),
      enableHiding: false,
    },
    ...(onOpenCibles
      ? [
        {
          id: 'cibles',
          header: ({ column }) => (
            <DataTableColumnHeader
              column={column}
              title='Valeur Cibles'
              className='flex w-full justify-center'
            />
          ),
          cell: ({ row }) => (
            <div className='flex justify-center'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='gap-2 border-blue-200 bg-blue-50 text-blue-700 transition-all duration-200 hover:bg-blue-100 hover:text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-950/50'
                onClick={() => onOpenCibles(row.original)}
                aria-label='Gérer les cibles CMR'
                title='Cibles CMR'
              >
                <span className='text-xs font-medium'>{row.original.cible_cmr}</span>
              </Button>
            </div>
          ),
          enableHiding: false,
          meta: {
            thClassName: 'text-center w-[120px] pe-12',
            className: 'text-center align-middle pe-12',
          },
          size: 120,
        } satisfies ColumnDef<T>,
      ]
      : []),

    {
      id: 'responsable_collecte_cmr',
      accessorKey: 'responsable_collecte_cmr',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Responsable' />
      ),
      cell: ({ row }) => (
        <LongText className='max-w-xs text-sm'>
          {displayValue(row.original.responsable_collecte_cmr)}
        </LongText>
      ),
    },
    ...(suiviColumn ? [suiviColumn] : []),
    ...(actionsColumn ? [actionsColumn] : []),
  ]
}