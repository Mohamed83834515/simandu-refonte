import type { FormConfig, SelectOption } from '../../Global/types/formConfig'
import type { Acteur } from '../allTypes/acteur'
import type { Localite } from '../allTypes/localite'
import type { Personnel, TypeActivite, UGL } from '../allTypes'

const chronogrammeOptions = [
  { label: 'Jan', value: 'Jan' },
  { label: 'Fév', value: 'Fév' },
  { label: 'Mar', value: 'Mar' },
  { label: 'Avr', value: 'Avr' },
  { label: 'Mai', value: 'Mai' },
  { label: 'Jun', value: 'Jun' },
  { label: 'Jul', value: 'Jul' },
  { label: 'Aoû', value: 'Aoû' },
  { label: 'Sep', value: 'Sep' },
  { label: 'Oct', value: 'Oct' },
  { label: 'Nov', value: 'Nov' },
  { label: 'Déc', value: 'Déc' },
]

function localiteOptions(localites: Localite[]): SelectOption[] {
  return localites
    .filter((localite) => {
      if (typeof localite.niveau_loca === 'object' && localite.niveau_loca !== null) {
        return localite.niveau_loca.nombre_nlc === 1
      }
      return localite.niveau_loca === 1
    })
    .map((localite) => ({
      value: localite.id_loca as number,
      label: localite.intitule_loca,
    }))
}

function acteurOptions(acteurs: Acteur[]): SelectOption[] {
  return acteurs
    .filter((acteur) => acteur.id_acteur !== undefined)
    .map((acteur) => ({
      value: acteur.id_acteur as number,
      label: acteur.nom_acteur,
    }))
}

function personnelOptions(personnels: Personnel[]): SelectOption[] {
  return personnels.map((p) => ({
    value: p.n_personnel!,
    label: `${p.prenom_perso} ${p.nom_perso}`,
  }))
}

function uglOptions(ugls: UGL[]): SelectOption[] {
  return ugls.map((ugl) => ({
    value: ugl.code_ugl,
    label: ugl.nom_ugl,
  }))
}

function typeActivitesOptions(typeActivites: TypeActivite[]): SelectOption[] {
  return typeActivites.map((item) => ({
    label: item.intutile_type as string,
    value: String(item.code_type),
  }))
}

export function getPtbaProjetFormConfig(
  activiteProjetOptions: SelectOption[],
  localites: Localite[] = [],
  acteurs: Acteur[] = [],
  personnels: Personnel[] = [],
  ugls: UGL[] = [],
  typeActivites: TypeActivite[] = [],
): FormConfig {
  return {
    steps: [
      { step: 1, title: 'Identité' },
      { step: 2, title: 'Coordonnées' },
    ],
    fields: [

      {
        name: 'code_actvite_projet',
        label: 'Plan Analytique',
        type: 'select',
        placeholder: 'Sélectionner une activité du projet',
        required: true,
        options: activiteProjetOptions,
        gridCols: 2,
        formStep: 1,
      },
      {
        name: 'code_activite_ptba',
        label: 'Code activité PTBA',
        type: 'text',
        placeholder: 'Ex: ACT001, PTBA01…',
        required: true,
        gridCols: 2,
        formStep: 1,
      },
      {
        name: 'intitule_activite_ptba',
        label: 'Intitulé activité PTBA',
        type: 'textarea',
        placeholder: "Intitulé de l'activité (max 200 caractères)",
        required: true,
        maxLength: 200,
        gridCols: 1,
        formStep: 1,
      },
      {
        name: 'chronogramme',
        label: 'Chronogramme',
        type: 'checkbox-group',
        multiple: true,
        required: true,
        options: chronogrammeOptions,
        gridCols: 1,
        formStep: 1,
      },
      {
        name: 'localites_ptba',
        label: 'Localités',
        type: 'multiselect',
        placeholder: 'Sélectionner une ou plusieurs localités',
        required: true,
        options: localiteOptions(localites),
        gridCols: 1,
        formStep: 2,
      },

      {
        name: 'type_activite',
        label: 'Type activité',
        type: 'select',
        placeholder: "Sélectionner un type d'activité",
        required: true,
        options: typeActivitesOptions(typeActivites),
        gridCols: 2,
        formStep: 2,
      },
      {
        name: 'partenaire_conserne_ptba',
        label: 'Partenaires concernés',
        type: 'multiselect',
        placeholder: 'Sélectionner un ou plusieurs partenaires',
        required: true,
        options: acteurOptions(acteurs),
        gridCols: 2,
        formStep: 2,
      },
      {
        name: 'responsable_ptba',
        label: 'Responsable PTBA',
        type: 'select',
        placeholder: 'Sélectionner un responsable (optionnel)',
        required: false,
        options: personnelOptions(personnels),
        gridCols: 2,
        formStep: 2,
      },
      {
        name: 'ugl_ptba',
        label: 'Unité de gestion',
        type: 'select',
        placeholder: 'Sélectionner une unité de gestion (optionnel)',
        required: false,
        options: uglOptions(ugls),
        gridCols: 2,
        formStep: 2,
      },
    ],
  }
}

export function resolveActiviteProjetId(
  value: unknown
): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  if (value && typeof value === 'object' && 'id_activite_projet' in value) {
    const id = Number(
      (value as { id_activite_projet?: number }).id_activite_projet
    )
    return Number.isFinite(id) ? id : undefined
  }
  return undefined
}
