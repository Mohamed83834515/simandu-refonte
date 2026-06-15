import { apiClient } from '@/axios/api'
import type { DocumentProjet } from '../allTypes/documentProjet'
import {
  filterDocumentsByProjet,
  type DocumentProjetApiPayload,
} from '../lib/documentProjetUtils'

const ENDPOINT = '/documents-projets/'

function toFormData(
  data: DocumentProjetApiPayload,
  file?: File
): FormData {
  const fd = new FormData()
  fd.append('projet', String(data.projet))
  if (data.description_document?.trim()) {
    fd.append('description_document', data.description_document.trim())
  }
  if (file) {
    fd.append('document', file, file.name)
  }
  return fd
}

const documentProjetService = {
  async getAll(): Promise<DocumentProjet[]> {
    return apiClient.request<DocumentProjet[]>(ENDPOINT, { method: 'GET' })
  },

  async getByProjet(idProjet: number): Promise<DocumentProjet[]> {
    try {
      const byParam = await apiClient.request<DocumentProjet[]>(ENDPOINT, {
        method: 'GET',
        params: { projet: idProjet },
      })
      if (byParam.length > 0) return byParam
    } catch {
      // Repli filtrage client
    }

    const all = await this.getAll()
    return filterDocumentsByProjet(all, idProjet)
  },

  async create(
    data: DocumentProjetApiPayload,
    file: File
  ): Promise<DocumentProjet> {
    return apiClient.request<DocumentProjet>(ENDPOINT, {
      method: 'POST',
      data: toFormData(data, file),
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  async update(
    id: number,
    data: DocumentProjetApiPayload,
    file?: File
  ): Promise<DocumentProjet> {
    return apiClient.request<DocumentProjet>(`${ENDPOINT}${id}/`, {
      method: 'PUT',
      data: toFormData(data, file),
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  async delete(id: number): Promise<void> {
    await apiClient.request(`${ENDPOINT}${id}/`, { method: 'DELETE' })
  },
}

export default documentProjetService
