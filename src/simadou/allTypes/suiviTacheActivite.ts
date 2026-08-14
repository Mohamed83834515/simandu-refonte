import type { TacheActivitePtba } from "./tacheActivitePtba";

/** Suivi de tâche d'activité */
export interface SuiviTacheActivite {
  id_suivi_groupe_tache: number;
  /** Lot réalisé (champ API, utilisé pour le taux global). */
  lot_realisee?: number;
  proportion_realisee: number;
  valide: boolean;
  /** Date réelle (nom champ API) */
  date_reele: string;
  observation_suivi: string;
  /** L’API renvoie souvent la tâche imbriquée au lieu de l’id seul */
  id_groupe_tache: number | TacheActivitePtba;
  id_activite_ptba: number | { id_ptba?: number };
}

export function resolveIdGroupeTache(
  ref: number | TacheActivitePtba | undefined | null,
): number | undefined {
  if (ref == null) return undefined;
  if (typeof ref === "object") return ref.id_groupe_tache;
  const n = Number(ref);
  return Number.isFinite(n) ? n : undefined;
}

export function resolveIdActivitePtba(
  ref: number | { id_ptba?: number } | undefined | null,
): number | undefined {
  if (ref == null) return undefined;
  if (typeof ref === "number" && Number.isFinite(ref)) return ref;
  if (typeof ref === "object" && "id_ptba" in ref) {
    const n = Number(ref.id_ptba);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

export function parseSuiviValide(raw: unknown): boolean {
  if (typeof raw === "boolean") return raw;
  if (raw === "true" || raw === 1 || raw === "1") return true;
  return false;
}

/** Champs tableau Suivi des tâches (date, validé, observation). */
export function getSuiviTableDisplayFields(suivi?: SuiviTacheActivite) {
  if (!suivi) {
    return {
      dateRealisation: undefined as string | undefined,
      valide: undefined as boolean | undefined,
      observation: undefined as string | undefined,
    };
  }
  const dateRaw = suivi.date_reele?.trim();
  return {
    dateRealisation: dateRaw || undefined,
    valide: suivi.valide,
    observation: suivi.observation_suivi?.trim() || undefined,
  };
}

/** Ids de tâches déjà couvertes par un suivi (hors suivi en cours d’édition). */
export function getUsedGroupeTacheIds(
  suivis: SuiviTacheActivite[],
  excludeSuiviId?: number,
): Set<number> {
  const ids = new Set<number>();
  for (const s of suivis) {
    if (
      excludeSuiviId != null &&
      s.id_suivi_groupe_tache === excludeSuiviId
    ) {
      continue;
    }
    const id = resolveIdGroupeTache(s.id_groupe_tache);
    if (id != null) ids.add(id);
  }
  return ids;
}

export function findSuiviForTache(
  suivis: SuiviTacheActivite[],
  idGroupeTache: number,
): SuiviTacheActivite | undefined {
  const tacheId = Number(idGroupeTache);
  if (!Number.isFinite(tacheId)) return undefined;
  return suivis.find(
    (s) => resolveIdGroupeTache(s.id_groupe_tache) === tacheId,
  );
}

/** Suivis rattachés aux tâches affichées (évite les suivi orphelins d'une autre activité). */
export function filterSuivisForTaches(
  suivis: SuiviTacheActivite[],
  taches: Pick<TacheActivitePtba, "id_groupe_tache">[],
): SuiviTacheActivite[] {
  const tacheIds = new Set(
    taches
      .map((t) => Number(t.id_groupe_tache))
      .filter((id) => Number.isFinite(id)),
  );
  return suivis.filter((s) => {
    const id = resolveIdGroupeTache(s.id_groupe_tache);
    return id != null && tacheIds.has(id);
  });
}

/** Parse P% (`proportion_gt`) stored as string, with or without `%`. */
export function parseProportionPercent(
  value: string | number | null | undefined,
): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return 0;
  const cleaned = value.trim().replace("%", "").replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/** Progression lot réalisée / lot prévu (0–100). */
export function lotRealiseePercent(
  lotRealisee: number | undefined | null,
  nLotPrevu: number | undefined | null,
): number {
  const prevu = nLotPrevu ?? 0;
  if (prevu <= 0) return 0;
  const realise = lotRealisee ?? 0;
  return Math.min(100, Math.round((realise / prevu) * 100));
}

/**
 * Contribution d'une tâche au taux global :
 * `(lot_réalisé × P%) / lot_prévu`, plafonnée à P%.
 */
export function contributionAvancementTache(
  tache: Pick<TacheActivitePtba, "n_lot_gt" | "proportion_gt">,
  lotRealisee: number | undefined | null,
): number {
  const lotPrevu = Number(tache.n_lot_gt) || 0;
  if (lotPrevu <= 0) return 0;
  const realise = Number(lotRealisee) || 0;
  if (realise <= 0) return 0;
  const proportion = parseProportionPercent(tache.proportion_gt);
  if (proportion <= 0) return 0;
  return Math.min(proportion, (realise * proportion) / lotPrevu);
}

/**
 * Taux d'avancement global des tâches :
 * somme de `(lot_réalisé × P%) / lot_prévu` pour chaque tâche (0–100).
 */
export function tauxAvancementGlobalTaches(
  taches: TacheActivitePtba[],
  suivis: SuiviTacheActivite[],
): number {
  if (taches.length === 0) return 0;

  let total = 0;
  for (const tache of taches) {
    const suivi = findSuiviForTache(suivis, tache.id_groupe_tache);
    const lotRealisee = suivi?.lot_realisee ?? suivi?.proportion_realisee ?? 0;
    total += contributionAvancementTache(tache, lotRealisee);
  }

  return Math.min(100, Math.round(total));
}

export function intituleGroupeTache(
  ref: number | TacheActivitePtba,
  taches: TacheActivitePtba[],
): string {
  if (typeof ref === "object") {
    return (
      ref.intutile_tache_gt?.trim() ||
      ref.code_tache_gt ||
      `— (${ref.id_groupe_tache})`
    );
  }
  const t = taches.find((x) => x.id_groupe_tache === ref);
  return (
    t?.intutile_tache_gt?.trim() || t?.code_tache_gt || `— (${ref})`
  );
}
