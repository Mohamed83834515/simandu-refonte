import type { FormConfig, SelectOption } from '../../Global/types/formConfig'
import { getActeurs } from '../allHooks/admin/acteurHooks'
import { getCadreStrategiques } from '../allHooks/admin/cadreStrategiqueHooks'
import { getLocalites } from '../allHooks/admin/localiteHooks'
import { getPersonnels } from '../allHooks/admin/personnelHooks'
import { getUgls } from '../allHooks/admin/uglHooks'

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

const localites = await getLocalites()
const acteurs = await getActeurs()
const personnels = await getPersonnels()
const cadre_strategiques = await getCadreStrategiques()
const ugls = await getUgls()

const cadreStrategiqueOptions = cadre_strategiques.map((cadre) => ({
  value: cadre.id_cs,
  label: `${cadre.code_cs} - ${cadre.intutile_cs}`,
}));


const localiteOptions = localites
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

const acteurOptions = acteurs
  .filter((acteur) => acteur.id_acteur !== undefined)
  .map((acteur) => ({
    value: acteur.id_acteur as number,
    label: acteur.nom_acteur,
  }))

const personnelOptions = personnels.map((p) => ({
  value: p.n_personnel!,
  label: `${p.prenom_perso} ${p.nom_perso}`,
}))


const uglOptions = ugls.map((ugl) => ({
  value: ugl.code_ugl,
  label: ugl.nom_ugl,
}))

export function getPtbaProjetFormConfig(
  activiteProjetOptions: SelectOption[],
  cadreAnalytiqueOptions: SelectOption[] = []
): FormConfig {
  return {
    steps: [
      { step: 1, title: 'Identité' },
      { step: 2, title: 'Coordonnées' },
    ],
    fields: [
      {
        name: 'code_actvite_projet',
        label: 'Activité projet',
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
        name: 'cadre_analytique',
        label: 'Cadre analytique',
        type: 'select',
        placeholder: 'Sélectionner un cadre analytique (optionnel)',
        required: true,
        options: cadreAnalytiqueOptions,
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
        options: localiteOptions,
        gridCols: 2,
        formStep: 2,
      },
      {
        name: 'code_crp',
        label: 'Cadre stratégique',
        type: 'select',
        placeholder: 'Sélectionner un cadre stratégique (optionnel)',
        required: false,
        options: cadreStrategiqueOptions,
        gridCols: 2,
        formStep: 2,
      },
      {
        name: 'partenaire_conserne_ptba',
        label: 'Partenaires concernés',
        type: 'multiselect',
        placeholder: 'Sélectionner un ou plusieurs partenaires',
        required: true,
        options: acteurOptions,
        gridCols: 1,
        formStep: 2,
      },
      {
        name: 'responsable_ptba',
        label: 'Responsable PTBA',
        type: 'select',
        placeholder: 'Sélectionner un responsable (optionnel)',
        required: false,
        options: personnelOptions,
        gridCols: 2,
        formStep: 2,
      },
      {
        name: 'ugl_ptba',
        label: 'Unité de gestion',
        type: 'select',
        placeholder: 'Sélectionner une unité de gestion (optionnel)',
        required: false,
        options: uglOptions,
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
