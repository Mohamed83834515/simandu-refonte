import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { toast } from 'sonner'
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
import { getApiErrorMessage } from '@/lib/api-error-message'

export type SuiviIndicateurCmrSourceResultatPanelHandle = {
  submit: () => Promise<void>
  delete: () => Promise<void>
  isPending: boolean
  isDeletePending: boolean
  isUpdatePending: boolean
}

type SuiviIndicateurCmrSourceResultatPanelProps = {
  refIndicateur: number
  periode: PeriodeIndicateur
  onDeleted?: () => void
  onActionsStateChange?: (state: {
    isPending: boolean
    isDeletePending: boolean
    isUpdatePending: boolean
  }) => void
}

const SuiviIndicateurCmrSourceResultatPanel = forwardRef<
  SuiviIndicateurCmrSourceResultatPanelHandle,
  SuiviIndicateurCmrSourceResultatPanelProps
>(function SuiviIndicateurCmrSourceResultatPanel(
  { refIndicateur, periode, onDeleted, onActionsStateChange },
  ref
) {
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

  useEffect(() => {
    onActionsStateChange?.({
      isPending,
      isDeletePending: deleteMutation.isPending,
      isUpdatePending: updateMutation.isPending,
    })
  }, [
    isPending,
    deleteMutation.isPending,
    updateMutation.isPending,
    onActionsStateChange,
  ])

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

  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
    delete: handleDelete,
    isPending,
    isDeletePending: deleteMutation.isPending,
    isUpdatePending: updateMutation.isPending,
  }))

  return (
    <PeriodeIndicateurFormFields
      form={form}
      disabled={isPending}
      variant='panel'
      onChange={updateField}
    />
  )
})

export default SuiviIndicateurCmrSourceResultatPanel
