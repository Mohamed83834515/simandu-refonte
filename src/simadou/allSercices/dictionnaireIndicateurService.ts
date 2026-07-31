import { toast } from 'sonner'
import { apiClient } from '@/axios/api'
import type { DictionnaireIndicateur, DictionnaireIndicateurWritePayload } from '../allTypes'

export const dictionnaireIndicateurService = {
  // Get all indicateurs du dictionnaire
  getAll: async (): Promise<DictionnaireIndicateur[]> => {
    try {
      const response = await apiClient.request<DictionnaireIndicateur[]>(
        "/dictionnaires-indicateurs/",
      );
      return Array.isArray(response) ? response : [];
    } catch (error) {
      toast.error(
        "Erreur lors de la récupération des indicateurs du dictionnaire",
      );
      throw error;
    }
  },

  // Get indicateur by ID
  getById: async (id: number): Promise<DictionnaireIndicateur> => {
    try {
      return await apiClient.request<DictionnaireIndicateur>(
        `/dictionnaires-indicateurs/${id}/`,
      );
    } catch (error) {
      toast.error(
        "Erreur lors de la récupération de l'indicateur du dictionnaire",
      );
      throw error;
    }
  },

  // Search indicateurs by code
  searchByCode: async (code: string): Promise<DictionnaireIndicateur[]> => {
    try {
      const response = await apiClient.request<DictionnaireIndicateur[]>(
        `/dictionnaires-indicateurs/?code_ref_ind__icontains=${code}`,
      );
      return Array.isArray(response) ? response : [];
    } catch (error) {
      toast.error(
        "Erreur lors de la recherche des indicateurs du dictionnaire",
      );
      throw error;
    }
  },

  // Get indicateurs by responsable collecte
  getByResponsable: async (
    responsable: string,
  ): Promise<DictionnaireIndicateur[]> => {
    try {
      const response = await apiClient.request<DictionnaireIndicateur[]>(
        `/dictionnaires-indicateurs/?responsable_collecte_cmr=${responsable}`,
      );
      return Array.isArray(response) ? response : [];
    } catch (error) {
      toast.error(
        "Erreur lors de la récupération des indicateurs du dictionnaire",
      );
      throw error;
    }
  },

  // Get indicateurs by typologie
  getByTypologie: async (
    typologie: string,
  ): Promise<DictionnaireIndicateur[]> => {
    try {
      const response = await apiClient.request<DictionnaireIndicateur[]>(
        `/dictionnaires-indicateurs/?typologie=${typologie}`,
      );
      return Array.isArray(response) ? response : [];
    } catch (error) {
      toast.error(
        "Erreur lors de la récupération des indicateurs du dictionnaire",
      );
      throw error;
    }
  },

  // Get indicateurs by domaine thématique
  getByDomaine: async (domaine: string): Promise<DictionnaireIndicateur[]> => {
    try {
      const response = await apiClient.request<DictionnaireIndicateur[]>(
        `/dictionnaires-indicateurs/?domaine_thematique=${domaine}`,
      );
      return Array.isArray(response) ? response : [];
    } catch (error) {
      toast.error(
        "Erreur lors de la récupération des indicateurs du dictionnaire",
      );
      throw error;
    }
  },

  // Create new indicateur
  create: async (
    data: DictionnaireIndicateurWritePayload,
  ): Promise<DictionnaireIndicateur> => {
    try {
      const response = await apiClient.request<DictionnaireIndicateur>(
        "/dictionnaires-indicateurs/",
        {
          method: "POST",
          data,
        },
      );
      toast.success("Indicateur du dictionnaire créé avec succès");
      return response;
    } catch (error) {
      toast.error("Erreur lors de la création de l'indicateur du dictionnaire");
      throw error;
    }
  },

  // Update indicateur
  update: async (
    id: number,
    data: Partial<DictionnaireIndicateurWritePayload>,
  ): Promise<DictionnaireIndicateur> => {
    try {
      const response = await apiClient.request<DictionnaireIndicateur>(
        `/dictionnaires-indicateurs/${id}/`,
        {
          method: "PUT",
          data,
        },
      );
      toast.success("Indicateur du dictionnaire mis à jour avec succès");
      return response;
    } catch (error) {
      toast.error(
        "Erreur lors de la mise à jour de l'indicateur du dictionnaire",
      );
      throw error;
    }
  },

  // Delete indicateur
  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.request<DictionnaireIndicateur>(
        `/dictionnaires-indicateurs/${id}/`,
        {
          method: "DELETE",
        },
      );
      toast.success("Indicateur du dictionnaire supprimé avec succès");
    } catch (error) {
      toast.error(
        "Erreur lors de la suppression de l'indicateur du dictionnaire",
      );
      throw error;
    }
  },

  // Toggle status
  toggleStatus: async (id: number): Promise<DictionnaireIndicateur> => {
    try {
      const response = await apiClient.request<DictionnaireIndicateur>(
        `/dictionnaires-indicateurs/${id}/toggle_status/`,
        {
          method: "PATCH",
        },
      );
      toast.success(
        "Status de l'indicateur du dictionnaire mis à jour avec succès",
      );
      return response;
    } catch (error) {
      toast.error(
        "Erreur lors de la mise à jour du status de l'indicateur du dictionnaire",
      );
      throw error;
    }
  },
};
