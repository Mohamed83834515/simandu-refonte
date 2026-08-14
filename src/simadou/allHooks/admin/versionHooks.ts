import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useActiveProgrammeCode } from '@/hooks/use-active-programme'
import type { Programme } from '@/simadou/allTypes/programme'
import type { Projet, VersionPtba } from '@/simadou/allTypes'
import versionPtbaService from '@/simadou/allSercices/versionPtbaService'
import {
  filterVersionOptionsByProjetYears,
  getProjetPtbaYears,
  resolveActiveVersionOption,
  resolveVersionIdNumber,
} from '@/simadou/lib/ptbaVersionUtils'

import { toast } from 'sonner'
export const useGetVersions = () => {
  return useQuery({
    queryKey: ['versions-ptba'],
    queryFn: async () => {
      const allVersions = await versionPtbaService.getAll()
      return allVersions
    },
  })
}

export const useSaveVersion = (
  isEdit: boolean,
  currentRow?: any,
  onSuccess?: () => void
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ data, file }: { data: any; file?: File }) =>
      isEdit && currentRow?.id_version_ptba  // ✅ Utiliser id_version au lieu de id_type
        ? versionPtbaService.update(currentRow.id_version_ptba, data, file)
        : versionPtbaService.create(data, file),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["versions-ptba"],
      })

      toast.success(
        isEdit
          ? "Version PTBA modifiée avec succès"
          : "Version PTBA créée avec succès"
      )

      onSuccess?.()
    },

      // Ajouter tous les champs du formulaire
    onError: (error: any) => {
      console.error("Erreur version PTBA:", error)
      toast.error(
        error?.response?.data?.message ||
        "Une erreur est survenue lors de l'enregistrement"
      )
    },
  })
}

export const useDeleteVersion = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => versionPtbaService.delete(id),
    onSuccess: () => {
      toast.success('Version PTBA supprimée avec succès')
      queryClient.invalidateQueries({
        queryKey: ['versions-ptba'],
      })
    },
    onError: () => {
      toast.error("Erreur lors de la suppression de la version PTBA")
    },
  })
}

export const useValiderVersion = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: versionPtbaService.valider,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["versions-ptba"] });
      toast.success("Version validée avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la validation");
    },
  });
}

export const useArchiverVersion = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: versionPtbaService.archiver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["versions-ptba"] });
      toast.success("Version archivée avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de l'archivage");
    },
  });
}

function normalizeProgrammeCode(code: string): string {
  return code.trim()
}

/** Compare codes (ex. "002" et "2" si l'API renvoie des formats différents). */
export function programmeCodesMatch(a: string, b: string): boolean {
  const left = normalizeProgrammeCode(a)
  const right = normalizeProgrammeCode(b)
  if (left === right) return true
  const strip = (s: string) => s.replace(/^0+/, '') || '0'
  return strip(left) === strip(right)
}

/**
 * Indique si une version PTBA appartient au programme actif.
 * L'API peut renvoyer `programme` comme code string ou objet Programme imbriqué.
 */
export function versionBelongsToProgramme(
  version: VersionPtba,
  codeProgramme: string | undefined
): boolean {
  if (!codeProgramme?.trim()) return false

  const raw = version.programme
  if (typeof raw === 'string') {
    return programmeCodesMatch(raw, codeProgramme)
  }
  if (raw && typeof raw === 'object') {
    const nested = raw as Programme
    if (nested.code_programme) {
      return programmeCodesMatch(nested.code_programme, codeProgramme)
    }
  }
  return false
}

const SELECTED_VERSION_STORAGE_KEY = 'selectedVersionId'

function getLatestVersion(versions: VersionPtba[]): VersionPtba {
  const validatedVersions = versions.filter((v) => v.date_validation)
  if (validatedVersions.length > 0) {
    return [...validatedVersions].sort(
      (a, b) =>
        new Date(b.date_validation!).getTime() -
        new Date(a.date_validation!).getTime()
    )[0]
  }
  return versions[0]
}

/** Version PTBA pour les listes PTBA / suivi PTBA (toutes les versions, sans filtre programme). */
export function usePtbaVersionSelection(_codeProgramme?: string) {
  const { data: versions = [] } = useGetVersions()
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null)

  const versionsForProgramme = useMemo(() => versions, [versions])

  const versionOptions = useMemo(
    () =>
      versionsForProgramme.map((version: VersionPtba) => ({
        label: `${version.annee_ptba}  -  ${version.version_ptba || `Version ${version.id_version_ptba}`} `,
        value: version.id_version_ptba.toString(),
      })),
    [versionsForProgramme]
  )

  useEffect(() => {
    if (versionsForProgramme.length === 0) {
      setSelectedVersionId(null)
      return
    }

    // Ne pas écraser un choix utilisateur déjà valide (évite les boucles avec le filtre projet).
    setSelectedVersionId((current) => {
      if (
        current &&
        versionsForProgramme.some(
          (v) => v.id_version_ptba.toString() === current
        )
      ) {
        return current
      }

      const stored = localStorage.getItem(SELECTED_VERSION_STORAGE_KEY)
      if (
        stored &&
        versionsForProgramme.some(
          (v) => v.id_version_ptba.toString() === stored
        )
      ) {
        return stored
      }

      const preferredId = getLatestVersion(
        versionsForProgramme
      ).id_version_ptba.toString()
      localStorage.setItem(SELECTED_VERSION_STORAGE_KEY, preferredId)
      return preferredId
    })
  }, [versionsForProgramme])

  const handleChangeVersion = useCallback((versionId: string | null) => {
    setSelectedVersionId(versionId)
    if (versionId) {
      localStorage.setItem(SELECTED_VERSION_STORAGE_KEY, versionId)
    } else {
      localStorage.removeItem(SELECTED_VERSION_STORAGE_KEY)
    }
  }, [])

  return {
    selectedVersionId,
    setSelectedVersionId: handleChangeVersion,
    handleChangeVersion,
    versionOptions,
    versionsForProgramme,
  }
}

/**
 * Version PTBA pour les onglets projet (PTBA / Suivi PTBA) :
 * options limitées à la durée du projet, version active dérivée (pas d'effet de reset).
 */
export function useProjetPtbaVersionSelection(projet: Projet) {
  const fallbackProgrammeCode = useActiveProgrammeCode()
  const codeProgramme =
    typeof projet.programme_projet === 'object' &&
    projet.programme_projet?.code_programme
      ? projet.programme_projet.code_programme
      : fallbackProgrammeCode

  const {
    selectedVersionId,
    handleChangeVersion,
    versionOptions,
    versionsForProgramme,
  } = usePtbaVersionSelection(codeProgramme)

  const projectYears = useMemo(
    () => getProjetPtbaYears(projet),
    [projet.date_demarrage_projet, projet.duree_projet]
  )

  const filteredVersionOptions = useMemo(
    () => filterVersionOptionsByProjetYears(versionOptions, projectYears),
    [versionOptions, projectYears]
  )

  const activeVersionOption = useMemo(
    () =>
      resolveActiveVersionOption(filteredVersionOptions, selectedVersionId),
    [filteredVersionOptions, selectedVersionId]
  )

  const activeVersionId = activeVersionOption?.value ?? null
  const selectedVersionPtbaId = resolveVersionIdNumber(activeVersionId)

  const selectedVersion = useMemo(() => {
    if (!activeVersionId) return null
    return (
      versionsForProgramme.find(
        (v) => v.id_version_ptba.toString() === activeVersionId
      ) ?? null
    )
  }, [activeVersionId, versionsForProgramme])

  return {
    selectedVersionId: activeVersionId,
    handleChangeVersion,
    filteredVersionOptions,
    selectedVersionPtbaId,
    selectedVersion,
  }
}
