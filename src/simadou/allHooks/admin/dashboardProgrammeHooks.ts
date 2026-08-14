import { useActiveProgrammeCode } from "@/hooks/use-active-programme"
import { dashboardService } from "@/simadou/allSercices/dashbordService"
import tacheActivitePtbaService from "@/simadou/allSercices/tacheActivitePtbaService"
import { useQuery } from "@tanstack/react-query"

import { useMemo, useState } from 'react'
import type { VersionPtba } from '@/simadou/allTypes'
import {
  buildLatestVersionByAnneeMap,
  getAnneesDisponiblesFromVersions,
} from '@/simadou/lib/versionPtbaUtils'

export const tachesActiviteByPlanSiteQueryKeys = {
  byVersion: (versionId: number, codeProgramme?: string) =>
    ['tache-activite-by-plan-site', versionId, codeProgramme ?? ''] as const,
}
export const avancementComposanteQueryKeys = {
  byVersion: (niveau: number, versionId: number, codeProgramme?: string) =>
    ['avancement-composantes', niveau, versionId, codeProgramme ?? ''] as const,
}

export const tachesActiviteByUglQueryKeys = {
  byVersion: (versionId: number, codeProgramme?: string) =>
    ['tache-activite-by-ugl', versionId, codeProgramme ?? ''] as const,
}

export function useGetAvancementParComposantes(niveau?: number, versionId?: number) {
  const codeProgramme = useActiveProgrammeCode()

  return useQuery({
    queryKey: avancementComposanteQueryKeys.byVersion(
      niveau ?? 0,
      versionId ?? 0,
      codeProgramme
    ),
    queryFn: () =>
      dashboardService.avancementParComposante(codeProgramme ?? '', niveau ?? 0, versionId ?? 0),
    enabled: niveau != null && niveau > 0,
  })
}
export function useGetTachesActiviteByPlanSite(versionId?: number) {
  const codeProgramme = useActiveProgrammeCode()

  return useQuery({
    queryKey: tachesActiviteByPlanSiteQueryKeys.byVersion(
      versionId ?? 0,
      codeProgramme
    ),
    queryFn: () =>
      tacheActivitePtbaService.getByPlanSite({
        versionPtba: versionId!,
        codeProgramme: codeProgramme ?? undefined,
      }),
    enabled: versionId != null && versionId > 0,
  })
}

export function useGetTachesActiviteByUgl(versionId?: number) {
  const codeProgramme = useActiveProgrammeCode()

  return useQuery({
    queryKey: tachesActiviteByUglQueryKeys.byVersion(
      versionId ?? 0,
      codeProgramme
    ),
    queryFn: () =>
      tacheActivitePtbaService.getByUgl({
        versionPtba: versionId!,
        codeProgramme: codeProgramme ?? undefined,
      }),
    enabled: versionId != null && versionId > 0,
  })
}

export function useDashboardAnneeSelection(versions: VersionPtba[]) {
  const anneesDisponibles = useMemo(
    () => getAnneesDisponiblesFromVersions(versions),
    [versions]
  )

  const versionsParAnnee = useMemo(
    () => buildLatestVersionByAnneeMap(versions),
    [versions]
  )

  const [anneeSelectionnee, setAnneeSelectionnee] = useState<number | null>(
    null
  )

  const selectedAnnee =
    anneeSelectionnee ??
    anneesDisponibles[0] ??
    new Date().getFullYear()

  const selectedVersion = versionsParAnnee.get(selectedAnnee) ?? null

  return {
    anneesDisponibles,
    selectedAnnee,
    setSelectedAnnee: setAnneeSelectionnee,
    selectedVersion,
  }
}

export const useGetAvancementDirections = () => {
  const codeProgramme = useActiveProgrammeCode()

  return useQuery({
    queryKey: ['avancement-direction-all', codeProgramme],
    queryFn: () => dashboardService.avancementParDirections(codeProgramme!),
    enabled: !!codeProgramme,
  })
}