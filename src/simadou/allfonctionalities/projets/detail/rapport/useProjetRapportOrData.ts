import { useMemo } from 'react'
import {
  useGetActivitesProjet,
  useGetNiveauxActiviteProjet,
} from '@/simadou/allHooks/admin/activiteProjetHooks'
import {
  useGetCadresResultat,
  useGetNiveauxCadreResultat,
} from '@/simadou/allHooks/admin/cadreResultatHooks'
import { useGetDossiersProjet } from '@/simadou/allHooks/admin/dossierProjetHooks'
import { useGetFinancementsProjet } from '@/simadou/allHooks/admin/financementProjetHooks'
import {
  useGetPtbasProjet,
  useGetPtbasProjetsByVersion,
} from '@/simadou/allHooks/admin/ptbaProjetHooks'
import {
  useGetTauxGlobalActiviteProjet,
} from '@/simadou/allHooks/admin/projetHooks'
import { useSuiviPtbaProjetActivitesProgress } from '@/simadou/allHooks/admin/suiviPtbaProjetHooks'
import { useProjetPtbaVersionSelection } from '@/simadou/allHooks/admin/versionHooks'
import type { Projet } from '@/simadou/allTypes'
import type { PtbaProjet } from '@/simadou/allTypes/ptbaProjet'

const EMPTY_PTBAS: PtbaProjet[] = []

export function useProjetRapportOrData(projet: Projet) {
  const idProjet = projet.id_projet
  const codeProjet = projet.code_projet

  const { data: financements = [], isLoading: financementsLoading } =
    useGetFinancementsProjet(idProjet)
  const { data: niveauxActivite = [], isLoading: niveauxActiviteLoading } =
    useGetNiveauxActiviteProjet(codeProjet)
  const { data: activites = [], isLoading: activitesLoading } =
    useGetActivitesProjet(codeProjet)
  const { data: niveauxCadre = [], isLoading: niveauxCadreLoading } =
    useGetNiveauxCadreResultat(idProjet)
  const { data: cadres = [], isLoading: cadresLoading } =
    useGetCadresResultat(codeProjet)
  const { data: dossiers = [], isLoading: dossiersLoading } =
    useGetDossiersProjet(idProjet)
  const { data: allPtbas = [], isLoading: allPtbasLoading } =
    useGetPtbasProjet(codeProjet)
  const { data: tauxGlobalData = [], isLoading: tauxGlobalLoading } =
    useGetTauxGlobalActiviteProjet(idProjet)

  const {
    selectedVersionPtbaId,
    selectedVersion,
    filteredVersionOptions,
    selectedVersionId,
    handleChangeVersion,
  } = useProjetPtbaVersionSelection(projet)

  const { data: ptbasByVersion, isLoading: ptbasVersionLoading } =
    useGetPtbasProjetsByVersion(
      selectedVersionPtbaId > 0 ? selectedVersionPtbaId : undefined,
      codeProjet
    )
  const ptbasVersion = ptbasByVersion?.ptbas_projets ?? EMPTY_PTBAS

  const activiteIds = useMemo(
    () =>
      ptbasVersion
        .map((a) => a.id_ptba)
        .filter((id): id is number => Number.isFinite(id)),
    [ptbasVersion]
  )

  const {
    tachesByActivite,
    avancementByActivite,
    isLoading: progressLoading,
  } = useSuiviPtbaProjetActivitesProgress(activiteIds)

  const isLoading =
    financementsLoading ||
    niveauxActiviteLoading ||
    activitesLoading ||
    niveauxCadreLoading ||
    cadresLoading ||
    dossiersLoading ||
    allPtbasLoading ||
    tauxGlobalLoading ||
    ptbasVersionLoading ||
    progressLoading

  return {
    projet,
    financements,
    niveauxActivite,
    activites,
    niveauxCadre,
    cadres,
    dossiers,
    allPtbas,
    tauxGlobalData,
    ptbasVersion,
    tachesByActivite,
    avancementByActivite,
    selectedVersion,
    filteredVersionOptions,
    selectedVersionId,
    handleChangeVersion,
    isLoading,
  }
}

export type ProjetRapportOrData = ReturnType<typeof useProjetRapportOrData>
