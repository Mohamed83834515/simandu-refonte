import { apiClient } from '@/axios/api'
import type { SourceVerificationSuiviAvancementConvention } from '../allTypes/sourceVerificationSuiviAvancementConvention'

const ENDPOINT = '/sources-verification-suivi-avancement-conventions/'

const sourceVerificationSuiviAvancementConventionService = {
  async getBySuivi(
    idSuivi: number
  ): Promise<SourceVerificationSuiviAvancementConvention[]> {
    const response = await apiClient.request<
      SourceVerificationSuiviAvancementConvention[]
    >(`${ENDPOINT}?suivi_avancement_convention=${idSuivi}`)
    return Array.isArray(response) ? response : []
  },

  async uploadFiles(
    suiviAvancementConventionId: number,
    files: File[]
  ): Promise<void> {
    for (const file of files) {
      const fd = new FormData()
      fd.append(
        'suivi_avancement_convention',
        String(suiviAvancementConventionId)
      )
      fd.append('fichier_join', file, file.name)
      await apiClient.request<SourceVerificationSuiviAvancementConvention>(
        ENDPOINT,
        { method: 'POST', data: fd }
      )
    }
  },

  async delete(id: number): Promise<void> {
    await apiClient.request(`${ENDPOINT}${id}/`, { method: 'DELETE' })
  },
}

export default sourceVerificationSuiviAvancementConventionService
