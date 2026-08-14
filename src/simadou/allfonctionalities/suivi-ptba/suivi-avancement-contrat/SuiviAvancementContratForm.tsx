import { useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { getSuiviAvancementContratFormConfigForSuivi } from '@/simadou/allfieldsConfig/suiviAvancementContratForm'
import {
  statutActiviteOptions,
  suiviAvancementContratSuiviPtbaSchema,
  type SuiviAvancementContratSuiviPtbaFormData,
} from '@/simadou/schemas/suiviAvancementContratSchemas'
import type { Ptba, SuiviAvancementContrat } from '@/simadou/allTypes'
import {
  resolveActivitePtbaId,
  resolvePersonnelId,
} from '@/simadou/allTypes/suiviAvancementContrat'
import { useMe } from '@/simadou/allHooks/auth/authHooks'
import {
  useCreateSuiviAvancementWithSources,
  useGetSuiviAvancementSources,
  useUpdateSuiviAvancementWithSources,
  type SuiviAvancementWithSourcesInput,
} from '@/simadou/allHooks/admin/suiviPtbaHooks'
import {
  buildSuiviAvancementDefaultValues,
  pickExistingDocumentSources,
  pickNewDocumentFiles,
} from './suiviAvancementContratFormUtils'

type SuiviAvancementContratFormProps = {
  suivi?: SuiviAvancementContrat
  activite: Ptba
  onClose: () => void
  onSuccess: () => void
}

function buildWithSourcesInput(
  data: SuiviAvancementContratSuiviPtbaFormData,
  activiteId: number,
  isEditing: boolean,
  modifierPar: string,
  idPersonnel: number,
  existing?: SuiviAvancementContrat
): SuiviAvancementWithSourcesInput {
  const idSuivi = existing?.id_suivi

  return {
    suivi: {
      ...(idSuivi != null ? { id_suivi: idSuivi } : {}),
      date_suivi: data.date_suivi,
      code_suivi: existing?.code_suivi ?? null,
      statut_activite: data.statut_activite,
      etat_avancement: data.etat_avancement,
      difficultes_rencontrees: data.difficultes_rencontrees,
      pistes_solutions: data.pistes_solutions,
      observation: data.observation,
      etat: isEditing ? 'modification' : 'ajout',
      retard_accuse: existing?.retard_accuse?.trim() ?? '',
      documents: existing?.documents ?? null,
      activite_ptba: resolveActivitePtbaId(existing?.activite_ptba) ?? activiteId,
      sous_activite:
        typeof existing?.sous_activite === 'number'
          ? existing.sous_activite
          : null,
      id_personnel: idPersonnel,
      modifier_par: modifierPar,
    },
    fichiers: pickNewDocumentFiles(data.documents_fichiers),
    existingSources:
      idSuivi != null
        ? pickExistingDocumentSources(data.documents_fichiers, idSuivi)
        : [],
  }
}

export default function SuiviAvancementContratForm({
  suivi,
  activite,
  onClose,
  onSuccess,
}: SuiviAvancementContratFormProps) {
  const isEditing = !!suivi
  const idActivite = activite.id_ptba
  const { data: me } = useMe()
  const modifierPar = me?.email?.trim() || 'Utilisateur'

  const { data: sources = [], isLoading: sourcesLoading } =
    useGetSuiviAvancementSources(suivi?.id_suivi)

  const documentUrls = useMemo(
    () =>
      sources
        .map((s) => s.fichier_join)
        .filter((url): url is string => typeof url === 'string' && !!url.trim()),
    [sources]
  )
  // Dans votre composant ou hook
  const formConfig = useMemo(() => {
    const config = getSuiviAvancementContratFormConfigForSuivi();
    const taux = activite?.taux_execution_ptba || 0;
    // Trouver l'index du champ statut_activite
    const statutIndex = config.fields.findIndex(
      field => field.name === 'statut_activite'
    );

    if (statutIndex !== -1 && taux < 100) {
      // Modifier directement le champ existant
      const field = config.fields[statutIndex];

      // Filtrer les options
      const filteredOptions = statutActiviteOptions.filter(
        option => option.value !== 'réalisé'
      );

      config.fields[statutIndex] = {
        ...field,
        options: filteredOptions,
      };
    }

    return config;
  }, [activite?.taux_execution_ptba, activite?.statut_activite]);

  const defaultValues = useMemo(
    () => buildSuiviAvancementDefaultValues(suivi, documentUrls),
    [suivi, documentUrls]
  )

  const createMutation = useCreateSuiviAvancementWithSources(idActivite)
  const updateMutation = useUpdateSuiviAvancementWithSources(idActivite)

  const onSubmit = (data: SuiviAvancementContratSuiviPtbaFormData) => {
    const idPersonnel =
      resolvePersonnelId(suivi?.id_personnel) ?? me?.n_personnel ?? null

    if (idPersonnel == null) {
      toast.error(
        'Impossible d’identifier le personnel connecté. Reconnectez-vous.'
      )
      return
    }

    const input = buildWithSourcesInput(
      data,
      idActivite,
      isEditing,
      modifierPar,
      idPersonnel,
      suivi
    )

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
      updateMutation.mutate({ id: suivi.id_suivi, input }, callbacks)
      return
    }

    createMutation.mutate(input, callbacks)
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
        schema={suiviAvancementContratSuiviPtbaSchema}
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
