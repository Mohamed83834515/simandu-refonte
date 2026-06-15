import type { Personnel } from "./personnel";
import type { Ptba } from "./ptba";

/** Suivi d'avancement contrat PTBA */
export interface SuiviAvancementContrat extends Record<string, unknown> {
  id_suivi: number;
  date_suivi: string;
  code_suivi?: string;
  etat_avancement: string;
  statut_activite: string;
  retard_accuse: string;
  difficultes_rencontrees: string;
  pistes_solutions: string;
  observation: string;
  documents?: string;
  date_enregistrement?: string;
  etat: string;
  modifier_le?: string;
  modifier_par?: string;
  activite_ptba: number | Ptba;
  sous_activite?: number;
  id_personnel: number | Personnel;
}

export function resolveActivitePtbaId(
  ref: number | Ptba | undefined | null,
): number | undefined {
  if (ref == null) return undefined;
  if (typeof ref === "object") return ref.id_ptba;
  return ref;
}

export function normalizeSuiviAvancementContrat(
  raw: SuiviAvancementContrat,
): SuiviAvancementContrat {
  const activiteId = resolveActivitePtbaId(raw.activite_ptba as number | Ptba);

  return {
    ...raw,
    id_suivi: Number(raw.id_suivi),
    activite_ptba: activiteId ?? raw.activite_ptba,
  };
}

export function filterSuivisAvancementByActivite(
  items: SuiviAvancementContrat[],
  idActivite: number,
): SuiviAvancementContrat[] {
  return items
    .map(normalizeSuiviAvancementContrat)
    .filter(
      (item) => resolveActivitePtbaId(item.activite_ptba as number | Ptba) === idActivite,
    );
}

export function resolvePersonnelId(
  ref: number | Personnel | undefined | null,
): number | undefined {
  if (ref == null) return undefined;
  if (typeof ref === "object") return ref.n_personnel;
  return ref;
}

export function labelPersonnel(ref: number | Personnel | undefined): string {
  if (ref == null) return "—";
  if (typeof ref === "object") {
    const name = [ref.prenom_perso, ref.nom_perso].filter(Boolean).join(" ");
    return name || ref.id_personnel_perso || String(ref.n_personnel ?? "—");
  }
  return String(ref);
}
