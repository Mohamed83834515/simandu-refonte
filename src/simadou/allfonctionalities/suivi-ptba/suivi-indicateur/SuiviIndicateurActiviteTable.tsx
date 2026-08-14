import { useMemo } from 'react'
import { GenericTable } from '@/Global/Generic/Generictable'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import { useGetUnitesIndicateur } from '@/simadou/allHooks/admin/uniteIndicateurHooks'
import type { IndicateurTache } from '@/simadou/allTypes/indicateurTache'
import type { SuiviIndicateurTache } from '@/simadou/allTypes/suiviIndicateurTacheProjet'
import {
  buildSuiviIndicateurColumns,
  type SuiviIndicateurTableRow,
} from '@/simadou/allColonnes/suivi-indicateur-columns'

type SuiviIndicateurActiviteTableProps = {
  indicateurs: IndicateurTache[]
  suivis: SuiviIndicateurTache[]
  onSuivre: (indicateur: IndicateurTache) => void
}

function groupSuivisByIndicateur(
  suivis: SuiviIndicateurTache[]
): Map<string, SuiviIndicateurTache[]> {
  const map = new Map<string, SuiviIndicateurTache[]>()
  for (const suivi of suivis) {
    const id = suivi.indicateur_sit
    if (id == null || !Number.isFinite(id)) continue
    const key = String(id)
    const list = map.get(key) ?? []
    list.push(suivi)
    map.set(key, list)
  }
  return map
}

export default function SuiviIndicateurActiviteTable({
  indicateurs,
  suivis,
  onSuivre,
}: SuiviIndicateurActiviteTableProps) {
  const { search, navigate } = useEmbeddedTableState()
  const { data: unites = [] } = useGetUnitesIndicateur()

  const suivisByIndicateur = useMemo(
    () => groupSuivisByIndicateur(suivis),
    [suivis]
  )

  const columns = useMemo(
    () =>
      buildSuiviIndicateurColumns({
        unites,
        onSuivre,
        suivisByIndicateur,
        resolveIndicateurKey: (indicateur) =>
          String(indicateur.id_indicateur_tache),
      }),
    [onSuivre, suivisByIndicateur, unites]
  )

  return (
    <GenericTable<SuiviIndicateurTableRow>
      data={indicateurs}
      columns={columns}
      search={search}
      navigate={navigate}
      searchKey='intitule_indicateur_tache'
      searchPlaceholder='Filtrer les indicateurs...'
      urlFilterConfig={[
        {
          columnId: 'intitule_indicateur_tache',
          searchKey: 'intitule_indicateur_tache',
          type: 'string',
        },
      ]}
      defaultPageSize={10}
      showViewOptions={false}
      emptyMessage='Aucun indicateur pour cette activité. Créez des indicateurs depuis la planification PTBA.'
    />
  )
}
