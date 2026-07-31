import { toast } from "sonner";
import { apiClient } from "@/axios/api";
import { CadreSecteur, CadreSecteurFormData } from "../allTypes/entities";

class CadreSecteurService {
  private baseUrl = "/cadres-secteurs";

  async getAll(): Promise<CadreSecteur[]> {
    const response = await apiClient.request<CadreSecteur[]>(this.baseUrl);
    return Array.isArray(response) ? response : [];
  }

  async getById(id: number): Promise<CadreSecteur> {
    return await apiClient.request<CadreSecteur>(`${this.baseUrl}/${id}`);
  }

  async getHierarchy(): Promise<CadreSecteur[]> {
    const response = await apiClient.request<CadreSecteur[]>(
      `${this.baseUrl}/hierarchy`,
    );
    return Array.isArray(response) ? response : [];
  }

  async getByParent(parentId: number | null): Promise<CadreSecteur[]> {
    const url = parentId
      ? `${this.baseUrl}/parent/${parentId}`
      : `${this.baseUrl}/root`;
    const response = await apiClient.request<CadreSecteur[]>(url);
    return Array.isArray(response) ? response : [];
  }

  async create(data: CadreSecteurFormData): Promise<CadreSecteur> {
    const response = await apiClient.request<CadreSecteur>(this.baseUrl, {
      method: "POST",
      data,
    });
    toast.success("Cadre secteur créé avec succès");
    return response;
  }

  async update(id: number, data: CadreSecteurFormData): Promise<CadreSecteur> {
    const response = await apiClient.request<CadreSecteur>(
      `${this.baseUrl}/${id}`,
      {
        method: "PUT",
        data,
      },
    );
    toast.success("Cadre secteur mis à jour avec succès");
    return response;
  }

  async delete(id: number): Promise<void> {
    await apiClient.request(`${this.baseUrl}/${id}`, {
      method: "DELETE",
    });
    toast.success("Cadre secteur supprimé avec succès");
  }

  async getChildren(parentId: number): Promise<CadreSecteur[]> {
    const response = await apiClient.request<CadreSecteur[]>(
      `${this.baseUrl}/children/${parentId}`,
    );
    return Array.isArray(response) ? response : [];
  }
}

export const cadreSecteurService = new CadreSecteurService();
