import { api, apiClient } from '@/axios/api'
import type { Ppm } from '@/simadou/allTypes/ppm'
import type { PpmFormData } from '@/simadou/schemas/ppmSchema'

const ENDPOINT = '/ppms/'

function filenameFromContentDisposition(
  header: string | undefined,
  fallback: string
): string {
  if (!header) return fallback
  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(header)
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].trim())
    } catch {
      return utf8Match[1].trim()
    }
  }
  const plainMatch = /filename="?([^";]+)"?/i.exec(header)
  return plainMatch?.[1]?.trim() || fallback
}

export const ppmService = {
  async getAll(): Promise<Ppm[]> {
    return apiClient.request<Ppm[]>(ENDPOINT, { method: 'GET' })
  },

  async getById(id: number): Promise<Ppm> {
    return apiClient.request<Ppm>(`${ENDPOINT}${id}/`, { method: 'GET' })
  },

  async create(data: PpmFormData): Promise<Ppm> {
    return apiClient.request<Ppm>(ENDPOINT, {
      method: 'POST',
      data,
    })
  },

  async update(id: number, data: Partial<PpmFormData>): Promise<Ppm> {
    return apiClient.request<Ppm>(`${ENDPOINT}${id}/`, {
      method: 'PUT',
      data,
    })
  },

  async delete(id: number): Promise<void> {
    await apiClient.request<void>(`${ENDPOINT}${id}/`, {
      method: 'DELETE',
    })
  },

  async downloadTemplate(): Promise<{ blob: Blob; filename: string }> {
    const response = await api.request<Blob>({
      url: `${ENDPOINT}template/`,
      method: 'GET',
      responseType: 'blob',
    })

    return {
      blob: response.data,
      filename: filenameFromContentDisposition(
        response.headers['content-disposition'],
        'PPM-canevas.xlsx'
      ),
    }
  },

  async importFromExcel(
    file: File,
    versionPpm?: number
  ): Promise<unknown> {
    const formData = new FormData()
    formData.append('file', file, file.name)
    if (versionPpm != null && Number.isFinite(versionPpm)) {
      formData.append('version_ppm', String(versionPpm))
    }

    return apiClient.request(`${ENDPOINT}import/`, {
      method: 'POST',
      data: formData,
    })
  },
}
