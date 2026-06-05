import { Acteur } from "./acteur";
import { Fonction } from "./fonction";
import { Localite } from "./localite";

import { PlanSite } from "./planSite";
import { ProjetActivePerso } from "./projetActivitePerso";
import { TitrePersonnel } from "./titrePersonnel";

export interface Personnel extends Record<string, unknown> {
  n_personnel?: number;
  is_admin : boolean;
  is_password_set : boolean;
  id_personnel_perso?: string;
  titre_personnel?: TitrePersonnel | null;
  nom_perso?: string;
  prenom_perso?: string;
  email?: string;
  contact_perso?: string;
  fonction_perso?: Fonction | null;
  service_perso?: PlanSite | null;
  niveau_perso?: number;
  rapport_mensuel_perso?: boolean;
  rapport_trimestriel_perso?: boolean;
  rapport_semestriel_perso?: boolean;
  rapport_annuel_perso?: boolean;
  statut?: number;
  region_perso?: Localite | null;
  structure_perso?: Acteur | null;
  ugl_perso?: string | null;
  projet_active_perso?: ProjetActivePerso[];
  pass?: string;
  password_last_modified : string
  personnel_profile_picture : string | null
}
