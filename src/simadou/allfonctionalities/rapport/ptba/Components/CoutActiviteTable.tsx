import { useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { resolveCadreAnalytiqueFormValue } from '@/simadou/lib/ptbaFormUtils'
import { GenericTable } from '@/Global/Generic/Generictable'
import type {
  CoutUnitairePtba,
  Ptba,
  CadreAnalytique,
} from '@/simadou/allTypes'
import { Loader2, Receipt } from 'lucide-react'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TableCell, TableRow } from '@/components/ui/table'
import { type RapportExportRowMeta } from '../../export/rapportExportTypes'
import { useRapportExportRegistration } from '../../useRapportExportRegistration'

interface Props {
  cadresAnalytiques: CadreAnalytique[]
  ptbas: Ptba[]
  couts: CoutUnitairePtba[]
  isLoading: boolean
  currencyCode?: string
}

type TreeRow = {
  type: 'cadre' | 'ptba'
  label?: string
  niveau: number
  ptba?: Ptba
  cout?: CoutUnitairePtba
  groupKey?: string
}

const fmt = (v: number) => new Intl.NumberFormat('fr-FR').format(v)

export function CoutActiviteTable({
  cadresAnalytiques,
  ptbas,
  couts,
  isLoading,
  currencyCode = 'GNF',
}: Props) {
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
      id: 'ordre',
      header: '#',
      accessorFn: (row) => row.cout?.ordre ?? '',
    },
    {
      id: 'tache',
      header: 'Intitulé tâche',
      accessorFn: (row) => row.cout?.intitule_tache ?? '',
    },
    {
      id: 'unite',
      header: 'Unité',
      accessorFn: (row) => row.cout?.unite_cu ?? '',
    },
    {
      id: 'quantite',
      header: 'Quantité',
      accessorFn: (row) => (row.cout ? fmt(row.cout.quantite_cu) : ''),
    },
    {
      id: 'prix',
      header: 'Prix unitaire',
      accessorFn: (row) => (row.cout ? fmt(row.cout.prix_unitaire) : ''),
    },
    {
      id: 'montant',
      header: 'Montant',
      accessorFn: (row) =>
        row.cout ? fmt(row.cout.quantite_cu * row.cout.prix_unitaire) : '',
    },
  ]

  const rows = useMemo(() => {
    const coutsByActivite = new Map<number, CoutUnitairePtba[]>()

    ptbas.forEach((p) => {
      coutsByActivite.set(p.id_ptba, [])
    })

    couts.forEach((c) => {
      const id =
        typeof c.ptba_activite === 'number'
          ? c.ptba_activite
          : c.ptba_activite?.id_ptba

      if (id && coutsByActivite.has(id)) {
        coutsByActivite.get(id)!.push(c)
      }
    })

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

    const result: TreeRow[] = []

    function children(parentId: number) {
      return cadresAnalytiques.filter((c) => {
        if (typeof c.parent_ca === 'object' && c.parent_ca)
          return c.parent_ca.id_ca === parentId

        return c.parent_ca === parentId
      })
    }

    function cadreHasPtba(cadre: CadreAnalytique): boolean {
      const activites = ptbasByCadre.get(cadre.id_ca) ?? []

      if (activites.length > 0) return true

      return children(cadre.id_ca).some(cadreHasPtba)
    }

    function parcourir(cadre: CadreAnalytique, niveau: number) {
      if (!cadreHasPtba(cadre)) return

      result.push({
        type: 'cadre',

        label: cadre.intutile_ca,

        niveau,
      })

      children(cadre.id_ca).forEach((c) => parcourir(c, niveau + 1))

      const activites = ptbasByCadre.get(cadre.id_ca) ?? []

      activites.forEach((ptba) => {
        const activiteCouts = coutsByActivite.get(ptba.id_ptba) ?? []

        const groupKey = String(ptba.id_ptba)

        if (activiteCouts.length === 0) {
          result.push({
            type: 'ptba',
            niveau,
            ptba,
            groupKey,
          })
        } else {
          activiteCouts.forEach((cout) => {
            result.push({
              type: 'ptba',
              niveau,
              ptba,
              cout,
              groupKey,
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
  }, [cadresAnalytiques, ptbas, couts])

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
        if (r.type === 'cadre') {
          exportRows.push([r.label ?? '', '', '', '', '', '', '', ''])

          rowMetas.push({
            type: 'section',
            niveau: r.niveau,
            label: r.label,
          })
        } else {
          exportRows.push([
            r.ptba?.code_activite_ptba ?? '',
            r.ptba?.intitule_activite_ptba ?? '',
            r.cout ? String(r.cout.ordre ?? '') : '',
            r.cout?.intitule_tache ?? '',
            r.cout?.unite_cu ?? '',
            r.cout ? fmt(r.cout.quantite_cu) : '',
            r.cout ? fmt(r.cout.prix_unitaire) : '',
            r.cout
              ? fmt(r.cout.quantite_cu * r.cout.prix_unitaire)
              : 'Aucun coût',
          ])

          rowMetas.push({
            type: 'data',
            groupKey: r.groupKey,
          })
        }
      })

      return {
        columns: [
          {
            id: 'code',
            header: 'Code',
          },
          {
            id: 'activite',
            header: 'Activité',
          },
          {
            id: 'ordre',
            header: '#',
          },
          {
            id: 'tache',
            header: 'Intitulé tâche',
          },
          {
            id: 'unite',
            header: 'Unité',
          },
          {
            id: 'quantite',
            header: 'Quantité',
          },
          {
            id: 'prix',
            header:
              `Prix unitaire ${currencyCode ? `(${currencyCode})` : ''}`.trim(),
          },
          {
            id: 'montant',
            header: `Montant ${currencyCode ? `(${currencyCode})` : ''}`.trim(),
          },
        ],
        rowMetas,
        rows: exportRows,
        visibleColumnIds: [
          'code',
          'activite',
          'ordre',
          'tache',
          'unite',
          'quantite',
          'prix',
          'montant',
        ],
      }
    },
  })

  if (isLoading)
    return (
      <div className='flex justify-center py-16'>
        <Loader2 className='animate-spin' />
      </div>
    )

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <Receipt className='h-4 w-4' />

          <CardTitle>Coûts par activité</CardTitle>

          <Badge className='ml-auto'>{couts.length}</Badge>
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
          customRowRenderer={(row, rowIdx, { rowClassName, cellClassName }) => {
            if (row.type === 'cadre') {
              const empty = row.niveau

              return (
                <TableRow className={`${rowClassName} font-bold`} key={rowIdx}>
                  {Array.from({
                    length: empty,
                  }).map((_, x) => (
                    <TableCell className={cellClassName()} key={x} />
                  ))}

                  <TableCell
                    className={cellClassName()}
                    colSpan={columns.length - empty}
                  >
                    {row.label}
                  </TableCell>
                </TableRow>
              )
            }

            const span = row.groupKey ? (groupSpans.get(row.groupKey) ?? 1) : 1

            const first =
              rows.findIndex((r) => r.groupKey === row.groupKey) === rowIdx

            return (
              <TableRow className={rowClassName} key={rowIdx}>
                {first && (
                  <TableCell className={cellClassName(0)} rowSpan={span}>
                    {row.ptba?.code_activite_ptba}
                  </TableCell>
                )}

                {first && (
                  <TableCell className={cellClassName(1)} rowSpan={span}>
                    {row.ptba?.intitule_activite_ptba}
                  </TableCell>
                )}

                <TableCell className={cellClassName(2)}>
                  {row.cout?.ordre}
                </TableCell>
                <TableCell className={cellClassName(3)}>
                  {row.cout?.intitule_tache}
                </TableCell>
                <TableCell className={cellClassName(4)}>
                  {row.cout?.unite_cu}
                </TableCell>
                <TableCell className={cellClassName(5)}>
                  {row.cout && fmt(row.cout.quantite_cu)}
                </TableCell>
                <TableCell className={cellClassName(6)}>
                  {row.cout && fmt(row.cout.prix_unitaire)}
                </TableCell>

                <TableCell className={cellClassName(7)}>
                  {row.cout
                    ? fmt(row.cout.quantite_cu * row.cout.prix_unitaire)
                    : 'Aucun coût'}
                </TableCell>
              </TableRow>
            )
          }}
        />
      </CardContent>
    </Card>
  )
}
