import { useMemo } from 'react'
import { toast } from 'sonner'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { getSuiviIndicateurActiviteFormConfigForSuivi } from '@/simadou/allfieldsConfig/suiviIndicateurActiviteForm'
import {
  suiviIndicateurActiviteSchema,
  type SuiviIndicateurActiviteFormData,
} from '@/simadou/schemas/suiviIndicateurSchemas'
import type { SuiviIndicateurActivite } from '@/simadou/allTypes'
import type { Ptba } from '@/simadou/allTypes'
import { IndicateurTache } from '@/simadou/allTypes/indicateurTache'
import {
  useCreateSuiviIndicateur,
  useGetLocalites,
  useUpdateSuiviIndicateur,
} from '@/simadou/allHooks/admin/suiviPtbaHooks'
import { ensureIndicateurActivitePtbaCode } from './suiviIndicateurUtils'

type SuiviIndicateurFormProps = {
  activite: Ptba
  indicateur: IndicateurTache
  suivi?: SuiviIndicateurActivite | null
  onClose: () => void
  onSuccess: () => void
}

export default function SuiviIndicateurProjetForm({
  activite,
  indicateur,
  suivi,
  onClose,
  onSuccess,
}: SuiviIndicateurFormProps) {
  const isEditing = !!suivi
  const codeIndicateur = indicateur.code_indicateur_ptba
  const { data: localites = [] } = useGetLocalites()

  const formConfig = useMemo(
    () => getSuiviIndicateurActiviteFormConfigForSuivi(localites),
    [localites]
  )

  const defaultValues = useMemo((): SuiviIndicateurActiviteFormData => {
    if (suivi) {
      return {
        localite:
          typeof suivi.localite === 'object' && suivi.localite
            ? suivi.localite.code_loca
            : typeof suivi.localite === 'string'
              ? suivi.localite
              : '',
        date_suivi_indicateur: suivi.date_suivi_indicateur
          ? new Date(suivi.date_suivi_indicateur).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        valeur_suivi_indicateur: suivi.valeur_suivi_indicateur || 0,
        indicateur_activite: codeIndicateur,
      }
    }
    return {
      localite: '',
      date_suivi_indicateur: new Date().toISOString().split('T')[0],
      valeur_suivi_indicateur: 0,
      indicateur_activite: codeIndicateur,
    }
  }, [suivi, codeIndicateur])

  const createMutation = useCreateSuiviIndicateur(codeIndicateur)
  const updateMutation = useUpdateSuiviIndicateur(codeIndicateur)

  const onSubmit = async (data: SuiviIndicateurActiviteFormData) => {
    try {
      const indicateurActiviteCode = await ensureIndicateurActivitePtbaCode(
        activite,
        indicateur
      )
      const payload = {
        ...data,
        indicateur_activite: indicateurActiviteCode,
      }

      if (isEditing && suivi) {
        updateMutation.mutate(
          { id: suivi.id_suivi_indicateur, data: payload },
          {
            onSuccess: () => {
              toast.success('Suivi modifié')
              onSuccess()
            },
            onError: (error) =>
              toast.error(
                getApiErrorMessage(error, 'Erreur lors de la mise à jour')
              ),
          }
        )
      } else {
        createMutation.mutate(payload, {
          onSuccess: () => {
            toast.success('Suivi enregistré')
            onSuccess()
          },
          onError: (error) =>
            toast.error(
              getApiErrorMessage(error, "Erreur lors de l'enregistrement")
            ),
        })
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erreur lors de l'enregistrement"))
    }
  }

  return (
    <DynamicForm
      config={formConfig}
      schema={suiviIndicateurActiviteSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      submitText={isEditing ? 'Mettre à jour' : 'Enregistrer'}
      loadingText='Enregistrement…'
      isLoading={createMutation.isPending || updateMutation.isPending}
      onCancel={onClose}
      cancelText='Annuler'
    />
  )
}
