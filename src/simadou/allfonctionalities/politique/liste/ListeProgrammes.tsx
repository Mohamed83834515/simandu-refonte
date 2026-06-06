import { useCallback, useMemo, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { GenericTable } from '@/Global/Generic/Generictable'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import type { Programme } from '@/simadou/allTypes/programme'
import {
  useDeleteProgramme,
  useGetProgrammes,
} from '@/simadou/allHooks/admin/programmeHooks'
import { buildProgrammeColumns } from '@/simadou/allColonnes/programme-columns'
import ProgrammeFormPanel from './ProgrammeFormPanel'

const route = getRouteApi('/_authenticated/programme/liste/')

export default function ListeProgrammes() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const { data: programmes = [] } = useGetProgrammes()
  const deleteMutation = useDeleteProgramme()

  const [editOpen, setEditOpen] = useState(false)
  const [currentRow, setCurrentRow] = useState<Programme | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [rowToDelete, setRowToDelete] = useState<Programme | null>(null)

  const closeEditModal = useCallback(() => {
    setEditOpen(false)
    setTimeout(() => setCurrentRow(null), 300)
  }, [])

  const handleEdit = useCallback((row: Programme) => {
    setCurrentRow(row)
    setEditOpen(true)
  }, [])

  const handleDeleteRequest = useCallback((row: Programme) => {
    setRowToDelete(row)
    setDeleteOpen(true)
  }, [])

  const columns = useMemo(
    () =>
      buildProgrammeColumns({
        onEdit: handleEdit,
        onDeleteRequest: handleDeleteRequest,
      }),
    [handleEdit, handleDeleteRequest]
  )

  return (
    <>
      <GenericTable<Programme>
        data={programmes}
        columns={columns}
        search={search}
        navigate={navigate}
        searchKey='nom_programme'
        searchPlaceholder='Rechercher un programme…'
        urlFilterConfig={[
          {
            columnId: 'nom_programme',
            searchKey: 'nom_programme',
            type: 'string',
          },
          {
            columnId: 'code_programme',
            searchKey: 'code_programme',
            type: 'string',
          },
        ]}
        showViewOptions={false}
        emptyMessage='Aucun programme.'
      />

      <Dialog open={editOpen} onOpenChange={(open) => !open && closeEditModal()}>
        <DialogContent
          className='gap-0 overflow-hidden p-0 sm:max-w-3xl'
          aria-describedby={undefined}
        >
          <DialogHeader className='space-y-1 border-b px-6 py-4 text-left'>
            <DialogTitle>Modifier le programme</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations du programme sélectionné.
            </DialogDescription>
          </DialogHeader>
          <div className='px-6 py-4'>
            {currentRow ? (
              <ProgrammeFormPanel
                key={currentRow.id_programme}
                programme={currentRow}
                onClose={closeEditModal}
                onSuccess={closeEditModal}
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      {rowToDelete ? (
        <GenericDeleteDialog<Programme>
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          currentRow={rowToDelete}
          entityName='ce programme'
          getEntityLabel={(row) => row.nom_programme}
          onDelete={(row) =>
            deleteMutation.mutate(row.id_programme, {
              onSuccess: () => {
                toast.success('Programme supprimé avec succès')
                setRowToDelete(null)
              },
              onError: () =>
                toast.error('Erreur lors de la suppression du programme'),
            })
          }
        />
      ) : null}
    </>
  )
}
