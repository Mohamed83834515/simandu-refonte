import { apiClient } from '@/axios/api'
import type { GroupeEtapePassation } from '@/simadou/allTypes/groupeEtapePassation'

const ENDPOINT = '/groupes-etapes-passation/'

export const groupeEtapePassationService = {
    async getAll(): Promise<GroupeEtapePassation[]> {
        return apiClient.request<GroupeEtapePassation[]>(ENDPOINT, {
            method: 'GET',
        })
    },

    async getById(id: number): Promise<GroupeEtapePassation> {
        return apiClient.request<GroupeEtapePassation>(`${ENDPOINT}${id}/`, {
            method: 'GET',
        })
    },
}