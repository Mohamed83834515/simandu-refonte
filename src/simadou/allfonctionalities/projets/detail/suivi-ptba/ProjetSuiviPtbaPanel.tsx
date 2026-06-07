import { useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { GenericTable } from '@/Global/Generic/Generictable'
import { DIALOG_SIZES } from '@/Global/Forms/dialog'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import type { Projet } from '@/simadou/allTypes'
import type { PtbaProjet } from '@/simadou/allTypes/ptbaProjet'
import { buildSuiviPtbaColumns } from '@/simadou/allColonnes/suivi-ptba-columns'
import { useGetPtbasProjet } from '@/simadou/allHooks/admin/ptbaProjetHooks'
import { useSuiviPtbaActivitesProgress } from '@/simadou/allHooks/admin/suiviPtbaHooks'
import ActiviteTabbedDialog from '@/simadou/allfonctionalities/suivi-ptba/ActiviteTabbedDialog'
import ObservationPtbaManager from '@/simadou/allfonctionalities/suivi-ptba/observations/ObservationPtbaManager'
import SuiviAvancementContratManager from '@/simadou/allfonctionalities/suivi-ptba/suivi-avancement-contrat/SuiviAvancementContratManager'
import SuiviIndicateurManager from '@/simadou/allfonctionalities/suivi-ptba/suivi-indicateur/SuiviIndicateurManager'
import SuiviTacheActiviteManager from '@/simadou/allfonctionalities/suivi-ptba/suivi-tache/SuiviTacheActiviteManager'

type ProjetSuiviPtbaPanelProps = {
  projet: Projet
}

export default function ProjetSuiviPtbaPanel({ projet }: ProjetSuiviPtbaPanelProps) {
  const codeProjet = projet.code_projet
  const { search, navigate } = useEmbeddedTableState()
  const { data: ptbas = [] } = useGetPtbasProjet(codeProjet)

  const [suiviActivite, setSuiviActivite] = useState<PtbaProjet | null>(null)
  const [showSuiviModal, setShowSuiviModal] = useState(false)
  const [showObservationModal, setShowObservationModal] = useState(false)
  const [observationActivite, setObservationActivite] =
    useState<PtbaProjet | null>(null)

  const activiteIds = useMemo(
    () =>
      ptbas
        .map((a) => a.id_ptba)
        .filter((id): id is number => Number.isFinite(id)),
    [ptbas]
  )

  const {
    tachesByActivite,
    avancementByActivite,
    isLoading: progressLoading,
  } = useSuiviPtbaActivitesProgress(activiteIds)

  const columns = useMemo(
    () =>
      buildSuiviPtbaColumns({
        onOpenSuivi: (activite) => {
          setSuiviActivite(activite as PtbaProjet)
          setShowSuiviModal(true)
        },
        onOpenObservations: (activite) => {
          setObservationActivite(activite as PtbaProjet)
          setShowObservationModal(true)
        },
        tachesByActivite,
        avancementByActivite,
        progressLoading,
      }),
    [tachesByActivite, avancementByActivite, progressLoading]
  )

  return (
    <div className='space-y-4'>
      <p className='text-sm text-muted-foreground'>
        Suivi d&apos;avancement des activités PTBA rattachées à ce projet.
      </p>

      <GenericTable<PtbaProjet>
        data={ptbas}
        columns={columns}
        search={search}
        navigate={navigate}
        searchKey='intitule_activite_ptba'
        searchPlaceholder='Filtrer les activités…'
        urlFilterConfig={[
          {
            columnId: 'intitule_activite_ptba',
            searchKey: 'intitule_activite_ptba',
            type: 'string',
          },
        ]}
        showViewOptions={false}
        emptyMessage='Aucune activité PTBA à suivre pour ce projet.'
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
                  content: (
                    <SuiviTacheActiviteManager activite={suiviActivite} />
                  ),
                },
                {
                  value: 'indicateurs',
                  label: 'Suivi des indicateurs',
                  content: (
                    <SuiviIndicateurManager activite={suiviActivite} />
                  ),
                },
                {
                  value: 'avancement-contrat',
                  label: "Observation globale sur l'activité",
                  content: (
                    <SuiviAvancementContratManager activite={suiviActivite} />
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
            <ObservationPtbaManager activite={observationActivite} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
