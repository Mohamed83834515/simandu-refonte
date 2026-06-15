import { apiClient } from "@/axios/api";
import type { NiveauStructure, PlanSite } from "../allTypes";
const BASE_URL = '/plan-sites/'

export const planSiteService = {
  async getAll(): Promise<PlanSite[]> {
    return await apiClient.request<PlanSite[]>(BASE_URL)
  },

  async getById(id: number): Promise<PlanSite> {
    return await apiClient.request<PlanSite>(`${BASE_URL}${id}/`)
  },

  async create(data: PlanSite): Promise<PlanSite> {
    return await apiClient.request<PlanSite>(BASE_URL, {
      method: "POST",
      data,
    })
  },

  async update(id: number, data: PlanSite): Promise<PlanSite> {
    return await apiClient.request<PlanSite>(`${BASE_URL}${id}/`, {
      method: "PUT",
      data,
    })
  },

  async delete(id: number): Promise<void> {
    await apiClient.request<void>(`${BASE_URL}${id}/`, {
      method: "DELETE",
    })
  },
}


const BASE_URL_NIVEAU = '/niveaux-niveaux-structure-config/'

export const NiveauStructureService = {
  async getAll(): Promise<NiveauStructure[]> {
    return await apiClient.request<NiveauStructure[]>(BASE_URL_NIVEAU)
  },

  async getById(id: number): Promise<NiveauStructure> {
    return await apiClient.request<NiveauStructure>(`${BASE_URL_NIVEAU}${id}/`)
  },

  async create(data: NiveauStructure[]): Promise<any> {
    return await apiClient.request(BASE_URL_NIVEAU, {
      method: "POST",
      data,
    })
  },

  async delete(id: number): Promise<void> {
    await apiClient.request<void>(`${BASE_URL_NIVEAU}${id}/`, {
      method: "DELETE",
    })
  },
}
