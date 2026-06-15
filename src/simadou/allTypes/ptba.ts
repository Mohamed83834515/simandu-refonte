import { Acteur } from "./acteur";
import { CadreAnalytique } from "./cadreAnalytique";
import { Localite } from "./localite";
import { Personnel } from "./personnel";
import { PlanSite } from "./planSite";

export interface Ptba extends Record<string, unknown> {
  id_ptba: number;
  localites_ptba: number[] | Localite[]; // Relations vers entité Localite
  partenaire_conserne_ptba: number[] | Acteur[]; // Relations vers entité Acteur
  code_activite_ptba: string;
  intitule_activite_ptba: string; // max 200 chars
  chronogramme: string; // max 100 chars - mois concernés
  observation?: string;
  statut_activite: string; // max 100 chars
  code_crp?: string; // Code du Cadre stratégique concerné, relation vers CadreStrategique
  cadre_analytique?: string | CadreAnalytique; // Code du Cadre analytique concerné, relation vers CadreAnalytique via code_ca
  responsable_ptba?: Personnel |  number; // Code du PlanSite responsable
  direction_ptba?: string; // Code du PlanSite direction, relation vers PlanSite via code_ds
  code_programme?: string;
  version_ptba: number; // Relation vers VersionPtba
  type_activite: string; // Relation vers TypeActivite
  created_at?: string;
  updated_at?: string;
  cout_total_ptba?:number;
  // Relations populées (optionnelles, selon l'API)
  responsable?: PlanSite; // PlanSite populé pour responsable_ptba
  direction?: PlanSite; // PlanSite populé pour direction_ptba
}
