import { useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { StepDynamicForm } from '@/Global/Forms/StepDynamicForm'
import { DIALOG_SIZES } from '@/Global/Forms/dialog'
import {
  useGetCadresAnalytique,
  useGetNiveauxCadreAnalytique,
} from '@/simadou/allHooks/admin/cadreAnalytiqueHooks'
import { usePtbaVersionSelection } from '@/simadou/allHooks/admin/versionHooks'
import ptbaService from '@/simadou/allSercices/ptbaService'
import {
  type Acteur,
  type Localite,
  type Ptba,
} from '@/simadou/allTypes/entities'
import { getPtbaFormConfig } from '@/simadou/allfieldsConfig/ptbaForm'
import {
  buildCadreAnalytiqueSelectOptions
} from '@/simadou/lib/cadreAnalytiqueUtils'
import {
  resolveCadreAnalytiqueFormValue,
  resolveCodeCrpFormValue,
  resolveResponsablePtbaFormValue,
  resolveTypeActiviteFormValue,
  resolveUglPtbaFormValue,
  resolveVersionPtbaFormValue,
} from '@/simadou/lib/ptbaFormUtils'
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
import { useGetActeurs } from '@/simadou/allHooks/admin/acteurHooks'
import { useGetPersonnels } from '@/simadou/allHooks/admin/personnelHooks'
import { useGetCadreStrategiques } from '@/simadou/allHooks/admin/cadreStrategiqueHooks'
import { useGetUgls } from '@/simadou/allHooks/admin/uglHooks'

export interface OpenPropsPTBA {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Ptba | null
}
const AddPtba = ({ open, onOpenChange, currentRow }: OpenPropsPTBA) => {
  const isEdit = !!currentRow?.id_ptba
  const codeProgramme = useActiveProgrammeCode()
  const { selectedVersionId } = usePtbaVersionSelection(codeProgramme)
  const { data: cadresAnalytique = [] } = useGetCadresAnalytique()
  const { data: niveaux = [] } = useGetNiveauxCadreAnalytique()
  const { data: types_activites = [] } = useGetTypeActivites()
  const { data: localites = [] } = useGetLocalites()
  const { data: acteurs = [] } = useGetActeurs()
  const { data: personnels = [] } = useGetPersonnels()
  const { data: cadres_strategiques = [] } = useGetCadreStrategiques()
  const { data: ugls = [] } = useGetUgls()

  // Fonction utilitaire (hors du composant)
  const getHighestLevelId = (niveauxx: any[]) => {
    if (!niveauxx || niveauxx.length === 0) return null;

    const highestLevel = niveauxx.reduce((max, current) =>
      current.nombre_nca > max.nombre_nca ? current : max
    );

    return highestLevel.id_nca;
  };

  // Dans votre composant React
  const highestLevelId = useMemo(() => {
    return getHighestLevelId(niveaux);
  }, [niveaux]);

  console.log('ID du niveau le plus élevé:', highestLevelId);
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
        niveauCodeNumber: highestLevelId,
        includeCadreIds: selectedCadreId ? [selectedCadreId] : [],
      }),
    [cadresAnalytique, highestLevelId, selectedCadreId]
  )
  const typeActivitesOptions = useMemo(() => {
    if (!types_activites || types_activites.length === 0) return [];
    return types_activites
      .filter(item => item?.code_type != null)
      .map((item: any) => ({
        label: item.intutile_type || 'Sans nom',
        value: String(item.code_type),
      }));
  }, [types_activites]);

  const localiteOptions = useMemo(() => {
    if (!localites || localites.length === 0) return [];
    return localites
      .filter((localite) => {
        if (!localite) return false;
        if (typeof localite.niveau_loca === 'object' && localite.niveau_loca !== null) {
          return localite.niveau_loca.nombre_nlc === 1;
        }
        return localite.niveau_loca === 1;
      })
      .map((localite) => ({
        value: localite.id_loca as number,
        label: localite.intitule_loca || 'Sans nom',
      }));
  }, [localites]);

  const acteurOptions = useMemo(() => {
    if (!acteurs || acteurs.length === 0) return [];
    return acteurs
      .filter((acteur) => acteur?.id_acteur != null)
      .map((acteur) => ({
        value: acteur.id_acteur as number,
        label: acteur.nom_acteur || 'Sans nom',
      }));
  }, [acteurs]);

  const personnelOptions = useMemo(() => {
    if (!personnels || personnels.length === 0) return [];
    return personnels
      .filter(p => p?.n_personnel != null)
      .map((p) => ({
        value: p.n_personnel!,
        label: `${p.prenom_perso || ''} ${p.nom_perso || ''}`.trim() || 'Sans nom',
      }));
  }, [personnels]);

  const uglOptions = useMemo(() => {
    if (!ugls || ugls.length === 0) return [];
    return ugls
      .filter(ugl => ugl?.code_ugl != null)
      .map((ugl) => ({
        value: ugl.code_ugl,
        label: ugl.nom_ugl || 'Sans nom',
      }));
  }, [ugls]);

  const cadreStrategiqueOptions = useMemo(() => {
    if (!cadres_strategiques || cadres_strategiques.length === 0) return [];
    return cadres_strategiques
      .filter(cadre => cadre?.id_cs != null)
      .map((cadre) => ({
        value: cadre.id_cs,
        label: `${cadre.code_cs || ''} - ${cadre.intutile_cs || ''}`.trim() || 'Sans nom',
      }));
  }, [cadres_strategiques]);

  // Utilisation dans le formConfig
  const formConfig = useMemo(
    () => getPtbaFormConfig(
      cadreAnalytiqueOptions,
      typeActivitesOptions,
      localiteOptions,
      acteurOptions,
      personnelOptions,
      uglOptions,
      cadreStrategiqueOptions
    ),
    [
      cadreAnalytiqueOptions,
      typeActivitesOptions,
      localiteOptions,
      acteurOptions,
      personnelOptions,
      uglOptions,
      cadreStrategiqueOptions
    ]
  );
  const defaultValues = useMemo(
    (): PtbaFormData => ({
      localites_ptba:
        typeof currentRow?.localites_ptba === 'object'
          ? (currentRow?.localites_ptba as Localite[]).map((l) => l.id_loca)
          : [],

      partenaire_conserne_ptba:
        typeof currentRow?.partenaire_conserne_ptba === 'object'
          ? (currentRow?.partenaire_conserne_ptba as Acteur[]).map(
            (p) => p.id_acteur
          )
          : [],

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

        {/* Conteneur avec défilement */}
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
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AddPtba
