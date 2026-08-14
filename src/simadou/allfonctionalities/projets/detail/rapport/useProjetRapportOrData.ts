import { useMemo } from 'react'
import { useGetActivitesProjet } from '@/simadou/allHooks/admin/activiteProjetHooks'
import {
  useGetCadresResultat,
  useGetNiveauxCadreResultat,
} from '@/simadou/allHooks/admin/cadreResultatHooks'
import { useGetDossiersProjet } from '@/simadou/allHooks/admin/dossierProjetHooks'
import { useGetFinancementsProjet } from '@/simadou/allHooks/admin/financementProjetHooks'
import { useIndicateursPerformanceByProjet } from '@/simadou/allHooks/admin/indicateurPerformanceProjetHooks'
import { useGetPersonnels } from '@/simadou/allHooks/admin/personnelHooks'
import { useGetPtbasProjet } from '@/simadou/allHooks/admin/ptbaProjetHooks'
import { useGetTauxGlobalActiviteProjet } from '@/simadou/allHooks/admin/projetHooks'
import { useGetUnitesIndicateur } from '@/simadou/allHooks/admin/uniteIndicateurHooks'
import type { Personnel, Projet } from '@/simadou/allTypes'
import type { PtbaProjet } from '@/simadou/allTypes/ptbaProjet'

const EMPTY_PTBAS: PtbaProjet[] = []

export function useProjetRapportOrData(projet: Projet) {
  const idProjet = projet.id_projet
  const codeProjet = projet.code_projet

  const { data: financements = [], isLoading: financementsLoading } =
    useGetFinancementsProjet(idProjet)
  const { data: activites = [], isLoading: activitesLoading } =
    useGetActivitesProjet(codeProjet)
  const { data: niveauxCadre = [], isLoading: niveauxCadreLoading } =
    useGetNiveauxCadreResultat(idProjet)
  const { data: cadres = [], isLoading: cadresLoading } =
    useGetCadresResultat(codeProjet)
  const { data: dossiers = [], isLoading: dossiersLoading } =
    useGetDossiersProjet(idProjet)
  const { data: allPtbasData, isLoading: allPtbasLoading } =
    useGetPtbasProjet(codeProjet)
  const allPtbas = allPtbasData ?? EMPTY_PTBAS
  const { data: tauxGlobalData = [], isLoading: tauxGlobalLoading } =
    useGetTauxGlobalActiviteProjet(idProjet)
  const {
    indicateurs: indicateursPerformance = [],
    isLoading: indicateursLoading,
  } = useIndicateursPerformanceByProjet(projet)
  const { data: unitesIndicateur = [], isLoading: unitesLoading } =
    useGetUnitesIndicateur()
  const { data: personnels = [], isLoading: personnelsLoading } =
    useGetPersonnels()

  const personnelsById = useMemo(() => {
    const map = new Map<number, Personnel>()
    for (const p of personnels) {
      if (p.n_personnel != null) map.set(p.n_personnel, p)
    }
    return map
  }, [personnels])

  const isLoading =
    financementsLoading ||
    activitesLoading ||
    niveauxCadreLoading ||
    cadresLoading ||
    dossiersLoading ||
    allPtbasLoading ||
    tauxGlobalLoading ||
    indicateursLoading ||
    unitesLoading ||
    personnelsLoading

  return {
    projet,
    financements,
    activites,
    indicateursPerformance,
    unitesIndicateur,
    niveauxCadre,
    cadres,
    dossiers,
    allPtbas,
    tauxGlobalData,
    personnelsById,
    isLoading,
  }
}

export type ProjetRapportOrData = ReturnType<typeof useProjetRapportOrData>
