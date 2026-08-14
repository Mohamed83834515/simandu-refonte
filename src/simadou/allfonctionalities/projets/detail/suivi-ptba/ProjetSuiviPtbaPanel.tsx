import { useCallback, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { GenericTable } from '@/Global/Generic/Generictable'
import { DIALOG_SIZES } from '@/Global/Forms/dialog'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import type { Projet, Ptba } from '@/simadou/allTypes'
import type { PtbaProjet } from '@/simadou/allTypes/ptbaProjet'
import { useGetPtbasProjetsByVersion } from '@/simadou/allHooks/admin/ptbaProjetHooks'
import { useProjetPtbaVersionSelection } from '@/simadou/allHooks/admin/versionHooks'
import ActiviteTabbedDialog from '@/simadou/allfonctionalities/suivi-ptba/ActiviteTabbedDialog'
import SuiviTacheActiviteProjetManager from './suivi-tache/SuiviTacheActiviteManager'
import SuiviIndicateurProjetManager from './suivi-indicateur/SuiviIndicateurManager'
import SuiviAvancementContratProjetManager from './suivi-avancement-contrat/SuiviAvancementContratManager'
import SuiviDecaissementPtbaProjetManager from './suivi-decaissement/SuiviDecaissementPtbaProjetManager'
import { buildSuiviPtbaProjetColumns } from '@/simadou/allColonnes/suivi-ptba-projet-columns'
import { PtbaVersionSelect } from '@/simadou/allfonctionalities/ptba/PtbaVersionSelect'

type ProjetSuiviPtbaPanelProps = {
  projet: Projet
}

const EMPTY_PTBAS: PtbaProjet[] = []

export default function ProjetSuiviPtbaPanel({
  projet,
}: ProjetSuiviPtbaPanelProps) {
  const codeProjet = projet.code_projet
  const {
    selectedVersionId,
    handleChangeVersion,
    filteredVersionOptions,
    selectedVersionPtbaId,
  } = useProjetPtbaVersionSelection(projet)

  const { search, navigate } = useEmbeddedTableState()
  const [suiviActivite, setSuiviActivite] = useState<PtbaProjet | null>(null)
  const [showSuiviModal, setShowSuiviModal] = useState(false)
  const [showObservationModal, setShowObservationModal] = useState(false)
  const [observationActivite, setObservationActivite] =
    useState<PtbaProjet | null>(null)

  const { data: ptbasByVersion } = useGetPtbasProjetsByVersion(
    selectedVersionPtbaId > 0 ? selectedVersionPtbaId : undefined,
    codeProjet
  )
  const ptbas = ptbasByVersion?.ptbas_projets ?? EMPTY_PTBAS

  const onOpenSuivi = useCallback((activite: Ptba) => {
    setSuiviActivite(activite as PtbaProjet)
    setShowSuiviModal(true)
  }, [])

  const onOpenObservations = useCallback((activite: Ptba) => {
    setObservationActivite(activite as PtbaProjet)
    setShowObservationModal(true)
  }, [])

  const columns = useMemo(
    () =>
      buildSuiviPtbaProjetColumns({
        onOpenSuivi,
        onOpenObservations,
      }),
    [onOpenSuivi, onOpenObservations]
  )

  return (
    <div className='space-y-4'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-sm text-muted-foreground'>
          Suivi d&apos;avancement des activités PTBA rattachées à ce projet.
        </p>
        {filteredVersionOptions.length > 0 ? (
          <PtbaVersionSelect
            options={filteredVersionOptions}
            value={selectedVersionId}
            onChange={handleChangeVersion}
          />
        ) : null}
      </div>

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
                  <SuiviTacheActiviteProjetManager activite={suiviActivite} />
                ),
              },
              {
                value: 'indicateurs',
                label: 'Suivi des indicateurs',
                content: (
                  <SuiviIndicateurProjetManager activite={suiviActivite} />
                ),
              },
              {
                value: 'decaissement',
                label: 'Suivi décaissement',
                content: (
                  <SuiviDecaissementPtbaProjetManager
                    key={suiviActivite.id_ptba}
                    projet={projet}
                    activite={suiviActivite}
                  />
                ),
              },
              {
                value: 'avancement-contrat',
                label: "Observation globale sur l'activité",
                content: (
                  <SuiviAvancementContratProjetManager
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
        <DialogContent
          className={`${DIALOG_SIZES.lg} flex max-h-[90vh] flex-col overflow-hidden`}
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle>Observations</DialogTitle>
          </DialogHeader>
          {observationActivite && (
            <div className='min-h-0 flex-1 overflow-hidden'>
              <SuiviAvancementContratProjetManager
                key={observationActivite.id_ptba}
                activite={observationActivite}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
