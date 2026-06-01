import { useCallback, useMemo, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { GenericTable } from '@/Global/Generic/Generictable'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import type { DictionnaireIndicateur } from '@/simadou/allTypes'
import {
  useDeleteDictionnaireIndicateur,
  useGetDictionnaireIndicateurs,
} from '@/simadou/allHooks/admin/dictionnaireIndicateurHooks'
import { buildDictionnaireIndicateurColumns } from '@/simadou/allColonnes/dictionnaire-indicateur-columns'
import DictionnaireIndicateurDetailView from './DictionnaireIndicateurDetailView'
import DictionnaireIndicateurFormPanel from './DictionnaireIndicateurFormPanel'
import DictionnaireIndicateurStats from './DictionnaireIndicateurStats'

const route = getRouteApi('/_authenticated/parametrage/dictionnaire-indicateurs/')

type ModalState = 'edit' | 'view'

export default function ListeDictionnaireIndicateurs() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const { data: dictionnaires = [] } = useGetDictionnaireIndicateurs()
  const deleteMutation = useDeleteDictionnaireIndicateur()

  const [modal, setModal] = useState<ModalState | null>(null)
  const [currentRow, setCurrentRow] = useState<DictionnaireIndicateur | null>(
    null
  )

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [rowToDelete, setRowToDelete] = useState<DictionnaireIndicateur | null>(
    null
  )

  const closeModal = useCallback(() => {
    setModal(null)
    setTimeout(() => setCurrentRow(null), 300)
  }, [])

  const handleView = useCallback((row: DictionnaireIndicateur) => {
    setCurrentRow(row)
    setModal('view')
  }, [])

  const handleEdit = useCallback((row: DictionnaireIndicateur) => {
    setCurrentRow(row)
    setModal('edit')
  }, [])

  const handleDeleteRequest = useCallback((row: DictionnaireIndicateur) => {
    setRowToDelete(row)
    setDeleteOpen(true)
  }, [])

  const columns = useMemo(
    () =>
      buildDictionnaireIndicateurColumns({
        onView: handleView,
        onEdit: handleEdit,
        onDeleteRequest: handleDeleteRequest,
      }),
    [handleView, handleEdit, handleDeleteRequest]
  )

  return (
    <>
      <DictionnaireIndicateurStats dictionnaires={dictionnaires} />

      <GenericTable<DictionnaireIndicateur>
        data={dictionnaires}
        columns={columns}
        search={search}
        navigate={navigate}
        searchKey='intitule_ref_ind'
        searchPlaceholder='Rechercher un indicateur…'
        urlFilterConfig={[
          {
            columnId: 'intitule_ref_ind',
            searchKey: 'intitule_ref_ind',
            type: 'string',
          },
          { columnId: 'code_ref_ind', searchKey: 'code_ref_ind', type: 'string' },
        ]}
        emptyMessage='Aucun indicateur.'
      />

      <Dialog open={modal === 'edit'} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent
          className='gap-0 overflow-hidden p-0 sm:max-w-3xl'
          aria-describedby={undefined}
        >
          <DialogHeader className='border-b px-6 py-4'>
            <DialogTitle>Modifier l&apos;indicateur</DialogTitle>
          </DialogHeader>
          <div className='max-h-[min(70vh,36rem)] overflow-y-auto px-6 py-4'>
            {currentRow ? (
              <DictionnaireIndicateurFormPanel
                key={currentRow.id_ref_ind_ref}
                dictionnaire={currentRow}
                onClose={closeModal}
                onSuccess={closeModal}
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={modal === 'view'} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent
          className='gap-0 overflow-hidden p-0 sm:max-w-2xl'
          aria-describedby={undefined}
        >
          <DialogHeader className='border-b px-6 py-4'>
            <DialogTitle>Détail de l&apos;indicateur</DialogTitle>
          </DialogHeader>
          <div className='px-6 py-5'>
            {currentRow ? (
              <DictionnaireIndicateurDetailView
                key={currentRow.id_ref_ind_ref}
                indicateurId={currentRow.id_ref_ind_ref}
                onClose={closeModal}
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      {rowToDelete && (
        <GenericDeleteDialog<DictionnaireIndicateur>
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          currentRow={rowToDelete}
          entityName="l'indicateur"
          getEntityLabel={(row) => row.intitule_ref_ind ?? row.code_ref_ind ?? '—'}
          onDelete={(row) => deleteMutation.mutate(row.id_ref_ind_ref)}
        />
      )}
    </>
  )
}
