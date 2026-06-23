import { Acteur } from "./acteur";
import { Localite } from "./localite";
import { Programme } from "./programme";
import { TypeProjet } from "./typeProjet";

export interface Projet {
  id_projet: number;
  code_projet: string;
  sigle_projet: string;
  intitule_projet: string;
  duree_projet: number;
  date_signature_projet: string;
  date_demarrage_projet: string;
  partenaire_projet: Acteur | null;
  programme_projet?: Programme | number;
  structure_projet: number;
  signataires_projet: Acteur[];
  partenaires_execution_projet: Acteur[];
  zone_projet: Localite[];
  budget_projet?: number,
  type_projet?: number | TypeProjet,
}

export type ProjetFormData = Omit<Projet, "id_projet">;

export interface ProjetSelectOption {
  value: number;
  label: string;
  projet: Projet;
}

export function resolveProgrammeProjetId(
  ref: Programme | number | undefined | null,
): number | undefined {
  if (ref == null) return undefined;
  if (typeof ref === "number" && Number.isFinite(ref)) return ref;
  if (typeof ref === "object" && "id_programme" in ref) {
    const id = Number(ref.id_programme);
    return Number.isFinite(id) ? id : undefined;
  }
  return undefined;
}

/** Filtre les projets du programme actif (sélecteur Projet en en-tête). */
export function projetBelongsToProgramme(
  projet: Projet,
  idProgramme: number | undefined,
): boolean {
  if (idProgramme == null) return false;
  return resolveProgrammeProjetId(projet.programme_projet) === idProgramme;
}
