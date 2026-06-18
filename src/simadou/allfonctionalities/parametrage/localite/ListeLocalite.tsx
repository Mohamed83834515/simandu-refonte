import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Settings } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { NiveauTabTrigger, NiveauTabsList, useNiveauTabsTheme } from '@/components/ui/NiveauTabs'
import { useGetAllLocalites, useDeleteLocalite } from '@/simadou/allHooks/admin/localiteHooks'
import { useGetNiveauxLocalite } from '@/simadou/allHooks/admin/niveauLocaliteHooks'
import AddLocalite from './AddLocalite'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import useDialogState from '@/hooks/use-dialog-state'
import type { Localite } from '@/simadou/allTypes/localite'
import { LocaliteNiveauTable } from './localiteNiveauTableau'
import NiveauLocaliteManager from './niveau/NiveauLocaliteManager'

type ModalState = 'form' | 'niveaux'

export default function ListeLocalite() {
    const { data: niveaux = [], isLoading: isLoadingNiveaux } = useGetNiveauxLocalite()
    const { data: allLocalites = [], dataUpdatedAt } = useGetAllLocalites()
    const deleteMutation = useDeleteLocalite()

    const sortedNiveaux = useMemo(
        () => [...niveaux].sort((a: any, b: any) => a.nombre_nlc - b.nombre_nlc),
        [niveaux]
    )

    const { tabsStyle } = useNiveauTabsTheme()
    const hasNiveaux = sortedNiveaux.length > 0

    const [activeNiveauId, setActiveNiveauId] = useState<string>('')
    const [showModal, setShowModal] = useState<ModalState | null>(null)
    const [selectedLocalite, setSelectedLocalite] = useState<Localite | null>(null)
    const [deleteOpen, setDeleteOpen] = useDialogState<'delete'>(null)
    const [localiteToDelete, setLocaliteToDelete] = useState<Localite | null>(null)

    // Initialiser le premier niveau
    useEffect(() => {
        if (sortedNiveaux.length > 0 && activeNiveauId === '') {
            setActiveNiveauId(String(sortedNiveaux[0].id_nlc))
        }
    }, [sortedNiveaux, activeNiveauId])

    const currentNiveauId = Number(activeNiveauId || sortedNiveaux[0]?.id_nlc || 0)
    const currentNiveau = useMemo(
        () =>
            sortedNiveaux.find(
                (n: any) => n.id_nlc === currentNiveauId
            ),
        [sortedNiveaux, currentNiveauId]
    )
    // Compter les localités par niveau
    const countByNiveau = useMemo(() => {
        const counts = new Map<number, number>()
        for (const loc of allLocalites) {
            const niveauId = typeof loc.niveau_loca === 'object'
                ? loc.niveau_loca?.id_nlc
                : loc.niveau_loca
            if (niveauId == null) continue
            counts.set(niveauId, (counts.get(niveauId) ?? 0) + 1)
        }
        return counts
    }, [allLocalites])

    const handleEdit = useCallback((localite: Localite) => {
        setSelectedLocalite(localite)
        setShowModal('form')
    }, [])

    const handleDeleteRequest = useCallback(
        (localite: Localite) => {
            setLocaliteToDelete(localite)
            setDeleteOpen('delete')
        },
        [setDeleteOpen]
    )

    const handleConfirmDelete = (localite: Localite) => {
        deleteMutation.mutate(localite.id_loca, {
            onSuccess: () => {
                toast.success('Localité supprimée')
                setLocaliteToDelete(null)
                setDeleteOpen(null)
            },
            onError: () => toast.error('Erreur lors de la suppression'),
        })
    }

    const handleClose = () => {
        setShowModal(null)
        setSelectedLocalite(null)
    }

    const handleSuccess = () => {
        handleClose()
        // Le refresh se fait automatiquement via React Query
    }

    return (
        <div className='space-y-2 px-2'>
            <div className='flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between'>
                <p className='text-sm text-muted-foreground'>
                    Configurez d&apos;abord les niveaux, puis ajoutez les localités par niveau.
                </p>

                <div className='flex flex-col gap-2 sm:flex-row'>
                    <Button type='button' variant='outline' onClick={() => setShowModal('niveaux')}>
                        <Settings className='h-4 w-4' />
                        Niveaux
                    </Button>
                </div>
            </div>

            {!isLoadingNiveaux && !hasNiveaux ? (
                <Card className='border-dashed text-center'>
                    <p className='mb-2 text-sm text-muted-foreground'>
                        Configurez les niveaux des localités avant d&apos;ajouter des localités.
                    </p>
                    <Button type='button' onClick={() => setShowModal('niveaux')}>
                        <Settings className='h-4 w-4' />
                        Configurer les niveaux
                    </Button>
                </Card>
            ) : (
                <Tabs
                    orientation='vertical'
                    defaultValue='overview'
                    className='space-y-2'
                    style={tabsStyle}
                    key={sortedNiveaux.length}
                    value={String(currentNiveauId)}
                    onValueChange={setActiveNiveauId}
                >
                    <div className='flex items-center justify-between gap-2'>
                        <div className='overflow-x-auto flex-1'>
                            <NiveauTabsList>
                                {sortedNiveaux.map((n: any) => (
                                    <NiveauTabTrigger
                                        key={n.id_nlc}
                                        value={String(n.id_nlc)}
                                        count={countByNiveau.get(n.id_nlc) ?? 0}
                                    >
                                        {n.libelle_nlc}
                                    </NiveauTabTrigger>
                                ))}
                            </NiveauTabsList>
                        </div>

                        <Button
                            type='button'
                            onClick={() => {
                                if (!hasNiveaux) {
                                    toast.info(
                                        "Configurez d’abord les niveaux des localités."
                                    )
                                    setShowModal('niveaux')
                                    return
                                }

                                setSelectedLocalite(null)
                                setShowModal('form')
                            }}
                            disabled={isLoadingNiveaux}
                        >
                            <Plus className='h-4 w-4' />
                            Ajouter {currentNiveau?.libelle_nlc ?? 'localité'}
                        </Button>
                    </div>
                    {sortedNiveaux.map((n: any) => (
                        <TabsContent key={n.id_nlc} value={String(n.id_nlc)}>
                            {n.id_nlc === currentNiveauId && (
                                <LocaliteNiveauTable
                                    niveauId={n.id_nlc}
                                    localites={allLocalites}
                                    tableKey={`localites-${n.id_nlc}-${dataUpdatedAt}-${allLocalites.length}`}
                                    onEdit={handleEdit}
                                    onDeleteRequest={handleDeleteRequest}
                                />
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            )}

            {localiteToDelete && (
                <GenericDeleteDialog<Localite>
                    open={deleteOpen === 'delete'}
                    onOpenChange={(isOpen) => setDeleteOpen(isOpen ? 'delete' : null)}
                    currentRow={localiteToDelete}
                    entityName='la localité'
                    getEntityLabel={(row) => row.intitule_loca}
                    onDelete={handleConfirmDelete}
                />
            )}

            {/* Dialogue Niveaux */}
            <Dialog open={showModal === 'niveaux'} onOpenChange={(o) => !o && handleClose()}>
                <DialogContent className='sm:max-w-3xl'>
                    <DialogHeader>
                        <DialogTitle>Configuration des niveaux de localité</DialogTitle>
                        <DialogDescription>
                            Définissez les niveaux (Région, Préfecture, Commune, etc.)
                        </DialogDescription>
                    </DialogHeader>
                    <NiveauLocaliteManager onSuccess={handleClose} />
                </DialogContent>
            </Dialog>

            {/* Dialogue Formulaire Localité */}
            <Dialog open={showModal === 'form'} onOpenChange={(o) => !o && handleClose()}>
                <DialogContent className='sm:max-w-3xl'>
                    <DialogHeader>
                        <DialogTitle>
                            {selectedLocalite
                                ? 'Modifier la localité'
                                : 'Créer une localité'}
                        </DialogTitle>
                    </DialogHeader>
                    <AddLocalite
                        currentRow={selectedLocalite}
                        niveauId={currentNiveauId}
                        onClose={handleClose}
                        onSuccess={handleSuccess}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}
