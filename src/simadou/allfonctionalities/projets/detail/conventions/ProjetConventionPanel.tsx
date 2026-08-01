import { useCallback, useMemo, useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { GenericTable } from '@/Global/Generic/Generictable'
import { DIALOG_SIZES } from '@/Global/Forms/dialog'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import useDialogState from '@/hooks/use-dialog-state'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import type { Projet } from '@/simadou/allTypes'
import type { Convention } from '@/simadou/allTypes/convention'
import { buildConventionProjetColumns } from '@/simadou/allColonnes/convention-projet-columns'
import {
  useDeleteConventionProjet,
  useGetConventionsByProjet,
} from '@/simadou/allHooks/admin/conventionHooks'
import ConventionProjetFormDialog from './ConventionProjetFormDialog'
import ConventionTabbedDialog from './ConventionTabbedDialog'
import SuiviDecaissementConventionManager from './suivi-decaissement/SuiviDecaissementConventionManager'
import SuiviAvancementConventionManager from './suivi-avancement/SuiviAvancementConventionManager'

type ProjetConventionPanelProps = {
  projet: Projet
}

export default function ProjetConventionPanel({
  projet,
}: ProjetConventionPanelProps) {
  const idProjet = projet.id_projet
  const { search, navigate } = useEmbeddedTableState()
  const { data: conventions = [], isLoading } =
    useGetConventionsByProjet(idProjet)
  const deleteMutation = useDeleteConventionProjet(idProjet)

  const [formOpen, setFormOpen] = useState(false)
  const [selectedConvention, setSelectedConvention] =
    useState<Convention | null>(null)
  const [deleteOpen, setDeleteOpen] = useDialogState<'delete'>(null)
  const [conventionToDelete, setConventionToDelete] =
    useState<Convention | null>(null)
  const [suiviConvention, setSuiviConvention] = useState<Convention | null>(null)
  const [showSuiviModal, setShowSuiviModal] = useState(false)

  const handleAdd = () => {
    setSelectedConvention(null)
    setFormOpen(true)
  }

  const handleEdit = useCallback((row: Convention) => {
    setSelectedConvention(row)
    setFormOpen(true)
  }, [])

  const handleDeleteRequest = useCallback(
    (row: Convention) => {
      setConventionToDelete(row)
      setDeleteOpen('delete')
    },
    [setDeleteOpen]
  )

  const onOpenSuivi = useCallback((convention: Convention) => {
    setSuiviConvention(convention)
    setShowSuiviModal(true)
  }, [])

  const handleCloseForm = () => {
    setFormOpen(false)
    setSelectedConvention(null)
  }

  const columns = useMemo(
    () =>
      buildConventionProjetColumns({
        onEdit: handleEdit,
        onDeleteRequest: handleDeleteRequest,
        onOpenSuivi,
      }),
    [handleEdit, handleDeleteRequest, onOpenSuivi]
  )

  const handleConfirmDelete = (row: Convention) => {
    if (!row.id_convention) return
    deleteMutation.mutate(row.id_convention, {
      onSuccess: () => {
        setConventionToDelete(null)
        setDeleteOpen(null)
      },
    })
  }

  if (isLoading) {
    return (
      <div className='flex justify-center py-16'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-sm text-muted-foreground'>
          Conventions rattachées au projet.
        </p>
        <Button type='button' onClick={handleAdd}>
          <Plus className='h-4 w-4' />
          Ajouter
        </Button>
      </div>

      <GenericTable<Convention>
        data={conventions}
        columns={columns}
        search={search}
        navigate={navigate}
        searchKey='intutile_conv'
        searchPlaceholder='Filtrer les conventions…'
        urlFilterConfig={[
          {
            columnId: 'code_convention',
            searchKey: 'code_convention',
            type: 'string',
          },
          {
            columnId: 'intutile_conv',
            searchKey: 'intutile_conv',
            type: 'string',
          },
        ]}
        showViewOptions={false}
        defaultPageSize={10}
        compactPagination
        emptyMessage='Aucune convention pour ce projet.'
      />

      <Dialog open={formOpen} onOpenChange={(open) => !open && handleCloseForm()}>
        <DialogContent className={DIALOG_SIZES.lg}>
          <DialogHeader>
            <DialogTitle>
              {selectedConvention
                ? 'Modifier la convention'
                : 'Ajouter une convention'}
            </DialogTitle>
            <DialogDescription>
              {selectedConvention
                ? `Modification de « ${selectedConvention.code_convention} »`
                : 'Renseignez les informations de la nouvelle convention'}
            </DialogDescription>
          </DialogHeader>
          <ConventionProjetFormDialog
            projet={projet}
            convention={selectedConvention}
            onClose={handleCloseForm}
            onSuccess={handleCloseForm}
          />
        </DialogContent>
      </Dialog>

      {conventionToDelete && (
        <GenericDeleteDialog<Convention>
          open={deleteOpen === 'delete'}
          onOpenChange={(isOpen) => setDeleteOpen(isOpen ? 'delete' : null)}
          currentRow={conventionToDelete}
          entityName='la convention'
          getEntityLabel={(row) =>
            `${row.code_convention} - ${row.intutile_conv}`
          }
          onDelete={handleConfirmDelete}
        />
      )}

      <ConventionTabbedDialog
        convention={suiviConvention}
        open={showSuiviModal}
        onOpenChange={(isOpen) => {
          setShowSuiviModal(isOpen)
          if (!isOpen) setSuiviConvention(null)
        }}
        defaultTab='decaissement'
        tabs={
          suiviConvention
            ? [
              {
                value: 'decaissement',
                label: 'Suivi décaissement',
                content: (
                  <SuiviDecaissementConventionManager
                    convention={suiviConvention}
                  />
                ),
              },
              {
                value: 'observation',
                label: 'Observation globale',
                content: (
                  <SuiviAvancementConventionManager
                    convention={suiviConvention}
                  />
                ),
              },
            ]
            : []
        }
      />
    </div>
  )
}
