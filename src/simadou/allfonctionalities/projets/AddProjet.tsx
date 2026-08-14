import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DIALOG_SIZES } from '@/Global/Forms/dialog'
import { useActiveProgrammeId } from '@/hooks/use-active-programme'
import { useGetActeurs } from '@/simadou/allHooks/admin/acteurHooks'
import { useGetLocalites } from '@/simadou/allHooks/admin/sharedHooks'
import { useMemo } from 'react'
import { getProjetFormConfig } from '@/simadou/allfieldsConfig/projetForm'
import { useCreateProjet, useUpdateProjet } from '@/simadou/allHooks/admin/projetHooks'
import { ProjectCreateData, projectCreateSchema } from '@/simadou/schemas/projetSchema'
import { toast } from 'sonner'
import { StepDynamicForm } from '@/Global/Forms/StepDynamicForm'
import { useGetUgls } from '@/simadou/allHooks/admin/uglHooks'
import { useGetProgrammes } from '@/simadou/allHooks/admin/programmeHooks'
import { useGetTypeProjet } from '@/simadou/allHooks/admin/typeProjetHooks'
import { useGetPersonnels } from '@/simadou/allHooks/admin/personnelHooks'

interface OpenPropsProjet {
  currentRow?: any | null
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddProjet({ open, onOpenChange, currentRow }: OpenPropsProjet) {
  const idProgramme = useActiveProgrammeId()
  const isEdit = !!currentRow?.id_projet

  // ── Données pour les options ──
  const { data: acteurs = [] } = useGetActeurs()
  const { data: localites = [] } = useGetLocalites()
  const { data: ugls = [] } = useGetUgls()
  const { data: programmes = [] } = useGetProgrammes()
  const { data: type_projets = [] } = useGetTypeProjet()
  const { data: personnels = [] } = useGetPersonnels()
  // ── Config du formulaire (options injectées ici, pas dans le fichier config) ──
  const formConfig = useMemo(
    () => getProjetFormConfig(acteurs, localites, ugls, programmes, type_projets, personnels),
    [acteurs, localites, ugls, programmes, type_projets, personnels]
  )

  // ── Mutations ──
  const createMutation = useCreateProjet()
  const updateMutation = useUpdateProjet(currentRow?.id_projet || 0)

  const mutation = isEdit ? updateMutation : createMutation

  // Ajoute ces helpers en haut du fichier
  const extractId = (item: any): number => {
    if (typeof item === 'number') return item
    if (item && typeof item === 'object') return item.id_acteur || item.id_loca || item.id_projet || 0
    return 0
  }
  const extractUniteId = (item: any): number => {
    if (typeof item === 'number') return item
    if (item && typeof item === 'object') return item.id_ugl || item.nom_ugl || 0
    return 0
  }
  const extracProgrammId = (item: any): number => {
    if (typeof item === 'number') return item
    if (item && typeof item === 'object') return item.id_programme || item.nom_programme || 0
    return 0
  }
  const extracPersonnelId = (item: any): number => {
    if (typeof item === 'number') return item
    if (item && typeof item === 'object') return item.n_personnel || item.id_personnel_perso || 0
    return 0
  }
  const extracTypeId = (item: any): number => {
    if (typeof item === 'number') return item
    if (item && typeof item === 'object') return item.id_type_projet || item.nom_type_projet || 0
    return 0
  }

  const extractIds = (items: any[] | undefined | null): number[] => {
    if (!Array.isArray(items)) return []
    return items.map(extractId).filter(id => id !== 0)
  }

  // ── Valeurs par défaut (create + edit) ──
  const defaultValues: ProjectCreateData = {
    code_projet: currentRow?.code_projet ?? '',
    sigle_projet: currentRow?.sigle_projet ?? '',
    intitule_projet: currentRow?.intitule_projet ?? '',
    date_signature_projet: currentRow?.date_signature_projet ?? '',
    date_demarrage_projet: currentRow?.date_demarrage_projet ?? '',
    duree_projet: currentRow?.duree_projet ?? 0,
    type_projet: extracTypeId(currentRow?.type_projet ?? 0),

    responsable_projet: extracPersonnelId(currentRow?.responsable_projet ?? 0),
    programme_projet: extracProgrammId(currentRow?.programme_projet ?? 0),
    structure_projet: extractUniteId(currentRow?.structure_projet ?? 0),
    signataires_projet: extractIds(currentRow?.signataires_projet),
    partenaires_execution_projet: extractIds(currentRow?.partenaires_execution_projet),
    zone_projet: extractIds(currentRow?.zone_projet),
    partenaire_projet: extractId(currentRow?.partenaire_projet),
  }
  // ── Soumission ──
  const handleSubmit = (data: ProjectCreateData) => {
    if (!isEdit && idProgramme == null) {
      toast.error('Sélectionnez un programme avant de créer un projet.')
      return
    }

    const payload = {
      ...data,
      structure_projet: data.structure_projet,
      signataires_projet: data.signataires_projet.map(Number),
      partenaires_execution_projet: data.partenaires_execution_projet.map(Number),
      zone_projet: data.zone_projet.map(Number),
    }
    mutation.mutate(payload, {
      onSuccess: () => {
        toast.success(isEdit ? 'Projet modifié avec succès' : 'Projet créé avec succès')
        onOpenChange(false)
      },
      onError: () =>
        toast.error(isEdit ? 'Erreur lors de la modification' : "Erreur lors de l'enregistrement"),
    })
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={DIALOG_SIZES.xl}>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Modifier le projet' : 'Ajouter un projet'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modification des informations du projet existant'
              : 'Création d\'un nouveau projet — renseignez les informations en 2 étapes'}
          </DialogDescription>
        </DialogHeader>

        <StepDynamicForm
          config={formConfig}
          schema={projectCreateSchema}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isLoading={mutation.isPending}
          submitText={isEdit ? 'Modifier' : 'Créer le projet'}
          loadingText={isEdit ? 'Modification…' : 'Enregistrement…'}
        />
      </DialogContent>
    </Dialog>
  )
}
