import { useMemo } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import { GenericTable } from '@/Global/Generic/Generictable'
import { useActiveProgrammeCode } from '@/hooks/use-active-programme'
import { TableCell, TableRow } from '@/components/ui/table'
import type { CadreAnalytique, Ptba } from '@/simadou/allTypes'
import { RapportMontantCell } from '@/simadou/allColonnes/RapportMontantCell'
import {
  computeTauxDecaissement,
  formatRapportTaux,
} from '@/simadou/allColonnes/rapport-format-utils'
import { useGetCadresAnalytique } from '@/simadou/allHooks/admin/cadreAnalytiqueHooks'
import { useGetPtbas } from '@/simadou/allHooks/admin/ptbaHooks'
import { usePtbaVersionSelection } from '@/simadou/allHooks/admin/versionHooks'
import { useGeneralParamsQuery } from '@/simadou/allHooks/generalParams/queries'
import { PtbaVersionSelect } from '@/simadou/allfonctionalities/ptba/PtbaVersionSelect'
import {
  ActiviteLabelCell,
  CadreSectionCells,
} from '@/simadou/allfonctionalities/rapport/CadreSectionCells'
import {
  EMPTY_PTBA_LIST,
  buildPlaceholderDecaissementMap,
  formatActiviteLabel,
  formatCadreSectionLabel,
  resolvePtbaActiviteId,
} from '@/simadou/allfonctionalities/rapport/rapportTableUtils'
import {
  buildRapportDecaissementExportRows,
  getRapportDecaissementExportColumns,
} from '@/simadou/allfonctionalities/rapport/export/rapportExportRowBuilders'
import { useRapportExportRegistration } from '@/simadou/allfonctionalities/rapport/useRapportExportRegistration'
import { type RapportExportRowMeta } from '@/simadou/allfonctionalities/rapport/export/rapportExportTypes'

const route = getRouteApi('/_authenticated/rapport/decaissement/')

type TreeRow = {
  type: 'cadre' | 'activite'
  label?: string
  niveau: number
  ptba?: Ptba
  activiteId?: number
}

export default function ListeRapportDecaissement() {
  const codeProgramme = useActiveProgrammeCode()
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const { selectedVersionId, handleChangeVersion, versionOptions } =
    usePtbaVersionSelection(codeProgramme)

  const { data: ptbas } = useGetPtbas(Number(selectedVersionId) || 0)
  const { data: config } = useGeneralParamsQuery()
  const currencyCode = config?.currencyCode
  const filteredPtbas = ptbas ?? EMPTY_PTBA_LIST
  const { data: cadresAnalytiques = [] } = useGetCadresAnalytique()
  
  const decaissementByActivite = useMemo(
    () => buildPlaceholderDecaissementMap(filteredPtbas),
    [filteredPtbas]
  )

  const columns: ColumnDef<TreeRow>[] = [
    {
      id: 'activite',
      header: 'Activité',
      accessorFn: (row) => (row.ptba ? formatActiviteLabel(row.ptba) : ''),
    },
    {
      id: 'montant_activite',
      header: currencyCode
        ? `Montant de l'activité (${currencyCode})`
        : "Montant de l'activité",
      accessorFn: () => '',
    },
    {
      id: 'decaissement',
      header: currencyCode ? `Décaissement (${currencyCode})` : 'Décaissement',
      accessorFn: () => '',
    },
    { id: 'taux_decaissement', header: 'Taux', accessorFn: () => '' },
  ]

  const rows = useMemo(() => {
    const ptbasByCadre = new Map<number, Ptba[]>()

    filteredPtbas.forEach((ptba) => {
      if (typeof ptba.cadre_analytique === 'object' && ptba.cadre_analytique) {
        const id = ptba.cadre_analytique.id_ca
        if (!ptbasByCadre.has(id)) ptbasByCadre.set(id, [])
        ptbasByCadre.get(id)!.push(ptba)
      }else if (typeof ptba.cadre_analytique === 'number') {
        const id = ptba.cadre_analytique
        if (!ptbasByCadre.has(id)) ptbasByCadre.set(id, [])
        ptbasByCadre.get(id)!.push(ptba)
      }
    })

    const result: TreeRow[] = []

    function children(parentId: number) {
      return cadresAnalytiques.filter((c) => {
        if (typeof c.parent_ca === 'object' && c.parent_ca) {
          return c.parent_ca.id_ca === parentId
        }
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
        label: formatCadreSectionLabel(cadre),
        niveau,
      })

      children(cadre.id_ca).forEach((c) => parcourir(c, niveau + 1))

      const activites = ptbasByCadre.get(cadre.id_ca) ?? []

      activites.forEach((ptba) => {
        result.push({
          type: 'activite',
          niveau,
          ptba,
          activiteId: resolvePtbaActiviteId(ptba),
        })
      })
    }

    cadresAnalytiques
      .filter((c) => c.parent_ca === null)
      .filter(cadreHasPtba)
      .forEach((c) => parcourir(c, 0))

    return result
  }, [cadresAnalytiques, filteredPtbas])

  // ── Rendu des cellules décaissement (par activité) ────────────────────────
  const renderDecaissement = (id: number | undefined) => (
    <RapportMontantCell
      value={id != null ? decaissementByActivite.get(id) : undefined}
    />
  )

  const renderTaux = (ptba: Ptba | undefined, id: number | undefined) => {
    const decaissement = id != null ? decaissementByActivite.get(id) : undefined
    const taux = computeTauxDecaissement(ptba?.cout_total_ptba, decaissement)

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
  }

  useRapportExportRegistration({
    buildExportTable: () => {
      const exportRows: string[][] = []
      const rowMetas: RapportExportRowMeta[] = []

      rows.forEach((r) => {
        if (r.type === 'cadre') {
          exportRows.push([r.label ?? '', '', '', ''])
          rowMetas.push({ type: 'section', niveau: r.niveau, label: r.label })
        } else if (r.ptba) {
          exportRows.push(
            buildRapportDecaissementExportRows([r.ptba], decaissementByActivite)[0]
          )
          rowMetas.push({
            type: 'data',
            // Les activités s'indentent d'un cran sous leur cadre.
            niveau: r.niveau + 1,
            ...(r.activiteId != null
              ? { mergeKeys: { 0: String(r.activiteId) } }
              : {}),
          })
        }
      })

      return {
        columns: getRapportDecaissementExportColumns(currencyCode),
        rows: exportRows,
        rowMetas,
        visibleColumnIds: ['activite', 'montant', 'decaissement', 'taux'],
      }
    },
  })

  return (
    <div className='overflow-x-auto'>
      <GenericTable<TreeRow>
        data={rows}
        columns={columns}
        search={search}
        navigate={navigate}
        showSearch={false}
        showViewOptions={false}
        showPagination={false}
        defaultPageSize={Math.max(rows.length, 1)}
        toolbarEndSlot={
          <PtbaVersionSelect
            options={versionOptions}
            value={selectedVersionId}
            onChange={handleChangeVersion}
          />
        }
        customRowRenderer={(row, i, { rowClassName, cellClassName }) => {
          if (row.type === 'cadre') {
            return (
              <TableRow className={rowClassName} key={i}>
                <CadreSectionCells
                  label={row.label ?? ''}
                  niveau={row.niveau}
                  columnCount={columns.length}
                  cellClassName={cellClassName}
                />
              </TableRow>
            )
          }

          const id = row.activiteId

          return (
            <TableRow className={rowClassName} key={i}>
              <ActiviteLabelCell
                label={row.ptba ? formatActiviteLabel(row.ptba) : ''}
                niveau={row.niveau + 1}
                className={cellClassName(0)}
              />
              <TableCell className={cellClassName(1)}>
                <RapportMontantCell value={row.ptba?.cout_total_ptba} />
              </TableCell>
              <TableCell className={cellClassName(2)}>
                {renderDecaissement(id)}
              </TableCell>
              <TableCell className={cellClassName(3)}>
                {renderTaux(row.ptba, id)}
              </TableCell>
            </TableRow>
          )
        }}
      />
    </div>
  )
}
