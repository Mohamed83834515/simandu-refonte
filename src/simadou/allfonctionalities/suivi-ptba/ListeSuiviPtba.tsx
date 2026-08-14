import { useEffect, useMemo, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { GenericTable } from '@/Global/Generic/Generictable'
import { DIALOG_SIZES } from '@/Global/Forms/dialog'
import type { Ptba, SuiviAvancementContrat } from '@/simadou/allTypes'
import { buildSuiviPtbaColumns } from '@/simadou/allColonnes/suivi-ptba-columns'
import { useActiveProgrammeCode } from '@/hooks/use-active-programme'
import { useGetPtbas } from '@/simadou/allHooks/admin/ptbaHooks'
import { usePtbaVersionSelection } from '@/simadou/allHooks/admin/versionHooks'
import { PtbaVersionSelect } from '@/simadou/allfonctionalities/ptba/PtbaVersionSelect'
import { useSuiviPtbaActivitesProgress } from '@/simadou/allHooks/admin/suiviPtbaHooks'
import ActiviteTabbedDialog from './ActiviteTabbedDialog'
import ObservationPtbaManager from './observations/ObservationPtbaManager'
import SuiviAvancementContratManager from './suivi-avancement-contrat/SuiviAvancementContratManager'
import SuiviIndicateurManager from './suivi-indicateur/SuiviIndicateurManager'
import SuiviTacheActiviteManager from './suivi-tache/SuiviTacheActiviteManager'
import SuiviDecaissementPtbaManager from './suivi-decaissement/SuiviDecaissementPtbaManager'
import suiviAvancementContratService from '@/simadou/allSercices/suiviAvancementContratService'

const route = getRouteApi('/_authenticated/programmation/suivi-ptba/')

export default function ListeSuiviPtba() {
  const codeProgramme = useActiveProgrammeCode()
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const { selectedVersionId, handleChangeVersion, versionOptions } =
    usePtbaVersionSelection(codeProgramme)
  const [suiviActivite, setSuiviActivite] = useState<Ptba | null>(null)
  const [showSuiviModal, setShowSuiviModal] = useState(false)
  const [showObservationModal, setShowObservationModal] = useState(false)
  const [observationActivite, setObservationActivite] = useState<Ptba | null>(null)

  const { data: ptbas = [] } = useGetPtbas(Number(selectedVersionId))
 
  const filteredPtbas = useMemo(() => {
    if (!selectedVersionId) return ptbas
    return ptbas.filter(
      (ptba: Ptba) => ptba.version_ptba?.toString() === selectedVersionId
    )
  }, [ptbas, selectedVersionId])

  const activiteIds = useMemo(
    () =>
      filteredPtbas
        .map((a) => a.id_ptba)
        .filter((id): id is number => Number.isFinite(id)),
    [filteredPtbas]
  )

  const {
    tachesByActivite,
    avancementByActivite,
    isLoading: progressLoading,
  } = useSuiviPtbaActivitesProgress(activiteIds)

  // Récupérer les observations pour chaque PTBA
  const [observationsByActivite, setObservationsByActivite] = useState<Map<number, SuiviAvancementContrat[]>>(new Map())
  const [isLoadingObservations, setIsLoadingObservations] = useState(true)

  useEffect(() => {
    const fetchAllObservations = async () => {
      setIsLoadingObservations(true)
      const map = new Map<number, SuiviAvancementContrat[]>()
      
      for (const ptba of filteredPtbas) {
        try {
          const observations = await suiviAvancementContratService.getByActivite(ptba.id_ptba)
          map.set(ptba.id_ptba, observations)
        } catch (error) {
          console.error(`Erreur chargement observations pour PTBA ${ptba.id_ptba}`, error)
          map.set(ptba.id_ptba, [])
        }
      }
      
      setObservationsByActivite(map)
      setIsLoadingObservations(false)
    }
    
    if (filteredPtbas.length > 0) {
      fetchAllObservations()
    }
  }, [filteredPtbas])

  const columns = useMemo(
    () =>
      buildSuiviPtbaColumns({
        onOpenSuivi: (activite) => {
          setSuiviActivite(activite)
          setShowSuiviModal(true)
        },
        onOpenObservations: (activite) => {
          setObservationActivite(activite)
          setShowObservationModal(true)
        },
        tachesByActivite,
        avancementByActivite,
        progressLoading,
        observationsByActivite,
        isLoadingObservations,
      }),
    [
      tachesByActivite,
      avancementByActivite,
      progressLoading,
      observationsByActivite,
      isLoadingObservations,
    ]
  )

  return (
    <>
      <GenericTable<Ptba>
        data={filteredPtbas}
        columns={columns}
        search={search}
        navigate={navigate}
        searchKey='intitule_activite_ptba'
        searchPlaceholder='Filtrer les activités...'
        urlFilterConfig={[
          {
            columnId: 'intitule_activite_ptba',
            searchKey: 'intitule_activite_ptba',
            type: 'string',
          },
        ]}
        toolbarEndSlot={
          <PtbaVersionSelect
            options={versionOptions}
            value={selectedVersionId}
            onChange={handleChangeVersion}
          />
        }
        showViewOptions={false}
        initialState={{
          columnVisibility: {
            version_ptba: false,
          },
        }}
      />

      <ActiviteTabbedDialog
        activite={suiviActivite}
        open={showSuiviModal}
        onOpenChange={(open) => {
          setShowSuiviModal(open)
          if (!open) setSuiviActivite(null)
        }}
        defaultTab='taches'
        tabs={
          suiviActivite
            ? [
                {
                  value: 'taches',
                  label: 'Suivi des tâches',
                  content: <SuiviTacheActiviteManager activite={suiviActivite} />,
                },
                {
                  value: 'indicateurs',
                  label: 'Suivi des indicateurs',
                  content: <SuiviIndicateurManager activite={suiviActivite} />,
                },
                {
                  value: 'decaissement',
                  label: 'Suivi décaissement',
                  content: (
                    <SuiviDecaissementPtbaManager
                      key={suiviActivite.id_ptba}
                      activite={suiviActivite}
                    />
                  ),
                },
                {
                  value: 'avancement-contrat',
                  label: "Observation globale sur l'activité",
                  content: (
                    <SuiviAvancementContratManager
                      key={suiviActivite.id_ptba}
                      activite={suiviActivite}
                    />
                  ),
                },
              ]
            : []
        }
      />

      <Dialog
        open={showObservationModal}
        onOpenChange={(open) => {
          setShowObservationModal(open)
          if (!open) setObservationActivite(null)
        }}
      >
        <DialogContent className={DIALOG_SIZES.lg} aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Observations</DialogTitle>
          </DialogHeader>
          {observationActivite && (
            <ObservationPtbaManager
              key={observationActivite.id_ptba}
              activite={observationActivite}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}