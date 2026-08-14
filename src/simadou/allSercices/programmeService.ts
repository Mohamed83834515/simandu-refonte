import { toast } from "sonner";
import { apiClient } from "@/axios/api";
import type {
  Programme,
  ProgrammeFormData,
  ProgrammeSelectOption,
} from "../allTypes/programme";

const endpoint = "/programmes/";

export const programmeService = {
  // Récupérer tous les programmes
  async getAll(): Promise<Programme[]> {
    try {
      const response = await apiClient.request<Programme[]>(endpoint);
      return response || [];
    } catch (error) {
      console.error("Erreur lors de la récupération des programmes:", error);
      toast.error("Erreur lors du chargement des programmes");
      throw error;
    }
  },

  // Récupérer un programme par ID
  async getById(id: number): Promise<Programme> {
    try {
      return await apiClient.request<Programme>(`${endpoint}${id}/`);
    } catch (error) {
      console.error(`Erreur lors de la récupération du programme ${id}:`, error);
      toast.error("Erreur lors du chargement du programme");
      throw error;
    }
  },

  // Créer un programme
  async create(data: ProgrammeFormData): Promise<Programme> {
    try {
      return await apiClient.request<Programme>(endpoint, {
        method: "POST",
        data,
      });
    } catch (error) {
      console.error("Erreur lors de la création du programme:", error);
      throw error;
    }
  },

  // Mettre à jour un programme
  async update(
    id: number,
    data: Partial<ProgrammeFormData>
  ): Promise<Programme> {
    try {
      return await apiClient.request<Programme>(`${endpoint}${id}/`, {
        method: "PUT",
        data,
      });
    } catch (error) {
      console.error(`Erreur lors de la modification du programme ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un programme
  async delete(id: number): Promise<void> {
    await apiClient.request(`${endpoint}${id}/`, {
      method: "DELETE",
    });
  },

  // Options pour react-select
  async getSelectOptions(): Promise<ProgrammeSelectOption[]> {
    try {
      const programmes = await programmeService.getAll();
      return programmes
        .filter((programme) => programme.actif_programme)
        .map((programme) => ({
          value: programme.id_programme,
          label: `${programme.sigle_programme} - ${programme.nom_programme}`,
          programme,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des options de programmes:",
        error
      );
      return [];
    }
  },

  // Récupérer les programmes actifs
  async getActivePrograms(): Promise<Programme[]> {
    try {
      const programmes = await programmeService.getAll();
      return programmes.filter((programme) => programme.actif_programme);
    } catch (error) {
      console.error("Erreur lors de la récupération des programmes actifs:", error);
      return [];
    }
  },

  // Recherche de programmes
  async searchPrograms(query: string): Promise<Programme[]> {
    try {
      const programmes = await programmeService.getAll();
      const searchTerm = query.toLowerCase();

      return programmes.filter(
        (programme) =>
          programme.nom_programme.toLowerCase().includes(searchTerm) ||
          programme.sigle_programme.toLowerCase().includes(searchTerm) ||
          programme.code_programme.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error("Erreur lors de la recherche de programmes:", error);
      return [];
    }
  },
};
