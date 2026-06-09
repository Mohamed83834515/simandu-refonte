import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { getApiErrorMessage } from '@/lib/api-error-message'
import {
  buildAnneeCibleOptions,
  getCibleCmrProjetFormConfigForDialog,
} from '@/simadou/allfieldsConfig/cibleCmrProjetForm'
import {
  cibleCmrProjetSchema,
  formatAnneeCibleForApi,
  normalizeAnneeCibleForForm,
  resolveCodeIndicateurCrpForForm,
  type CibleCmrProjetFormData,
} from '@/simadou/schemas/cibleCmrProjetSchema'
import type { CibleCmrProjet } from '@/simadou/allTypes'
import { useGetIndicateursCadreResultat } from '@/simadou/allHooks/admin/indicateurCadreResultatHooks'
import {
  useCreateCibleCmrProjet,
  useUpdateCibleCmrProjet,
} from '@/simadou/allHooks/admin/indicateurCmrHooks'
import { parseOptionalNumber, resolveRelationCode } from '@/simadou/lib/resolveApiRelation'
import { uglService } from '@/simadou/allSercices/uglService'

export default function CibleCmrProjetFormDialog({
  codeProjet,
  cible,
  fixedIndicateurCrpId,
  onClose,
  onSuccess,
}: {
  codeProjet: string
  cible?: CibleCmrProjet | null
  fixedIndicateurCrpId?: number | null
  onClose: () => void
  onSuccess: () => void
}) {
  const isEditing = !!cible
  const hideIndicateurField = fixedIndicateurCrpId != null
  const createMutation = useCreateCibleCmrProjet(codeProjet)
  const updateMutation = useUpdateCibleCmrProjet(codeProjet)
  const { data: indicateurs = [], isLoading: isLoadingIndicateurs } =
    useGetIndicateursCadreResultat()
  const { data: ugls = [], isLoading: isLoadingUgls } = useQuery({
    queryKey: ['ugls'],
    queryFn: () => uglService.getAll(),
  })

  const anneeOptions = useMemo(() => buildAnneeCibleOptions(), [])

  const indicateurOptions = useMemo(
    () =>
      indicateurs
        .filter((i) => i.id_indicateur_cr_iop != null)
        .map((i) => ({
          value: i.id_indicateur_cr_iop,
          label: `${i.code_indicateur_cr_iop} — ${i.intitule_indicateur_cr_iop}`,
        })),
    [indicateurs]
  )

  const uglOptions = useMemo(
    () =>
      ugls
        .filter((u) => u.code_ugl != null)
        .map((u) => ({
          value: u.code_ugl!,
          label: `${u.code_ugl} — ${u.nom_ugl}`,
        })),
    [ugls]
  )

  const config = useMemo(
    () =>
      getCibleCmrProjetFormConfigForDialog({
        anneeOptions,
        indicateurOptions,
        uglOptions,
        isLoadingIndicateurs,
        isLoadingUgls,
        hideIndicateurField,
      }),
    [
      anneeOptions,
      indicateurOptions,
      uglOptions,
      isLoadingIndicateurs,
      isLoadingUgls,
      hideIndicateurField,
    ]
  )

  const defaultValues = useMemo((): CibleCmrProjetFormData => {
    const annee = normalizeAnneeCibleForForm(cible?.annee, anneeOptions)
    const indicateurCrpId =
      fixedIndicateurCrpId ?? resolveCodeIndicateurCrpForForm(cible)

    return {
      annee,
      valeur_cible_indcateur_crp: cible?.valeur_cible_indcateur_crp ?? 0,
      code_indicateur_crp: indicateurCrpId,
      code_ug:
        resolveRelationCode(cible?.code_ug, 'code_ugl') ??
        (typeof cible?.code_ug === 'string' ? cible.code_ug : null),
      code_projet: codeProjet,
    }
  }, [cible, codeProjet, anneeOptions, fixedIndicateurCrpId])

  const onSubmit = (data: CibleCmrProjetFormData) => {
    const payload: CibleCmrProjetFormData = {
      ...data,
      annee: formatAnneeCibleForApi(data.annee),
      code_projet: codeProjet,
      code_indicateur_crp:
        fixedIndicateurCrpId != null
          ? fixedIndicateurCrpId
          : parseOptionalNumber(data.code_indicateur_crp),
      code_ug: data.code_ug || null,
    }

    const callbacks = {
      onSuccess: () => {
        toast.success(isEditing ? 'Cible mise à jour' : 'Cible créée')
        onSuccess()
      },
      onError: (error: unknown) =>
        toast.error(
          getApiErrorMessage(
            error,
            isEditing ? 'Erreur lors de la mise à jour' : 'Erreur lors de la création'
          )
        ),
    }

    if (isEditing && cible) {
      updateMutation.mutate(
        { id: cible.id_cible_indicateur_crp, data: payload },
        callbacks
      )
      return
    }

    createMutation.mutate(payload, callbacks)
  }

  return (
    <DynamicForm
      key={cible?.id_cible_indicateur_crp ?? 'new'}
      config={config}
      schema={cibleCmrProjetSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      submitText={isEditing ? 'Modifier' : 'Ajouter'}
      loadingText='Enregistrement…'
      isLoading={createMutation.isPending || updateMutation.isPending}
      onCancel={onClose}
      cancelText='Annuler'
    />
  )
}
