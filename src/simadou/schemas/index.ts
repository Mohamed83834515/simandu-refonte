// Export centralisé de tous les schémas Zod

// Schémas Activité Projet
export {
  activiteProjetSchema,
  activiteProjetCreateSchema,
  activiteProjetUpdateSchema,
  type ActiviteProjetFormData,
} from "./activiteProjetSchemas";

// Schémas Indicateur Performance Projet
export {
  indicateurPerformanceProjetSchema,
  indicateurPerformanceProjetCreateSchema,
  indicateurPerformanceProjetUpdateSchema,
  type IndicateurPerformanceProjetFormData,
} from "./activiteProjetSchemas";

// Schémas Suivi indicateur tâche (programme + projet)
export {
  type SuiviIndicateurTachePayload,
  type SuiviIndicateurTacheProjetPayload,
} from './suiviIndicateurTacheProjetSchemas'
