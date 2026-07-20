import { useMemo } from 'react'
import { useGetCadresAnalytique } from '@/simadou/allHooks/admin/cadreAnalytiqueHooks'
import { useGetAllIndicateursTache } from '@/simadou/allHooks/admin/indicateurTacheHooks'
import { useGetPtbas } from '@/simadou/allHooks/admin/ptbaHooks'
import { usePtbaVersionSelection } from '@/simadou/allHooks/admin/versionHooks'
import { PtbaVersionSelect } from '@/simadou/allfonctionalities/ptba/PtbaVersionSelect'
import {
  EMPTY_PTBA_LIST,
  filterPtbasByVersion,
  resolvePtbaActiviteId,
} from '@/simadou/allfonctionalities/rapport/rapportTableUtils'
import { LineChart } from 'lucide-react'
import { useActiveProgrammeCode } from '@/hooks/use-active-programme'
import RapportPageLayout from '../RapportPageLayout'
import { IndicateursTable } from '../ptba/Components/IndicateursTable'

export default function RapportIndicateursPage() {
  const codeProgramme = useActiveProgrammeCode()
  const { selectedVersionId, handleChangeVersion, versionOptions } =
    usePtbaVersionSelection(codeProgramme)

  const { data: ptbasRaw = EMPTY_PTBA_LIST, isLoading: ptbasLoading } =
    useGetPtbas(selectedVersionId ? Number(selectedVersionId) : 0)
  const { data: allIndicateurs = [], isLoading: indicateursLoading } =
    useGetAllIndicateursTache()
  const { data: cadresAnalytiques = [], isLoading: caLoading } =
    useGetCadresAnalytique()

  const ptbas = useMemo(
    () => filterPtbasByVersion(ptbasRaw, selectedVersionId),
    [ptbasRaw, selectedVersionId]
  )

  const activiteIds = useMemo(
    () =>
      ptbas
        .map((ptba) => resolvePtbaActiviteId(ptba))
        .filter((id): id is number => id != null),
    [ptbas]
  )

  const indicateurs = useMemo(() => {
    const activiteIdSet = new Set(activiteIds)
    return allIndicateurs.filter(
      (indicateur) =>
        indicateur.id_activite != null &&
        activiteIdSet.has(indicateur.id_activite)
    )
  }, [allIndicateurs, activiteIds])

  const isLoading = ptbasLoading || indicateursLoading || caLoading

  return (
    <RapportPageLayout title='Rapport des indicateurs' icon={LineChart}>
      <div className='space-y-4'>
        <div className='flex justify-end'>
          <PtbaVersionSelect
            options={versionOptions}
            value={selectedVersionId}
            onChange={handleChangeVersion}
          />
        </div>

        <IndicateursTable
          cadresAnalytiques={cadresAnalytiques}
          ptbas={ptbas}
          indicateurs={indicateurs}
          isLoading={isLoading}
          showValeurRealisee
        />
      </div>
    </RapportPageLayout>
  )
}
