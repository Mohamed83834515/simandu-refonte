import { useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { GenericTable } from '@/Global/Generic/Generictable'
import type { CadreLogiqueClcp } from '@/simadou/allTypes/cadreLogiqueClcp'
import type { IndicateurContrat } from '@/simadou/allTypes/indicateurContrat'
import type { NiveauConfigClcp } from '@/simadou/allTypes/niveauConfigClcp'
import type { SuiviContrat } from '@/simadou/allTypes/suiviContrat'
import { resolveRelationId } from '@/simadou/lib/resolveApiRelation'
import { useRapportExportRegistration } from '@/simadou/allfonctionalities/rapport/useRapportExportRegistration'
import {
  getNiveauClcpLabel,
  resolveNiveauClcId,
  sortNiveauxConfigClcp,
} from '@/simadou/lib/cadreLogiqueClcpUtils'
import { resolveClcpId } from '@/simadou/lib/indicateurContratUtils'
import { getUniteSymbole } from '@/simadou/lib/uniteIndicateurUtils'
import { useGetUnitesIndicateur } from '@/simadou/allHooks/admin/uniteIndicateurHooks'
import type { UniteIndicateur } from '@/simadou/allTypes/uniteIndicateur'
import { FileSignature, Loader2 } from 'lucide-react'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TableCell, TableRow } from '@/components/ui/table'
import {
  type RapportExportColumn,
  type RapportExportRowMeta,
} from '../export/rapportExportTypes'

interface Props {
  niveaux: NiveauConfigClcp[]
  cadres: CadreLogiqueClcp[]
  indicateurs: IndicateurContrat[]
  isLoading: boolean
  /** Suivis des indicateurs : ajoute la colonne « Valeur réalisée ». */
  suivis?: SuiviContrat[]
  showValeurRealisee?: boolean
}

type ReportRow = {
  niveauKey: string
  niveauLabel: string
  cadre: CadreLogiqueClcp
  ind?: IndicateurContrat
  groupKey: string
}

function formatCadreLabel(cadre: CadreLogiqueClcp): string {
  return `${cadre.code_clc} : ${cadre.intitule_clc}`
}

/** Index (0–3) du trimestre d'un suivi, quel que soit le format (« T1 », « 1 »…). */
function parseTrimestreIndex(value: unknown): number | null {
  const match = String(value ?? '').match(/([1-4])/)
  return match ? Number(match[1]) - 1 : null
}

/** Date de référence d'un suivi, pour ne garder que le plus récent. */
function suiviTimestamp(suivi: SuiviContrat): number {
  const date = suivi.modifier_le ?? suivi.date_enregistrement
  const time = date ? new Date(date).getTime() : 0
  return Number.isFinite(time) ? time : 0
}

/** Valeur numérique d'une cible / valeur réalisée (« 25 », « 25,5 »…). */
function parseValeurNumerique(value: unknown): number | null {
  if (value == null || value === '') return null
  const parsed = Number(String(value).replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : null
}

/**
 * Somme des valeurs trimestrielles suivie du symbole de l'unité
 * (« 120 », « 25% », « 340 kg »…). Vide si aucun trimestre n'est renseigné.
 */
function formatSommeTrimestres(valeurs: unknown[], symbole: string): string {
  const nombres = valeurs
    .map(parseValeurNumerique)
    .filter((n): n is number => n != null)
  if (nombres.length === 0) return ''

  const somme = Number(nombres.reduce((a, b) => a + b, 0).toFixed(2))
  if (!symbole) return String(somme)
  return symbole === '%' ? `${somme}%` : `${somme} ${symbole}`
}

/** Nom de fichier lisible à partir de l'URL du moyen de vérification. */
function moyenVerificationLabel(value: unknown): string {
  if (typeof value !== 'string' || !value) return ''
  const last = value.split('/').pop() ?? value
  try {
    return decodeURIComponent(last)
  } catch {
    return last
  }
}

export function ContratPerformanceReportTable({
  niveaux,
  cadres,
  indicateurs,
  isLoading,
  suivis,
  showValeurRealisee = false,
}: Props) {
  const { navigate } = useEmbeddedTableState()

  // Unités des indicateurs, pour afficher leur symbole après les sommes.
  const { data: unites = [] } = useGetUnitesIndicateur()

  const unitesById = useMemo(() => {
    const map = new Map<number, UniteIndicateur>()
    for (const unite of unites as UniteIndicateur[]) {
      map.set(unite.id_unite, unite)
    }
    return map
  }, [unites])

  const uniteSymbole = (ind: IndicateurContrat | undefined): string => {
    if (!ind) return ''
    if (typeof ind.unite === 'object' && ind.unite !== null) {
      return getUniteSymbole(ind.unite as UniteIndicateur)
    }
    const id = resolveRelationId(ind.unite, 'id_unite')
    return getUniteSymbole(id != null ? unitesById.get(id) : undefined)
  }

  // Valeur réalisée par indicateur et par trimestre (suivi le plus récent).
  const realiseesByIndicateur = useMemo(() => {
    const map = new Map<number, (SuiviContrat | undefined)[]>()

    for (const suivi of suivis ?? []) {
      const id = resolveRelationId(
        suivi.indicateur_contrat,
        'id_indicateur_contrat'
      )
      const trimestre = parseTrimestreIndex(suivi.trimestre)
      if (id == null || trimestre == null) continue

      const parTrimestre =
        map.get(id) ?? [undefined, undefined, undefined, undefined]
      const existant = parTrimestre[trimestre]

      if (!existant || suiviTimestamp(suivi) >= suiviTimestamp(existant)) {
        parTrimestre[trimestre] = suivi
      }
      map.set(id, parTrimestre)
    }

    return map
  }, [suivis])

  const valeurRealisee = (
    ind: IndicateurContrat | undefined,
    trimestre: number
  ): string => {
    if (!ind) return ''
    const suivi = realiseesByIndicateur.get(ind.id_indicateur_contrat)?.[
      trimestre
    ]
    return suivi?.valeur_realisee != null ? String(suivi.valeur_realisee) : ''
  }

  // Colonnes fusionnées : somme des trimestres + symbole de l'unité.
  const cibleTotale = (ind: IndicateurContrat | undefined): string =>
    ind
      ? formatSommeTrimestres(
          [ind.cible_t1, ind.cible_t2, ind.cible_t3, ind.cible_t4],
          uniteSymbole(ind)
        )
      : ''

  const realiseeTotale = (ind: IndicateurContrat | undefined): string =>
    ind
      ? formatSommeTrimestres(
          [0, 1, 2, 3].map((trimestre) => valeurRealisee(ind, trimestre)),
          uniteSymbole(ind)
        )
      : ''

  const columns: ColumnDef<ReportRow>[] = [
    {
      id: 'chaine_resultats',
      header: 'Chaine des Résultats',
      meta: { mergeSubHeaders: true },
      columns: [
        {
          id: 'niveau',
          header: '',
          accessorFn: (row) => row.niveauLabel,
        },
        {
          id: 'cadre',
          header: '',
          accessorFn: (row) => formatCadreLabel(row.cadre),
        },
      ],
    },
    {
      id: 'indicateur',
      header: 'Indicateurs',
      accessorFn: (row) => row.ind?.intitule_indicateur ?? '',
    },
    {
      id: 'reference',
      header: 'Valeur de référence',
      accessorFn: (row) =>
        row.ind?.valeur_reference != null
          ? String(row.ind.valeur_reference)
          : '',
    },
    {
      id: 'valeur_cible',
      header: 'Valeur Cible',
      accessorFn: (row) => cibleTotale(row.ind),
    },
    ...(showValeurRealisee
      ? [
          {
            id: 'valeur_realisee',
            header: 'Valeur réalisée',
            accessorFn: (row) => realiseeTotale(row.ind),
          } satisfies ColumnDef<ReportRow>,
        ]
      : []),
    {
      id: 'moyen_verification',
      header: 'Moyen de Vérification',
      accessorFn: (row) => moyenVerificationLabel(row.ind?.moyen_verification),
    },
  ]

  // Colonnes à plat pour l'export (les groupes sont portés par headerGroups).
  const exportColumns: RapportExportColumn[] = [
    { id: 'niveau', header: '' },
    // Le code du cadre (avant « : ») est rendu en gras dans les exports.
    { id: 'cadre', header: '', boldPrefixSeparator: ' : ' },
    { id: 'indicateur', header: 'Indicateurs' },
    { id: 'reference', header: 'Valeur de référence' },
    { id: 'valeur_cible', header: 'Valeur Cible' },
    ...(showValeurRealisee
      ? [{ id: 'valeur_realisee', header: 'Valeur réalisée' }]
      : []),
    { id: 'moyen_verification', header: 'Moyen de Vérification' },
  ]

  const indicateursByCadre = useMemo(() => {
    const map = new Map<number, IndicateurContrat[]>()

    for (const cadre of cadres) {
      map.set(cadre.id_clc, [])
    }

    for (const ind of indicateurs) {
      const id = resolveClcpId(ind.clcp)
      if (id != null && map.has(id)) {
        map.get(id)!.push(ind)
      }
    }

    return map
  }, [cadres, indicateurs])

  /**
   * Une ligne par indicateur, groupée par cadre logique puis par niveau
   * (Objectifs, Résultats, Activités…). Un cadre sans indicateur produit
   * une ligne aux colonnes indicateur vides, comme dans le rapport Word.
   */
  const rows = useMemo(() => {
    const result: ReportRow[] = []

    sortNiveauxConfigClcp(niveaux).forEach((niveau) => {
      const niveauKey = String(niveau.id_niveau_ncl)
      const niveauLabel = getNiveauClcpLabel(niveau)

      const cadresDuNiveau = cadres
        .filter(
          (c) => resolveNiveauClcId(c.niveau_clc) === niveau.id_niveau_ncl
        )
        .sort((a, b) =>
          a.code_clc.localeCompare(b.code_clc, 'fr', { numeric: true })
        )

      cadresDuNiveau.forEach((cadre) => {
        const inds = indicateursByCadre.get(cadre.id_clc) ?? []
        const groupKey = String(cadre.id_clc)

        if (inds.length === 0) {
          result.push({ niveauKey, niveauLabel, cadre, groupKey })
        } else {
          inds.forEach((ind) => {
            result.push({ niveauKey, niveauLabel, cadre, ind, groupKey })
          })
        }
      })
    })

    return result
  }, [niveaux, cadres, indicateursByCadre])

  /**
   * =========================
   * SPANS (niveau + cadre)
   * =========================
   */
  const { niveauSpans, niveauFirstIndex, cadreSpans, cadreFirstIndex } =
    useMemo(() => {
      const niveauSpans = new Map<string, number>()
      const niveauFirstIndex = new Map<string, number>()
      const cadreSpans = new Map<string, number>()
      const cadreFirstIndex = new Map<string, number>()

      rows.forEach((r, i) => {
        if (!niveauFirstIndex.has(r.niveauKey))
          niveauFirstIndex.set(r.niveauKey, i)
        niveauSpans.set(r.niveauKey, (niveauSpans.get(r.niveauKey) ?? 0) + 1)

        if (!cadreFirstIndex.has(r.groupKey)) cadreFirstIndex.set(r.groupKey, i)
        cadreSpans.set(r.groupKey, (cadreSpans.get(r.groupKey) ?? 0) + 1)
      })

      return { niveauSpans, niveauFirstIndex, cadreSpans, cadreFirstIndex }
    }, [rows])

  useRapportExportRegistration({
    isLoading,

    buildExportTable: () => {
      const exportRows: string[][] = []
      const rowMetas: RapportExportRowMeta[] = []

      rows.forEach((r) => {
        exportRows.push([
          r.niveauLabel,
          formatCadreLabel(r.cadre),
          r.ind?.intitule_indicateur ?? '',
          r.ind?.valeur_reference != null ? String(r.ind.valeur_reference) : '',
          cibleTotale(r.ind),
          ...(showValeurRealisee ? [realiseeTotale(r.ind)] : []),
          moyenVerificationLabel(r.ind?.moyen_verification),
        ])

        // Fusion verticale indépendante par colonne : le niveau est affiché
        // une seule fois par niveau, le cadre une seule fois par cadre.
        rowMetas.push({
          type: 'data',
          mergeKeys: {
            0: `niveau-${r.niveauKey}`,
            1: `cadre-${r.groupKey}`,
          },
        })
      })

      return {
        columns: exportColumns,
        rowMetas,
        rows: exportRows,
        visibleColumnIds: exportColumns.map((c) => c.id),

        // En-tête fusionné au-dessus des colonnes, comme le rapport Word.
        headerGroups: [
          {
            header: 'Chaine des Résultats',
            columnIds: ['niveau', 'cadre'],
            // Sous-colonnes sans nom : l'en-tête couvre les deux lignes.
            mergeSubHeaders: true,
          },
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
          <FileSignature className='h-4 w-4' />

          <CardTitle>Chaine des résultats du contrat</CardTitle>

          <Badge className='ml-auto'>{indicateurs.length}</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className='overflow-x-auto'>
          <GenericTable<ReportRow>
            data={rows}
            columns={columns}
            search={{}}
            navigate={navigate}
            showPagination={false}
            defaultPageSize={rows.length}
            showSearch={false}
            showViewOptions={false}
            emptyMessage='Aucun cadre logique pour ce contrat'
            customRowRenderer={(row, i, { rowClassName, cellClassName }) => {
              const isFirstNiveau = niveauFirstIndex.get(row.niveauKey) === i
              const isFirstCadre = cadreFirstIndex.get(row.groupKey) === i

              const moyen = row.ind?.moyen_verification
              const moyenLabel = moyenVerificationLabel(moyen)

              return (
                <TableRow className={rowClassName} key={i}>
                  {isFirstNiveau && (
                    <TableCell
                      className={`${cellClassName(0)} align-top font-bold`}
                      rowSpan={niveauSpans.get(row.niveauKey)}
                    >
                      {row.niveauLabel}
                    </TableCell>
                  )}

                  {isFirstCadre && (
                    <TableCell
                      className={cellClassName(1)}
                      rowSpan={cadreSpans.get(row.groupKey)}
                    >
                      <span className='font-bold'>{row.cadre.code_clc}</span>
                      {` : ${row.cadre.intitule_clc}`}
                    </TableCell>
                  )}

                  <TableCell className={cellClassName(2)}>
                    {row.ind?.intitule_indicateur ?? ''}
                  </TableCell>

                  <TableCell className={cellClassName(3)}>
                    {row.ind?.valeur_reference ?? ''}
                  </TableCell>

                  <TableCell className={cellClassName(4)}>
                    {cibleTotale(row.ind)}
                  </TableCell>

                  {showValeurRealisee && (
                    <TableCell className={cellClassName(5)}>
                      {realiseeTotale(row.ind)}
                    </TableCell>
                  )}

                  <TableCell
                    className={cellClassName(showValeurRealisee ? 6 : 5)}
                  >
                    {typeof moyen === 'string' && moyen ? (
                      <a
                        href={moyen}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-primary underline-offset-4 hover:underline'
                      >
                        {moyenLabel}
                      </a>
                    ) : (
                      ''
                    )}
                  </TableCell>
                </TableRow>
              )
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
