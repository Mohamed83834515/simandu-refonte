import { apiClient } from '@/axios/api'
import type { DocumentProjet } from '../allTypes/documentProjet'
import type { DocumentProjetApiPayload } from '../lib/documentProjetUtils'
import { normalizeApiList } from './apiListUtils'

const ENDPOINT = '/documents-projets/'
const DOSSIER_DOCUMENTS_BASE = '/dossiers-projets/'

function toFormData(
  data: DocumentProjetApiPayload,
  file?: File
): FormData {
  const fd = new FormData()
  fd.append('projet', String(data.projet))
  fd.append('dossier', String(data.dossier))
  if (data.description_document?.trim()) {
    fd.append('description_document', data.description_document.trim())
  }
  if (file) {
    fd.append('document', file, file.name)
  }
  return fd
}

const documentProjetService = {
  async getByDossier(idDossier: number): Promise<DocumentProjet[]> {
    const response = await apiClient.request<unknown>(
      `${DOSSIER_DOCUMENTS_BASE}${idDossier}/documents/`
    )
    return normalizeApiList<DocumentProjet>(response)
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
