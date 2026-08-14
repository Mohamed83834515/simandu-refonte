import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { DataTableToolbarOutlineButton } from '@/components/data-table/toolbar-outline-button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs } from '@/components/ui/tabs'
import {
  NiveauTabTrigger,
  NiveauTabsList,
  useNiveauTabsTheme,
} from '@/components/ui/NiveauTabs'
import { GenericTable } from '@/Global/Generic/Generictable'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import useDialogState from '@/hooks/use-dialog-state'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import type { Projet } from '@/simadou/allTypes'
import type { IndicateurCmrProjet } from '@/simadou/allTypes/indicateurCmrProjet'
import { buildIndicateurCmrColumns } from '@/simadou/allColonnes/indicateur-cmr-columns'
import {
  useDeleteIndicateurCmrProjet,
  useGetIndicateursCmrProjet,
} from '@/simadou/allHooks/admin/indicateurCmrHooks'
import {
  useGetCadresResultat,
  useGetNiveauxCadreResultat,
} from '@/simadou/allHooks/admin/cadreResultatHooks'
import { useGetIndicateursCadreResultat } from '@/simadou/allHooks/admin/indicateurCadreResultatHooks'
import { sortNiveauxCadreResultat } from '@/simadou/lib/cadreResultatUtils'
import CiblesCmrIndicateurDialog from './CiblesCmrIndicateurDialog'
import IndicateurCmrProjetDetailView from './IndicateurCmrProjetDetailView'
import IndicateurCmrProjetFormPanel from './IndicateurCmrProjetFormPanel'
import {
  countIndicateursCmrProjetByNiveau,
  filterCadresResultatByNiveau,
  filterIndicateursCmrProjetByNiveau,
} from './indicateurCmrProjetFormUtils'

type ModalState = 'indicateur' | 'indicateurView'

export default function ProjetIndicateursCmrPanel({ projet }: { projet: Projet }) {
  const codeProjet = projet.code_projet
  const { data: niveaux = [], isLoading: isLoadingNiveaux } =
    useGetNiveauxCadreResultat(projet.id_projet)
  const { data: cadresResultat = [] } = useGetCadresResultat(codeProjet)
  const { data: indicateursCadreResultat = [] } = useGetIndicateursCadreResultat()
  const { data: indicateurs = [], dataUpdatedAt: indicateursUpdatedAt } =
    useGetIndicateursCmrProjet(codeProjet, projet.id_projet)
  const deleteIndMutation = useDeleteIndicateurCmrProjet()
  const { search, navigate } = useEmbeddedTableState()

  const sortedNiveaux = useMemo(
    () => sortNiveauxCadreResultat(niveaux),
    [niveaux]
  )

  const hasNiveaux = sortedNiveaux.length > 0
  const { tabsStyle } = useNiveauTabsTheme()

  const [activeNiveauId, setActiveNiveauId] = useState('')
  const [modal, setModal] = useState<ModalState | null>(null)
  const [ciblesOpen, setCiblesOpen] = useState(false)
  const [indicateurForCibles, setIndicateurForCibles] =
    useState<IndicateurCmrProjet | null>(null)
  const [selectedIndicateurId, setSelectedIndicateurId] = useState<number | null>(
    null
  )
  const [selectedIndicateur, setSelectedIndicateur] =
    useState<IndicateurCmrProjet | null>(null)

  const [indDeleteOpen, setIndDeleteOpen] = useDialogState<'delete'>(null)
  const [indToDelete, setIndToDelete] = useState<IndicateurCmrProjet | null>(null)

  useEffect(() => {
    if (sortedNiveaux.length > 0 && activeNiveauId === '') {
      setActiveNiveauId(String(sortedNiveaux[0].id_ncr))
    }
  }, [sortedNiveaux, activeNiveauId])

  const currentNiveauId = Number(
    activeNiveauId || sortedNiveaux[0]?.id_ncr || 0
  )

  const currentNiveauLibelle = useMemo(() => {
    const niveau = sortedNiveaux.find((item) => item.id_ncr === currentNiveauId)
    return niveau?.libelle_ncr ?? 'niveau'
  }, [sortedNiveaux, currentNiveauId])

  const indicateurCountByNiveau = useMemo(
    () =>
      countIndicateursCmrProjetByNiveau(
        indicateurs,
        cadresResultat,
        indicateursCadreResultat
      ),
    [indicateurs, cadresResultat, indicateursCadreResultat]
  )

  const filteredIndicateurs = useMemo(
    () =>
      filterIndicateursCmrProjetByNiveau(
        indicateurs,
        currentNiveauId,
        cadresResultat,
        indicateursCadreResultat
      ),
    [indicateurs, currentNiveauId, cadresResultat, indicateursCadreResultat]
  )

  const closeAll = () => {
    setModal(null)
    setSelectedIndicateur(null)
    setSelectedIndicateurId(null)
  }

  const handleViewIndicateur = useCallback((ind: IndicateurCmrProjet) => {
    setSelectedIndicateurId(ind.id_ref_ind_cmr)
    setModal('indicateurView')
  }, [])

  const handleEditIndicateur = useCallback((ind: IndicateurCmrProjet) => {
    setSelectedIndicateur(ind)
    setModal('indicateur')
  }, [])

  const handleDeleteIndicateurRequest = useCallback(
    (ind: IndicateurCmrProjet) => {
      setIndToDelete(ind)
      setIndDeleteOpen('delete')
    },
    [setIndDeleteOpen]
  )

  const handleOpenCibles = useCallback((ind: IndicateurCmrProjet) => {
    setIndicateurForCibles(ind)
    setCiblesOpen(true)
  }, [])

  const handleCloseCibles = useCallback((open: boolean) => {
    setCiblesOpen(open)
    if (!open) setIndicateurForCibles(null)
  }, [])

  const indicateurColumns = useMemo(
    () =>
      buildIndicateurCmrColumns<IndicateurCmrProjet>({
        onView: handleViewIndicateur,
        onEdit: handleEditIndicateur,
        onDeleteRequest: handleDeleteIndicateurRequest,
        onOpenCibles: handleOpenCibles,
        hideReferentielColumn: true,
      }),
    [
      handleViewIndicateur,
      handleEditIndicateur,
      handleDeleteIndicateurRequest,
      handleOpenCibles,
    ]
  )

  const handleConfirmDeleteIndicateur = (ind: IndicateurCmrProjet) => {
    deleteIndMutation.mutate(ind.id_ref_ind_cmr, {
      onSuccess: () => {
        toast.success('Indicateur supprimé')
        setIndToDelete(null)
        setIndDeleteOpen(null)
      },
      onError: () => toast.error('Erreur lors de la suppression'),
    })
  }

  const handleAddForm = () => {
    if (!hasNiveaux) {
      toast.info('Configurez d’abord les niveaux du cadre de résultats.')
      return
    }

    const cadresAtNiveau = filterCadresResultatByNiveau(
      cadresResultat,
      currentNiveauId
    )

    if (cadresAtNiveau.length === 0) {
      toast.info(
        `Aucun cadre de résultat au niveau « ${currentNiveauLibelle} ». Créez-en un d'abord.`
      )
      return
    }

    setSelectedIndicateur(null)
    setModal('indicateur')
  }

  if (isLoadingNiveaux) {
    return (
      <div className='py-12 text-center text-sm text-muted-foreground'>
        Chargement…
      </div>
    )
  }

  if (!hasNiveaux) {
    return (
      <Card className='border-dashed p-6 text-center'>
        <p className='text-sm text-muted-foreground'>
          Configurez les niveaux du cadre de résultats avant d&apos;ajouter des
          indicateurs CMR projet.
        </p>
      </Card>
    )
  }

  return (
    <>
      <div className='space-y-4'>
        <Tabs
          value={String(currentNiveauId)}
          onValueChange={setActiveNiveauId}
          style={tabsStyle}
        >
          <div className='overflow-x-auto'>
            <NiveauTabsList>
              {sortedNiveaux.map((niveau) => (
                <NiveauTabTrigger
                  key={niveau.id_ncr}
                  value={String(niveau.id_ncr)}
                  count={indicateurCountByNiveau[niveau.id_ncr] ?? 0}
                >
                  {niveau.libelle_ncr}
                </NiveauTabTrigger>
              ))}
            </NiveauTabsList>
          </div>
        </Tabs>

        <GenericTable<IndicateurCmrProjet>
          key={`indicateurs-cmr-projet-${codeProjet}-${currentNiveauId}-${indicateursUpdatedAt}-${filteredIndicateurs.length}`}
          data={filteredIndicateurs}
          columns={indicateurColumns}
          search={search}
          navigate={navigate}
          searchKey='intitule_ref_ind'
          searchPlaceholder='Filtrer les indicateurs CMR…'
          urlFilterConfig={[
            {
              columnId: 'intitule_ref_ind',
              searchKey: 'intitule_ref_ind',
              type: 'string',
            },
            {
              columnId: 'code_ref_ind',
              searchKey: 'code_ref_ind',
              type: 'string',
            },
          ]}
          defaultPageSize={10}
          showViewOptions={false}
          toolbarEndSlot={
            <DataTableToolbarOutlineButton onClick={handleAddForm}>
              Nouvel indicateur
            </DataTableToolbarOutlineButton>
          }
          emptyMessage='Aucun indicateur CMR pour ce niveau'
        />
      </div>

      {indToDelete && (
        <GenericDeleteDialog<IndicateurCmrProjet>
          open={indDeleteOpen === 'delete'}
          onOpenChange={(isOpen) => setIndDeleteOpen(isOpen ? 'delete' : null)}
          currentRow={indToDelete}
          entityName="l'indicateur CMR"
          getEntityLabel={(row) => row.intitule_ref_ind}
          onDelete={handleConfirmDeleteIndicateur}
        />
      )}

      <CiblesCmrIndicateurDialog
        open={ciblesOpen}
        onOpenChange={handleCloseCibles}
        indicateur={indicateurForCibles}
        codeProjet={codeProjet}
        projet={projet}
      />

      <Dialog open={modal === 'indicateur'} onOpenChange={(o) => !o && closeAll()}>
        <DialogContent
          className='gap-0 overflow-hidden p-0 sm:max-w-3xl'
          aria-describedby={undefined}
        >
          <DialogHeader className='border-b px-6 py-4'>
            <DialogTitle>
              {selectedIndicateur
                ? "Modifier l'indicateur CMR"
                : 'Créer un indicateur CMR'}
            </DialogTitle>
            <DialogDescription className='px-6 pb-0'>
              Niveau cadre résultat : {currentNiveauLibelle}
            </DialogDescription>
          </DialogHeader>
          <div className='px-6 py-4'>
            <IndicateurCmrProjetFormPanel
              key={
                selectedIndicateur?.id_ref_ind_cmr ?? `new-${currentNiveauId}`
              }
              indicateur={selectedIndicateur}
              codeProjet={codeProjet}
              niveauId={currentNiveauId}
              niveauLibelle={currentNiveauLibelle}
              cadresResultat={cadresResultat}
              indicateursCadreResultat={indicateursCadreResultat}
              onClose={closeAll}
              onSuccess={closeAll}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={modal === 'indicateurView'} onOpenChange={(o) => !o && closeAll()}>
        <DialogContent
          className='gap-0 overflow-hidden p-0 sm:max-w-2xl'
          aria-describedby={undefined}
        >
          <DialogHeader className='border-b px-6 py-4'>
            <DialogTitle>Indicateur CMR</DialogTitle>
          </DialogHeader>
          <div className='px-6 py-5'>
            {selectedIndicateurId != null ? (
              <IndicateurCmrProjetDetailView
                indicateurId={selectedIndicateurId}
                onClose={closeAll}
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
