import { apiClient } from "@/axios/api";
import type { SuiviTacheActiviteFormData } from "../schemas/suiviTacheActiviteSchemas";
import type { SuiviTacheActivite } from "../allTypes";
import {
  resolveIdActivitePtba,
  parseSuiviValide,
} from "../allTypes/suiviTacheActivite";

const ENDPOINT = "/suivi-tache-activites/";
const WITH_LIVRABLES_ENDPOINT = "/suivi-tache-activites/with-livrables/";

type SuiviFieldsJson = Omit<SuiviTacheActiviteFormData, "livrable_fichier"> & {
  id_activite_ptba: number;
  lot_realisee: number;
};

function normalizeList(response: unknown): Record<string, unknown>[] {
  if (Array.isArray(response)) return response as Record<string, unknown>[];
  if (
    response &&
    typeof response === "object" &&
    "results" in response &&
    Array.isArray((response as { results: unknown }).results)
  ) {
    return (response as { results: Record<string, unknown>[] }).results;
  }
  return [];
}

/** Normalise la réponse API vers le type front (date_reele, valide, observation_suivi, etc.). */
export function mapSuiviTacheActiviteFromApi(
  raw: Record<string, unknown>,
): SuiviTacheActivite {
  const dateReelle = raw.date_reele ?? raw.date_reel;
  const idActivite = resolveIdActivitePtba(
    raw.id_activite_ptba as SuiviTacheActivite["id_activite_ptba"],
  );
  const lotRealisee = Number(raw.lot_realisee ?? raw.proportion_realisee ?? 0);
  return {
    id_suivi_groupe_tache: Number(raw.id_suivi_groupe_tache),
    lot_realisee: lotRealisee,
    proportion_realisee: lotRealisee,
    valide: parseSuiviValide(raw.valide),
    date_reele: typeof dateReelle === "string" ? dateReelle : "",
    observation_suivi:
      typeof raw.observation_suivi === "string" ? raw.observation_suivi : "",
    id_groupe_tache: raw.id_groupe_tache as SuiviTacheActivite["id_groupe_tache"],
    id_activite_ptba: idActivite ?? raw.id_activite_ptba ?? 0,
  };
}

function toApiPayload(data: SuiviFieldsJson) {
  return {
    id_activite_ptba: data.id_activite_ptba,
    id_groupe_tache: data.id_groupe_tache,
    date_reele: data.date_reele,
    observation_suivi: data.observation_suivi,
    lot_realisee: data.lot_realisee,
    valide: data.valide,
    livrables: [] as { fichier_join: string; suivi_tache_activite: number }[],
  };
}

function toSuiviFieldsJson(
  data: SuiviTacheActiviteFormData & { id_activite_ptba: number },
): SuiviFieldsJson {
  const { livrable_fichier: _files, ...rest } = data;
  return {
    ...rest,
    id_activite_ptba: data.id_activite_ptba,
    lot_realisee: data.proportion_realisee,
  };
}

function appendSuiviFormFields(
  fd: FormData,
  data: SuiviFieldsJson,
  files: File[],
) {
  fd.append("id_activite_ptba", String(data.id_activite_ptba));
  fd.append("id_groupe_tache", String(data.id_groupe_tache));
  fd.append("date_reele", data.date_reele);
  fd.append("observation_suivi", data.observation_suivi);
  fd.append("lot_realisee", String(data.lot_realisee));
  fd.append("valide", data.valide ? "true" : "false");
  for (const file of files) {
    fd.append("livrables", file, file.name);
  }
}

const suiviTacheActiviteService = {
  async getByActivite(idActivite: number): Promise<SuiviTacheActivite[]> {
    const response = await apiClient.request<unknown>(ENDPOINT, {
      method: "GET",
      params: { id_activite: idActivite },
    });
    return normalizeList(response).map(mapSuiviTacheActiviteFromApi);
  },

  async create(
    data: SuiviTacheActiviteFormData & { id_activite_ptba: number },
  ): Promise<SuiviTacheActivite> {
    const json = toSuiviFieldsJson(data);
    const { livrable_fichier } = data;

    if (livrable_fichier.length > 0) {
      const fd = new FormData();
      appendSuiviFormFields(fd, json, livrable_fichier);
      const raw = await apiClient.request<Record<string, unknown>>(
        WITH_LIVRABLES_ENDPOINT,
        { method: "POST", data: fd },
      );
      return mapSuiviTacheActiviteFromApi(raw);
    }

    const raw = await apiClient.request<Record<string, unknown>>(
      WITH_LIVRABLES_ENDPOINT,
      {
        method: "POST",
        data: toApiPayload(json),
      },
    );
    return mapSuiviTacheActiviteFromApi(raw);
  },

  async update(
    id: number,
    data: SuiviTacheActiviteFormData & { id_activite_ptba?: number },
  ): Promise<SuiviTacheActivite> {
    const id_ptba = data.id_activite_ptba;
    if (id_ptba == null) {
      throw new Error("id_activite_ptba requis pour la mise à jour");
    }
    const json = toSuiviFieldsJson({
      ...data,
      id_activite_ptba: id_ptba,
    });
    const { livrable_fichier } = data;
    const url = `${ENDPOINT}${id}/with-livrables/`;

    if (livrable_fichier.length > 0) {
      const fd = new FormData();
      appendSuiviFormFields(fd, json, livrable_fichier);
      const raw = await apiClient.request<Record<string, unknown>>(url, {
        method: "PUT",
        data: fd,
      });
      return mapSuiviTacheActiviteFromApi(raw);
    }

    const raw = await apiClient.request<Record<string, unknown>>(url, {
      method: "PUT",
      data: toApiPayload(json),
    });
    return mapSuiviTacheActiviteFromApi(raw);
  },

  async delete(id: number): Promise<void> {
    await apiClient.request(`${ENDPOINT}${id}/`, {
      method: "DELETE",
    });
  },
};

export default suiviTacheActiviteService;