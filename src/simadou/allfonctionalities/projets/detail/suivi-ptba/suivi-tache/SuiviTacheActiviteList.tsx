import { useMemo } from 'react'
import { GenericTable } from '@/Global/Generic/Generictable'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import type { TacheActivitePtba } from '@/simadou/allTypes'
import type { SuiviTacheActivite } from '@/simadou/allTypes/suiviTacheActivite'
import {
  buildSuiviTacheColumns,
  type SuiviTacheTableRow,
} from '@/simadou/allColonnes/suivi-tache-columns'

type SuiviTacheActiviteListProps = {
  taches: TacheActivitePtba[]
  suivis: SuiviTacheActivite[]
  onSuivre: (tache: TacheActivitePtba, suivi?: SuiviTacheActivite) => void
}

export default function SuiviTacheActiviteProjetList({
  taches,
  suivis,
  onSuivre,
}: SuiviTacheActiviteListProps) {
  const { search, navigate } = useEmbeddedTableState()

  const columns = useMemo(
    () => buildSuiviTacheColumns({ onSuivre, suivis }),
    [onSuivre, suivis]
  )

  return (
    <GenericTable<SuiviTacheTableRow>
      data={taches}
      columns={columns}
      search={search}
      navigate={navigate}
      searchKey='intutile_tache_gt'
      searchPlaceholder='Filtrer les tâches...'
      urlFilterConfig={[
        {
          columnId: 'intutile_tache_gt',
          searchKey: 'intutile_tache_gt',
          type: 'string',
        },
      ]}
      defaultPageSize={10}
      showViewOptions={false}
      emptyMessage='Aucune tâche pour cette activité. Créez des tâches depuis la planification PTBA.'
    />
  )
}
