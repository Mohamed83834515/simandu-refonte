import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DIALOG_SIZES } from '@/Global/Forms/dialog'
import type { Projet } from '@/simadou/allTypes'
import ProjetRapportOrView from './ProjetRapportOrView'

type ProjetRapportOrDialogProps = {
  projet: Projet
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ProjetRapportOrDialog({
  projet,
  open,
  onOpenChange,
}: ProjetRapportOrDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${DIALOG_SIZES.full} flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0`}
      >
        <DialogHeader className='shrink-0 border-b px-6 py-4'>
          <DialogTitle>Rapport d&apos;or du projet</DialogTitle>
          <DialogDescription>
            Synthèse multi-chapitres — export PDF ou Word.
          </DialogDescription>
        </DialogHeader>
        <div className='min-h-0 flex-1 overflow-y-auto px-6 py-4'>
          {open ? <ProjetRapportOrView projet={projet} /> : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
