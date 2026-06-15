import type { FormConfig } from '../../Global/types/formConfig'
import { statutActiviteOptions } from '../schemas/suiviAvancementContratSchemas'

/** Champs formulaire alignés sur suiviAvancementContratSuiviPtbaSchema (écran suivi PTBA). */
export const getSuiviAvancementContratFormConfigForSuivi = (): FormConfig => ({
  fields: [
    {
      name: 'date_suivi',
      label: 'Date du suivi',
      type: 'date',
      required: true,
    },
    {
      name: 'statut_activite',
      label: 'Statut activité',
      type: 'select',
      required: true,
      options: [...statutActiviteOptions],
    },
    {
      name: 'etat_avancement',
      label: "État d'avancement",
      type: 'textarea',
      rows: 2,
      required: true,
      className: 'resize-y',
    },
    {
      name: 'observation',
      label: 'Observation',
      type: 'textarea',
      rows: 2,
      required: true,
      className: 'resize-y',
    },
    {
      name: 'difficultes_rencontrees',
      label: 'Difficultés rencontrées',
      type: 'textarea',
      rows: 2,
      required: true,
      className: 'resize-y',
    },
    {
      name: 'pistes_solutions',
      label: 'Pistes de solutions',
      type: 'textarea',
      rows: 2,
      required: true,
      className: 'resize-y',
    },
    {
      name: 'documents_fichiers',
      label: 'Documents',
      type: 'file',
      multiple: true,
      accept: 'application/pdf,image/*,.doc,.docx',
      maxSize: 10,
      helperText: 'PDF, images ou documents (max 10 Mo par fichier)',
      required: false,
      gridCols: 1,
    },
  ],
})

/** Config complète entité (admin / paramétrage — champs relationnels inclus). */
export const getSuiviAvancementContratFormConfig = (): FormConfig => ({
  fields: [
    ...getSuiviAvancementContratFormConfigForSuivi().fields,
    {
      name: 'code_suivi',
      label: 'Code suivi',
      type: 'text',
      required: false,
      gridCols: 1,
    },
    {
      name: 'retard_accuse',
      label: 'Retard accusé',
      type: 'text',
      required: false,
      gridCols: 2,
    },
    {
      name: 'etat',
      label: 'État',
      type: 'select',
      required: true,
      options: [
        { value: 'ajout', label: 'Ajout' },
        { value: 'modification', label: 'Modification' },
      ],
      gridCols: 1,
    },
    {
      name: 'activite_ptba',
      label: 'Activité PTBA',
      type: 'select',
      required: true,
      options: [],
      gridCols: 1,
    },
    {
      name: 'id_personnel',
      label: 'Personnel',
      type: 'select',
      required: true,
      options: [],
      gridCols: 1,
    },
  ],
})
