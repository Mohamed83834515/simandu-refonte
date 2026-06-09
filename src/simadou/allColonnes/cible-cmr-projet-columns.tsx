import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { buildEditDeleteActionsColumn } from '@/Global/Tableaux/buildEditDeleteActionsColumn'
import type { CibleCmrProjet, IndicateurCadreResultat, UGL } from '@/simadou/allTypes'
import {
  formatAnneeCible,
  formatValeurCible,
  lookupIndicateurCadreResultatByCrpId,
  resolveCodeIndicateurCrpForForm,
} from '@/simadou/schemas/cibleCmrProjetSchema'
import { resolveRelationCode } from '@/simadou/lib/resolveApiRelation'

function displayCode(value: unknown, codeKey: string): string {
  return resolveRelationCode(value, codeKey) ?? 'Non défini'
}

function lookupUglByCode(
  codeUg: string | null | undefined,
  ugls: UGL[]
): UGL | null {
  if (!codeUg) return null
  return ugls.find((u) => u.code_ugl === codeUg) ?? null
}

function resolveIndicateurDisplay(
  row: CibleCmrProjet,
  indicateurs: IndicateurCadreResultat[]
) {
  const indicateurId = resolveCodeIndicateurCrpForForm(row)
  const indicateur =
    lookupIndicateurCadreResultatByCrpId(indicateurId, indicateurs) ??
    (row.indicateur_crp as IndicateurCadreResultat | null | undefined)
  const code =
    indicateur?.code_indicateur_cr_iop ??
    resolveRelationCode(row.code_indicateur_crp, 'code_indicateur_cr_iop') ??
    'Non défini'
  const intitule =
    indicateur?.intitule_indicateur_cr_iop ??
    resolveRelationCode(
      row.indicateur_crp ?? row.code_indicateur_crp,
      'intitule_indicateur_cr_iop'
    )

  return { code, intitule }
}

export function buildCibleCmrProjetColumns({
  onView,
  onEdit,
  onDeleteRequest,
  hideProjetColumn = false,
  hideIndicateurColumn = false,
  indicateurs = [],
  ugls = [],
}: {
  onView?: (row: CibleCmrProjet) => void
  onEdit: (row: CibleCmrProjet) => void
  onDeleteRequest: (row: CibleCmrProjet) => void
  hideProjetColumn?: boolean
  hideIndicateurColumn?: boolean
  indicateurs?: IndicateurCadreResultat[]
  ugls?: UGL[]
}): ColumnDef<CibleCmrProjet>[] {
  const actionsColumn = buildEditDeleteActionsColumn({
    onView,
    onEdit,
    onDeleteRequest,
  })

  const columns: ColumnDef<CibleCmrProjet>[] = [
    {
      id: 'annee',
      accessorKey: 'annee',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Année' />
      ),
      cell: ({ row }) => (
        <span className='font-medium tabular-nums'>
          {formatAnneeCible(row.original.annee)}
        </span>
      ),
      enableHiding: false,
    },
    {
      id: 'valeur_cible_indcateur_crp',
      accessorKey: 'valeur_cible_indcateur_crp',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Valeur cible' />
      ),
      cell: ({ row }) => (
        <span className='font-semibold tabular-nums'>
          {formatValeurCible(Number(row.original.valeur_cible_indcateur_crp ?? 0))}
        </span>
      ),
      enableHiding: false,
    },
    ...(hideIndicateurColumn
      ? []
      : [
          {
            id: 'code_indicateur_crp',
            accessorFn: (row) =>
              resolveIndicateurDisplay(row, indicateurs).intitule ?? '',
            header: ({ column }) => (
              <DataTableColumnHeader column={column} title='Indicateur' />
            ),
            cell: ({ row }) => {
              const { code, intitule } = resolveIndicateurDisplay(
                row.original,
                indicateurs
              )

              return (
                <div className='max-w-xs'>
                  <span className='font-mono text-sm'>{code}</span>
                  {intitule ? (
                    <p
                      className='mt-1 truncate text-xs text-muted-foreground'
                      title={intitule}
                    >
                      {intitule}
                    </p>
                  ) : null}
                </div>
              )
            },
            enableSorting: false,
            enableHiding: false,
          } satisfies ColumnDef<CibleCmrProjet>,
        ]),
    {
      id: 'code_ug',
      accessorFn: (row) => {
        const code =
          resolveRelationCode(row.code_ug, 'code_ugl') ??
          (typeof row.code_ug === 'string' ? row.code_ug : null)
        const ugl =
          (row.ugl as UGL | null | undefined) ?? lookupUglByCode(code, ugls)
        return (
          ugl?.nom_ugl ??
          resolveRelationCode(row.ugl ?? row.code_ug, 'nom_ugl') ??
          ''
        )
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='UGL' />
      ),
      cell: ({ row }) => {
        const nom =
          (row.getValue('code_ug') as string) ||
          'Non défini'

        return (
          <span className='max-w-xs truncate text-sm' title={nom}>
            {nom}
          </span>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
  ]

  if (!hideProjetColumn) {
    columns.push({
      id: 'code_projet',
      accessorKey: 'code_projet',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Code projet' />
      ),
      cell: ({ row }) => (
        <span className='font-mono text-sm text-muted-foreground'>
          {displayCode(row.original.code_projet, 'code_projet')}
        </span>
      ),
      enableSorting: false,
      enableHiding: false,
    })
  }

  columns.push(actionsColumn)

  return columns
}
