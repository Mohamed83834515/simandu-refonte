import { useMemo } from 'react'
import { GenericTable } from '@/Global/Generic/Generictable'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import type { IndicateurTache } from '@/simadou/allTypes/indicateurTache'
import type { SuiviIndicateurActivite } from '@/simadou/allTypes/suiviIndicateurActivite'
import {
  buildSuiviIndicateurColumns,
  type SuiviIndicateurTableRow,
} from '@/simadou/allColonnes/suivi-indicateur-columns'

type SuiviIndicateurActiviteTableProps = {
  indicateurs: IndicateurTache[]
  suivis: SuiviIndicateurActivite[]
  onSuivre: (indicateur: IndicateurTache) => void
}

function resolveSuiviIndicateurCode(suivi: SuiviIndicateurActivite): string | null {
  if (typeof suivi.indicateur_activite === 'string') {
    return suivi.indicateur_activite
  }
  if (
    typeof suivi.indicateur_activite === 'object' &&
    suivi.indicateur_activite
  ) {
    const obj = suivi.indicateur_activite as Record<string, unknown>
    if (typeof obj.code_indicateur_activite === 'string') {
      return obj.code_indicateur_activite
    }
    if (typeof obj.code_indicateur_ptba === 'string') {
      return obj.code_indicateur_ptba
    }
  }
  return null
}

function groupSuivisByIndicateur(suivis: SuiviIndicateurActivite[]) {
  const map = new Map<string, SuiviIndicateurActivite[]>()
  for (const suivi of suivis) {
    const code = resolveSuiviIndicateurCode(suivi)
    if (!code) continue
    const list = map.get(code) ?? []
    list.push(suivi)
    map.set(code, list)
  }
  return map
}

export default function SuiviIndicateurActiviteTable({
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
    () => buildSuiviIndicateurColumns({ onSuivre, suivisByIndicateur }),
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
      emptyMessage='Aucun indicateur pour cette activité. Créez des indicateurs depuis la planification PTBA.'
    />
  )
}
