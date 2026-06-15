import { useCallback, useMemo, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/others/confirm-dialog'
import { GenericTable } from '@/Global/Generic/Generictable'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import type { Personnel } from '@/simadou/allTypes'
import {
  useDeletePersonnel,
  useDisablePersonnel,
  useEnablePersonnel,
  useGetPersonnels,
} from '@/simadou/allHooks/admin/personnelHooks'
import { buildPersonnelColumns } from '@/simadou/allColonnes/personnel-columns'
import {
  formatPersonnelNom,
  isPersonnelActif,
} from './personnelFormUtils'
import UtilisateurFormPanel from './UtilisateurFormPanel'

const route = getRouteApi('/_authenticated/parametrage/utilisateurs/')

export default function ListeUtilisateurs() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const { data: personnels = [] } = useGetPersonnels()
  const deleteMutation = useDeletePersonnel()
  const enableMutation = useEnablePersonnel()
  const disableMutation = useDisablePersonnel()

  const [editOpen, setEditOpen] = useState(false)
  const [currentRow, setCurrentRow] = useState<Personnel | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [rowToDelete, setRowToDelete] = useState<Personnel | null>(null)

  const [toggleOpen, setToggleOpen] = useState(false)
  const [rowToToggle, setRowToToggle] = useState<Personnel | null>(null)

  const closeEditModal = useCallback(() => {
    setEditOpen(false)
    setTimeout(() => setCurrentRow(null), 300)
  }, [])

  const handleEdit = useCallback((row: Personnel) => {
    setCurrentRow(row)
    setEditOpen(true)
  }, [])

  const handleDeleteRequest = useCallback((row: Personnel) => {
    setRowToDelete(row)
    setDeleteOpen(true)
  }, [])

  const handleToggleRequest = useCallback((row: Personnel) => {
    setRowToToggle(row)
    setToggleOpen(true)
  }, [])

  const handleConfirmToggle = useCallback(() => {
    if (!rowToToggle?.n_personnel) return
    const id = rowToToggle.n_personnel
    const actif = isPersonnelActif(rowToToggle.statut)

    if (actif) {
      disableMutation.mutate(id, {
        onSuccess: () => {
          setToggleOpen(false)
          setRowToToggle(null)
        },
      })
      return
    }

    enableMutation.mutate(id, {
      onSuccess: () => {
        setToggleOpen(false)
        setRowToToggle(null)
      },
    })
  }, [rowToToggle, disableMutation, enableMutation])

  const columns = useMemo(
    () =>
      buildPersonnelColumns({
        onEdit: handleEdit,
        onToggleStatus: handleToggleRequest,
        onDeleteRequest: handleDeleteRequest,
      }),
    [handleEdit, handleToggleRequest, handleDeleteRequest]
  )

  const toggleActif = rowToToggle ? isPersonnelActif(rowToToggle.statut) : false
  const isToggling = enableMutation.isPending || disableMutation.isPending

  return (
    <>
      <GenericTable<Personnel>
        data={personnels}
        columns={columns}
        search={search}
        navigate={navigate}
        searchKey='nom_complet'
        searchPlaceholder='Rechercher un utilisateur…'
        urlFilterConfig={[
          {
            columnId: 'nom_complet',
            searchKey: 'nom_complet',
            type: 'string',
          },
          {
            columnId: 'id_personnel_perso',
            searchKey: 'id_personnel_perso',
            type: 'string',
          },
          {
            columnId: 'email',
            searchKey: 'email',
            type: 'string',
          },
        ]}
        showViewOptions={false}
        emptyMessage='Aucun utilisateur.'
      />

      <Dialog open={editOpen} onOpenChange={(open) => !open && closeEditModal()}>
        <DialogContent
          className='gap-0 overflow-hidden p-0 sm:max-w-3xl'
          aria-describedby={undefined}
        >
          <DialogHeader className='border-b px-6 py-4'>
            <DialogTitle>Modifier l&apos;utilisateur</DialogTitle>
          </DialogHeader>
          <div className='max-h-[min(70vh,36rem)] overflow-y-auto px-6 py-4'>
            {currentRow?.n_personnel ? (
              <UtilisateurFormPanel
                key={currentRow.n_personnel}
                personnel={currentRow}
                onClose={closeEditModal}
                onSuccess={closeEditModal}
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      {rowToDelete?.n_personnel && (
        <GenericDeleteDialog<Personnel>
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          currentRow={rowToDelete}
          entityName="l'utilisateur"
          getEntityLabel={(row) => formatPersonnelNom(row)}
          onDelete={(row) => deleteMutation.mutate(row.n_personnel!)}
        />
      )}

      {rowToToggle && (
        <ConfirmDialog
          open={toggleOpen}
          onOpenChange={setToggleOpen}
          title={toggleActif ? "Désactiver l'utilisateur" : "Activer l'utilisateur"}
          desc={
            <>
              Êtes-vous sûr de vouloir {toggleActif ? 'désactiver' : 'activer'}{' '}
              <span className='font-semibold'>{formatPersonnelNom(rowToToggle)}</span>{' '}
              ?
            </>
          }
          confirmText={toggleActif ? 'Désactiver' : 'Activer'}
          destructive={toggleActif}
          isLoading={isToggling}
          handleConfirm={handleConfirmToggle}
        />
      )}
    </>
  )
}
