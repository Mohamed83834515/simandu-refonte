import { useMemo, useState } from 'react'
import { useGetCadresAnalytique, useGetNiveauxCadreAnalytique } from '@/simadou/allHooks/admin/cadreAnalytiqueHooks'
import { useGetCoutsUnitaires } from '@/simadou/allHooks/admin/coutUnitairePtbaHooks'
import { useGetAllIndicateursTache } from '@/simadou/allHooks/admin/indicateurTacheHooks'
import { useGetPtbas } from '@/simadou/allHooks/admin/ptbaHooks'
import { useGetAllTachesActivite } from '@/simadou/allHooks/admin/suiviPtbaHooks'
import { usePtbaVersionSelection } from '@/simadou/allHooks/admin/versionHooks'
import { useGeneralParamsQuery } from '@/simadou/allHooks/generalParams/queries'
import { PtbaVersionSelect } from '@/simadou/allfonctionalities/ptba/PtbaVersionSelect'
import {
  resolvePtbaActiviteId,
  EMPTY_PTBA_LIST,
} from '@/simadou/allfonctionalities/rapport/rapportTableUtils'
import { ClipboardList } from 'lucide-react'
import { normalizeIndicateurTache } from '@/simadou/lib/indicateurTacheUtils'
import { useActiveProgrammeCode } from '@/hooks/use-active-programme'
import { useNiveauTabsTheme } from '@/components/ui/NiveauTabs'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import RapportPageLayout from '../RapportPageLayout'
import { CoutActiviteReport } from './CoutActiviteReport'
import { IndicateursPtbaReport } from './IndicateursPtbaReport'
import { TachesPtbaReport } from './TachesPtbaReport'
import { type RapportPtbaData } from './types'

export default function RapportPtbaPage() {
  const codeProgramme = useActiveProgrammeCode()
  const { selectedVersionId, handleChangeVersion, versionOptions } =
    usePtbaVersionSelection(codeProgramme)

  const [activeTab, setActiveTab] = useState('taches')
  const { tabsStyle } = useNiveauTabsTheme()

  const { data: ptbasRaw = EMPTY_PTBA_LIST, isLoading: ptbasLoading } =
    useGetPtbas(Number(selectedVersionId))
  const { data: allTaches = [], isLoading: tachesLoading } =
    useGetAllTachesActivite()
  const { data: allIndicateurs = [], isLoading: indicateursLoading } =
    useGetAllIndicateursTache()
  const { data: allCouts = [], isLoading: coutsLoading } =
    useGetCoutsUnitaires()
  const { data: niveaux = [], isLoading: niveauxCaLoading } =
    useGetNiveauxCadreAnalytique()
  const { data: cadresAnalaytiques = [], isLoading: caLoading } =
    useGetCadresAnalytique()
  const { data: config } = useGeneralParamsQuery()
  const currencyCode = config?.currencyCode

  // Le endpoint `/versions-ptbas/{id}/ptbas-programmes/` renvoie déjà les
  // activités de la version sélectionnée : aucun re-filtrage côté client.
  const ptbas = ptbasRaw

  // ✅ Récupérer les IDs des activités
  const activiteIds = useMemo(
    () =>
      ptbas
        .map((ptba) => resolvePtbaActiviteId(ptba))
        .filter((id): id is number => id != null),
    [ptbas]
  )

  // ✅ Filtrer les tâches par activité
  const taches = useMemo(() => {
    const activiteIdSet = new Set(activiteIds)
    return allTaches.filter((tache) => {
      const id =
        typeof tache.id_activite === 'number'
          ? tache.id_activite
          : tache.id_activite?.id_ptba
      return id != null && activiteIdSet.has(id)
    })
  }, [allTaches, activiteIds])

  // ✅ Filtrer les indicateurs par activité.
  // L'API renvoie `id_activite` et `unite_ind_tache` comme objets imbriqués :
  // on normalise pour obtenir des ids numériques avant le filtrage.
  const indicateurs = useMemo(() => {
    const activiteIdSet = new Set(activiteIds)
    return allIndicateurs
      .map(normalizeIndicateurTache)
      .filter((indicateur) => activiteIdSet.has(indicateur.id_activite))
  }, [allIndicateurs, activiteIds])

  // ✅ Filtrer les coûts par activité
  const couts = useMemo(() => {
    const activiteIdSet = new Set(activiteIds)
    return allCouts.filter((cout) => {
      const id =
        typeof cout.ptba_activite === 'number'
          ? cout.ptba_activite
          : cout.ptba_activite?.id_ptba
      return id != null && activiteIdSet.has(id)
    })
  }, [allCouts, activiteIds])

  const isLoading =
    ptbasLoading ||
    tachesLoading ||
    indicateursLoading ||
    coutsLoading ||
    niveauxCaLoading ||
    caLoading

  const rapportData: RapportPtbaData = {
    niveaux,
    cadresAnalaytiques,
    ptbas,
    taches,
    indicateurs,
    couts,
    isLoading,
    selectedVersionId,
    onVersionChange: handleChangeVersion,
    versionOptions,
    currencyCode,
  }

  return (
    <RapportPageLayout title='Rapport des états PTBA' icon={ClipboardList}>
      <div className='space-y-4'>
        {/* ✅ Version Select sur la même ligne que les tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          orientation='vertical'
          className='gap-1 space-y-1'
          style={tabsStyle}
        >
          <div className='flex items-center justify-between gap-4'>
            <TabsList>
              <TabsTrigger value='taches'>Tâches PTBA</TabsTrigger>
              <TabsTrigger value='indicateurs'>Indicateurs</TabsTrigger>
              <TabsTrigger value='couts'>Coût Activité</TabsTrigger>
            </TabsList>

            <PtbaVersionSelect
              options={versionOptions}
              value={selectedVersionId}
              onChange={handleChangeVersion}
            />
          </div>
        </Tabs>

        {/* ✅ Contenu des tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value='taches' className='mt-4'>
            <TachesPtbaReport {...rapportData} />
          </TabsContent>
          <TabsContent value='indicateurs' className='mt-4'>
            <IndicateursPtbaReport {...rapportData} />
          </TabsContent>
          <TabsContent value='couts' className='mt-4'>
            <CoutActiviteReport {...rapportData} />
          </TabsContent>
        </Tabs>
      </div>
    </RapportPageLayout>
  )
}
