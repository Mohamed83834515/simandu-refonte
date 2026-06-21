import { useCallback, useMemo, useState } from 'react'
import { FolderOpen, Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DIALOG_SIZES } from '@/Global/Forms/dialog'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import useDialogState from '@/hooks/use-dialog-state'
import type { Projet } from '@/simadou/allTypes'
import type { DossierProjet } from '@/simadou/allTypes/dossierProjet'
import {
  useDeleteDossierProjet,
  useGetDossiersProjet,
} from '@/simadou/allHooks/admin/dossierProjetHooks'
import { DossierCard } from './DossierCard'
import DossierFormDialog from './DossierFormDialog'
// ✅ Importer le composant pour afficher les documents d'un dossier
import DossierDocumentsPanel from './DossierDocumentsPanel'

type ProjetDocumentsPanelProps = {
  projet: Projet
}

export default function ProjetDocumentsPanel({ 
  projet 
}: ProjetDocumentsPanelProps) {
  const idProjet = projet.id_projet
  const { data: dossiers = [], isLoading } = useGetDossiersProjet(idProjet)
  const deleteMutation = useDeleteDossierProjet(idProjet)

  const [formOpen, setFormOpen] = useState(false)
  const [selectedDossier, setSelectedDossier] = useState<DossierProjet | null>(null)
  const [deleteOpen, setDeleteOpen] = useDialogState<'delete'>(null)
  const [dossierToDelete, setDossierToDelete] = useState<DossierProjet | null>(null)
  
  // ✅ État pour le dossier ouvert (affichage des documents)
  const [openedDossier, setOpenedDossier] = useState<DossierProjet | null>(null)

  const dossierCountLabel = useMemo(
    () => `${dossiers.length} dossier(s)`,
    [dossiers.length]
  )

  const handleAdd = () => {
    setSelectedDossier(null)
    setFormOpen(true)
  }

  const handleEdit = useCallback((dossier: DossierProjet) => {
    setSelectedDossier(dossier)
    setFormOpen(true)
  }, [])

  const handleDelete = useCallback(
    (dossier: DossierProjet) => {
      setDossierToDelete(dossier)
      setDeleteOpen('delete')
    },
    [setDeleteOpen]
  )

  const handleCloseForm = () => {
    setFormOpen(false)
    setSelectedDossier(null)
  }

  // ✅ Ouvrir un dossier pour voir ses documents
  const handleOpenDossier = useCallback((dossier: DossierProjet) => {
    setOpenedDossier(dossier)
  }, [])

  // ✅ Retour à la liste des dossiers
  const handleBackToDossiers = useCallback(() => {
    setOpenedDossier(null)
  }, [])

  const handleConfirmDelete = (dossier: DossierProjet) => {
    deleteMutation.mutate(dossier.id_dossier, {
      onSuccess: () => {
        setDossierToDelete(null)
        setDeleteOpen(null)
      },
    })
  }

  // ✅ Si un dossier est ouvert, afficher ses documents
  if (openedDossier) {
    return (
      <DossierDocumentsPanel
        projet={projet}
        dossier={openedDossier}
        onBack={handleBackToDossiers}
      />
    )
  }

  // Sinon, afficher la liste des dossiers
  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-sm text-muted-foreground'>
          Organisez les documents du projet par dossier
        </p>
        <Button onClick={handleAdd} className='shadow-sm'>
          <Plus className='h-4 w-4' />
          Créer un dossier
        </Button>
      </div>

      {!isLoading && dossiers.length > 0 && (
        <div className='flex flex-wrap gap-3'>
          <div className='flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'>
            <FolderOpen className='h-3 w-3' />
            <span>{dossierCountLabel}</span>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className='flex justify-center py-16'>
          <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
        </div>
      ) : dossiers.length === 0 ? (
        <div className='flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/60 bg-muted/20 py-16 text-center'>
          <div className='rounded-full bg-primary/10 p-4'>
            <FolderOpen className='h-8 w-8 text-primary/60' />
          </div>
          <div>
            <p className='text-sm font-medium text-foreground'>Aucun dossier</p>
            <p className='text-xs text-muted-foreground'>
              Créez un dossier pour y ajouter des documents
            </p>
          </div>
          <Button variant='outline' size='sm' onClick={handleAdd} className='mt-2'>
            <Plus className='h-3.5 w-3.5' /> Créer un dossier
          </Button>
        </div>
      ) : (
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
          {dossiers.map((dossier) => (
            <DossierCard
              key={dossier.id_dossier}
              dossier={dossier}
              onOpen={handleOpenDossier}  // ✅ On passe bien onOpen
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
          <button
            type='button'
            onClick={handleAdd}
            className='group flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/50 bg-transparent transition-all hover:border-primary/40 hover:bg-primary/5'
          >
            <div className='rounded-full bg-muted/50 p-3 transition-all group-hover:scale-110 group-hover:bg-primary/10'>
              <Plus className='h-6 w-6 text-muted-foreground transition-all group-hover:text-primary' />
            </div>
            <span className='text-xs font-medium text-muted-foreground transition-all group-hover:text-primary'>
              Ajouter
            </span>
          </button>
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={(open) => !open && handleCloseForm()}>
        <DialogContent className={DIALOG_SIZES.md}>
          <DialogHeader>
            <DialogTitle>
              {selectedDossier ? 'Modifier le dossier' : 'Créer un dossier'}
            </DialogTitle>
            <DialogDescription>
              {selectedDossier
                ? 'Modifiez le nom ou la description du dossier.'
                : 'Créez un dossier pour regrouper les documents du projet.'}
            </DialogDescription>
          </DialogHeader>
          <DossierFormDialog
            projet={projet}
            dossier={selectedDossier}
            onClose={handleCloseForm}
            onSuccess={handleCloseForm}
          />
        </DialogContent>
      </Dialog>

      {dossierToDelete && (
        <GenericDeleteDialog<DossierProjet>
          open={deleteOpen === 'delete'}
          onOpenChange={(isOpen) => setDeleteOpen(isOpen ? 'delete' : null)}
          currentRow={dossierToDelete}
          entityName='le dossier'
          getEntityLabel={(row) => row.nom_dossier?.trim() || 'Dossier'}
          onDelete={handleConfirmDelete}
        />
      )}
    </div>
  )
}