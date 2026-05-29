// Types pour les entités de paramètres

import { ActiviteProgramme } from "./activiteProgramme";
import { CadreAnalytique } from "./cadreAnalytique";
import { NiveauLocalite } from "./niveauLocalite";
import { Projet } from "./projet";

// Niveau Cadre Stratégique
export interface NiveauCadreStrategique extends Record<string, unknown> {
  id_nsc: number;
  nombre_nsc: number;
  libelle_nsc: string;
  code_number_nsc: number;
  type_niveau: 1 | 2 | 3 | string; // 1 - Effet, 2 - Produit, 3 - Impact
  programme?: string | Programme;
}

// Niveau Cadre Analytique
export interface NiveauCadreAnalytique extends Record<string, unknown> {
  id_nca: number;
  nombre_nca: number;
  libelle_nca: string;
  code_number_nca: number;
  programme?: string | Programme;
}

// Cible CMR Projet
export interface CibleCmrProjet extends Record<string, unknown> {
  id_cible_indicateur_crp: number; // readOnly
  annee: string; // date format - Année de la cible
  valeur_cible_indcateur_crp: number; // Valeur cible de l'indicateur CRP
  code_indicateur_crp?: number | null; // FK id_indicateur_cr_iop (IndicateurCadreResultat)
  code_ug?: string | null; // Code UGL, relation avec UGL via code_ugl
  code_projet?: string | null; // Code du projet concerné
  // Relations populées
  indicateur_crp?: IndicateurCadreResultat | null; // Relation vers IndicateurCadreResultat
  ugl?: UGL | null; // Relation vers UGL
}

export interface TitrePersonnel extends Record<string, unknown> {
  id_titre: number;
  libelle_titre: string;
  description_titre?: string;
}

export interface TitrePersonnel {
  id_titre: number;
  libelle_titre: string;
  description_titre?: string;
}

export interface Personnel extends Record<string, unknown> {
  n_personnel?: number;
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
}

export interface PlanSite extends Record<string, unknown> {
  id_ds?: number;
  code_ds: string;
  intutile_ds: string;
  niveau_ds: number;
  parent_ds: number;
  code_relai_ds: string;
}

export interface TypeZone extends Record<string, unknown> {
  id_type_zone: number;
  code_type_zone: string;
  nom_type_zone: string;
}
export interface Acteur extends Record<string, unknown> {
  id_acteur: number;
  code_acteur: string;
  nom_acteur: string;
  description_acteur: string;
  personne_responsable: string;
  contact: string;
  adresse_email: string;
  categorie_acteur: number;
}

export interface Convention extends Record<string, unknown> {
  id_convention?: number;
  code_convention: string;
  intutile_conv: string;
  reference_conv: string;
  montant_conv: number;
  date_signature_conv: string;
  etat_conv: string;
  partenaire_conv: Partial<Acteur> | null;
}

export interface Localite extends Record<string, unknown> {
  id_loca: number;
  code_loca: string;
  intitule_loca: string;
  code_national_loca: string;
  parent_loca: number | null;
  niveau_loca: NiveauLocalite;
}

export interface Structure extends Record<string, unknown> {
  id_acteur: number;
  code_acteur: string;
  nom_acteur: string;
  description_acteur: string;
  personne_responsable: string;
  contact: string;
  adresse_email: string;
  categorie_acteur: number;
}

export interface UGL extends Record<string, unknown> {
  id_ugl: number;
  code_ugl: string;
  nom_ugl: string;
  abrege_ugl: string;
  couleur_ugl: string;
  chef_lieu_ugl: number;
  region_concerne_ugl: number[];
}

export interface Fonction extends Record<string, unknown> {
  id_fonction?: number;
  nom_fonction: string;
  description_fonction: string;
}

export interface ProjetActivePerso {
  id_projet: number;
  code_projet: string;
  sigle_projet: string;
  intitule_projet: string;
  duree_projet: number;
  date_signature_projet: string;
  date_demarrage_projet: string;
  partenaire_projet: number;
  programme_projet: number;
  structure_projet: number[];
  signataires_projet: number[];
  partenaires_execution_projet: number[];
  zone_projet: number[];
}

export interface Fonction extends Record<string, unknown> {
  id_fonction?: number;
  nom_fonction: string;
  description_fonction: string;
}

export interface NiveauStructureConfig extends Record<string, unknown> {
  id_nsc?: number;
  nombre_nsc: number;
  libelle_nsc: string;
  code_number_nsc: string;
  id_programme: number;
}

// Types pour les formulaires
export type PersonnelFormData = Omit<Personnel, "n_personnel">;
export type PlanSiteFormData = Omit<PlanSite, "id_ds">;
export type TypeZoneFormData = Omit<TypeZone, "id_type_zone">;
export type ActeurFormData = Omit<Acteur, "id_acteur">;
export type LocaliteFormData = Omit<Localite, "id_loca">;
export type StructureFormData = Omit<Structure, "id_acteur">;
export type UGLFormData = Omit<UGL, "id_ugl">;
export type FonctionFormData = Omit<Fonction, "id_fonction">;
export type NiveauStructureConfigFormData = Omit<
  NiveauStructureConfig,
  "id_nsc"
>;

// ============================================
// RESULTS FRAMEWORKS & INDICATORS ENTITIES
// ============================================

// Unité d'indicateur
export interface UniteIndicateur extends Record<string, unknown> {
  id_unite: number;
  unite_ui: string;
  definition_ui: string;
}

// Cadre logique (cadre_secteur)
export interface CadreSecteur extends Record<string, unknown> {
  id_cl: number;
  code_cl: string;
  intitule_cl: string;
  abrege_cl: string;
  niveau_cl: number;
  parent_cl?: number | null;
  id_programme?: number | null;
  created_at?: string;
  updated_at?: string;
}

// Indicateur de cadre de résultat
export interface IndicateurCadreResultat extends Record<string, unknown> {
  id_indicateur_cr_iop: number;
  niveau_iop: number;
  code_indicateur_cr_iop: string;
  code_cr_iop: string;
  intitule_indicateur_cr_iop: string;
  periodicite_iop: string;
  source_iop: string;
  responsable_iop: string;
  description_iop: string;
  structure_iop?: string;
  projet_iop?: string;
  created_at?: string;
  updated_at?: string;
}

// Indicateur stratégique (indicateur_cmr)
export interface IndicateurCmr extends Record<string, unknown> {
  id_ref_ind_cmr: number;
  code_ref_ind: string;
  resultat_cmr: string;
  intitule_ref_ind: string;
  reference_cmr: string;
  annee_reference: number;
  responsable_collecte_cmr: string;
  cible_cmr: string;
  fonction_agregat_cmr: string;
  unite_cmr?: UniteIndicateur | null;
  created_at?: string;
  updated_at?: string;
}

// Dictionnaire des indicateurs
export interface DictionnaireIndicateur extends Record<string, unknown> {
  id_ref_ind_ref: number;
  code_ref_ind: string;
  intitule_ref_ind: string;
  unite_cmr?: UniteIndicateur | null;
  fonction_agregat_cmr?: string;
  echelle?: TypeZone | null;
  typologie?: string;
  seuil_minimum?: number;
  seuil_maximum?: number;
  responsable_collecte_cmr?: Acteur;
  created_at?: string;
  updated_at?: string;
}

// Niveau Cadre Résultat
export interface NiveauCadreResultat extends Record<string, unknown> {
  id_ncr: number;
  nombre_ncr: number;
  libelle_ncr: string;
  code_number_ncr: number;
  type_niveau: 1 | 2 | 3; // 1 - Effet, 2 - Produit, 3 - Impact
}

// Cadre Résultat
export interface CadreResultat extends Record<string, unknown> {
  id_cr: number;
  code_cr: string;
  intutile_cr: string;
  abgrege_cr: string;
  cout_axe: number;
  date_enregistrement: string; // Géré auto par le backend
  date_modification: string; // Géré auto par le backend
  etat?: string | null;
  niveau_cr?: number | null;
  partenaire_cr?: Acteur | string | null;
  parent_cr?: number | null;
  projet_cr?: number | null;
  // Relations populées
  niveau?: NiveauCadreResultat | null;
  partenaire?: Acteur | null;
  parent?: CadreResultat | null;
}

// Form Data Types
export type UniteIndicateurFormData = Omit<UniteIndicateur, "id_unite">;
export type CadreSecteurFormData = Omit<CadreSecteur, "id_cl">;
export type IndicateurCadreResultatFormData = Omit<
  IndicateurCadreResultat,
  "id_indicateur_cr_iop"
>;
export type IndicateurCmrFormData = Omit<IndicateurCmr, "id_ref_ind_cmr">;
export type DictionnaireIndicateurFormData = Omit<
  DictionnaireIndicateur,
  "id_ref_ind_ref"
>;
export type NiveauCadreResultatFormData = Omit<NiveauCadreResultat, "id_ncr">;
export type CadreResultatFormData = Omit<
  CadreResultat,
  "id_cr" | "date_enregistrement" | "date_modification"
>;

// Programme Entity
export interface Programme extends Record<string, unknown> {
  id_programme: number;
  code_programme: string;
  nom_programme: string;
  description_programme?: string;
  date_debut?: string;
  date_fin?: string;
  budget?: number;
  statut?: number;
  created_at?: string;
  updated_at?: string;
}

// CadreStrategique Entity
export interface CadreStrategique extends Record<string, unknown> {
  id_cs: number;
  code_cs: string;
  intutile_cs: string;
  abgrege_cs: string;
  niveau_cs: number | string;
  date_enregistrement: string;
  date_modification: string;
  etat?: number;
  partenaire_cs?: Acteur | null;
  parent_cs?: CadreStrategique | number | null;
  programme_cs?: Programme | null;
  created_at?: string;
  updated_at?: string;
}

// CadreStrategiqueConfig Entity
export interface CadreStrategiqueConfig extends Record<string, unknown> {
  id_csc: number;
  nombre: number;
  libelle_csc: string;
  type_csc: 1 | 2 | 3; // 1 - Effet, 2 - Produit, 3 - Impact
  date_enregistrement: string;
  date_modification: string;
  etat?: number;
  programme?: Programme | null;
  created_at?: string;
  updated_at?: string;
}

// Form Data Types for new entities
export type CadreStrategiqueFormData = Omit<CadreStrategique, "id_cs">;
export type CadreStrategiqueConfigFormData = Omit<
  CadreStrategiqueConfig,
  "id_csc"
>;

// ============================================
// PTBA ENTITIES
// ============================================

// Type d'activité
export interface TypeActivite extends Record<string, unknown> {
  id_type: number;
  code_type: string;
  intutile_type: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

// Version PTBA
export interface VersionPtba extends Record<string, unknown> {
  id_version_ptba: number; // Identifiant unique
  annee_ptba: number; // Année du PTBA (requis)
  version_ptba?: string; // Version du PTBA (string: 30)
  date_validation: string; // Date de validation (requis)
  observation?: string; // Observations
  documentUrl?: string; // URL du document ($uri format)
  statut_version?: number; // Statut de la version (0: En construction, 1: Validée, 2: Archivée)
  date_enregistrement: string; // Date d'enregistrement (requis)
  etat?: string; // État de la version
  modifier_le: string; // Date de dernière modification (requis)
  modifier_par?: string; // Qui a modifié
  programme?: string | Programme; // Relation vers Projet (int)
  id_personnel?: number; // Relation vers Personnel (int)
}

// Version PTBA Request (pour les POST)
export interface VersionPtbaRequest {
  annee_ptba: number; // Année du PTBA (requis)
  version_ptba?: string; // Version du PTBA
  date_validation: string; // Date de validation (requis)
  observation?: string; // Observations
  documentUrl?: string; // URL du document
  statut_version?: number; // Statut de la version (0: En construction, 1: Validée, 2: Archivée)
  etat?: string; // État de la version
  modifier_par?: string; // Qui a modifié
  programme?: string; // Relation vers Projet
  id_personnel?: number; // Relation vers Personnel
}

// Activité PTBA
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
  responsable_ptba?: number; // Code du PlanSite responsable
  direction_ptba?: string; // Code du PlanSite direction, relation vers PlanSite via code_ds
  code_programme?: string;
  version_ptba: number; // Relation vers VersionPtba
  type_activite: string ; // Relation vers TypeActivite
  created_at?: string;
  updated_at?: string;

  // Relations populées (optionnelles, selon l'API)
  responsable?: PlanSite; // PlanSite populé pour responsable_ptba
  direction?: PlanSite; // PlanSite populé pour direction_ptba
}

// Tâche d'activité PTBA
export interface TacheActivitePtba extends Record<string, unknown> {
  id_groupe_tache: number;
  intutile_tache_gt: string; // max 200 chars
  proportion_gt: string; // max 10 chars
  code_tache_gt: string; // max 200 chars
  date_debut_gt: string; // date
  date_fin_gt: string; // date
  date_reelle_gt: string; // date
  n_lot_gt: number;
  valider_gt: string; // max 100 chars
  observation_gt?: string; // max 200 chars
  livrable_gt: string; // max 100 chars
  id_personnel_gt: number | Personnel;
  responsable_gt?: number | Personnel; // max 100 chars
  id_activite: number; // relation vers Ptba
  created_at?: string;
  updated_at?: string;
}

// Request pour TacheActivitePtba
export interface TacheActivitePtbaRequest {
  intutile_tache_gt: string;
  proportion_gt: string;
  code_tache_gt: string;
  date_debut_gt: string;
  date_fin_gt: string;
  date_reelle_gt: string;
  n_lot_gt: number;
  valider_gt: string;
  observation_gt?: string;
  livrable_gt: string;
  id_personnel_gt: number;
  responsable_gt: number;
  id_activite: number;
}

// ============================================
// NOUVELLES ENTITÉS PROJET
// ============================================

// Activité Projet
// Niveau Activité Projet
export interface NiveauActiviteProjet extends Record<string, unknown> {
  id_niveau_activite_projet: number;
  nombre_niveau_activite_projet: number;
  libelle_niveau_activite_projet: string;
  taille_code_niveau_activite_projet: number;
  code_projet?: string | null;
}

export interface ActiviteProjet extends Record<string, unknown> {
  id_activite_projet: number;
  code_activite_projet: string;
  intitule_activite_projet: string;
  niveau_activite_projet: number;
  parent_activite_projet?: number | ActiviteProjet | null;
  code_activite_programme?: string | ActiviteProgramme | null;
  code_projet?: string | Projet | null;
  // Relations populées
  parent?: ActiviteProjet | null;
}

// Indicateur Performance Projet
export interface IndicateurPerformanceProjet extends Record<string, unknown> {
  id_indicateur_performance: number;
  code_indicateur_performance: string;
  intitule_indicateur_tache: string;
  code_activite_projet?: string | number | ActiviteProjet | null;
  unite_indicateur_performance?: number | UniteIndicateur | null;
  code_projet?: string | Projet | null;
}

// Indicateur Activité PTBA
export interface IndicateurActivitePtba extends Record<string, unknown> {
  id_indicateur_activite: number;
  code_indicateur_activite: string;
  intitule_indicateur_tache: string;
  activite_ptba?: string | Ptba | null;
  code_indicateur_performance?: string | IndicateurPerformanceProjet | null;
  abrege_unite?: number | UniteIndicateur | null;
}

// Suivi Indicateur Activité
export interface SuiviIndicateurActivite extends Record<string, unknown> {
  id_suivi_indicateur: number;
  date_suivi_indicateur: string;
  valeur_suivi_indicateur: number; // double
  indicateur_activite?: string | IndicateurActivitePtba | null; // relation via code_indicateur_activite
  localite?: string | Localite | null; // relation via code_loca
}

// Observation PTBA
export interface ObservationPtba extends Record<string, unknown> {
  id_observation: number;
  observation: string;
  date_observation: string;
  ptba?: string | Ptba | null; // relation via code_activite_ptba
}
