import { useMemo } from 'react'
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
import { CadreAnalytique } from '@/simadou/allTypes/cadreAnalytique'
import { Localite } from '@/simadou/allTypes/localite'
import type { Acteur } from '@/simadou/allTypes/acteur'
import {
  ptbaProjetSchema,
  type PtbaProjetFormData,
} from '@/simadou/schemas/ptbaProjetSchemas'
import { useGetActivitesProjet } from '@/simadou/allHooks/admin/activiteProjetHooks'
import {
  useCreatePtbaProjet,
  useUpdatePtbaProjet,
} from '@/simadou/allHooks/admin/ptbaProjetHooks'

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
  const { data: activites = [] } = useGetActivitesProjet(codeProjet)

  const activiteOptions = useMemo((): SelectOption[] =>
    activites.map((activite: ActiviteProjet) => ({
      value: activite.id_activite_projet,
      label: `${activite.code_activite_projet} — ${activite.intitule_activite_projet}`,
    })),
    [activites]
  )

  const formConfig = useMemo(
    () => getPtbaProjetFormConfig(activiteOptions),
    [activiteOptions]
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
      code_crp: currentRow?.code_crp || '',
      cadre_analytique:
        (currentRow?.cadre_analytique as CadreAnalytique)?.code_ca || '',
      responsable_ptba:
        typeof currentRow?.responsable_ptba === 'number'
          ? currentRow.responsable_ptba
          : typeof currentRow?.responsable_ptba === 'object' &&
              currentRow.responsable_ptba
            ? (currentRow.responsable_ptba as { n_personnel?: number })
                .n_personnel
            : undefined,
      ugl_ptba:
        typeof currentRow?.ugl_ptba === 'object' && currentRow.ugl_ptba
          ? String((currentRow.ugl_ptba as { code_ugl?: string }).code_ugl ?? '')
          : typeof currentRow?.ugl_ptba === 'string'
            ? currentRow.ugl_ptba
            : '',
      code_projet: codeProjet,
      statut_activite: currentRow?.statut_activite || 'Planifiée',
    }
  }, [currentRow, codeProjet])

  const createMutation = useCreatePtbaProjet(codeProjet)
  const updateMutation = useUpdatePtbaProjet(codeProjet)

  const onSubmit = (data: PtbaProjetFormData) => {
    const payload: PtbaProjetFormData = {
      ...data,
      code_projet: codeProjet,
      code_crp: data.code_crp?.trim() || undefined,
      cadre_analytique: data.cadre_analytique?.trim() || undefined,
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
            {isEdit ? 'Modifier une activité PTBA' : 'Ajouter une activité PTBA'}
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
