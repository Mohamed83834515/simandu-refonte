import { apiClient } from '@/axios/api'
import type { SourceVerificationEtapePassation } from '@/simadou/allTypes/sourceVerificationEtapePassation'

const ENDPOINT = '/sources-verification-etapes-passation/'

export type SourceVerificationEtapePassationPayload = {
    fichier_join: File
    etape_passation: number
}

export const sourceVerificationEtapePassationService = {
    async getAll(params?: {
        etape_passation?: number
    }): Promise<SourceVerificationEtapePassation[]> {
        const query =
            params?.etape_passation != null
                ? `?etape_passation=${params.etape_passation}`
                : ''
        return apiClient.request<SourceVerificationEtapePassation[]>(
            `${ENDPOINT}${query}`,
            { method: 'GET' }
        )
    },

    async create(
        data: SourceVerificationEtapePassationPayload
    ): Promise<SourceVerificationEtapePassation> {
        const formData = new FormData()
        formData.append('fichier_join', data.fichier_join, data.fichier_join.name)
        formData.append('etape_passation', String(data.etape_passation))

        return apiClient.request<SourceVerificationEtapePassation>(ENDPOINT, {
            method: 'POST',
            data: formData,
        })
    },

    async delete(id: number): Promise<void> {
        await apiClient.request<void>(`${ENDPOINT}${id}/`, { method: 'DELETE' })
    },
}