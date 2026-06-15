import { Personnel } from "./personnel";
import { Programme } from "./programme";

export interface VersionPtba extends Record<string, unknown> {
  id_version_ptba: number; // Identifiant unique
  annee_ptba: number; // Année du PTBA (requis)
  version_ptba?: string; // Version du PTBA (string: 30)
  date_validation?: string; // Date de validation (requis)
  observation?: string; // Observations
  documentUrl?: File | String; // URL du document ($uri format)
  statut_version?: number; // Statut de la version (0: En construction, 1: Validée, 2: Archivée)
  date_enregistrement?: string; // Date d'enregistrement (requis)
  etat?: string; // État de la version
  modifier_le?: string; // Date de dernière modification (requis)
  modifier_par?: string; // Qui a modifié
  programme?: string | Programme; // Relation vers Projet (int)
  id_personnel?: number | Personnel; // Relation vers Personnel (int)
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
