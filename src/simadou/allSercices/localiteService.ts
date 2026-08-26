import { apiClient } from "@/axios/api";
import { Localite } from "../allTypes/localite";

const LOCALITE_URL = "/localites/";
export const localiteService = {
  async getAll(): Promise<Localite[]> {
    return await apiClient.request<Localite[]>(LOCALITE_URL)
  },

  async getById(id: number): Promise<Localite> {
    return await apiClient.request<Localite>(`${LOCALITE_URL}${id}/`)
  },

  async getByParent(parentId: number | null): Promise<Localite[]> {
    const allLocalites = await this.getAll()

    if (parentId === null) {
      // Retourner les localités sans parent (niveau 1)
      return allLocalites.filter((loc) => loc.parent_loca === null)
    }

    // Filtrer les localités dont l'id du parent correspond
    return allLocalites.filter((loc) => {
      if (!loc.niveau_loca) return false
      if (loc.niveau_loca && typeof loc.niveau_loca === 'number') {
        return loc.niveau_loca === parentId
      }
      // Si parent_loca est un objet
      return (loc.niveau_loca as any).nombre_nlc === parentId
    })
  },

  // ✅ Correction: Filtrer les localités par niveau côté frontend
  async getByNiveau(niveauId: number): Promise<{ localites: Localite[] }> {
    const allLocalites = await this.getAll()
    // Filtrer les localités dont l'objet niveau_loca a l'id correspondant
    const filtered = allLocalites.filter((loc) => {
      // Si niveau_loca est un objet, comparer son id
      if (loc.niveau_loca && typeof loc.niveau_loca === 'object') {
        return (loc.niveau_loca as any).id_nlc === niveauId
      }
      // Si c'est un nombre (ancienne structure), comparer directement
      return loc.niveau_loca === niveauId
    })
    return { localites: filtered }
  },


  // Récupérer les localités de premier niveau (parent === null)
  async getOneLevel(): Promise<Localite[]> {
    const response = await this.getAll()
    return response.filter((loc) => loc.parent_loca === null)
  },

  async create(data: Localite): Promise<Localite> {
    if (data.shape_file) {
      // Si un fichier est fourni, utiliser FormData
      const formData = new FormData();

      // Ajouter tous les champs du formulaire
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Ajouter le fichier avec la clé documentUrl
      formData.append("shape_file", data.shape_file);

      return apiClient.request(LOCALITE_URL, {
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } else {
      delete data.shape_file;
      // Pas de fichier, utiliser JSON normal
      return apiClient.request(LOCALITE_URL, {
        method: "POST",
        data,
      });
    }
  },

  async update(data: Localite): Promise<Localite> {
    if (data.shape_file) {
      const formData = new FormData();

      console.log("update data", data);

      // Ajouter tous les champs sauf shape_file
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'shape_file' && value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      if (typeof data.shape_file !== 'string') {
        formData.append("shape_file", data.shape_file as File);
      }

      return apiClient.request(`${LOCALITE_URL}${data.id_loca}/`, {
        method: "PATCH",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } else {
      const updateData = { ...data };
      delete updateData.shape_file;

      return apiClient.request(`${LOCALITE_URL}${data.id_loca}/`, {
        method: "PATCH",
        data: updateData,
      });
    }
  },

  async delete(id: number): Promise<void> {
    await apiClient.request<void>(`${LOCALITE_URL}${id}/`, {
      method: "DELETE",
    })
  },
}