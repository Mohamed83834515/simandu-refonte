import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error-message'
import versionPPMService from '@/simadou/allSercices/versionPPMService'
import type { VersionPPM } from '@/simadou/allTypes/versionPPM'
import { VersionPPMFormData } from '@/simadou/schemas/ppmShema'

export const versionPPMQueryKeys = {
  all: ['versions-ppm'] as const,
  list: () => [...versionPPMQueryKeys.all, 'list'] as const,
}

const SELECTED_PPM_VERSION_STORAGE_KEY = 'selectedPpmVersionId'

function getLatestVersionPpm(versions: VersionPPM[]): VersionPPM {
  return [...versions].sort(
    (a, b) =>
      new Date(b.date_version).getTime() - new Date(a.date_version).getTime()
  )[0]
}

export const useGetVersionsPPM = () => {
  return useQuery({
    queryKey: versionPPMQueryKeys.list(),
    queryFn: () => versionPPMService.getAll(),
  })
}

/** Sélection de version PPM pour la liste / création PPMS (comme PTBA). */
export function usePpmVersionSelection() {
  const { data: versions = [] } = useGetVersionsPPM()
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null)

  const versionOptions = useMemo(
    () =>
      versions
        .filter((version) => version.id_version_ppm != null)
        .map((version) => ({
          label:
            version.numero_version_ppm?.trim() ||
            `Version ${version.id_version_ppm}`,
          value: String(version.id_version_ppm),
        })),
    [versions]
  )

  useEffect(() => {
    if (versions.length === 0) {
      setSelectedVersionId(null)
      return
    }

    setSelectedVersionId((current) => {
      if (
        current &&
        versions.some((v) => String(v.id_version_ppm) === current)
      ) {
        return current
      }

      const stored = localStorage.getItem(SELECTED_PPM_VERSION_STORAGE_KEY)
      if (stored && versions.some((v) => String(v.id_version_ppm) === stored)) {
        return stored
      }

      const preferredId = String(
        getLatestVersionPpm(versions).id_version_ppm
      )
      localStorage.setItem(SELECTED_PPM_VERSION_STORAGE_KEY, preferredId)
      return preferredId
    })
  }, [versions])

  const handleChangeVersion = useCallback((versionId: string | null) => {
    setSelectedVersionId(versionId)
    if (versionId) {
      localStorage.setItem(SELECTED_PPM_VERSION_STORAGE_KEY, versionId)
    } else {
      localStorage.removeItem(SELECTED_PPM_VERSION_STORAGE_KEY)
    }
  }, [])

  return {
    selectedVersionId,
    handleChangeVersion,
    versionOptions,
    versions,
  }
}

export const useSaveVersionPPM = (isEdit: boolean, currentRow?: any, onSuccess?: () => void) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: VersionPPMFormData) =>
      isEdit && currentRow?.id_version_ppm

        ? versionPPMService.update(currentRow.id_version_ppm, data)
        : versionPPMService.create(data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: versionPPMQueryKeys.list(),
      })
      toast.success(isEdit ? 'Version PPM modifiée avec succès' : 'Version PPM créée avec succès')
      onSuccess?.()
    },

    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Une erreur est survenue'))
    },
  })
}

export const useDeleteVersionPPM = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => versionPPMService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: versionPPMQueryKeys.list(),
      })
      toast.success('Version PPM supprimée avec succès')
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erreur lors de la suppression'))
    },
  })
}