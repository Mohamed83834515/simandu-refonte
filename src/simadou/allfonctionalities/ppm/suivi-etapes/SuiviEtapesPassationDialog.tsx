import { Loader2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import type { Ppm } from '@/simadou/allTypes/ppm'
import { useGetEtapesByPpm } from '@/simadou/allHooks/admin/etapePassationHooks'
import SuiviEtapesPassationTable from './SuiviEtapesPassationTable'

type SuiviEtapesPassationDialogProps = {
    ppm: Ppm | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function SuiviEtapesPassationDialog({
    ppm,
    open,
    onOpenChange,
}: SuiviEtapesPassationDialogProps) {
    const idPpm = ppm?.id_ppm ?? 0
    const { data: etapes = [], isLoading } = useGetEtapesByPpm(idPpm)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='flex max-h-[85vh] flex-col overflow-hidden sm:max-w-5xl'>
                <DialogHeader>
                    <DialogTitle>Suivi des étapes de passation</DialogTitle>
                    <DialogDescription>{ppm?.intitule_ppm ?? '—'}</DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className='flex items-center justify-center py-12'>
                        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                    </div>
                ) : (
                    <div className='min-h-0 flex-1 overflow-y-auto'>
                        <SuiviEtapesPassationTable etapes={etapes} idPpm={idPpm ?? 0} />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}