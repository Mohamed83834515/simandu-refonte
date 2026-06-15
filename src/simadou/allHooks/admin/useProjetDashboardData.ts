import { useMemo } from 'react'
import { useGetActivitesProjet } from '@/simadou/allHooks/admin/activiteProjetHooks'
import { useGetIndicateursPerformanceProjet } from '@/simadou/allHooks/admin/indicateurPerformanceProjetHooks'
import { useGetPtbasProjet } from '@/simadou/allHooks/admin/ptbaProjetHooks'
export function useProjetDashboardData(codeProjet: string, annee: number) {
  const { data: activites = [] } = useGetActivitesProjet(codeProjet)
  const { data: indicateurs = [] } = useGetIndicateursPerformanceProjet(codeProjet)
  const { data: ptbas = [] } = useGetPtbasProjet(codeProjet)
  
  // Note: useGetSourcesByProjet n'existe pas, on utilise useGetSourcesByActivite
  // ou on crée un hook spécifique. Pour l'instant, on va filtrer par code_projet
  // depuis les activités si nécessaire

  // Statistiques globales
  const stats = useMemo(() => {
    const totalActivites = activites.length
    const activitesTerminees = activites.filter(a => a.statut === 'terminee').length
    const tauxExecution = totalActivites > 0 ? Math.round((activitesTerminees / totalActivites) * 100) : 0

    // Budget total des activités
    const budgetTotal = activites.reduce((sum, a) => sum + (Number(a.budget) || 0), 0)
    
    // Budget PTBA
    const budgetPtbaTotal = ptbas.reduce((sum, p) => sum + (Number(p.cout_ptba) || 0), 0)
    
    // Budget consommé - à calculer depuis les sources de financement des activités
    // Pour l'instant, on utilise une valeur par défaut
    const budgetConsommeAnnee = 0
    
    const tauxDecaissement = budgetTotal > 0 ? Math.round((budgetConsommeAnnee / budgetTotal) * 100) : 0

    return {
      totalActivites,
      activitesTerminees,
      tauxExecution,
      budgetTotal,
      budgetPtbaTotal,
      budgetConsommeAnnee,
      tauxDecaissement,
      totalPtbas: ptbas.length,
    }
  }, [activites, ptbas, annee])

  // Indicateurs KPI
  const kpiIndicateurs = useMemo(() => {
    return indicateurs.map(ind => ({
      id: ind.id_indicateur_performance,
      label: ind.intitule_indicateur_tache,
      target: 100,
      current: typeof ind.cibles === 'object' && ind.cibles !== null
        ? Number((ind.cibles as any).valeur_cible) || 0
        : 0,
      unit: typeof ind.unite_indicateur_performance === 'object' && ind.unite_indicateur_performance !== null
        ? (ind.unite_indicateur_performance as any).unite_ui || ''
        : typeof ind.unite_indicateur_performance === 'string'
        ? ind.unite_indicateur_performance
        : '',
    }))
  }, [indicateurs])

  // Données PTBA par année
  const ptbaData = useMemo(() => {
    const activitesParAnnee = activites.reduce((acc, a) => {
      if (!a.date_debut_activite) return acc
      const anneeActivite = new Date('').getFullYear()
      if (!acc[anneeActivite]) acc[anneeActivite] = { prevu: 0, execute: 0, count: 0 }
      acc[anneeActivite].prevu += Number(a.budget) || 0
      acc[anneeActivite].count++
      return acc
    }, {} as Record<number, { prevu: number; execute: number; count: number }>)

    // Ajouter les données PTBA
    ptbas.forEach(p => {
      if (p.chronogramme) {
        // Extraire les années depuis le chronogramme
        const anneePtba = new Date().getFullYear()
        if (!activitesParAnnee[anneePtba]) {
          activitesParAnnee[anneePtba] = { prevu: 0, execute: 0, count: 0 }
        }
        activitesParAnnee[anneePtba].prevu += Number(p.cout_ptba) || 0
      }
    })

    return Object.entries(activitesParAnnee)
      .map(([year, data]) => ({
        year: parseInt(year),
        prevu: data.prevu,
        execute: data.execute,
        count: data.count,
      }))
      .sort((a, b) => a.year - b.year)
  }, [activites, ptbas])

  // Données pour le graphique d'avancement PTBA
  const ptbaAdvancement = useMemo(() => {
    const total = ptbas.length
    const planifies = ptbas.filter(p => p.statut_activite === 'Planifiée').length
    const encours = ptbas.filter(p => p.statut_activite === 'En cours').length
    const realises = ptbas.filter(p => p.statut_activite === 'Réalisée' || p.statut_activite === 'Terminée').length
    
    return {
      total,
      planifies,
      encours,
      realises,
      tauxRealisation: total > 0 ? Math.round((realises / total) * 100) : 0,
    }
  }, [ptbas])

  return {
    stats,
    kpiIndicateurs,
    ptbaData,
    ptbaAdvancement,
    isLoading: false,
  }
}