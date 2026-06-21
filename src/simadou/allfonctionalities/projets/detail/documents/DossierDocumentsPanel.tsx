import { useCallback, useMemo, useState } from 'react'
import { ArrowLeft, File, Loader2, Plus } from 'lucide-react'
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
import { DataTableToolbarOutlineButton } from '@/components/data-table/toolbar-outline-button'
import useDialogState from '@/hooks/use-dialog-state'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import type { Projet } from '@/simadou/allTypes'
import type { DossierProjet } from '@/simadou/allTypes/dossierProjet'
import type { DocumentProjet } from '@/simadou/allTypes/documentProjet'
import { buildDocumentProjetColumns } from '@/simadou/allColonnes/document-projet-columns'
import {
    useDeleteDocumentProjet,
    useGetDocumentsDossier,
} from '@/simadou/allHooks/admin/documentProjetHooks'
import DocumentFormDialog from './DocumentFormDialog'

type DossierDocumentsPanelProps = {
    projet: Projet
    dossier: DossierProjet
    onBack?: () => void
}

export default function DossierDocumentsPanel({
    projet,
    dossier,
    onBack,
}: DossierDocumentsPanelProps) {
    const idDossier = dossier.id_dossier
    const { search, navigate } = useEmbeddedTableState()

    const { data: documents = [], isLoading } = useGetDocumentsDossier(idDossier)
    const deleteMutation = useDeleteDocumentProjet(idDossier)

    const [formOpen, setFormOpen] = useState(false)
    const [selectedDocument, setSelectedDocument] = useState<DocumentProjet | null>(null)
    const [deleteOpen, setDeleteOpen] = useDialogState<'delete'>(null)
    const [documentToDelete, setDocumentToDelete] = useState<DocumentProjet | null>(null)

    const handleAdd = () => {
        setSelectedDocument(null)
        setFormOpen(true)
    }

    const handleEdit = useCallback((doc: DocumentProjet) => {
        setSelectedDocument(doc)
        setFormOpen(true)
    }, [])

    const handleCloseForm = () => {
        setFormOpen(false)
        setSelectedDocument(null)
    }

    const columns = useMemo(
        () =>
            buildDocumentProjetColumns(setDeleteOpen, setDocumentToDelete, handleEdit),
        [handleEdit, setDeleteOpen]
    )

    const handleConfirmDelete = (doc: DocumentProjet) => {
        deleteMutation.mutate(doc.id_document, {
            onSuccess: () => {
                setDocumentToDelete(null)
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
            {/* En-tête avec retour et compteur */}
            <div className='flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3'>
                {onBack && (
                    <Button
                        variant='ghost'
                        size='sm'
                        onClick={onBack}
                        className='gap-2 shrink-0 hover:bg-background'
                    >
                        <ArrowLeft className='h-4 w-4' />
                        Retour
                    </Button>
                )}

                <div className='flex-1 min-w-0'>
                    <h3 className='truncate text-base font-semibold'>
                        {dossier.nom_dossier}
                    </h3>
                    {dossier.description_dossier?.trim() && (
                        <p className='truncate text-xs text-muted-foreground'>
                            {dossier.description_dossier}
                        </p>
                    )}
                </div>

                <div className='flex items-center gap-2 shrink-0'>
                    <div className='flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'>
                        <File className='h-3.5 w-3.5' />
                        <span>{documents.length}</span>
                    </div>
                    <span className='text-xs text-muted-foreground'>
                        document{documents.length > 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* Tableau des documents */}
            <GenericTable<DocumentProjet>
                data={documents}
                columns={columns}
                search={search}
                navigate={navigate}
                searchKey='description_document'
                searchPlaceholder='Filtrer les documents…'
                urlFilterConfig={[
                    {
                        columnId: 'description_document',
                        searchKey: 'description_document',
                        type: 'string',
                    },
                ]}
                toolbarEndSlot={
                    <DataTableToolbarOutlineButton className='ms-auto' onClick={handleAdd}>
                        <Plus className='h-4 w-4' />
                        Ajouter
                    </DataTableToolbarOutlineButton>
                }
                defaultPageSize={10}
                compactPagination
                showViewOptions={false}
                emptyMessage='Aucun document dans ce dossier.'
            />

            {/* Dialog formulaire */}
            <Dialog open={formOpen} onOpenChange={(open) => !open && handleCloseForm()}>
                <DialogContent className={DIALOG_SIZES.md}>
                    <DialogHeader>
                        <DialogTitle>
                            {selectedDocument ? 'Modifier le document' : 'Ajouter un document'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedDocument
                                ? 'Modifiez la description ou remplacez le fichier.'
                                : 'Téléversez un document dans ce dossier.'}
                        </DialogDescription>
                    </DialogHeader>
                    <DocumentFormDialog
                        projet={projet}
                        dossier={dossier}
                        document={selectedDocument}
                        onClose={handleCloseForm}
                        onSuccess={handleCloseForm}
                    />
                </DialogContent>
            </Dialog>

            {/* Dialog suppression */}
            {documentToDelete && (
                <GenericDeleteDialog<DocumentProjet>
                    open={deleteOpen === 'delete'}
                    onOpenChange={(isOpen) => setDeleteOpen(isOpen ? 'delete' : null)}
                    currentRow={documentToDelete}
                    entityName='le document'
                    getEntityLabel={(row) =>
                        row.description_document?.trim() || 'Document'
                    }
                    onDelete={handleConfirmDelete}
                />
            )}
        </div>
    )
}