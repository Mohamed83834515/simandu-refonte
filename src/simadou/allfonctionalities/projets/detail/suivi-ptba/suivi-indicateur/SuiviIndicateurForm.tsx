import { useMemo } from 'react'
import { toast } from 'sonner'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import {
  suiviIndicateurActiviteSchema,
  type SuiviIndicateurActiviteFormData,
} from '@/simadou/schemas/suiviIndicateurSchemas'
import { useGetLocalites } from '@/simadou/allHooks/admin/localiteHooks'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DIALOG_SIZES } from '@/Global/Forms/dialog'
import { getSuiviIndicateurActiviteFormConfigForSuivi } from '@/simadou/allfieldsConfig/suiviIndicateurActiviteForm'

type AddSuiviIndicateurProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  indicateurId?: number
  suivi?: SuiviIndicateurActiviteFormData | null
  onSuccess: () => void
}

export default function AddSuiviIndicateur({
  open,
  onOpenChange,
  indicateurId,
  suivi,
  onSuccess,
}: AddSuiviIndicateurProps) {
  const { data: localites = [], isLoading: isLoadingLocalites } = useGetLocalites()

  const indicateurOptions = [
    { value: '1', label: 'Indicateur 1' },
    { value: '2', label: 'Indicateur 2' },
    { value: '3', label: 'Indicateur 3' },
  ]
 
  const formConfig = useMemo(
    () => getSuiviIndicateurActiviteFormConfigForSuivi({
      localites,
      isLoadingLocalites,
      indicateurOptions,
    }),
    [localites, isLoadingLocalites, indicateurOptions]
  )

  const defaultValues: SuiviIndicateurActiviteFormData = {
    date_suivi_indicateur: suivi?.date_suivi_indicateur || new Date().toISOString().split('T')[0],
    valeur_suivi_indicateur: suivi?.valeur_suivi_indicateur || 0,
    localite: suivi?.localite || '',
    indicateur_activite: suivi?.indicateur_activite || (indicateurId ? String(indicateurId) : null),
  }

  const form = useForm<SuiviIndicateurActiviteFormData>({
    resolver: zodResolver(suiviIndicateurActiviteSchema),
    defaultValues,
    mode: 'onChange',
  })

  const onSubmit = async (data: SuiviIndicateurActiviteFormData) => {
    console.log('Données soumises:', data)
    toast.success(suivi ? 'Suivi modifié avec succès' : 'Suivi enregistré avec succès')
    onSuccess()
    onOpenChange(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={DIALOG_SIZES.md}>
        <DialogHeader>
          <DialogTitle>
            {suivi ? 'Modifier le suivi' : 'Ajouter un suivi d\'indicateur'}
          </DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
          <DynamicForm
            config={formConfig}
            schema={suiviIndicateurActiviteSchema}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            submitText={suivi ? 'Modifier' : 'Enregistrer'}
            loadingText='Enregistrement...'
            isLoading={false}
            onCancel={() => onOpenChange(false)}
            cancelText='Annuler'
          />
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}