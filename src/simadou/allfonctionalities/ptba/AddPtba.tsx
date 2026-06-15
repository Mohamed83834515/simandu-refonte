import { useMemo } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DIALOG_SIZES } from "@/Global/Forms/dialog"
import { StepDynamicForm } from "@/Global/Forms/StepDynamicForm"
import { getApiErrorMessage } from "@/lib/api-error-message"
import { useActiveProgrammeCode, useActiveProgrammeId } from "@/hooks/use-active-programme"
import { usePtbaVersionSelection } from "@/simadou/allHooks/admin/versionHooks"
import { getPtbaFormConfig } from "@/simadou/allfieldsConfig/ptbaForm"
import {
  useGetCadresAnalytique,
  useGetNiveauxCadreAnalytique,
} from "@/simadou/allHooks/admin/cadreAnalytiqueHooks"
import {
  buildCadreAnalytiqueSelectOptions,
  filterNiveauxByProgramme,
  getPtbaCadreAnalytiqueNiveauCode,
  sortNiveauxCadreAnalytique,
} from "@/simadou/lib/cadreAnalytiqueUtils"
import ptbaService from "@/simadou/allSercices/ptbaService"
import { Acteur, Localite, Ptba } from "@/simadou/allTypes/entities"
import {
  resolveCadreAnalytiqueFormValue,
  resolveCodeCrpFormValue,
  resolveResponsablePtbaFormValue,
  resolveTypeActiviteFormValue,
  resolveUglPtbaFormValue,
  resolveVersionPtbaFormValue,
} from "@/simadou/lib/ptbaFormUtils"
import { PtbaFormData, ptbaSchema } from "@/simadou/schemas/ptbaSchemas"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {toast} from "sonner"
export interface OpenPropsPTBA {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: Ptba | null;
}
const AddPtba = ({ open, onOpenChange, currentRow }: OpenPropsPTBA) => {
  const isEdit = !!currentRow?.id_ptba
  const codeProgramme = useActiveProgrammeCode();
  const programmeId = useActiveProgrammeId()
  const { selectedVersionId } = usePtbaVersionSelection(codeProgramme)
  const { data: cadresAnalytique = [] } = useGetCadresAnalytique(programmeId)
  const { data: niveaux = [] } = useGetNiveauxCadreAnalytique()

  const ptbaNiveauCode = useMemo(() => {
    const sortedNiveaux = sortNiveauxCadreAnalytique(
      filterNiveauxByProgramme(niveaux, codeProgramme, programmeId)
    )
    return getPtbaCadreAnalytiqueNiveauCode(sortedNiveaux)
  }, [niveaux, codeProgramme, programmeId])

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
        niveauCodeNumber: ptbaNiveauCode,
        includeCadreIds: selectedCadreId ? [selectedCadreId] : [],
      }),
    [cadresAnalytique, ptbaNiveauCode, selectedCadreId]
  )
  const formConfig = useMemo(
    () => getPtbaFormConfig(cadreAnalytiqueOptions),
    [cadreAnalytiqueOptions]
  )
  const defaultValues = useMemo((): PtbaFormData => ({
    localites_ptba:
      typeof currentRow?.localites_ptba === "object"
        ? (currentRow?.localites_ptba as Localite[]).map(l => l.id_loca)
        : [],

    partenaire_conserne_ptba:
      typeof currentRow?.partenaire_conserne_ptba === "object"
        ? (currentRow?.partenaire_conserne_ptba as Acteur[]).map(p => p.id_acteur)
        : [],

    code_activite_ptba: currentRow?.code_activite_ptba || "",
    intitule_activite_ptba: currentRow?.intitule_activite_ptba || "",

    chronogramme: currentRow?.chronogramme || "",
    observation: currentRow?.observation || "",

    code_crp: resolveCodeCrpFormValue(currentRow?.code_crp),

    cadre_analytique: resolveCadreAnalytiqueFormValue(
      currentRow?.cadre_analytique,
      cadresAnalytique
    ),

    responsable_ptba: resolveResponsablePtbaFormValue(currentRow ?? undefined),
    ugl_ptba: resolveUglPtbaFormValue(currentRow ?? undefined),

    version_ptba:
      resolveVersionPtbaFormValue(currentRow ?? undefined, selectedVersionId) ??
      0,

    code_programme: currentRow?.code_programme || codeProgramme,

    statut_activite: currentRow?.statut_activite || "En construction",

    type_activite: resolveTypeActiviteFormValue(currentRow?.type_activite),
  }), [currentRow, codeProgramme, selectedVersionId, cadresAnalytique])
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (data: PtbaFormData) =>
      isEdit && currentRow?.id_ptba
        ? ptbaService.update(currentRow.id_ptba, data)
        : ptbaService.create(data),

    onSuccess: async () => {
      toast.success(
        isEdit
          ? "Activité modifiée avec succès"
          : "Activité créée avec succès"
      )
      await queryClient.invalidateQueries({
      queryKey: ["ptba-activites-all"],
    })
      onOpenChange(false)
    },

    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          isEdit
            ? "Erreur lors de la modification"
            : "Erreur lors de la création"
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={DIALOG_SIZES.xl}>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Modifier une Activité" : "Ajouter une Activité"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modification de l'activité existante"
              : "Création d'une nouvelle activité"}
          </DialogDescription>
        </DialogHeader>

        <StepDynamicForm
          key={`${currentRow?.id_ptba ?? "new"}-${open}`}
          config={formConfig}
          schema={ptbaSchema}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          isLoading={mutation.isPending}
          submitText={isEdit ? "Modifier" : "Ajouter"}
          loadingText={isEdit ? "Modification..." : "Ajout en cours..."}
        />
      </DialogContent>
    </Dialog>
  )
}

export default AddPtba