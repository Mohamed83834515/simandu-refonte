import React, { useMemo, useState } from 'react'
import { useGetProjets } from '@/simadou/allHooks/admin/projetHooks'
import { useCountProjectsPerType } from '@/simadou/allHooks/admin/typeProjetHooks'
import {
    useActiveProgrammeCode,
    useActiveProgrammeId,
} from '@/hooks/use-active-programme'
import { useGetVersions } from '@/simadou/allHooks/admin/versionHooks'
import { useGetPtbas } from '@/simadou/allHooks/admin/ptbaHooks'
import {
    useDashboardAnneeSelection,
    useGetAvancementDirections,
    useGetAvancementParComposantes,
    useGetTachesActiviteByUgl,
} from '@/simadou/allHooks/admin/dashboardProgrammeHooks'
import { useGetPtbasProjetsByVersion } from '@/simadou/allHooks/admin/ptbaProjetHooks'
import { formatNumber } from '@/simadou/allSercices/montantFormater'
import type { ProjetDashboardSource } from '@/simadou/allTypes/dashboardProjet'
import {
    buildProjetDashboardRows,
    buildProjetProgrammeDashboardStats,
} from '@/simadou/lib/dashboardProjetUtils'
import {
    buildPaoMinagriDashboardStats,
    formatDashboardPercent,
} from '@/simadou/lib/dashboardPaoStatsUtils'
import { buildPtbaProjetsDashboardStats } from '@/simadou/lib/dashboardPtbaProjetsStatsUtils'
import { buildAvancementTachesUglChartData } from '@/simadou/lib/dashboardTachesUglUtils'
import DashboardHeader from './DashboardHeader'
import ProjectTable from './ProjectTable'
import StatCard from './StatCard'
import AvancementDirectionChart from './AvancementDirectionChart'
import AvancementTachesPlanSiteChart from './AvancementTachesPlanSiteChart'
import AvancementComposanteChart from './Avancementcomposantechart'


// ─── Dashboard principal ───────────────────────────────────────────────────────
const DashboardPage: React.FC = () => {
    // Filtres par année pour les différents graphiques
    const [searchQuery, setSearchQuery] = useState('')

    const codeProgramme = useActiveProgrammeCode()
    const idProgramme = useActiveProgrammeId()
    const { data: projets = [] } = useGetProjets()
    const { data: avancement_directions = [] } = useGetAvancementDirections()

    const { data: versions = [] } = useGetVersions()
    const {
        anneesDisponibles,
        selectedAnnee,
        setSelectedAnnee,
        selectedVersion,
    } = useDashboardAnneeSelection(versions)

    const { data: ptbas = [] } = useGetPtbas(selectedVersion?.id_version_ptba || 0)

    const {
        selectedAnnee: activitesDirectionSelectedAnnee,
        setSelectedAnnee: setActivitesDirectionSelectedAnnee,
        selectedVersion: activitesDirectionSelectedVersion,
    } = useDashboardAnneeSelection(versions)

    const {
        selectedAnnee: composanteSelectedAnnee,
        setSelectedAnnee: setComposanteSelectedAnnee,
        selectedVersion: composanteSelectedVersion,
    } = useDashboardAnneeSelection(versions)

    const selectedVersionId = selectedVersion?.id_version_ptba
    const composanteSelectedVersionId = composanteSelectedVersion?.id_version_ptba
    const { data: avancementComposantesNiveau2 = [] } = useGetAvancementParComposantes(2, composanteSelectedVersionId)
    const { data: avancementComposantesNiveau3 = [] } = useGetAvancementParComposantes(3, composanteSelectedVersionId)
    const activitesDirectionVersionId =
        activitesDirectionSelectedVersion?.id_version_ptba

    const projetRows = useMemo(
        () => buildProjetDashboardRows(projets as ProjetDashboardSource[]),
        [projets]
    )
    const { data: ptbasProjetsData } = useGetPtbasProjetsByVersion(selectedVersionId)
    const { data: tachesByUgl = [] } =
        useGetTachesActiviteByUgl(activitesDirectionVersionId)

    const activitesDirectionChartData = useMemo(
        () => buildAvancementTachesUglChartData(tachesByUgl),
        [tachesByUgl]
    )
    // Filtrage par recherche globale
    const projetRowsFiltered = useMemo(() => {
        if (!searchQuery.trim()) return projetRows
        const q = searchQuery.toLowerCase()
        return projetRows.filter(
            (r) =>
                r.sigle.toLowerCase().includes(q) ||
                r.nom_projet.toLowerCase().includes(q) ||
                (r.bailleur && r.bailleur.toLowerCase().includes(q))
        )
    }, [projetRows, searchQuery])

    // Données pour la carte 1 : Projet Programme
    const { data: projectsPerType = [] } = useCountProjectsPerType(idProgramme || 0)
    const projetProgrammeStats = useMemo(
        () => buildProjetProgrammeDashboardStats(projets),
        [projets]
    )

    // Données pour la carte 2 : PTBA Projets/Programmes
    const ptbaProjetsStats = useMemo(
        () => buildPtbaProjetsDashboardStats(ptbasProjetsData, selectedAnnee),
        [ptbasProjetsData, selectedAnnee]
    )

    const notifications = useMemo(
        () => [
            {
                id: 1,
                message: `$n retard nécessitent votre attention`,
                type: 'warning' as const,
                time: 'Maintenant',
                lu: false,
            },
            {
                id: 2,
                message: 'Rapport mensuel disponible pour téléchargement',
                type: 'info' as const,
                time: 'Il y a 2h',
                lu: false,
            },
            {
                id: 3,
                message: 'Sprint Q2 terminé avec succès',
                type: 'success' as const,
                time: 'Hier',
                lu: true,
            },
        ],
        [9]
    )
    const paoMinagriStats = useMemo(
        () =>
            buildPaoMinagriDashboardStats(
                ptbas,
                selectedVersionId,
                selectedAnnee
            ),
        [ptbas, selectedVersionId, selectedAnnee]
    )

    // Données pour la carte 4 : Points de blocage (fictives car pas dans ton API)
    const pointsBlocageStats = useMemo(() => {
        // Données fictives basées sur le nombre de projets
        const totalPoints = projets.length * 12
        const pointsResolus = Math.floor(totalPoints * 0.51)
        const pointsNonResolus = totalPoints - pointsResolus
        const pourcentageResolus = Math.round((pointsResolus / totalPoints) * 100)
        const pourcentageNonResolus = Math.round(
            (pointsNonResolus / totalPoints) * 100
        )

        return {
            total: totalPoints,
            resolus: pointsResolus,
            nonResolus: pointsNonResolus,
            pourcentageResolus,
            pourcentageNonResolus,
        }
    }, [projets])
    const TAG_COLORS = [
        { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' },
        { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
        { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
        { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
        { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
        { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
    ]
    const projetsEnCours = projetProgrammeStats.total - (projetProgrammeStats.critiques + projetProgrammeStats.enRetard)
    const pourcentageEnCours = projetProgrammeStats.total > 0
        ? Math.round((projetsEnCours / projetProgrammeStats.total) * 100)
        : 0
    // ── Render ────────────────────────────────────────────────────────────────────
    return (
        <div className='min-h-screen space-y-3 bg-gray-50 p-2 dark:bg-gray-950'>
            {/* En-tête */}
            <DashboardHeader
                nomProgramme={`Programme ${codeProgramme || 'Demo'}`}
                notifications={notifications}
                onSearchProject={setSearchQuery}
            />

            {/* ── Cartes statistiques ── */}
            <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4'>
                {/* Carte 1 : Projet Programme */}
                {/* Carte 1 : Projet Programme */}
                <StatCard
                    title='Projets et Programmes'
                    color='blue'
                    tags={projectsPerType.map((ppt, index) => ({
                        label: ppt.code_type_projet,
                        value: ppt.nombre_projets,
                        color: TAG_COLORS[index % TAG_COLORS.length],
                    }))}
                    narrativeNode={
                        <div className="space-y-2">
                            {/* Ligne principale avec "dont" */}
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="text-3xl font-black text-gray-900 dark:text-white">
                                    {projetProgrammeStats.total}
                                </span>
                                <span className="ml-1.5 text-sm text-gray-500">
                                    projets au total, dont
                                </span>
                            </p>

                            {/* Statuts en ligne */}
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                                <span className="flex items-center gap-1">
                                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                                    <span className="font-semibold text-emerald-600">{projetsEnCours}</span>
                                    <span className="text-gray-500">en cours</span>
                                    <span className="text-xs text-gray-400">({pourcentageEnCours}%)</span>
                                </span>
                                <span className="text-gray-300">•</span>
                                <span className="flex items-center gap-1">
                                    <span className="inline-block h-2 w-2 rounded-full bg-orange-500" />
                                    <span className="font-semibold text-orange-500">{projetProgrammeStats.enRetard}</span>
                                    <span className="text-gray-500">en retard</span>
                                    <span className="text-xs text-gray-400">({projetProgrammeStats.pourcentageRetard}%)</span>
                                </span>
                                <span className="text-gray-300">•</span>
                                <span className="flex items-center gap-1">
                                    <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                                    <span className="font-semibold text-red-600">{projetProgrammeStats.critiques}</span>
                                    <span className="text-gray-500">critiques</span>
                                    <span className="text-xs text-gray-400">({projetProgrammeStats.pourcentageCritique}%)</span>
                                </span>
                            </div>
                        </div>
                    }
                />

                {/* Carte 2 : PAO Programme */}
                <StatCard
                    title={`PTBA ${ptbaProjetsStats.annee} des Projets/Programmes`}
                    color='emerald'
                    rows={[
                        {
                            label: 'Montant Total Prévu',
                            value: formatNumber(ptbaProjetsStats.montantTotalPrevu),
                            suffix: 'GNF',
                        },
                        {
                            label: 'Montant Total Décaissé',
                            value: formatNumber(ptbaProjetsStats.montantTotalDecaisse),
                            suffix: `(${formatDashboardPercent(ptbaProjetsStats.tauxDecaissement)}%) GNF`,
                            valueColor: 'emerald',
                        },
                        {
                            label: "Nombre Total d'activité réalisée",
                            value: ptbaProjetsStats.activitesRealisees,
                            suffix: `(${formatDashboardPercent(ptbaProjetsStats.tauxRealisationActivites)}%)`,
                            valueColor: 'emerald',
                        },
                    ]}
                    progressValue={ptbaProjetsStats.tauxRealisationActivites}
                    progressDecimals={2}
                    progressColor='emerald'
                />

                {/* Carte 3 : PAO Département */}
                <StatCard
                    title={`PAO ${paoMinagriStats.annee} du MINAGRI`}
                    color='purple'
                    rows={[
                        {
                            label: 'Montant Total Prévu',
                            value: formatNumber(paoMinagriStats.montantTotalPrevu),
                            suffix: 'GNF',
                        },
                        {
                            label: 'Montant Total Décaissé',
                            value: formatNumber(paoMinagriStats.montantTotalDecaisse),
                            suffix: `(${formatDashboardPercent(paoMinagriStats.tauxDecaissement)}%) GNF`,
                            valueColor: 'purple',
                        },
                        {
                            label: "Nombre Total d'activité réalisée",
                            value: paoMinagriStats.activitesRealisees,
                            suffix: `(${formatDashboardPercent(paoMinagriStats.tauxRealisationActivites)}%)`,
                            valueColor: 'purple',
                        },
                    ]}
                    progressValue={paoMinagriStats.tauxRealisationActivites}
                    progressDecimals={2}
                    progressColor='purple'
                />

                {/* Carte 4 : Points de blocage */}
                <StatCard
                    title='Points de blocage'
                    color='rose'
                    rows={[
                        { label: 'Nombre Total', value: pointsBlocageStats.total },
                        {
                            label: 'Total point de blocage résolu',
                            value: pointsBlocageStats.resolus,
                            suffix: `(${pointsBlocageStats.pourcentageResolus}%)`,
                            valueColor: 'emerald',
                        },
                        {
                            label: 'Total point de blocage non résolu',
                            value: pointsBlocageStats.nonResolus,
                            suffix: `(${pointsBlocageStats.pourcentageNonResolus}%)`,
                            valueColor: 'red',
                        },
                    ]}
                    progressValue={pointsBlocageStats.pourcentageResolus}
                    progressColor='emerald'
                />
            </div>

            {/* ── Tableau des projets ── */}
            <ProjectTable
                projets={projetRowsFiltered}
                pageSize={10}
            />
            <AvancementComposanteChart
                niveau2Data={avancementComposantesNiveau2}
                niveau3Data={avancementComposantesNiveau3}
                anneesDisponibles={anneesDisponibles}
                selectedAnnee={composanteSelectedAnnee}
                onAnneeChange={setComposanteSelectedAnnee}
                title='PAO par Programme'
                subtitle='Avancement technique · Indicateurs · Décaissement'
            />

            {/* ── Graphiques ligne 2 : Avancement par service ── */}
            <div className='grid grid-cols-1 gap-2 lg:grid-cols-2'>
                {/* <AvancementServiceChart
                    data={avancementTaches}
                    mode='pourcentage'
                    anneesDisponibles={anneesDisponibles}
                    selectedAnnee={anneeTaches}
                    onAnneeChange={setAnneeTaches}
                    title='Avancement des tâches par service (Top 10)'
                    subtitle='Taux de réalisation par direction'
                />*/}
                <AvancementDirectionChart
                    data={avancement_directions}
                    mode='detail'
                    anneesDisponibles={anneesDisponibles}
                    selectedAnnee={selectedAnnee}
                    onAnneeChange={setSelectedAnnee}
                    title='Avancement des activités de PAO par Direction'
                />
                <AvancementTachesPlanSiteChart
                    data={activitesDirectionChartData}
                    anneesDisponibles={anneesDisponibles}
                    selectedAnnee={activitesDirectionSelectedAnnee}
                    onAnneeChange={setActivitesDirectionSelectedAnnee}
                    title='Avancement des Taches par Direction'
                    subtitle='Nombre total et taux de réalisation par direction'
                    emptyMessage={`Aucune tache par direction pour l'année ${activitesDirectionSelectedAnnee}`}
                />
                {/* <AvancementTachesPlanSiteChart
                    data={tachesPlanSiteChartData}
                    anneesDisponibles={anneesDisponibles}
                    selectedAnnee={planSiteSelectedAnnee}
                    onAnneeChange={setPlanSiteSelectedAnnee}
                    title='Avancement des Tâches par Plan Site'
                    subtitle='Nombre total et taux de validation par service'
                /> */}
            </div>

        </div>
    )
}

export default DashboardPage
