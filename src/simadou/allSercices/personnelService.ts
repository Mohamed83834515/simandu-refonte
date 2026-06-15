import { toast } from "sonner";
import { apiClient } from "@/axios/api";
import type { Personnel } from "../allTypes";
import { PersonnelFormData } from "../allTypes/entities";


interface UpdateProfilePictureResponse {
   personnel_profile_picture: "string"
}
const BASE_URL = "/personnels/";

export const personnelService = {
  // Récupérer tous les personnels
  async getAll(): Promise<Personnel[]> {
    try {
      const response = await apiClient.request<Personnel[]>(BASE_URL);
      return response || [];
    } catch (error) {
      toast.error("Erreur lors de la récupération des personnels");
      throw error;
    }
  },

  // Récupérer un utilisateur par ID
  async getById(n_personnel: number): Promise<Personnel> {
    try {
      const response = await apiClient.request<Personnel>(
        `${BASE_URL}${n_personnel}/`,
      );
      return response;
    } catch (error) {
      toast.error("Erreur lors de la récupération du personnel");
      throw error;
    }
  },

  // Créer un nouveau personnel
  async create(data: PersonnelFormData): Promise<Personnel> {
    try {
      const response = await apiClient.request<Personnel>(BASE_URL, {
        method: "POST",
        data,
      });
      toast.success("Personnel créé avec succès");
      return response;
    } catch (error) {
      toast.error("Erreur lors de la création du personnel");
      throw error;
    }
  },

  // Mettre à jour un utilisateur
  async update(
    n_personnel: number,
    data: PersonnelFormData,
  ): Promise<Personnel> {
    try {
      if (typeof data.projet_active_perso === "string") {
        data.projet_active_perso = data.projet_active_perso
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean);
      }
      const response = await apiClient.request<Personnel>(
        `${BASE_URL}${n_personnel}/`,
        {
          method: "PUT",
          data,
        },
      );
      toast.success("Personnel mis à jour avec succès");
      return response;
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du personnel");
      throw error;
    }
  },

  // Supprimer un utilisateur
  async delete(n_personnel: number): Promise<void> {
    try {
      await apiClient.request<void>(`${BASE_URL}${n_personnel}/`, {
        method: "DELETE",
      });
      toast.success("Personnel supprimé avec succès");
    } catch (error) {
      toast.error("Erreur lors de la suppression du personnel");
      throw error;
    }
  },

  // Rechercher des personnels
  async search(query: string): Promise<Personnel[]> {
    try {
      const response = await apiClient.request<Personnel[]>(
        `${BASE_URL}search/?q=${encodeURIComponent(query)}`,
      );
      return response || [];
    } catch (error) {
      toast.error("Erreur lors de la recherche de personnels");
      throw error;
    }
  },

  // Activer un personnel
  async enable(n_personnel: number): Promise<void> {
    try {
      await apiClient.request<void>(`${BASE_URL}${n_personnel}/enable/`, {
        method: "PUT",
      });
      toast.success("Personnel activé avec succès");
    } catch (error) {
      toast.error("Erreur lors de l'activation du personnel");
      throw error;
    }
  },

  // Désactiver un personnel
  async disable(n_personnel: number): Promise<void> {
    try {
      await apiClient.request<void>(`${BASE_URL}${n_personnel}/disable/`, {
        method: "PUT",
      });
      toast.success("Personnel désactivé avec succès");
    } catch (error) {
      toast.error("Erreur lors de la désactivation du personnel");
      throw error;
    }
  },
  //  Update profile picture
  async updateProfilePicture(n_personnel : number, file : File) : Promise<UpdateProfilePictureResponse>{
    try {
      const formData = new FormData()
  formData.append('personnel_profile_picture', file)
     const res = await apiClient.request<UpdateProfilePictureResponse>(
    `/personnels/${n_personnel}/profile-picture/`, {
      data : formData,
      headers : { 'Content-Type': 'multipart/form-data' },
      method : 'PATCH'
    })
    return  res
    } catch (error) {
      toast.error("Erreur lors de la modification de la photo de profile");
      throw error;
    }
  },


  // Delete profile picture
  async deleteProfilePicture (n_personel : number) : Promise<void> {
    try {
        await apiClient.request<void>(`/personnels/${n_personel}/profile-picture/`, {
          method : 'DELETE'
        })
        toast.success("Photo de profile supprimée");
    } catch (error) {
      toast.error("Erreur lors de la suppression de la photo de profile");
      throw new Error
      
    }
  }



};



