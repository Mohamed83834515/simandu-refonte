import { useEffect, useState } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { formPrimaryButtonClassName } from '@/Global/Forms/form-footer-styles'
import { useMe } from '@/simadou/allHooks/auth/authHooks'
import {
  useDeletePeriodeIndicateur,
  useUpdatePeriodeIndicateur,
} from '@/simadou/allHooks/admin/periodeIndicateurHooks'
import type {
  PeriodeIndicateur,
  PeriodeIndicateurFormData,
} from '@/simadou/allTypes/periodeIndicateur'
import {
  buildPeriodeIndicateurWritePayload,
  periodeIndicateurToFormValues,
} from './periodeIndicateurFormUtils'
import PeriodeIndicateurFormFields from './PeriodeIndicateurFormFields'

type SuiviIndicateurCmrSourceResultatPanelProps = {
  refIndicateur: number
  periode: PeriodeIndicateur
  onDeleted?: () => void
}

export default function SuiviIndicateurCmrSourceResultatPanel({
  refIndicateur,
  periode,
  onDeleted,
}: SuiviIndicateurCmrSourceResultatPanelProps) {
  const { data: user } = useMe()
  const updateMutation = useUpdatePeriodeIndicateur(refIndicateur)
  const deleteMutation = useDeletePeriodeIndicateur(refIndicateur)

  const [form, setForm] = useState<PeriodeIndicateurFormData>(
    periodeIndicateurToFormValues(periode)
  )

  useEffect(() => {
    setForm(periodeIndicateurToFormValues(periode))
  }, [periode])

  const isPending = updateMutation.isPending || deleteMutation.isPending
  const personnelId = user?.n_personnel

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

    if (!personnelId) {
      toast.error('Utilisateur non identifié.')
      return
    }

    const payload = buildPeriodeIndicateurWritePayload({
      form,
      refIndicateur,
      personnelId,
      existingPeriode: periode,
      isEdit: true,
    })

    try {
      await updateMutation.mutateAsync({ id: periode.id_periode, data: payload })
      toast.success('Période modifiée')
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, 'Erreur lors de la modification de la période')
      )
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Supprimer cette période de suivi ?')) return

    try {
      await deleteMutation.mutateAsync(periode.id_periode)
      toast.success('Période supprimée')
      onDeleted?.()
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, 'Erreur lors de la suppression de la période')
      )
    }
  }

  return (
    <div className='space-y-5'>
      <PeriodeIndicateurFormFields
        form={form}
        disabled={isPending}
        onChange={updateField}
      />

      <div className='flex items-center justify-between border-t pt-4'>
        <Button
          type='button'
          variant='outline'
          className='gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive'
          onClick={handleDelete}
          disabled={isPending}
        >
          {deleteMutation.isPending ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Trash2 className='h-4 w-4' />
          )}
          Supprimer
        </Button>

        <Button
          type='button'
          className={formPrimaryButtonClassName}
          onClick={handleSubmit}
          disabled={isPending}
        >
          {updateMutation.isPending && (
            <Loader2 className='h-4 w-4 animate-spin' />
          )}
          Modifier
        </Button>
      </div>
    </div>
  )
}
