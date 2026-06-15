import type { FormConfig, SelectOption } from '@/Global/types/formConfig'
import type { Acteur, TypeZone, UniteIndicateur } from '@/simadou/allTypes'
import {
  fonctionAgregatOptions,
  typologieOptions,
} from '@/simadou/schemas/dictionnaireIndicateurSchemas'

type DictionnaireIndicateurFormDeps = {
  unites: UniteIndicateur[]
  typeZones: TypeZone[]
  acteurs: Acteur[]
  isLoadingUnites?: boolean
  isLoadingTypeZones?: boolean
  isLoadingActeurs?: boolean
}

function mapSelectOptions<T>(
  items: T[],
  valueKey: (item: T) => number,
  labelKey: (item: T) => string
): SelectOption[] {
  return items.map((item) => ({
    value: valueKey(item),
    label: labelKey(item),
  }))
}

/** Formulaire compact pour dialog (2 colonnes, moins de hauteur). */
export function getDictionnaireIndicateurFormConfigForDialog({
  unites,
  typeZones,
  acteurs,
  isLoadingUnites,
  isLoadingTypeZones,
  isLoadingActeurs,
}: DictionnaireIndicateurFormDeps): FormConfig {
  return {
    fields: [
      {
        name: 'code_ref_ind',
        label: 'Code de référence',
        type: 'text',
        placeholder: 'ex: REF001',
        required: true,
        maxLength: 50,
        gridCols: 2,
      },
      {
        name: 'typologie',
        label: 'Typologie',
        type: 'select',
        placeholder: 'Sélectionner…',
        required: true,
        options: typologieOptions.map((v) => ({ value: v, label: v })),
        gridCols: 2,
      },
      {
        name: 'intitule_ref_ind',
        label: 'Intitulé',
        type: 'text',
        placeholder: "Intitulé de l'indicateur",
        required: true,
        maxLength: 200,
        gridCols: 1,
      },
      {
        name: 'unite_cmr',
        label: 'Unité de mesure',
        type: 'select',
        placeholder: 'Sélectionner une unité…',
        required: true,
        options: mapSelectOptions(
          unites,
          (u) => u.id_unite,
          (u) => `${u.unite_ui} — ${u.definition_ui}`
        ),
        isLoading: isLoadingUnites,
        gridCols: 2,
      },
      {
        name: 'echelle',
        label: 'Échelle',
        type: 'select',
        placeholder: 'Sélectionner une échelle…',
        required: true,
        options: mapSelectOptions(
          typeZones,
          (tz) => tz.id_type_zone,
          (tz) => tz.nom_type_zone
        ),
        isLoading: isLoadingTypeZones,
        gridCols: 2,
      },
      {
        name: 'fonction_agregat_cmr',
        label: "Fonction d'agrégation",
        type: 'select',
        placeholder: 'Sélectionner…',
        required: true,
        options: fonctionAgregatOptions.map((v) => ({ value: v, label: v })),
        gridCols: 2,
      },
      {
        name: 'responsable_collecte_cmr',
        label: 'Responsable de collecte',
        type: 'select',
        placeholder: 'Sélectionner…',
        required: true,
        options: mapSelectOptions(
          acteurs,
          (a) => a.id_acteur,
          (a) => a.nom_acteur
        ),
        isLoading: isLoadingActeurs,
        gridCols: 2,
      },
      {
        name: 'seuil_minimum',
        label: 'Seuil minimum',
        type: 'number',
        placeholder: 'Min',
        required: true,
        min: 0,
        step: 1,
        gridCols: 2,
      },
      {
        name: 'seuil_maximum',
        label: 'Seuil maximum',
        type: 'number',
        placeholder: 'Max',
        required: true,
        min: 0,
        step: 1,
        gridCols: 2,
      },
    ],
  }
}

/** @deprecated Utiliser getDictionnaireIndicateurFormConfigForDialog */
export function getDictionnaireIndicateurFormConfig(
  deps: DictionnaireIndicateurFormDeps
): FormConfig {
  return getDictionnaireIndicateurFormConfigForDialog(deps)
}
