import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { DynamicForm, type DynamicFormHandle } from '@/Global/Forms/DynamicForm'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { getIndicateurCmrProjetFormConfigForDialog } from '@/simadou/allfieldsConfig/indicateurCmrForm'
import type { CadreResultat, IndicateurCadreResultat } from '@/simadou/allTypes'
import type { IndicateurCmrProjet } from '@/simadou/allTypes/indicateurCmrProjet'
import {
  indicateurCmrProjetCreateSchema,
  type IndicateurCmrProjetCreateData,
} from '@/simadou/schemas/indicateurCmrProjetSchemas'
import {
  useCreateIndicateurCmrProjet,
  useUpdateIndicateurCmrProjet,
} from '@/simadou/allHooks/admin/indicateurCmrHooks'
import { useGetDictionnaireIndicateurs } from '@/simadou/allHooks/admin/dictionnaireIndicateurHooks'
import {
  buildCadreResultatSelectOptions,
  buildDictionnaireIndicateurSelectOptions,
  buildIndicateurCadreResultatSelectOptions,
  filterCadresResultatByNiveau,
  filterIndicateursForCadreResultat,
  indicateurCmrProjetToFormValues,
  resolveCadreIdForIndicateurCmrProjet,
  resolveCadreResultatById,
  resolveIndicateurIopId,
  resolveIndicateurIopLabel,
  resolveReferentielCmrId,
  resolveResultatCmrProjetLabel,
} from './indicateurCmrProjetFormUtils'

export default function IndicateurCmrProjetFormPanel({
  indicateur,
  codeProjet,
  niveauId,
  niveauLibelle,
  cadresResultat,
  indicateursCadreResultat,
  onClose,
  onSuccess,
}: {
  indicateur?: IndicateurCmrProjet | null
  codeProjet: string
  niveauId: number
  niveauLibelle: string
  cadresResultat: CadreResultat[]
  indicateursCadreResultat: IndicateurCadreResultat[]
  onClose: () => void
  onSuccess: () => void
}) {
  const isEditing = !!indicateur
  const formRef = useRef<DynamicFormHandle>(null)
  const createMutation = useCreateIndicateurCmrProjet(codeProjet)
  const updateMutation = useUpdateIndicateurCmrProjet()
  const { data: dictionnaires = [], isLoading: isLoadingReferentiels } =
    useGetDictionnaireIndicateurs()

  const [selectedCadreId, setSelectedCadreId] = useState<number | null>(() =>
    resolveCadreIdForIndicateurCmrProjet(indicateur, cadresResultat)
  )

  useEffect(() => {
    setSelectedCadreId(
      resolveCadreIdForIndicateurCmrProjet(indicateur, cadresResultat)
    )
  }, [indicateur, cadresResultat])

  const cadresResultatForNiveau = useMemo(
    () => filterCadresResultatByNiveau(cadresResultat, niveauId),
    [cadresResultat, niveauId]
  )

  const selectedCadre = useMemo(
    () => resolveCadreResultatById(cadresResultat, selectedCadreId),
    [cadresResultat, selectedCadreId]
  )

  const indicateursForCadre = useMemo(() => {
    if (!selectedCadre) return []

    const filtered = filterIndicateursForCadreResultat(
      indicateursCadreResultat,
      selectedCadre,
      codeProjet
    )

    const currentIndicateurId = resolveIndicateurIopId(indicateur)
    if (
      currentIndicateurId == null ||
      filtered.some((item) => item.id_indicateur_cr_iop === currentIndicateurId)
    ) {
      return filtered
    }

    const populatedIndicateur =
      indicateur?.indicateur_iop ??
      (indicateur?.resultat_cmr != null &&
      typeof indicateur.resultat_cmr === 'object' &&
      'id_indicateur_cr_iop' in indicateur.resultat_cmr
        ? (indicateur.resultat_cmr as unknown as IndicateurCadreResultat)
        : null)

    if (populatedIndicateur && typeof populatedIndicateur === 'object') {
      return [...filtered, populatedIndicateur]
    }

    return filtered
  }, [indicateursCadreResultat, selectedCadre, codeProjet, indicateur])

  const savedCadreLabel = useMemo(() => {
    if (!indicateur) return null
    const cadreId = resolveCadreIdForIndicateurCmrProjet(indicateur, cadresResultat)
    const cadre = cadresResultat.find((item) => item.id_cr === cadreId)
    if (cadre) return `${cadre.code_cr} — ${cadre.intutile_cr}`
    return resolveResultatCmrProjetLabel(indicateur.resultat_cmr) || null
  }, [indicateur, cadresResultat])

  const referentielOptions = useMemo(
    () =>
      buildDictionnaireIndicateurSelectOptions(
        dictionnaires,
        resolveReferentielCmrId(indicateur)
      ),
    [dictionnaires, indicateur]
  )

  const cadreResultatOptions = useMemo(
    () =>
      buildCadreResultatSelectOptions(
        cadresResultatForNiveau,
        resolveCadreIdForIndicateurCmrProjet(indicateur, cadresResultat),
        savedCadreLabel
      ),
    [cadresResultatForNiveau, indicateur, cadresResultat, savedCadreLabel]
  )

  const indicateurCadreResultatOptions = useMemo(
    () =>
      buildIndicateurCadreResultatSelectOptions(
        indicateursForCadre,
        resolveIndicateurIopId(indicateur),
        indicateur ? resolveIndicateurIopLabel(indicateur.indicateur_iop ?? indicateur.resultat_cmr) : null
      ),
    [indicateursForCadre, indicateur]
  )

  const formConfig = useMemo(
    () =>
      getIndicateurCmrProjetFormConfigForDialog({
        referentielOptions,
        isLoadingReferentiels,
        cadreResultatOptions,
        indicateurCadreResultatOptions,
        resultatFieldLabel: niveauLibelle,
        indicateurFieldDisabled: selectedCadreId == null,
      }),
    [
      referentielOptions,
      isLoadingReferentiels,
      cadreResultatOptions,
      indicateurCadreResultatOptions,
      niveauLibelle,
      selectedCadreId,
    ]
  )

  const defaultValues = useMemo(
    () => indicateurCmrProjetToFormValues(indicateur, cadresResultat),
    [indicateur, cadresResultat]
  )

  const handleFieldChange = (fieldName: string, value: unknown) => {
    if (fieldName !== 'resultat_cmr') return

    const nextCadreId =
      value === '' || value == null || value === 0 ? null : Number(value)

    setSelectedCadreId(Number.isFinite(nextCadreId) ? nextCadreId : null)
    formRef.current?.setValue('indicateur_iop', null)
  }

  const onSubmit = (data: IndicateurCmrProjetCreateData) => {
    const payload = {
      ...data,
      referentiel_cmr: data.referentiel_cmr ?? null,
      code_projet: codeProjet,
    }

    const callbacks = {
      onSuccess: () => {
        toast.success(
          isEditing ? 'Indicateur CMR mis à jour' : 'Indicateur CMR créé'
        )
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

    if (isEditing && indicateur) {
      updateMutation.mutate(
        { id: indicateur.id_ref_ind_cmr, data: payload },
        callbacks
      )
      return
    }

    createMutation.mutate(payload, callbacks)
  }

  return (
    <DynamicForm
      ref={formRef}
      key={`${indicateur?.id_ref_ind_cmr ?? 'new'}-${niveauId}`}
      config={formConfig}
      schema={indicateurCmrProjetCreateSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      onFieldChange={handleFieldChange}
      submitText={isEditing ? 'Modifier' : 'Créer'}
      loadingText='Enregistrement…'
      isLoading={createMutation.isPending || updateMutation.isPending}
      onCancel={onClose}
      cancelText='Annuler'
    />
  )
}
