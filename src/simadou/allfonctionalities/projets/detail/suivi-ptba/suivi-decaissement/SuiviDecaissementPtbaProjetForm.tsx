import { useMemo } from 'react'
import { toast } from 'sonner'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { getSuiviDecaissementPtbaProjetFormConfig } from '@/simadou/allfieldsConfig/suiviDecaissementPtbaProjetForm'
import {
  suiviDecaissementPtbaProjetSchema,
  type SuiviDecaissementPtbaProjetFormData,
} from '@/simadou/schemas/suiviDecaissementPtbaProjetSchemas'
import type { Projet } from '@/simadou/allTypes/projet'
import type { SuiviDecaissementPtbaProjet } from '@/simadou/allTypes/suiviDecaissementPtbaProjet'
import {
  useCreateSuiviDecaissementProjet,
  useUpdateSuiviDecaissementProjet,
} from '@/simadou/allHooks/admin/suiviPtbaProjetHooks'
import { useGetFinancementsProjet } from '@/simadou/allHooks/admin/financementProjetHooks'
import {
  buildSuiviDecaissementRegionOptions,
  buildSuiviDecaissementTypePartOptions,
  resolveSuiviDecaissementRegionId,
  resolveSuiviDecaissementTypePartId,
} from '@/simadou/lib/suiviDecaissementPtbaProjetUtils'

type Props = {
  projet: Projet
  idActivite: number
  suivi?: SuiviDecaissementPtbaProjet
  onClose: () => void
  onSuccess: () => void
}

export default function SuiviDecaissementPtbaProjetForm({
  projet,
  idActivite,
  suivi,
  onClose,
  onSuccess,
}: Props) {
  const isEditing = !!suivi
  const { data: financements = [] } = useGetFinancementsProjet(projet.id_projet)

  const regionOptions = useMemo(
    () => buildSuiviDecaissementRegionOptions(projet.zone_projet),
    [projet.zone_projet]
  )
  const typePartOptions = useMemo(
    () => buildSuiviDecaissementTypePartOptions(financements),
    [financements]
  )

  const config = useMemo(
    () =>
      getSuiviDecaissementPtbaProjetFormConfig({
        regionOptions,
        typePartOptions,
      }),
    [regionOptions, typePartOptions]
  )

  const createMutation = useCreateSuiviDecaissementProjet(idActivite)
  const updateMutation = useUpdateSuiviDecaissementProjet(idActivite)

  const defaultValues = useMemo((): SuiviDecaissementPtbaProjetFormData => {
    const regionId = resolveSuiviDecaissementRegionId(suivi)
    const typePartId = resolveSuiviDecaissementTypePartId(suivi)

    return {
      date_suivi_dec:
        suivi?.date_suivi_dec?.slice(0, 10) ||
        new Date().toISOString().split('T')[0],
      region: regionId ?? regionOptions[0]?.value ?? 0,
      type_part: typePartId ?? typePartOptions[0]?.value ?? 0,
      observation: suivi?.observation ?? '',
      montant_decaisse: suivi?.montant_decaisse ?? 0,
    }
  }, [suivi, regionOptions, typePartOptions])

  const onSubmit = (data: SuiviDecaissementPtbaProjetFormData) => {
    const callbacks = {
      onSuccess: () => {
        toast.success(isEditing ? 'Décaissement mis à jour' : 'Décaissement ajouté')
        onSuccess()
      },
      onError: (error: unknown) =>
        toast.error(
          getApiErrorMessage(
            error,
            isEditing ? 'Erreur lors de la mise à jour' : "Erreur lors de l'ajout"
          )
        ),
    }

    if (isEditing && suivi) {
      updateMutation.mutate(
        {
          id: suivi.id_suivi_dec,
          data,
          existing: {
            periode_suivi_dec: suivi.periode_suivi_dec,
            taux_dollars_jour: suivi.taux_dollars_jour,
          },
        },
        callbacks
      )
      return
    }

    createMutation.mutate(data, callbacks)
  }

  if (regionOptions.length === 0 || typePartOptions.length === 0) {
    return (
      <p className='py-6 text-center text-sm text-muted-foreground'>
        {regionOptions.length === 0
          ? 'Aucune zone configurée sur ce projet.'
          : 'Aucun financement configuré pour ce projet.'}
      </p>
    )
  }

  return (
    <DynamicForm
      key={suivi?.id_suivi_dec ?? 'new'}
      className='w-full'
      embedded
      config={config}
      schema={suiviDecaissementPtbaProjetSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      submitText={isEditing ? 'Modifier' : 'Ajouter'}
      loadingText='Enregistrement…'
      isLoading={createMutation.isPending || updateMutation.isPending}
      onCancel={onClose}
      cancelText='Retour'
    />
  )
}
