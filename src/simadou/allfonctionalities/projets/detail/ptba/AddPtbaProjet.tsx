import { useMemo } from 'react'
import { toast } from 'sonner'
import { useGetActeurs } from '@/simadou/allHooks/admin/acteurHooks'
import { useGetLocalites } from '@/simadou/allHooks/admin/sharedHooks'
import { useGetPersonnels } from '@/simadou/allHooks/admin/personnelHooks'
import { useGetTypeActivites } from '@/simadou/allHooks/admin/typeActivitesHooks'
import { useGetUgls } from '@/simadou/allHooks/admin/uglHooks'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DIALOG_SIZES } from '@/Global/Forms/dialog'
import type { SelectOption } from '@/Global/types/formConfig'
import { StepDynamicForm } from '@/Global/Forms/StepDynamicForm'
import {
  getPtbaProjetFormConfig,
  resolveActiviteProjetId,
} from '@/simadou/allfieldsConfig/ptbaProjetForm'
import type { ActiviteProjet, Projet } from '@/simadou/allTypes'
import type { PtbaProjet } from '@/simadou/allTypes/ptbaProjet'
import { Localite } from '@/simadou/allTypes/localite'
import type { Acteur } from '@/simadou/allTypes/acteur'
import {
  ptbaProjetSchema,
  type PtbaProjetFormData,
} from '@/simadou/schemas/ptbaProjetSchemas'
import { useGetActivitesProjetLastNiveau } from '@/simadou/allHooks/admin/activiteProjetHooks'
import {
  resolveResponsablePtbaFormValue,
  resolveUglPtbaFormValue,
  resolveVersionPtbaFormValue,
} from '@/simadou/lib/ptbaFormUtils'
import {
  useActiveProgrammeCode,
} from '@/hooks/use-active-programme'
import {
  useCreatePtbaProjet,
  useUpdatePtbaProjet,
} from '@/simadou/allHooks/admin/ptbaProjetHooks'
import { usePtbaVersionSelection } from '@/simadou/allHooks/admin/versionHooks'

export type AddPtbaProjetProps = {
  projet: Projet
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: PtbaProjet | null
}

export default function AddPtbaProjet({
  projet,
  open,
  onOpenChange,
  currentRow,
}: AddPtbaProjetProps) {
  const codeProjet = projet.code_projet
  const isEdit = !!currentRow?.id_ptba
  const activeProgrammeCode = useActiveProgrammeCode()
  const codeProgramme =
    typeof projet.programme_projet === 'object' &&
    projet.programme_projet?.code_programme
      ? projet.programme_projet.code_programme
      : activeProgrammeCode
  const {  selectedVersionId} = usePtbaVersionSelection(codeProgramme)
  const reel_version = localStorage.getItem('selectedVersionId') ?? selectedVersionId 
  const { data: activites = [] } = useGetActivitesProjetLastNiveau(codeProjet)
  const { data: acteurs = [] } = useGetActeurs()
  const { data: localites = [] } = useGetLocalites()
  const { data: personnels = [] } = useGetPersonnels()
  const { data: ugls = [] } = useGetUgls()
  const { data: typeActivites = [] } = useGetTypeActivites()

  const activiteOptions = useMemo((): SelectOption[] =>
    activites?.map((activite: ActiviteProjet) => ({
      value: activite.id_activite_projet,
      label: `${activite.code_activite_projet} — ${activite.intitule_activite_projet}`,
    })),
    [activites]
  )

  const formConfig = useMemo(
    () =>
      getPtbaProjetFormConfig(
        activiteOptions,
        localites,
        acteurs,
        personnels,
        ugls,
        typeActivites
      ),
    [activiteOptions, localites, acteurs, personnels, ugls, typeActivites]
  )

  const defaultValues = useMemo((): PtbaProjetFormData => {
    return {
      code_actvite_projet:
        resolveActiviteProjetId(currentRow?.code_actvite_projet) ?? 0,
      localites_ptba:
        typeof currentRow?.localites_ptba === 'object'
          ? (currentRow.localites_ptba as Localite[]).map((l) => l.id_loca)
          : [],
      partenaire_conserne_ptba:
        typeof currentRow?.partenaire_conserne_ptba === 'object'
          ? (currentRow.partenaire_conserne_ptba as Acteur[]).map(
              (p) => p.id_acteur
            )
          : [],
      code_activite_ptba: currentRow?.code_activite_ptba || '',
      intitule_activite_ptba: currentRow?.intitule_activite_ptba || '',
      chronogramme: currentRow?.chronogramme || '',
      observation: currentRow?.observation || '',
      responsable_ptba: resolveResponsablePtbaFormValue(currentRow ?? undefined),
      ugl_ptba: resolveUglPtbaFormValue(currentRow ?? undefined),
      code_projet: codeProjet,
      statut_activite: currentRow?.statut_activite || 'Planifiée',
      version_ptba:
        resolveVersionPtbaFormValue(currentRow ?? undefined, reel_version) ??
        0,
    }
  }, [currentRow, codeProjet, reel_version])

  const createMutation = useCreatePtbaProjet(codeProjet)
  const updateMutation = useUpdatePtbaProjet(codeProjet)

  const onSubmit = (data: PtbaProjetFormData) => {
    const versionPtba =
      resolveVersionPtbaFormValue(currentRow ?? undefined, reel_version) ??
      (data.version_ptba != null && data.version_ptba > 0
        ? data.version_ptba
        : undefined)

    if (!versionPtba) {
      toast.error(
        "Sélectionnez une version PTBA dans la liste avant d'ajouter une activité."
      )
      return
    }

    const payload: PtbaProjetFormData = {
      ...data,
      code_projet: codeProjet,
      version_ptba: versionPtba,
      observation: data.observation?.trim() || undefined,
      ugl_ptba: data.ugl_ptba?.trim() || undefined,
    }

    const mutationOptions = {
      onSuccess: () => onOpenChange(false),
    }

    if (isEdit && currentRow?.id_ptba) {
      updateMutation.mutate(
        { id: currentRow.id_ptba, data: payload },
        mutationOptions
      )
    } else {
      createMutation.mutate(payload, mutationOptions)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={DIALOG_SIZES.xl}>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Modifier une activité PTBA' : 'Ajouter une activité PTBA'} {reel_version}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modification de l'activité PTBA rattachée au projet"
              : 'Création d\'une activité PTBA liée à une activité du projet'}
          </DialogDescription>
        </DialogHeader>

        <StepDynamicForm
          key={`${currentRow?.id_ptba ?? 'new'}-${open}`}
          config={formConfig}
          schema={ptbaProjetSchema}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
          submitText={isEdit ? 'Modifier' : 'Ajouter'}
          loadingText={isEdit ? 'Modification…' : 'Ajout en cours…'}
        />
      </DialogContent>
    </Dialog>
  )
}
