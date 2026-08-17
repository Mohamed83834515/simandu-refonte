import { apiClient } from '@/axios/api'
import type { EtapePassation } from '@/simadou/allTypes/etapePassation'

const ENDPOINT = '/etapes-passation/'

export type EtapePassationPayload = {
    etape: string
    date_prevu?: string | null
    date_realise?: string | null
    groupe_etape?: number | null
    ppm: number
}

export const etapePassationService = {
    async getAll(): Promise<EtapePassation[]> {
        return apiClient.request<EtapePassation[]>(ENDPOINT, { method: 'GET' })
    },

    async getAllByPpm(idPpm: number): Promise<EtapePassation[]> {
        const query = `?ppm=${idPpm}`
        return apiClient.request<EtapePassation[]>(`${ENDPOINT}${query}`, { method: 'GET' })
    },

    async getById(id: number): Promise<EtapePassation> {
        return apiClient.request<EtapePassation>(`${ENDPOINT}${id}/`, {
            method: 'GET',
        })
    },

    async create(data: EtapePassationPayload): Promise<EtapePassation> {
        return apiClient.request<EtapePassation>(ENDPOINT, {
            method: 'POST',
            data,
        })
    },

    async createWithSources(
        data: EtapePassationPayload,
        files: File[]
    ): Promise<EtapePassation> {
        const formData = new FormData()
        formData.append('etape', data.etape)
        if (data.date_prevu) formData.append('date_prevu', data.date_prevu)
        if (data.date_realise) formData.append('date_realise', data.date_realise)
        if (data.groupe_etape != null) {
            formData.append('groupe_etape', String(data.groupe_etape))
        }
        formData.append('ppm', String(data.ppm))

        files.forEach((file, index) => {
            formData.append(`sources_verification[${index}]fichier_join`, file, file.name)
        })

        return apiClient.request<EtapePassation>(`${ENDPOINT}with-sources/`, {
            method: 'POST',
            data: formData,
        })
    },

    async update(
        id: number,
        data: Partial<EtapePassationPayload>
    ): Promise<EtapePassation> {
        return apiClient.request<EtapePassation>(`${ENDPOINT}${id}/`, {
            method: 'PUT',
            data,
        })
    },

    async delete(id: number): Promise<void> {
        await apiClient.request<void>(`${ENDPOINT}${id}/`, { method: 'DELETE' })
    },
}