import { useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { Ppm } from '@/simadou/allTypes/ppm'
import type { EtapePassation } from '@/simadou/allTypes/etapePassation'
import { useGetEtapesByPpm } from '@/simadou/allHooks/admin/etapePassationHooks'
import EtapePassationForm from './EtapePassationForm'
import EtapesPassationTable from './EtapesPassationTable'

type EtapesPassationDialogProps = {
    ppm: Ppm | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function EtapesPassationDialog({
    ppm,
    open,
    onOpenChange,
}: EtapesPassationDialogProps) {
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState<EtapePassation | undefined>()

    const idPpm = ppm?.id_ppm || 0
    const { data: etapes = [], isLoading } = useGetEtapesByPpm(idPpm)

    const handleAdd = () => {
        setEditing(undefined)
        setShowForm(true)
    }

    const handleEdit = (row: EtapePassation) => {
        setEditing(row)
        setShowForm(true)
    }

    const handleCloseForm = () => {
        setShowForm(false)
        setEditing(undefined)
    }

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            setShowForm(false)
            setEditing(undefined)
        }
        onOpenChange(isOpen)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className='flex max-h-[85vh] flex-col overflow-hidden sm:max-w-4xl'>
                <DialogHeader>
                    <DialogTitle>Étapes de passation</DialogTitle>
                    <DialogDescription>{ppm?.intitule_ppm ?? '—'}</DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className='flex items-center justify-center py-12'>
                        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                    </div>
                ) : showForm ? (
                    idPpm != null && (
                        <EtapePassationForm
                            etape={editing}
                            idPpm={idPpm}
                            onClose={handleCloseForm}
                            onSuccess={handleCloseForm}
                        />
                    )
                ) : (
                    <div className='flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto'>
                        <div className='flex justify-end'>
                            <Button
                                type='button'
                                size='sm'
                                onClick={handleAdd}
                                className='gap-2'
                            >
                                <Plus className='h-4 w-4' />
                                Ajouter une étape
                            </Button>
                        </div>
                        <EtapesPassationTable
                            etapes={etapes}
                            idPpm={idPpm ?? 0}
                            onEdit={handleEdit}
                        />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}