import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { GenericTable } from '@/Global/Generic/Generictable'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import { buildIndicateurCmrColumns } from '@/simadou/allColonnes/indicateur-cmr-columns'
import { useGetNiveauxCadreStrategique, useGetCadresStrategique } from '@/simadou/allHooks/admin/cadreStrategiqueHooks'
import {
  useDeleteIndicateurCmr,
  useGetIndicateursCmr,
} from '@/simadou/allHooks/admin/indicateurCmrHooks'
import { useGetIndicateursStrategique } from '@/simadou/allHooks/admin/indicateurStrategiqueHooks'
import type { IndicateurCmr } from '@/simadou/allTypes'
import IndicateurCmrDetailView from '@/simadou/allfonctionalities/projets/detail/cmrIndicators/IndicateurCmrDetailView'
import { toast } from 'sonner'
import {
  useActiveProgramme,
  useActiveProgrammeId,
} from '@/hooks/use-active-programme'
import useDialogState from '@/hooks/use-dialog-state'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import {
  NiveauTabTrigger,
  NiveauTabsList,
  useNiveauTabsTheme,
} from '@/components/ui/NiveauTabs'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs } from '@/components/ui/tabs'
import { DataTableToolbarOutlineButton } from '@/components/data-table/toolbar-outline-button'
import CiblesCmrDialog from './CiblesCmrDialog'
import IndicateurCmrFormPanel from './IndicateurCmrFormPanel'
import { filterCadresStrategiqueByNiveau } from '@/simadou/lib/cadreStrategiqueUtils'
import {
  countIndicateursCmrByNiveau,
  filterIndicateursCmrByNiveau,
} from './indicateurCmrFormUtils'

type ModalState = 'indicateur' | 'indicateurView'

type ListeIndicateursCmrProps = {
  showAddButton?: boolean
  showSuiviAction?: boolean
}

export default function ListeIndicateursCmr({
  showAddButton = true,
  showSuiviAction = false,
}: ListeIndicateursCmrProps = {}) {
  const routerNavigate = useNavigate()
  const activeProgramme = useActiveProgramme()
  const programmeId = useActiveProgrammeId()
  const codeProgramme = activeProgramme?.code_programme

  const { data: niveaux = [], isLoading: isLoadingNiveaux } =
    useGetNiveauxCadreStrategique()
  const { data: cadresStrategiques = [] } = useGetCadresStrategique()
  const { data: indicateurs = [], dataUpdatedAt } = useGetIndicateursCmr()
  const { data: indicateursStrategiques = [] } = useGetIndicateursStrategique()
  const deleteMutation = useDeleteIndicateurCmr()
  const { search, navigate } = useEmbeddedTableState()

  const hasNiveaux = niveaux.length > 0
  const { tabsStyle } = useNiveauTabsTheme()

  const [activeNiveauCode, setActiveNiveauCode] = useState('')
  const [modal, setModal] = useState<ModalState | null>(null)
  const [ciblesOpen, setCiblesOpen] = useState(false)
  const [indicateurForCibles, setIndicateurForCibles] =
    useState<IndicateurCmr | null>(null)
  const [selectedIndicateurId, setSelectedIndicateurId] = useState<
    number | null
  >(null)
  const [selectedIndicateur, setSelectedIndicateur] =
    useState<IndicateurCmr | null>(null)

  const [deleteOpen, setDeleteOpen] = useDialogState<'delete'>(null)
  const [rowToDelete, setRowToDelete] = useState<IndicateurCmr | null>(null)

  useEffect(() => {
    if (niveaux.length > 0 && activeNiveauCode === '') {
      setActiveNiveauCode(String(niveaux[0].id_nsc))
    }
  }, [niveaux, activeNiveauCode])

  const currentNiveauCode = Number(
    activeNiveauCode || niveaux[0]?.id_nsc || 0
  )

  const currentNiveau = useMemo(
    () =>
      niveaux.find((x) => Number(x.id_nsc) === currentNiveauCode) ??
      niveaux[0],
    [niveaux, currentNiveauCode]
  )

  const currentNiveauId = Number(currentNiveau?.id_nsc ?? 0)

  const currentNiveauLibelle = currentNiveau?.libelle_nsc ?? 'niveau'

  const closeAll = useCallback(() => {
    setModal(null)
    setSelectedIndicateur(null)
    setSelectedIndicateurId(null)
  }, [])

  const handleView = useCallback((row: IndicateurCmr) => {
    setSelectedIndicateurId(row.id_ref_ind_cmr)
    setModal('indicateurView')
  }, [])

  const handleEdit = useCallback((row: IndicateurCmr) => {
    setSelectedIndicateur(row)
    setModal('indicateur')
  }, [])

  const handleDeleteRequest = useCallback(
    (row: IndicateurCmr) => {
      setRowToDelete(row)
      setDeleteOpen('delete')
    },
    [setDeleteOpen]
  )

  const handleOpenCibles = useCallback((row: IndicateurCmr) => {
    setIndicateurForCibles(row)
    setCiblesOpen(true)
  }, [])

  const handleCloseCibles = useCallback((open: boolean) => {
    setCiblesOpen(open)
    if (!open) setIndicateurForCibles(null)
  }, [])

  const handleSuivi = useCallback(
    (row: IndicateurCmr) => {
      routerNavigate({
        to: '/suivi-resultats/suivi-indicateurs/$id',
        params: { id: String(row.id_ref_ind_cmr) },
      })
    },
    [routerNavigate]
  )

  const cmrCountByNiveau = useMemo(
    () => countIndicateursCmrByNiveau(indicateurs, indicateursStrategiques),
    [indicateurs, indicateursStrategiques]
  )

  const indicateursForNiveau = useMemo(
    () =>
      filterIndicateursCmrByNiveau(
        indicateurs,
        currentNiveauCode,
        indicateursStrategiques
      ),
    [indicateurs, currentNiveauCode, indicateursStrategiques]
  )

  const columns = useMemo(
    () =>
      buildIndicateurCmrColumns({
        onView: showSuiviAction ? undefined : handleView,
        onEdit: showSuiviAction ? undefined : handleEdit,
        onDeleteRequest: showSuiviAction ? undefined : handleDeleteRequest,
        onOpenCibles: showSuiviAction ? undefined : handleOpenCibles,
        onSuivi: showSuiviAction ? handleSuivi : undefined,
      }),
    [
      showSuiviAction,
      handleView,
      handleEdit,
      handleDeleteRequest,
      handleOpenCibles,
      handleSuivi,
    ]
  )

  const handleConfirmDelete = (row: IndicateurCmr) => {
    deleteMutation.mutate(row.id_ref_ind_cmr, {
      onSuccess: () => {
        toast.success('Indicateur CMR supprimé avec succès')
        setRowToDelete(null)
        setDeleteOpen(null)
      },
      onError: () => toast.error('Erreur lors de la suppression'),
    })
  }

  const handleAddForm = () => {
    if (!hasNiveaux) {
      toast.info('Configurez d’abord les niveaux du cadre stratégique.')
      return
    }
    const cadresAtNiveau = filterCadresStrategiqueByNiveau(
      cadresStrategiques,
      currentNiveauId
    )
    if (cadresAtNiveau.length === 0) {
      toast.info(
        `Aucun cadre stratégique au niveau « ${currentNiveauLibelle} ». Créez-en un d’abord.`
      )
      return
    }
    setSelectedIndicateur(null)
    setModal('indicateur')
  }

  if (!programmeId || !codeProgramme) {
    return (
      <Card className='border-dashed p-6 text-center'>
        <p className='text-sm text-muted-foreground'>
          Sélectionnez un programme dans l&apos;en-tête pour gérer les
          indicateurs CMR.
        </p>
      </Card>
    )
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
          Configurez les niveaux du cadre stratégique (menu Gestion des niveaux)
          avant d&apos;ajouter des indicateurs CMR.
        </p>
      </Card>
    )
  }

  return (
    <div className='space-y-4'>
      <Tabs
        value={String(currentNiveauCode)}
        onValueChange={setActiveNiveauCode}
        style={tabsStyle}
      >
        <div className='overflow-x-auto'>
          <NiveauTabsList>
            {niveaux.map((n) => (
              <NiveauTabTrigger
                key={n.id_nsc}
                value={String(n.id_nsc)}
                count={cmrCountByNiveau[Number(n.id_nsc)] ?? 0}
              >
                {n.libelle_nsc}
              </NiveauTabTrigger>
            ))}
          </NiveauTabsList>
        </div>
      </Tabs>

      <GenericTable<IndicateurCmr>
        key={`indicateurs-cmr-politique-${dataUpdatedAt}-${currentNiveauCode}-${indicateursForNiveau.length}`}
        data={indicateursForNiveau}
        columns={columns}
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
          showAddButton ? (
            <DataTableToolbarOutlineButton onClick={handleAddForm}>
              Ajouter un nouvel indicateur
            </DataTableToolbarOutlineButton>
          ) : undefined
        }
        emptyMessage='Aucun indicateur CMR.'
      />

      {rowToDelete ? (
        <GenericDeleteDialog<IndicateurCmr>
          open={deleteOpen === 'delete'}
          onOpenChange={(isOpen) => setDeleteOpen(isOpen ? 'delete' : null)}
          currentRow={rowToDelete}
          entityName="l'indicateur CMR"
          getEntityLabel={(row) => row.intitule_ref_ind}
          onDelete={handleConfirmDelete}
        />
      ) : null}

      <CiblesCmrDialog
        open={ciblesOpen}
        onOpenChange={handleCloseCibles}
        indicateur={indicateurForCibles}
      />

      <Dialog
        open={modal === 'indicateur'}
        onOpenChange={(o) => !o && closeAll()}
      >
        <DialogContent
          className='flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl'
          aria-describedby={undefined}
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <DialogHeader className='shrink-0 border-b px-6 py-4'>
            <DialogTitle>
              {selectedIndicateur
                ? "Modifier l'indicateur CMR"
                : 'Créer un indicateur CMR'}
            </DialogTitle>
            <DialogDescription className='px-6 pb-0'>
              Niveau stratégique : {currentNiveauLibelle}
            </DialogDescription>
          </DialogHeader>
          <div className='min-h-0 flex-1 overflow-y-auto px-6 py-4'>
            {modal === 'indicateur' ? (
              <IndicateurCmrFormPanel
                key={
                  selectedIndicateur?.id_ref_ind_cmr ??
                  `new-${currentNiveauId}`
                }
                indicateur={selectedIndicateur}
                codeProgramme={codeProgramme}
                niveauId={currentNiveauId}
                niveauLibelle={currentNiveauLibelle}
                cadresStrategiques={cadresStrategiques}
                indicateursStrategiques={indicateursStrategiques}
                onClose={closeAll}
                onSuccess={closeAll}
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={modal === 'indicateurView'}
        onOpenChange={(o) => !o && closeAll()}
      >
        <DialogContent
          className='gap-0 overflow-hidden p-0 sm:max-w-2xl'
          aria-describedby={undefined}
        >
          <DialogHeader className='border-b px-6 py-4'>
            <DialogTitle>Détails de l&apos;indicateur CMR</DialogTitle>
          </DialogHeader>
          <div className='px-6 py-5'>
            {selectedIndicateurId != null ? (
              <IndicateurCmrDetailView
                indicateurId={selectedIndicateurId}
                onClose={closeAll}
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
