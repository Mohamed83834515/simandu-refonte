import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { DynamicForm, type DynamicFormHandle } from '@/Global/Forms/DynamicForm'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { getIndicateurCmrProgrammeFormConfigForDialog } from '@/simadou/allfieldsConfig/indicateurCmrForm'
import type { IndicateurCmr } from '@/simadou/allTypes'
import type { CadreStrategique } from '@/simadou/allTypes/cadreStrategique'
import type { IndicateurStrategique } from '@/simadou/allTypes/indicateurStrategique'
import {
  indicateurCmrProgrammeCreateSchema,
  type IndicateurCmrProgrammeCreateData,
} from '@/simadou/schemas/indicateurCmrProgrammeSchemas'
import {
  useCreateIndicateurCmr,
  useUpdateIndicateurCmr,
} from '@/simadou/allHooks/admin/indicateurCmrHooks'
import { useGetDictionnaireIndicateurs } from '@/simadou/allHooks/admin/dictionnaireIndicateurHooks'
import {
  buildCadreStrategiqueSelectOptions,
  filterCadresStrategiqueByNiveau,
  resolveCadreStrategiqueById,
} from '@/simadou/lib/cadreStrategiqueUtils'
import {
  buildIndicateurStrategiqueSelectOptions,
  filterIndicateursStrategiqueForCadreStrategique,
} from '@/simadou/allfonctionalities/politique/indicateurs-strategique/indicateurStrategiqueFormUtils'
import {
  buildDictionnaireIndicateurSelectOptions,
  indicateurCmrProgrammeToFormValues,
  resolveCadreIdForIndicateurCmr,
  resolveIndicateurStrategiqueId,
  resolveReferentielCmrId,
  resolveResultatCmrLabel,
} from './indicateurCmrFormUtils'

export default function IndicateurCmrFormPanel({
  indicateur,
  codeProgramme,
  niveauId,
  niveauLibelle,
  cadresStrategiques,
  indicateursStrategiques,
  onClose,
  onSuccess,
}: {
  indicateur?: IndicateurCmr | null
  codeProgramme: string
  niveauId: number
  niveauLibelle: string
  cadresStrategiques: CadreStrategique[]
  indicateursStrategiques: IndicateurStrategique[]
  onClose: () => void
  onSuccess: () => void
}) {
  const isEditing = !!indicateur
  const formRef = useRef<DynamicFormHandle>(null)
  const createMutation = useCreateIndicateurCmr()
  const updateMutation = useUpdateIndicateurCmr()
  const { data: dictionnaires = [], isLoading: isLoadingReferentiels } =
    useGetDictionnaireIndicateurs()

  const [selectedCadreId, setSelectedCadreId] = useState<number | null>(() =>
    resolveCadreIdForIndicateurCmr(indicateur, cadresStrategiques)
  )

  useEffect(() => {
    setSelectedCadreId(
      resolveCadreIdForIndicateurCmr(indicateur, cadresStrategiques)
    )
  }, [indicateur, cadresStrategiques])

  const cadresStrategiquesForNiveau = useMemo(
    () => filterCadresStrategiqueByNiveau(cadresStrategiques, niveauId),
    [cadresStrategiques, niveauId]
  )

  const selectedCadre = useMemo(
    () => resolveCadreStrategiqueById(cadresStrategiques, selectedCadreId),
    [cadresStrategiques, selectedCadreId]
  )

  const indicateursForCadre = useMemo(() => {
    if (!selectedCadre) return []

    const filtered = filterIndicateursStrategiqueForCadreStrategique(
      indicateursStrategiques,
      selectedCadre,
      codeProgramme
    )

    const currentIndicateurId = resolveIndicateurStrategiqueId(indicateur)
    if (
      currentIndicateurId == null ||
      filtered.some((item) => item.id_indicateur_str === currentIndicateurId)
    ) {
      return filtered
    }

    const populatedIndicateur =
      indicateur?.resultat_cmr != null &&
      typeof indicateur.resultat_cmr === 'object' &&
      'id_indicateur_str' in indicateur.resultat_cmr
        ? (indicateur.resultat_cmr as IndicateurStrategique)
        : null

    if (populatedIndicateur) {
      return [...filtered, populatedIndicateur]
    }

    return filtered
  }, [indicateursStrategiques, selectedCadre, codeProgramme, indicateur])

  const savedCadreLabel = useMemo(() => {
    if (!indicateur) return null
    const cadreId = resolveCadreIdForIndicateurCmr(indicateur, cadresStrategiques)
    const cadre = cadresStrategiques.find((item) => item.id_cs === cadreId)
    if (cadre) return `${cadre.code_cs} — ${cadre.intutile_cs}`
    return null
  }, [indicateur, cadresStrategiques])

  const referentielOptions = useMemo(
    () =>
      buildDictionnaireIndicateurSelectOptions(
        dictionnaires,
        resolveReferentielCmrId(indicateur)
      ),
    [dictionnaires, indicateur]
  )

  const cadreStrategiqueOptions = useMemo(
    () =>
      buildCadreStrategiqueSelectOptions(
        cadresStrategiquesForNiveau,
        resolveCadreIdForIndicateurCmr(indicateur, cadresStrategiques),
        savedCadreLabel
      ),
    [
      cadresStrategiquesForNiveau,
      indicateur,
      cadresStrategiques,
      savedCadreLabel,
    ]
  )

  const indicateurStrategiqueOptions = useMemo(
    () =>
      buildIndicateurStrategiqueSelectOptions(
        indicateursForCadre,
        resolveIndicateurStrategiqueId(indicateur),
        indicateur ? resolveResultatCmrLabel(indicateur.resultat_cmr) : null
      ),
    [indicateursForCadre, indicateur]
  )

  const formConfig = useMemo(
    () =>
      getIndicateurCmrProgrammeFormConfigForDialog({
        referentielOptions,
        isLoadingReferentiels,
        cadreStrategiqueOptions,
        indicateurStrategiqueOptions,
        resultatFieldLabel: niveauLibelle,
        indicateurFieldDisabled: selectedCadreId == null,
      }),
    [
      referentielOptions,
      isLoadingReferentiels,
      cadreStrategiqueOptions,
      indicateurStrategiqueOptions,
      niveauLibelle,
      selectedCadreId,
    ]
  )

  const defaultValues = useMemo(
    () => indicateurCmrProgrammeToFormValues(indicateur, cadresStrategiques),
    [indicateur, cadresStrategiques]
  )

  const handleFieldChange = (fieldName: string, value: unknown) => {
    if (fieldName !== 'resultat_cmr') return

    const nextCadreId =
      value === '' || value == null || value === 0 ? null : Number(value)

    setSelectedCadreId(Number.isFinite(nextCadreId) ? nextCadreId : null)
    formRef.current?.setValue('indicateur_istr', null)
  }

  const onSubmit = (data: IndicateurCmrProgrammeCreateData) => {
    const payload = {
      ...data,
      referentiel_cmr: data.referentiel_cmr ?? null,
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
      updateMutation.mutate({ id: indicateur.id_ref_ind_cmr, data: payload }, callbacks)
      return
    }

    createMutation.mutate(payload, callbacks)
  }

  return (
    <DynamicForm
      ref={formRef}
      key={`${indicateur?.id_ref_ind_cmr ?? 'new'}-${niveauId}`}
      config={formConfig}
      schema={indicateurCmrProgrammeCreateSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      onFieldChange={handleFieldChange}
      submitText={isEditing ? 'Mettre à jour' : 'Ajouter'}
      loadingText='Enregistrement…'
      isLoading={createMutation.isPending || updateMutation.isPending}
      onCancel={onClose}
      cancelText='Annuler'
    />
  )
}
