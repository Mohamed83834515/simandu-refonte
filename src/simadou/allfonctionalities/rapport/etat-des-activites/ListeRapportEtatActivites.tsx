import { useCallback, useMemo, useRef } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { GenericTable } from '@/Global/Generic/Generictable'
import { useActiveProgrammeCode } from '@/hooks/use-active-programme'
import type { Ptba } from '@/simadou/allTypes'
import { buildRapportEtatActivitesColumns } from '@/simadou/allColonnes/rapport-etat-activites-columns'
import { useObservationsByActiviteIds } from '@/simadou/allHooks/admin/rapportHooks'
import { useGetPtbas } from '@/simadou/allHooks/admin/ptbaHooks'
import { usePtbaVersionSelection } from '@/simadou/allHooks/admin/versionHooks'
import { useSuiviPtbaActivitesProgress } from '@/simadou/allHooks/admin/suiviPtbaHooks'
import { PtbaVersionSelect } from '@/simadou/allfonctionalities/ptba/PtbaVersionSelect'
import {
  EMPTY_PTBA_LIST,
  RAPPORT_PTBA_TABLE_INITIAL_STATE,
  RAPPORT_PTBA_URL_FILTER_CONFIG,
  filterPtbasByVersion,
  resolvePtbaActiviteId,
} from '@/simadou/allfonctionalities/rapport/rapportTableUtils'
import {
  buildRapportEtatActivitesExportRows,
  getRapportEtatActivitesExportColumns,
} from '@/simadou/allfonctionalities/rapport/export/rapportExportRowBuilders'
import {
  mapTableColumnsToExportIds,
  RAPPORT_ETAT_COLUMN_MAP,
} from '@/simadou/allfonctionalities/rapport/export/rapportExportColumnMap'
import { useExportTableContextRef } from '@/simadou/allfonctionalities/rapport/useExportTableContextRef'
import { useRapportExportRegistration } from '@/simadou/allfonctionalities/rapport/useRapportExportRegistration'

const route = getRouteApi('/_authenticated/rapport/etat-des-activites/')

export default function ListeRapportEtatActivites() {
  const codeProgramme = useActiveProgrammeCode()
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const { selectedVersionId, handleChangeVersion, versionOptions } =
    usePtbaVersionSelection(codeProgramme)

  const { exportContextRef, onExportContext } = useExportTableContextRef<Ptba>()

  const { data: ptbas } = useGetPtbas()
  const ptbaList = ptbas ?? EMPTY_PTBA_LIST

  const filteredPtbas = useMemo(
    () => filterPtbasByVersion(ptbaList, selectedVersionId),
    [ptbaList, selectedVersionId]
  )

  const activiteIds = useMemo(
    () =>
      filteredPtbas
        .map((ptba) => resolvePtbaActiviteId(ptba))
        .filter((id): id is number => id != null),
    [filteredPtbas]
  )

  const {
    tachesByActivite,
    suivisByActivite,
    avancementByActivite,
    isLoading: progressLoading,
  } = useSuiviPtbaActivitesProgress(activiteIds)

  const { observationsByActivite, isLoading: isLoadingObservations } =
    useObservationsByActiviteIds(activiteIds)

  const exportHandlersRef = useRef({
    tachesByActivite,
    avancementByActivite,
    suivisByActivite,
    observationsByActivite,
  })
  exportHandlersRef.current = {
    tachesByActivite,
    avancementByActivite,
    suivisByActivite,
    observationsByActivite,
  }

  const buildExportTable = useCallback(
    () => ({
      columns: getRapportEtatActivitesExportColumns(),
      rows: buildRapportEtatActivitesExportRows(
        exportContextRef.current.filteredData,
        exportHandlersRef.current
      ),
      visibleColumnIds: mapTableColumnsToExportIds(
        exportContextRef.current.visibleColumnIds,
        RAPPORT_ETAT_COLUMN_MAP
      ),
    }),
    [exportContextRef]
  )

  useRapportExportRegistration({
    buildExportTable,
    isLoading: progressLoading || isLoadingObservations,
  })

  const columns = useMemo(
    () =>
      buildRapportEtatActivitesColumns({
        tachesByActivite,
        avancementByActivite,
        suivisByActivite,
        observationsByActivite,
        progressLoading,
        isLoadingObservations,
      }),
    [
      tachesByActivite,
      avancementByActivite,
      suivisByActivite,
      observationsByActivite,
      progressLoading,
      isLoadingObservations,
    ]
  )

  return (
    <GenericTable<Ptba>
      data={filteredPtbas}
      columns={columns}
      search={search}
      navigate={navigate}
      searchKey='intitule_activite_ptba'
      searchPlaceholder='Filtrer les activités...'
      urlFilterConfig={RAPPORT_PTBA_URL_FILTER_CONFIG}
      toolbarEndSlot={
        <PtbaVersionSelect
          options={versionOptions}
          value={selectedVersionId}
          onChange={handleChangeVersion}
        />
      }
      showViewOptions={false}
      initialState={RAPPORT_PTBA_TABLE_INITIAL_STATE}
      onExportContext={onExportContext}
    />
  )
}
