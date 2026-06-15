import type { FormConfig, SelectOption } from '@/Global/types/formConfig'
import type {
  Acteur,
  Fonction,
  Localite,
  PlanSite,
  TitrePersonnel,
} from '@/simadou/allTypes'
import { NIVEAU_ACCES_OPTIONS } from '@/simadou/schemas/personnelWriteSchema'

type PersonnelFormDeps = {
  titres: TitrePersonnel[]
  fonctions: Fonction[]
  planSites: PlanSite[]
  regions: Localite[]
  structures: Acteur[]
  isLoadingTitres?: boolean
  isLoadingFonctions?: boolean
  isLoadingPlanSites?: boolean
  isLoadingRegions?: boolean
  isLoadingStructures?: boolean
}

function mapOptions<T>(
  items: T[],
  valueKey: (item: T) => number,
  labelKey: (item: T) => string
): SelectOption[] {
  return items.map((item) => ({
    value: valueKey(item),
    label: labelKey(item),
  }))
}

export function getPersonnelFormConfigForDialog({
  titres,
  fonctions,
  planSites,
  regions,
  structures,
  isLoadingTitres,
  isLoadingFonctions,
  isLoadingPlanSites,
  isLoadingRegions,
  isLoadingStructures,
}: PersonnelFormDeps): FormConfig {
  return {
    fields: [
      {
        name: 'nom_perso',
        label: 'Nom',
        type: 'text',
        placeholder: 'Nom de famille',
        required: true,
        gridCols: 2,
      },
      {
        name: 'prenom_perso',
        label: 'Prénom(s)',
        type: 'text',
        placeholder: 'Prénom(s)',
        required: true,
        gridCols: 2,
      },
      {
        name: 'id_personnel_perso',
        label: 'Identifiant',
        type: 'text',
        placeholder: 'Identifiant de connexion',
        required: true,
        gridCols: 2,
      },
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'email@exemple.com',
        required: true,
        gridCols: 2,
      },
      {
        name: 'titre_personnel',
        label: 'Titre',
        type: 'select',
        placeholder: 'Sélectionner un titre…',
        required: true,
        options: mapOptions(
          titres,
          (t) => t.id_titre,
          (t) => t.libelle_titre
        ),
        isLoading: isLoadingTitres,
        gridCols: 2,
      },
      {
        name: 'contact_perso',
        label: 'Contact',
        type: 'tel',
        placeholder: '+224…',
        required: true,
        gridCols: 2,
      },
      {
        name: 'structure_perso',
        label: 'Structure',
        type: 'select',
        placeholder: 'Sélectionner une structure…',
        required: true,
        options: mapOptions(
          structures,
          (s) => s.id_acteur!,
          (s) => `${s.nom_acteur} (${s.code_acteur})`
        ),
        isLoading: isLoadingStructures,
        gridCols: 2,
      },
      {
        name: 'fonction_perso',
        label: 'Fonction',
        type: 'select',
        placeholder: 'Sélectionner une fonction…',
        required: true,
        options: mapOptions(
          fonctions,
          (f) => f.id_fonction!,
          (f) => f.nom_fonction
        ),
        isLoading: isLoadingFonctions,
        gridCols: 2,
      },
      {
        name: 'service_perso',
        label: 'Service / Direction',
        type: 'select',
        placeholder: 'Optionnel',
        required: false,
        options: mapOptions(
          planSites,
          (p) => p.id_ds!,
          (p) => `${p.intutile_ds} (${p.code_ds})`
        ),
        isLoading: isLoadingPlanSites,
        gridCols: 2,
      },
      {
        name: 'region_perso',
        label: 'Région',
        type: 'select',
        placeholder: 'Sélectionner une région…',
        required: true,
        options: mapOptions(
          regions,
          (r) => r.id_loca!,
          (r) => `${r.intitule_loca} (${r.code_loca})`
        ),
        isLoading: isLoadingRegions,
        gridCols: 2,
      },
      {
        name: 'niveau_perso',
        label: "Niveau d'accès",
        type: 'select',
        placeholder: "Sélectionner un niveau…",
        required: true,
        options: NIVEAU_ACCES_OPTIONS.map((o) => ({
          value: o.value,
          label: o.label,
        })),
        gridCols: 2,
      },
    ],
  }
}
