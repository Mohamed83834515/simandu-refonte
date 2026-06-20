import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { DIALOG_SIZES } from '@/Global/Forms/dialog'
import { formPrimaryButtonClassName } from '@/Global/Forms/form-footer-styles'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { useMe } from '@/simadou/allHooks/auth/authHooks'
import { useCreatePeriodeIndicateur } from '@/simadou/allHooks/admin/periodeIndicateurHooks'
import type { PeriodeIndicateurFormData } from '@/simadou/allTypes/periodeIndicateur'
import {
  buildPeriodeIndicateurWritePayload,
  emptyPeriodeIndicateurFormValues,
} from './periodeIndicateurFormUtils'
import PeriodeIndicateurFormFields from './PeriodeIndicateurFormFields'

type SuiviIndicateurCmrAddPeriodeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  refIndicateur: number
  indicateurCode: string
  onCreated?: (idPeriode: number) => void
}

export default function SuiviIndicateurCmrAddPeriodeDialog({
  open,
  onOpenChange,
  refIndicateur,
  indicateurCode,
  onCreated,
}: SuiviIndicateurCmrAddPeriodeDialogProps) {
  const { data: user } = useMe()
  const createMutation = useCreatePeriodeIndicateur(refIndicateur)
  const [form, setForm] = useState<PeriodeIndicateurFormData>(
    emptyPeriodeIndicateurFormValues()
  )

  useEffect(() => {
    if (open) {
      setForm(emptyPeriodeIndicateurFormValues())
    }
  }, [open])

  const updateField = <K extends keyof PeriodeIndicateurFormData>(
    key: K,
    value: PeriodeIndicateurFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    if (!form.periode_collecte.trim()) {
      toast.error('La période de collecte est obligatoire.')
      return
    }

    const personnelId = user?.n_personnel
    if (!personnelId) {
      toast.error('Utilisateur non identifié.')
      return
    }

    const payload = buildPeriodeIndicateurWritePayload({
      form,
      refIndicateur,
      personnelId,
      isEdit: false,
    })

    try {
      const created = await createMutation.mutateAsync(payload)
      toast.success('Période ajoutée')
      onOpenChange(false)
      onCreated?.(created.id_periode)
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Erreur lors de l'ajout de la période")
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(DIALOG_SIZES.form, 'gap-0 p-0')}
        aria-describedby={undefined}
      >
        <DialogHeader className='border-b px-6 py-4 pr-12'>
          <DialogTitle>
            Ajouter une période —{' '}
            <span className='font-mono text-primary'>{indicateurCode}</span>
          </DialogTitle>
        </DialogHeader>

        <div className='px-6 py-4'>
          <PeriodeIndicateurFormFields
            form={form}
            disabled={createMutation.isPending}
            idPrefix='add-periode'
            onChange={updateField}
          />
        </div>

        <DialogFooter className='border-t px-6 py-4'>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={createMutation.isPending}
          >
            Annuler
          </Button>
          <Button
            type='button'
            className={formPrimaryButtonClassName}
            onClick={handleSubmit}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending && (
              <Loader2 className='h-4 w-4 animate-spin' />
            )}
            Ajouter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
