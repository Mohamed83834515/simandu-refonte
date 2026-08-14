import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { StepDynamicForm } from '@/Global/Forms/StepDynamicForm'
import { DIALOG_SIZES } from '@/Global/Forms/dialog'
import {
  useGetCadresAnalytique,
  useGetNiveauxCadreAnalytique,
} from '@/simadou/allHooks/admin/cadreAnalytiqueHooks'
import { usePtbaVersionSelection } from '@/simadou/allHooks/admin/versionHooks'
import ptbaService from '@/simadou/allSercices/ptbaService'
import { type Ptba } from '@/simadou/allTypes/entities'
import { getPtbaFormConfig } from '@/simadou/allfieldsConfig/ptbaForm'
import {
  buildCadreAnalytiqueSelectOptions,
  getNiveauCadreAnalytiqueLibelle,
} from '@/simadou/lib/cadreAnalytiqueUtils'
import {
  buildCadreStrategiqueSelectOptions,
  filterCadresStrategiqueByNiveau,
  sortNiveauxCadreStrategique,
} from '@/simadou/lib/cadreStrategiqueUtils'
import {
  resolveCadreAnalytiqueFormValue,
  resolveCodeCrpFormValue,
  resolveResponsablePtbaFormValue,
  resolveTypeActiviteFormValue,
  resolveUglPtbaFormValue,
  resolveVersionPtbaFormValue,
} from '@/simadou/lib/ptbaFormUtils'
import { resolveRelationId } from '@/simadou/lib/resolveApiRelation'
import { type PtbaFormData, ptbaSchema } from '@/simadou/schemas/ptbaSchemas'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { useActiveProgrammeCode } from '@/hooks/use-active-programme'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useGetTypeActivites } from '@/simadou/allHooks/admin/typeActivitesHooks'
import { useGetLocalites } from '@/simadou/allHooks/admin/localiteHooks'
import { useGetPersonnels } from '@/simadou/allHooks/admin/personnelHooks'
import {
  useGetCadreStrategiques,
  useGetNiveauxCadreStrategique,
} from '@/simadou/allHooks/admin/cadreStrategiqueHooks'
import { useGetUgls } from '@/simadou/allHooks/admin/uglHooks'
import { useGetAllPlansSite } from '@/simadou/allHooks/admin/planSiteHooks'

export interface OpenPropsPTBA {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Ptba | null
}

function isLocaliteArray(
  value: unknown
): value is Array<{ id_loca: number }> {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === 'object' &&
    value[0] !== null &&
    'id_loca' in value[0]
  )
}

function isActeurArray(
  value: unknown
): value is Array<{ id_acteur: number }> {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === 'object' &&
    value[0] !== null &&
    'id_acteur' in value[0]
  )
}

function isPlanSiteArray(
  value: unknown
): value is Array<{ id_ds: number }> {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === 'object' &&
    value[0] !== null &&
    'id_ds' in value[0]
  )
}

function resolvePartenaireIds(value: unknown): number[] {
  if (isPlanSiteArray(value)) {
    return value.map((p) => p.id_ds).filter((id): id is number => id != null)
  }
  if (isActeurArray(value)) {
    return value
      .map((p) => p.id_acteur)
      .filter((id): id is number => id != null)
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'number') return item
        return resolveRelationId(item, 'id_ds') ?? resolveRelationId(item, 'id_acteur')
      })
      .filter((id): id is number => id != null && id > 0)
  }
  if (typeof value === 'number' && value > 0) return [value]
  return []
}

function resolveLocaliteIds(value: unknown): number[] {
  if (isLocaliteArray(value)) {
    return value.map((l) => l.id_loca).filter((id): id is number => id != null)
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'number') return item
        return resolveRelationId(item, 'id_loca')
      })
      .filter((id): id is number => id != null && id > 0)
  }
  if (typeof value === 'number' && value > 0) return [value]
  return []
}

const AddPtba = ({ open, onOpenChange, currentRow }: OpenPropsPTBA) => {
  const isEdit = !!currentRow?.id_ptba
  const codeProgramme = useActiveProgrammeCode()
  const { selectedVersionId } = usePtbaVersionSelection(codeProgramme)
  const { data: cadresAnalytique = [] } = useGetCadresAnalytique()
  const { data: niveaux = [] } = useGetNiveauxCadreAnalytique()
  const { data: types_activites = [] } = useGetTypeActivites()
  const { data: localites = [] } = useGetLocalites()
  const { data: planSites = [] } = useGetAllPlansSite()
  const { data: personnels = [] } = useGetPersonnels()
  const { data: cadres_strategiques = [] } = useGetCadreStrategiques()
  const { data: niveauxCs = [] } = useGetNiveauxCadreStrategique()
  const { data: ugls = [] } = useGetUgls()

  const [selectedPlanSiteIds, setSelectedPlanSiteIds] = useState<number[]>([])

  const highestCaNiveau = useMemo(() => {
    if (!niveaux.length) return null
    return niveaux.reduce((max, current) =>
      Number(current.nombre_nca) > Number(max.nombre_nca) ? current : max
    )
  }, [niveaux])

  const highestCaNiveauId = highestCaNiveau?.id_nca ?? null
  const highestCaNiveauCode = highestCaNiveau
    ? Number(highestCaNiveau.nombre_nca)
    : null

  const highestCsNiveau = useMemo(() => {
    const sorted = sortNiveauxCadreStrategique(niveauxCs)
    if (!sorted.length) return null
    return sorted[sorted.length - 1]
  }, [niveauxCs])

  const selectedCadreId = useMemo(
    () =>
      resolveCadreAnalytiqueFormValue(
        currentRow?.cadre_analytique,
        cadresAnalytique
      ),
    [currentRow?.cadre_analytique, cadresAnalytique]
  )

  const cadreAnalytiqueOptions = useMemo(
    () =>
      buildCadreAnalytiqueSelectOptions(cadresAnalytique, {
        niveauCodeNumber: highestCaNiveauId ?? undefined,
        includeCadreIds: selectedCadreId ? [selectedCadreId] : [],
      }),
    [cadresAnalytique, highestCaNiveauId, selectedCadreId]
  )

  const cadreAnalytiqueLabel = useMemo(() => {
    if (highestCaNiveau?.libelle_nca) return highestCaNiveau.libelle_nca
    if (highestCaNiveauCode == null) return 'Cadre analytique'
    return (
      getNiveauCadreAnalytiqueLibelle(niveaux, highestCaNiveauCode) ||
      'Cadre analytique'
    )
  }, [highestCaNiveau, highestCaNiveauCode, niveaux])

  const typeActivitesOptions = useMemo(() => {
    if (!types_activites || types_activites.length === 0) return []
    return types_activites
      .filter((item) => item?.code_type != null)
      .map((item: any) => ({
        label: item.intutile_type || 'Sans nom',
        value: String(item.code_type),
      }))
  }, [types_activites])

  const localiteOptions = useMemo(() => {
    if (!localites || localites.length === 0) return []
    return localites
      .filter((localite) => {
        if (!localite) return false
        if (typeof localite.niveau_loca === 'object' && localite.niveau_loca !== null) {
          return localite.niveau_loca.nombre_nlc === 1
        }
        return localite.niveau_loca === 1
      })
      .map((localite) => ({
        value: localite.id_loca as number,
        label: localite.intitule_loca || 'Sans nom',
      }))
  }, [localites])

  const planSiteOptions = useMemo(() => {
    if (!planSites || planSites.length === 0) return []
    return planSites
      .filter((plan) => plan?.id_ds != null)
      .map((plan) => ({
        value: plan.id_ds as number,
        label: plan.intutile_ds || plan.code_ds || 'Sans nom',
      }))
  }, [planSites])

  const personnelOptions = useMemo(() => {
    if (!personnels || personnels.length === 0) return []
    return personnels
      .filter((p) => {
        if (p?.n_personnel == null) return false
        if (selectedPlanSiteIds.length === 0) return false
        const serviceId = resolveRelationId(p.service_perso, 'id_ds')
        return serviceId != null && selectedPlanSiteIds.includes(serviceId)
      })
      .map((p) => ({
        value: p.n_personnel!,
        label: `${p.prenom_perso || ''} ${p.nom_perso || ''}`.trim() || 'Sans nom',
      }))
  }, [personnels, selectedPlanSiteIds])

  const uglOptions = useMemo(() => {
    if (!ugls || ugls.length === 0) return []
    return ugls
      .filter((ugl) => ugl?.code_ugl != null)
      .map((ugl) => ({
        value: ugl.code_ugl,
        label: ugl.nom_ugl || 'Sans nom',
      }))
  }, [ugls])

  const selectedCodeCrp = useMemo(
    () => resolveCodeCrpFormValue(currentRow?.code_crp),
    [currentRow?.code_crp]
  )

  const cadreStrategiqueOptions = useMemo(() => {
    const lastNiveauId = highestCsNiveau?.id_nsc
    const scoped =
      lastNiveauId != null
        ? filterCadresStrategiqueByNiveau(cadres_strategiques, lastNiveauId)
        : cadres_strategiques

    const currentLabel =
      selectedCodeCrp != null
        ? cadres_strategiques.find((c) => c.id_cs === selectedCodeCrp)
        : null

    return buildCadreStrategiqueSelectOptions(
      scoped,
      selectedCodeCrp,
      currentLabel
        ? `${currentLabel.code_cs} — ${currentLabel.intutile_cs}`
        : undefined
    )
  }, [cadres_strategiques, highestCsNiveau, selectedCodeCrp])

  const cadreStrategiqueLabel =
    highestCsNiveau?.libelle_nsc || 'Cadre stratégique'

  const formConfig = useMemo(
    () =>
      getPtbaFormConfig(
        cadreAnalytiqueOptions,
        typeActivitesOptions,
        localiteOptions,
        planSiteOptions,
        personnelOptions,
        uglOptions,
        cadreStrategiqueOptions,
        {
          cadreAnalytique: cadreAnalytiqueLabel,
          cadreStrategique: cadreStrategiqueLabel,
        }
      ),
    [
      cadreAnalytiqueOptions,
      typeActivitesOptions,
      localiteOptions,
      planSiteOptions,
      personnelOptions,
      uglOptions,
      cadreStrategiqueOptions,
      cadreAnalytiqueLabel,
      cadreStrategiqueLabel,
    ]
  )

  const defaultValues = useMemo(
    (): PtbaFormData => ({
      localites_ptba: resolveLocaliteIds(currentRow?.localites_ptba),
      partenaire_conserne_ptba: resolvePartenaireIds(
        currentRow?.partenaire_conserne_ptba
      ),
      code_activite_ptba: currentRow?.code_activite_ptba || '',
      intitule_activite_ptba: currentRow?.intitule_activite_ptba || '',
      chronogramme: currentRow?.chronogramme || '',
      observation: currentRow?.observation || '',
      code_crp: resolveCodeCrpFormValue(currentRow?.code_crp),
      cadre_analytique: resolveCadreAnalytiqueFormValue(
        currentRow?.cadre_analytique,
        cadresAnalytique
      ),
      responsable_ptba: resolveResponsablePtbaFormValue(
        currentRow ?? undefined
      ),
      ugl_ptba: resolveUglPtbaFormValue(currentRow ?? undefined),
      version_ptba:
        resolveVersionPtbaFormValue(
          currentRow ?? undefined,
          selectedVersionId
        ) ?? 0,
      code_programme: currentRow?.code_programme || codeProgramme,
      statut_activite: currentRow?.statut_activite || 'En construction',
      type_activite: resolveTypeActiviteFormValue(currentRow?.type_activite),
    }),
    [currentRow, codeProgramme, selectedVersionId, cadresAnalytique]
  )

  useEffect(() => {
    if (!open) return
    setSelectedPlanSiteIds(defaultValues.partenaire_conserne_ptba ?? [])
  }, [open, defaultValues.partenaire_conserne_ptba])

  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (data: PtbaFormData) =>
      isEdit && currentRow?.id_ptba
        ? ptbaService.update(currentRow.id_ptba, data)
        : ptbaService.create(data),

    onSuccess: async () => {
      toast.success(
        isEdit ? 'Activité modifiée avec succès' : 'Activité créée avec succès'
      )
      await queryClient.invalidateQueries({
        queryKey: ['ptba-activites-all'],
      })
      onOpenChange(false)
    },

    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          isEdit
            ? 'Erreur lors de la modification'
            : 'Erreur lors de la création'
        )
      )
    },
  })

  const onSubmit = (data: PtbaFormData) => {
    const versionPtba =
      resolveVersionPtbaFormValue(currentRow ?? undefined, selectedVersionId) ??
      (data.version_ptba > 0 ? data.version_ptba : undefined)

    if (!versionPtba) {
      toast.error(
        "Sélectionnez une version PTBA dans la liste avant d'ajouter une activité."
      )
      return
    }

    mutation.mutate({
      ...data,
      version_ptba: versionPtba,
      code_programme: data.code_programme?.trim() || codeProgramme,
      ugl_ptba: data.ugl_ptba?.trim() || undefined,
      observation: data.observation?.trim() || undefined,
    })
  }

  const handleFieldChange = (fieldName: string, value: unknown) => {
    if (fieldName === 'partenaire_conserne_ptba') {
      const ids = Array.isArray(value)
        ? value
            .map((v) => (typeof v === 'number' ? v : Number(v)))
            .filter((id) => Number.isFinite(id) && id > 0)
        : []
      setSelectedPlanSiteIds(ids)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={DIALOG_SIZES.xl}>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Modifier une Activité' : 'Ajouter une Activité'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modification de l'activité existante"
              : "Création d'une nouvelle activité"}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-2 -mr-2">
          <StepDynamicForm
            key={`${currentRow?.id_ptba ?? 'new'}-${open}`}
            config={formConfig}
            schema={ptbaSchema}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            isLoading={mutation.isPending}
            submitText={isEdit ? 'Modifier' : 'Ajouter'}
            loadingText={isEdit ? 'Modification...' : 'Ajout en cours...'}
            onFieldChange={handleFieldChange}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AddPtba
