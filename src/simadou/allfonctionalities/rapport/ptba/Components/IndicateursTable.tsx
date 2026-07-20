import { useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { GenericTable } from '@/Global/Generic/Generictable'
import { useGetUnitesIndicateur } from '@/simadou/allHooks/admin/uniteIndicateurHooks'
import type { CadreAnalytique, Ptba } from '@/simadou/allTypes'
import { type IndicateurTache } from '@/simadou/allTypes/indicateurTache'
import { resolveCadreAnalytiqueFormValue } from '@/simadou/lib/ptbaFormUtils'
import { useRapportExportRegistration } from '@/simadou/allfonctionalities/rapport/useRapportExportRegistration'
import { LineChart, Loader2 } from 'lucide-react'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TableCell, TableRow } from '@/components/ui/table'
import { type RapportExportRowMeta } from '../../export/rapportExportTypes'

interface IndicateursTableProps {
  cadresAnalytiques: CadreAnalytique[]
  ptbas: Ptba[]
  indicateurs: IndicateurTache[]
  isLoading: boolean
  showValeurRealisee?: boolean
}

type TreeRow = {
  type: 'cadre' | 'ptba'
  label?: string
  niveau: number
  ptba?: Ptba
  ind?: IndicateurTache
  groupKey?: string
}

export function IndicateursTable({
  cadresAnalytiques,
  ptbas,
  indicateurs,
  isLoading,
  showValeurRealisee = false,
}: IndicateursTableProps) {
  const { data: unites = [] } = useGetUnitesIndicateur()
  const { navigate } = useEmbeddedTableState()

  const columns: ColumnDef<TreeRow>[] = [
    {
      id: 'code',
      header: 'Code',
      accessorFn: (row) => row.ptba?.code_activite_ptba ?? '',
    },
    {
      id: 'activite',
      header: 'Activité',
      accessorFn: (row) => row.ptba?.intitule_activite_ptba ?? '',
    },
    {
      id: 'indicateur',
      header: 'Indicateur',
      accessorFn: (row) => row.ind?.intitule_indicateur_tache ?? '',
    },
    {
      id: 'unite',
      header: 'Unité',
      accessorFn: (row) => {
        const unite = unites.find((u) => u.id_unite == row.ind?.unite_ind_tache)

        return unite
          ? `${unite.definition_ui} (${unite.unite_ui})`
          : (row.ind?.unite_ind_tache ?? '')
      },
    },
    {
      id: 't1',
      header: 'T1',
      accessorFn: (row) =>
        row.ind?.trimestre_1 != null ? String(row.ind.trimestre_1) : '',
    },
    {
      id: 't2',
      header: 'T2',
      accessorFn: (row) =>
        row.ind?.trimestre_2 != null ? String(row.ind.trimestre_2) : '',
    },
    {
      id: 't3',
      header: 'T3',
      accessorFn: (row) =>
        row.ind?.trimestre_3 != null ? String(row.ind.trimestre_3) : '',
    },
    {
      id: 't4',
      header: 'T4',
      accessorFn: (row) =>
        row.ind?.trimestre_4 != null ? String(row.ind.trimestre_4) : '',
    },
    ...(showValeurRealisee
      ? [
          {
            id: 'valeur_realisee',
            header: 'Valeur réalisée',
            accessorFn: (row) =>
              row.ind?.valeur_realisee != null
                ? String(row.ind.valeur_realisee)
                : '',
          } satisfies ColumnDef<TreeRow>,
        ]
      : []),
  ]

  const indicateursByActivite = useMemo(() => {
    const map = new Map<number, IndicateurTache[]>()

    for (const ptba of ptbas) {
      if (ptba.id_ptba) map.set(ptba.id_ptba, [])
    }

    for (const ind of indicateurs) {
      const id = ind.id_activite
      if (id && map.has(id)) {
        map.get(id)!.push(ind)
      }
    }

    return map
  }, [ptbas, indicateurs])

  /**
   * =========================
   * TREE BUILD (comme TachesTable)
   * =========================
   */
  const rows = useMemo(() => {
    const result: TreeRow[] = []

    const ptbasByCadre = new Map<number, Ptba[]>()

    ptbas.forEach((ptba) => {
      const id = resolveCadreAnalytiqueFormValue(
        ptba.cadre_analytique,
        cadresAnalytiques
      )
      if (id == null) return
      if (!ptbasByCadre.has(id)) ptbasByCadre.set(id, [])
      ptbasByCadre.get(id)!.push(ptba)
    })

    function children(cadres: CadreAnalytique[], parentId: number) {
      return cadres.filter((c) => {
        if (typeof c.parent_ca === 'object' && c.parent_ca) {
          return c.parent_ca.id_ca === parentId
        }
        return c.parent_ca === parentId
      })
    }

    function cadreHasPtba(cadre: CadreAnalytique): boolean {
      const activites = ptbasByCadre.get(cadre.id_ca) ?? []
      if (activites.length > 0) return true

      const enfants = children(cadresAnalytiques, cadre.id_ca)
      return enfants.some(cadreHasPtba)
    }

    function parcourir(cadre: CadreAnalytique, niveau: number) {
      if (!cadreHasPtba(cadre)) return

      result.push({
        type: 'cadre',
        label: cadre.intutile_ca,
        niveau,
      })

      children(cadresAnalytiques, cadre.id_ca).forEach((c) =>
        parcourir(c, niveau + 1)
      )

      const activites = ptbasByCadre.get(cadre.id_ca) ?? []

      activites.forEach((ptba) => {
        const inds = indicateursByActivite.get(ptba.id_ptba) ?? []

        const groupKey = String(ptba.id_ptba)

        if (inds.length === 0) {
          result.push({
            type: 'ptba',
            ptba,
            niveau,
            groupKey,
          })
        } else {
          inds.forEach((ind) => {
            result.push({
              type: 'ptba',
              ptba,
              niveau,
              groupKey,
              ind,
            })
          })
        }
      })
    }

    cadresAnalytiques
      .filter((c) => c.parent_ca === null)
      .filter(cadreHasPtba)
      .forEach((c) => parcourir(c, 0))

    return result
  }, [cadresAnalytiques, ptbas, indicateursByActivite])

  /**
   * =========================
   * GROUP SPAN PTBA
   * =========================
   */
  const groupSpans = useMemo(() => {
    const map = new Map<string, number>()

    rows.forEach((r) => {
      if (r.type !== 'ptba') return
      if (!r.groupKey) return
      map.set(r.groupKey, (map.get(r.groupKey) ?? 0) + 1)
    })

    return map
  }, [rows])

  useRapportExportRegistration({
    isLoading,

    buildExportTable: () => {
      const exportRows: string[][] = []
      const rowMetas: RapportExportRowMeta[] = []

      rows.forEach((r) => {
        /**
         * =========================
         * CADRE ANALYTIQUE
         * =========================
         */
        if (r.type === 'cadre') {
          exportRows.push([
            r.label ?? '',
            ...Array.from({ length: columns.length - 1 }, () => ''),
          ])

          rowMetas.push({
            type: 'section',
            niveau: r.niveau,
            label: r.label,
          })

          return
        }

        /**
         * =========================
         * PTBA + INDICATEUR
         * =========================
         */

        const unite = unites.find((u) => u.id_unite == r.ind?.unite_ind_tache)

        exportRows.push([
          r.ptba?.code_activite_ptba ?? '',
          r.ptba?.intitule_activite_ptba ?? '',
          r.ind?.intitule_indicateur_tache ?? 'Aucun indicateur',
          ...(unite
            ? [`${unite.definition_ui} (${unite.unite_ui})`]
            : [r.ind?.unite_ind_tache ? String(r.ind.unite_ind_tache) : '']),
          r.ind?.trimestre_1 != null ? String(r.ind.trimestre_1) : '',
          r.ind?.trimestre_2 != null ? String(r.ind.trimestre_2) : '',
          r.ind?.trimestre_3 != null ? String(r.ind.trimestre_3) : '',
          r.ind?.trimestre_4 != null ? String(r.ind.trimestre_4) : '',
          ...(showValeurRealisee
            ? [
                r.ind?.valeur_realisee != null
                  ? String(r.ind.valeur_realisee)
                  : '',
              ]
            : []),
        ])

        rowMetas.push({
          type: 'data',
          groupKey: r.ptba?.id_ptba ? String(r.ptba.id_ptba) : undefined,
        })
      })

      return {
        columns: columns.map((c) => ({
          id: c.id as string,
          header: c.header as string,
        })),

        rowMetas,
        rows: exportRows,
        visibleColumnIds: columns.map((c) => c.id as string),
      }
    },
  })

  if (isLoading) return <Loader2 className='animate-spin' />

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <LineChart className='h-4 w-4' />

          <CardTitle>Indicateurs par cadre analytique</CardTitle>

          <Badge className='ml-auto'>{indicateurs.length}</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <GenericTable<TreeRow>
          data={rows}
          columns={columns}
          search={{}}
          navigate={navigate}
          showPagination={false}
          defaultPageSize={rows.length}
          showSearch={false}
          showViewOptions={false}
          customRowRenderer={(row, i, { rowClassName, cellClassName }) => {
            /**
             * =========================
             * CADRE ROW
             * =========================
             */
            if (row.type === 'cadre') {
              const empty = row.niveau
              const span = columns.length - empty

              return (
                <TableRow className={`${rowClassName} font-bold`} key={i}>
                  {Array.from({ length: empty }).map((_, idx) => (
                    <TableCell className={cellClassName()} key={idx} />
                  ))}
                  <TableCell className={cellClassName()} colSpan={span}>
                    {row.label}
                  </TableCell>
                </TableRow>
              )
            }

            /**
             * =========================
             * PTBA + INDICATEUR
             * =========================
             */
            const span = row.groupKey ? (groupSpans.get(row.groupKey) ?? 1) : 1

            const isFirst = row.groupKey
              ? rows.findIndex(
                  (r) => r.groupKey === row.groupKey && r.type === 'ptba'
                ) === i
              : true

            const unite = unites.find(
              (u) => u.id_unite == row.ind?.unite_ind_tache
            )

            return (
              <TableRow className={rowClassName} key={i}>
                {isFirst && (
                  <TableCell className={cellClassName(0)} rowSpan={span}>
                    {row.ptba?.code_activite_ptba}
                  </TableCell>
                )}

                {isFirst && (
                  <TableCell className={cellClassName(1)} rowSpan={span}>
                    {row.ptba?.intitule_activite_ptba}
                  </TableCell>
                )}

                <TableCell className={cellClassName(2)}>
                  {row.ind?.intitule_indicateur_tache ?? '—'}
                </TableCell>

                <TableCell className={cellClassName(3)}>
                  {unite
                    ? `${unite.definition_ui} (${unite.unite_ui})`
                    : row.ind?.unite_ind_tache}
                </TableCell>

                <TableCell className={cellClassName(4)}>
                  {row.ind?.trimestre_1 ?? ''}
                </TableCell>
                <TableCell className={cellClassName(5)}>
                  {row.ind?.trimestre_2 ?? ''}
                </TableCell>
                <TableCell className={cellClassName(6)}>
                  {row.ind?.trimestre_3 ?? ''}
                </TableCell>
                <TableCell className={cellClassName(7)}>
                  {row.ind?.trimestre_4 ?? ''}
                </TableCell>

                {showValeurRealisee && (
                  <TableCell className={cellClassName(8)}>
                    {row.ind?.valeur_realisee ?? ''}
                  </TableCell>
                )}
              </TableRow>
            )
          }}
        />
      </CardContent>
    </Card>
  )
}
