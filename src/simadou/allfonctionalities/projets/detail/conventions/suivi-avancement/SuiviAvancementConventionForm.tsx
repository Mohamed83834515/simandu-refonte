import { useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { getSuiviAvancementConventionFormConfig } from '@/simadou/allfieldsConfig/suiviAvancementConventionForm'
import {
  suiviAvancementConventionSchema,
  type SuiviAvancementConventionFormData,
} from '@/simadou/schemas/suiviAvancementConventionSchemas'
import type { SuiviAvancementConvention } from '@/simadou/allTypes/suiviAvancementConvention'
import { resolvePersonnelId } from '@/simadou/allTypes/suiviAvancementConvention'
import { useMe } from '@/simadou/allHooks/auth/authHooks'
import {
  useCreateSuiviAvancementConvention,
  useGetSuiviAvancementConventionSources,
  useUpdateSuiviAvancementConvention,
} from '@/simadou/allHooks/admin/suiviConventionHooks'
import type { SuiviAvancementConventionPayload } from '@/simadou/allSercices/suiviAvancementConventionService'
import {
  buildSuiviAvancementConventionDefaultValues,
  pickNewDocumentFiles,
} from './suiviAvancementConventionFormUtils'

type Props = {
  idConvention: number
  suivi?: SuiviAvancementConvention
  onClose: () => void
  onSuccess: () => void
}

function buildPayload(
  data: SuiviAvancementConventionFormData,
  idConvention: number,
  isEditing: boolean,
  modifierPar: string,
  idPersonnel: number,
  existing?: SuiviAvancementConvention
): SuiviAvancementConventionPayload {
  return {
    ...(existing?.id_suivi != null ? { id_suivi: existing.id_suivi } : {}),
    date_suivi: data.date_suivi,
    code_suivi: existing?.code_suivi ?? null,
    statut_activite: data.statut_activite,
    etat_avancement: data.etat_avancement,
    difficultes_rencontrees: data.difficultes_rencontrees,
    pistes_solutions: data.pistes_solutions,
    observation: data.observation,
    etat: isEditing ? 'modification' : 'ajout',
    retard_accuse: existing?.retard_accuse?.trim() ?? '',
    convention: idConvention,
    id_personnel: idPersonnel,
    modifier_par: modifierPar,
  }
}

export default function SuiviAvancementConventionForm({
  idConvention,
  suivi,
  onClose,
  onSuccess,
}: Props) {
  const isEditing = !!suivi
  const { data: me } = useMe()
  const modifierPar = me?.email?.trim() || 'Utilisateur'

  const { data: sources = [], isLoading: sourcesLoading } =
    useGetSuiviAvancementConventionSources(suivi?.id_suivi)

  const documentUrls = useMemo(
    () =>
      sources
        .map((s) => s.fichier_join)
        .filter((url): url is string => typeof url === 'string' && !!url.trim()),
    [sources]
  )

  const formConfig = useMemo(() => getSuiviAvancementConventionFormConfig(), [])

  const defaultValues = useMemo(
    () => buildSuiviAvancementConventionDefaultValues(suivi, documentUrls),
    [suivi, documentUrls]
  )

  const createMutation = useCreateSuiviAvancementConvention(idConvention)
  const updateMutation = useUpdateSuiviAvancementConvention(idConvention)

  const onSubmit = (data: SuiviAvancementConventionFormData) => {
    const idPersonnel =
      resolvePersonnelId(suivi?.id_personnel) ?? me?.n_personnel ?? null

    if (idPersonnel == null) {
      toast.error(
        'Impossible d’identifier le personnel connecté. Reconnectez-vous.'
      )
      return
    }

    const payload = buildPayload(
      data,
      idConvention,
      isEditing,
      modifierPar,
      idPersonnel,
      suivi
    )
    const fichiers = pickNewDocumentFiles(data.documents_fichiers)

    const callbacks = {
      onSuccess: () => {
        toast.success(
          isEditing ? 'Observation mise à jour' : 'Observation enregistrée'
        )
        onSuccess()
      },
      onError: (error: unknown) =>
        toast.error(
          getApiErrorMessage(
            error,
            isEditing
              ? 'Erreur lors de la mise à jour'
              : "Erreur lors de l'enregistrement"
          )
        ),
    }

    if (isEditing && suivi) {
      updateMutation.mutate(
        { id: suivi.id_suivi, payload, fichiers },
        callbacks
      )
      return
    }

    createMutation.mutate({ payload, fichiers }, callbacks)
  }

  const retardAffiche = suivi?.retard_accuse?.trim() || '—'
  const isPending = createMutation.isPending || updateMutation.isPending

  if (isEditing && sourcesLoading) {
    return (
      <div className='flex justify-center py-12'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    )
  }

  return (
    <div className='flex w-full flex-col gap-3'>
      <p className='text-sm text-muted-foreground'>
        <span className='font-medium text-foreground'>Retard accusé :</span>{' '}
        {retardAffiche}
      </p>

      <DynamicForm
        key={`${suivi?.id_suivi ?? 'new'}-${documentUrls.join(',')}`}
        className='w-full'
        embedded
        config={formConfig}
        schema={suiviAvancementConventionSchema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        submitText={isEditing ? 'Mettre à jour' : 'Enregistrer'}
        loadingText='Enregistrement…'
        isLoading={isPending}
        onCancel={onClose}
        cancelText='Retour'
      />
    </div>
  )
}
