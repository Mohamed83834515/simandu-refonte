import { ActiviteProgramme } from "./activiteProgramme";
import { Projet } from "./projet";

export interface ActiviteProjet extends Record<string, unknown> {
  id_activite_projet: number;
  code_activite_projet: string;
  intitule_activite_projet: string;
  niveau_activite_projet: number;
  parent_activite_projet?: number | ActiviteProjet | null;
  code_activite_programme?: string | ActiviteProgramme | null;
  code_projet?: string | Projet | null;
  // Relations populées
  budget?: number;
  parent?: ActiviteProjet | null;
}
