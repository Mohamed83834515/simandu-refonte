import { apiClient } from "@/axios/api";
import type { SourceVerificationSuiviAvancementContrat } from "../allTypes";

const ENDPOINT = "/sources-verification-suivi-avancement-contrat/";

const sourceVerificationSuiviAvancementContratService = {
  async getBySuivi(
    idSuivi: number,
  ): Promise<SourceVerificationSuiviAvancementContrat[]> {
    const response = await apiClient.request<
      SourceVerificationSuiviAvancementContrat[]
    >(`${ENDPOINT}?suivi_avancement_contrat=${idSuivi}`);
    return Array.isArray(response) ? response : [];
  },

  async uploadFiles(
    suiviAvancementContratId: number,
    files: File[],
  ): Promise<void> {
    for (const file of files) {
      const fd = new FormData();
      fd.append("suivi_avancement_contrat", String(suiviAvancementContratId));
      fd.append("fichier_join", file, file.name);
      await apiClient.request<SourceVerificationSuiviAvancementContrat>(
        ENDPOINT,
        { method: "POST", data: fd },
      );
    }
  },

  async delete(id: number): Promise<void> {
    await apiClient.request(`${ENDPOINT}${id}/`, {
      method: "DELETE",
    });
  },
};

export default sourceVerificationSuiviAvancementContratService;
