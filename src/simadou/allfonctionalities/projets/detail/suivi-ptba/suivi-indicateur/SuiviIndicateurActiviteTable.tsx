import { useMemo } from 'react'
import { GenericTable } from '@/Global/Generic/Generictable'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import type { IndicateurTache } from '@/simadou/allTypes/indicateurTache'
import type { SuiviIndicateurActivite } from '@/simadou/allTypes/suiviIndicateurActivite'
import type { SuiviIndicateurTacheProjet } from '@/simadou/allTypes/suiviIndicateurTacheProjet'
import {
  buildSuiviIndicateurColumns,
  type SuiviIndicateurTableRow,
} from '@/simadou/allColonnes/suivi-indicateur-columns'

type SuiviIndicateurActiviteTableProps = {
  indicateurs: IndicateurTache[]
  suivis: SuiviIndicateurTacheProjet[]
  onSuivre: (indicateur: IndicateurTache) => void
}

function groupSuivisByIndicateur(suivis: SuiviIndicateurTacheProjet[]) {
  const map = new Map<string, SuiviIndicateurActivite[]>()
  for (const suivi of suivis) {
    const id = suivi.indicateur_sit
    if (id == null || !Number.isFinite(id)) continue
    const key = String(id)
    const list = map.get(key) ?? []
    list.push({ id_suivi_indicateur: suivi.id_suivi_sit } as SuiviIndicateurActivite)
    map.set(key, list)
  }
  return map
}

export default function SuiviIndicateurActiviteProjetTable({
  indicateurs,
  suivis,
  onSuivre,
}: SuiviIndicateurActiviteTableProps) {
  const { search, navigate } = useEmbeddedTableState()

  const suivisByIndicateur = useMemo(
    () => groupSuivisByIndicateur(suivis),
    [suivis]
  )

  const columns = useMemo(
    () =>
      buildSuiviIndicateurColumns({
        onSuivre,
        suivisByIndicateur,
        resolveIndicateurKey: (indicateur) =>
          String(indicateur.id_indicateur_tache),
      }),
    [onSuivre, suivisByIndicateur]
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
      emptyMessage='Aucun indicateur pour cette activité.'
    />
  )
}
