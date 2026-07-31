import { apiClient } from '@/axios/api'
import { toast } from 'sonner'
import type { NiveauCadreStrategique } from '../allTypes'

export interface NiveauCadreStrategiqueFormData {
  nombre_nsc: number
  libelle_nsc: string
  code_number_nsc: number
  type_niveau: number
  programme?: string
}

export const niveauCadreStrategiqueService = {
  // Récupérer tous les niveaux
  async getAll(
    activeProgrammeCode?: string
  ): Promise<NiveauCadreStrategique[]> {
    try {
      const response = await apiClient.request<NiveauCadreStrategique[]>(
        '/niveaux-cadres-strategiques/'
      )
      response.sort((a, b) => a.nombre_nsc - b.nombre_nsc)
      if (activeProgrammeCode) {
        return response.filter((n) =>
          typeof n.programme == 'object'
            ? n.programme?.code_programme == activeProgrammeCode
            : n.programme == activeProgrammeCode
        )
      }
      return response || []
    } catch (error) {
      toast.error('Erreur lors de la récupération des niveaux')
      throw error
    }
  },

  // Récupérer un niveau par ID
  async getById(id_nsc: number): Promise<NiveauCadreStrategique> {
    return await apiClient.request<NiveauCadreStrategique>(
      `/niveaux-cadres-strategiques/${id_nsc}/`
    )
  },

  // Créer un nouveau niveau
  async create(
    data: NiveauCadreStrategiqueFormData
  ): Promise<NiveauCadreStrategique> {
    return await apiClient.request<NiveauCadreStrategique>(
      '/niveaux-cadres-strategiques/',
      {
        method: 'POST',
        data,
      }
    )
  },

  // Mettre à jour un niveau
  async update(
    id_nsc: number,
    data: NiveauCadreStrategiqueFormData
  ): Promise<NiveauCadreStrategique> {
    return await apiClient.request<NiveauCadreStrategique>(
      `/niveaux-cadres-strategiques/${id_nsc}/`,
      {
        method: 'PUT',
        data,
      }
    )
  },

  // Supprimer un niveau
  async delete(id_nsc: number): Promise<void> {
    await apiClient.request<void>(`/niveaux-cadres-strategiques/${id_nsc}/`, {
      method: 'DELETE',
    })
  },
}
