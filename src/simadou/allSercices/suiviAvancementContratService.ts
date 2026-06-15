import { apiClient } from "@/axios/api";
import type {
  ETAT_SUIVI_VALUES,
  STATUT_ACTIVITE_VALUES,
} from "../schemas/suiviAvancementContratSchemas";
import {
  filterSuivisAvancementByActivite,
  SuiviAvancementContrat,
} from "../allTypes";

const ENDPOINT = "/suivi-avancement-contrat/";
const WITH_SOURCES_ENDPOINT = "/suivi-avancement-contrat/with-sources/";

export type SourceVerificationInput = {
  fichier_join: string;
  suivi_avancement_contrat: number;
};

/** Champs suivi envoyés avec sources (JSON ou multipart) */
export type SuiviAvancementContratPayload = {
  id_suivi?: number;
  date_suivi: string;
  code_suivi?: string | null;
  statut_activite: (typeof STATUT_ACTIVITE_VALUES)[number];
  etat_avancement: string;
  retard_accuse: string;
  difficultes_rencontrees: string;
  pistes_solutions: string;
  observation: string;
  documents?: string | null;
  etat: (typeof ETAT_SUIVI_VALUES)[number];
  activite_ptba: number;
  sous_activite?: number | null;
  id_personnel: number;
  modifier_par: string;
};

export type SuiviAvancementWithSourcesInput = {
  suivi: SuiviAvancementContratPayload;
  /** Nouveaux fichiers à joindre (multipart). */
  fichiers: File[];
  /** Documents déjà enregistrés à conserver (JSON ou métadonnées multipart). */
  existingSources: SourceVerificationInput[];
};

function appendSuiviFields(fd: FormData, suivi: SuiviAvancementContratPayload) {
  if (suivi.id_suivi != null) {
    fd.append("id_suivi", String(suivi.id_suivi));
  }
  fd.append("date_suivi", suivi.date_suivi);
  fd.append("etat_avancement", suivi.etat_avancement);
  fd.append("statut_activite", suivi.statut_activite);
  fd.append("retard_accuse", suivi.retard_accuse);
  fd.append("difficultes_rencontrees", suivi.difficultes_rencontrees);
  fd.append("pistes_solutions", suivi.pistes_solutions);
  fd.append("observation", suivi.observation);
  fd.append("etat", suivi.etat);
  fd.append("activite_ptba", String(suivi.activite_ptba));
  fd.append("id_personnel", String(suivi.id_personnel));
  fd.append("modifier_par", suivi.modifier_par);

  if (suivi.code_suivi != null && suivi.code_suivi !== "") {
    fd.append("code_suivi", suivi.code_suivi);
  }
  if (suivi.documents != null && suivi.documents !== "") {
    fd.append("documents", suivi.documents);
  }
  if (suivi.sous_activite != null) {
    fd.append("sous_activite", String(suivi.sous_activite));
  }
}

function toJsonBody(
  suivi: SuiviAvancementContratPayload,
  existingSources: SourceVerificationInput[],
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    sources_verification: existingSources.filter(
      (s) => s.fichier_join.trim() && s.suivi_avancement_contrat > 0,
    ),
    date_suivi: suivi.date_suivi,
    code_suivi: suivi.code_suivi ?? null,
    etat_avancement: suivi.etat_avancement,
    statut_activite: suivi.statut_activite,
    retard_accuse: suivi.retard_accuse,
    difficultes_rencontrees: suivi.difficultes_rencontrees,
    pistes_solutions: suivi.pistes_solutions,
    observation: suivi.observation,
    documents: suivi.documents ?? null,
    etat: suivi.etat,
    activite_ptba: suivi.activite_ptba,
    sous_activite: suivi.sous_activite ?? null,
    id_personnel: suivi.id_personnel,
    modifier_par: suivi.modifier_par,
  };

  if (suivi.id_suivi != null) {
    body.id_suivi = suivi.id_suivi;
  }

  return body;
}

function toMultipartBody(
  suivi: SuiviAvancementContratPayload,
  fichiers: File[],
  existingSources: SourceVerificationInput[],
): FormData {
  const fd = new FormData();
  appendSuiviFields(fd, suivi);

  const kept = existingSources.filter((s) => s.fichier_join.trim());
  if (kept.length > 0) {
    fd.append("sources_verification", JSON.stringify(kept));
  }

  for (const file of fichiers) {
    fd.append("sources_verification", file, file.name);
  }

  return fd;
}

const suiviAvancementContratService = {
  async getByActivite(idActivite: number): Promise<SuiviAvancementContrat[]> {
    const response = await apiClient.request<SuiviAvancementContrat[]>(ENDPOINT);
    const items = Array.isArray(response) ? response : [];
    return filterSuivisAvancementByActivite(items, idActivite);
  },

  async createWithSources(
    input: SuiviAvancementWithSourcesInput,
  ): Promise<SuiviAvancementContrat> {
    const { suivi, fichiers, existingSources } = input;
    if (fichiers.length > 0) {
      return apiClient.request<SuiviAvancementContrat>(WITH_SOURCES_ENDPOINT, {
        method: "POST",
        data: toMultipartBody(suivi, fichiers, existingSources),
      });
    }
    return apiClient.request<SuiviAvancementContrat>(WITH_SOURCES_ENDPOINT, {
      method: "POST",
      data: toJsonBody(suivi, existingSources),
    });
  },

  async updateWithSources(
    id: number,
    input: SuiviAvancementWithSourcesInput,
  ): Promise<SuiviAvancementContrat> {
    const { suivi, fichiers, existingSources } = input;
    const url = `${ENDPOINT}${id}/with-sources/`;
    const payload = {
      ...input,
      suivi: { ...suivi, id_suivi: id },
    };

    if (fichiers.length > 0) {
      return apiClient.request<SuiviAvancementContrat>(url, {
        method: "PUT",
        data: toMultipartBody(payload.suivi, fichiers, existingSources),
      });
    }
    return apiClient.request<SuiviAvancementContrat>(url, {
      method: "PUT",
      data: toJsonBody(payload.suivi, existingSources),
    });
  },

  async delete(id: number): Promise<void> {
    await apiClient.request(`${ENDPOINT}${id}/`, {
      method: "DELETE",
    });
  },
};

export default suiviAvancementContratService;
