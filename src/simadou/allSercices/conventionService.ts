import { apiClient } from '@/axios/api'
import type { Convention, ConventionApiPayload } from '@/simadou/allTypes/convention'
import { filterConventionsByProjet } from '@/simadou/lib/conventionUtils'
import { normalizeApiList } from './apiListUtils'

const ENDPOINT = '/conventions/'

function toFormData(data: ConventionApiPayload, file?: File | null): FormData {
  const fd = new FormData()
  fd.append('code_convention', data.code_convention)
  fd.append('intutile_conv', data.intutile_conv)
  fd.append('reference_conv', data.reference_conv)
  fd.append('montant_conv', String(data.montant_conv))
  fd.append('date_signature_conv', data.date_signature_conv)
  fd.append('projet', String(data.projet))
  if (data.etat_conv) {
    fd.append('etat_conv', data.etat_conv)
  }
  if (data.partenaire_conv != null) {
    fd.append('partenaire_conv', String(data.partenaire_conv))
  }
  if (file) {
    fd.append('document_fichier', file, file.name)
  }
  return fd
}

function toJsonPayload(data: ConventionApiPayload): Record<string, unknown> {
  return {
    code_convention: data.code_convention,
    intutile_conv: data.intutile_conv,
    reference_conv: data.reference_conv,
    montant_conv: data.montant_conv,
    date_signature_conv: data.date_signature_conv,
    etat_conv: data.etat_conv,
    partenaire_conv: data.partenaire_conv ?? null,
    projet: data.projet,
    document_fichier:
      typeof data.document_fichier === 'string' ? data.document_fichier : null,
  }
}

function resolveFile(data: ConventionApiPayload): File | null {
  return data.document_fichier instanceof File ? data.document_fichier : null
}

export const conventionService = {
  async getAll(): Promise<Convention[]> {
    const response = await apiClient.request<unknown>(ENDPOINT, { method: 'GET' })
    return normalizeApiList<Convention>(response)
  },

  async getByProjet(idProjet: number): Promise<Convention[]> {
    try {
      const byParam = await apiClient.request<unknown>(ENDPOINT, {
        method: 'GET',
        params: { projet: idProjet },
      })
      const items = normalizeApiList<Convention>(byParam)
      if (items.length > 0) return items
    } catch {
      // Repli filtrage client
    }

    const all = await this.getAll()
    return filterConventionsByProjet(all, idProjet)
  },

  async create(data: ConventionApiPayload): Promise<Convention> {
    const file = resolveFile(data)
    return apiClient.request<Convention>(ENDPOINT, {
      method: 'POST',
      data: file ? toFormData(data, file) : toJsonPayload(data),
    })
  },

  async update(id: number, data: ConventionApiPayload): Promise<Convention> {
    const file = resolveFile(data)
    return apiClient.request<Convention>(`${ENDPOINT}${id}/`, {
      method: 'PUT',
      data: file ? toFormData(data, file) : toJsonPayload(data),
    })
  },

  async delete(id: number): Promise<void> {
    await apiClient.request<void>(`${ENDPOINT}${id}/`, {
      method: 'DELETE',
    })
  },
}
