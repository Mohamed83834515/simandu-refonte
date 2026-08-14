import React, { useState, useMemo } from "react";
import {
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { CHART_COLORS, useColor } from "@/stores/others/color-store";
import { formatNumber } from "@/simadou/allSercices/montantFormater";

import type { ProjetDashboardRow } from '@/simadou/allTypes/dashboardProjet'

export type ProjetRow = ProjetDashboardRow

interface ProjectTableProps {
  projets: ProjetRow[];
  onProjetClick?: (projet: ProjetRow) => void;
  pageSize?: number;
}

const statutStyle: Record<
  ProjetRow["statut"],
  { label: string; cls: string; icon: string }
> = {
  actif: { label: "Actif", cls: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400", icon: "●" },
  critique: { label: "Critique", cls: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400", icon: "⚠" },
  retard: { label: "En retard", cls: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400", icon: "⌛" },
  clôturé: { label: "Clôturé", cls: "bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400", icon: "✓" },
  suspendu: { label: "Suspendu", cls: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400", icon: "⏸" },
};

const ProgressBar: React.FC<{ value: number; label?: string }> = ({ value }) => {
  const clamped = Math.min(100, Math.max(0, value));
  const barColor =
    clamped >= 75
      ? "bg-green-500"
      : clamped >= 40
        ? "bg-yellow-400"
        : "bg-red-400";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 min-w-[36px] text-right">
        {clamped.toFixed(0)}%
      </span>
    </div>
  );
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
};

const ProjectTable: React.FC<ProjectTableProps> = ({
  projets,
  onProjetClick,
  pageSize = 10,
}) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { color } = useColor();
  const { stroke } = CHART_COLORS[color];

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return projets;
    return projets.filter(
      (p) =>
        p.sigle.toLowerCase().includes(q) ||
        p.nom_projet.toLowerCase().includes(q) ||
        (p.bailleur && p.bailleur.toLowerCase().includes(q))
    );
  }, [projets, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Avancement technique et financier par projet
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {filtered.length} projet{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        {/* Recherche */}
        <div className="relative w-full sm:w-72">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher un projet, bailleur…"
            value={search}
            onChange={handleSearch}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-800 transition text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-900 dark:to-gray-950 text-white">
              <th
                rowSpan={2}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-l-0 border-t-0 border-r border-b border-white/15 rounded-tl-xl"
              >
                Sigle / Projet
              </th>
              <th
                rowSpan={2}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-t-0 border-r border-b border-white/15"
              >
                Bailleur
              </th>
              <th
                colSpan={3}
                className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider border-t-0 border-r border-b border-white/15"
              >
                Calendrier
              </th>
              <th
                colSpan={3}
                className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider border-t-0 border-r border-b border-white/15"
              >
                Budget (GNF)
              </th>
              <th
                rowSpan={2}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-t-0 border-r border-b border-white/15"
              >
                Avancement
              </th>
              <th
                rowSpan={2}
                className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider border-t-0 border-r-0 border-b border-white/15 rounded-tr-xl"
              >
                Statut
              </th>
            </tr>
            <tr className="bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-900 dark:to-gray-950 text-white">
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-300 border-t-0 border-r border-b border-white/15">
                Démarrage
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-300 border-t-0 border-r border-b border-white/15">
                Clôture
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-300 border-t-0 border-r border-b border-white/15">
                Consommé
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-300 border-t-0 border-r border-b border-white/15">
                Prévu
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-300 border-t-0 border-r border-b border-white/15">
                Décaissé
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-300 border-t-0 border-r-0 border-b border-white/15">
                Taux
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-6 py-12 text-center text-gray-400 dark:text-gray-500 text-sm italic">
                  Aucun projet trouvé
                </td>
              </tr>
            ) : (
              pageData.map((projet, idx) => {
                const s = statutStyle[projet.statut] || statutStyle.actif;
                return (
                  <tr
                    key={projet.id}
                    className={`hover:bg-blue-50/40 dark:hover:bg-blue-900/20 transition-colors cursor-pointer ${idx % 2 === 0
                        ? "bg-white dark:bg-gray-800"
                        : "bg-gray-50/50 dark:bg-gray-800/50"
                      }`}
                    onClick={() => onProjetClick?.(projet)}
                  >
                    {/* Sigle + Projet */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-bold uppercase shadow-sm"
                          style={{ backgroundColor: stroke }}
                        >
                          {projet.logo ? (
                            <img
                              src={projet.logo}
                              alt={projet.sigle}
                              className="w-9 h-9 rounded-lg object-cover"
                            />
                          ) : (
                            projet.sigle.slice(0, 2)
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                            {projet.sigle}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[160px]">
                            {projet.nom_projet}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Bailleur */}
                    <td className="px-4 py-4 text-xs text-gray-600 dark:text-gray-400 font-medium">
                      {projet.bailleur ?? "—"}
                    </td>

                    {/* Date début */}
                    <td className="px-4 py-4 text-xs text-gray-600 dark:text-gray-400">
                      {formatDate(projet.date_demarrage)}
                    </td>

                    {/* Date fin calculée */}
                    <td className="px-4 py-4 text-xs text-gray-600 dark:text-gray-400">
                      {formatDate(projet.date_fin ?? '')}
                    </td>

                    {/* Délai consommé */}
                    <td className="px-4 py-4 min-w-[100px]">
                      <ProgressBar value={projet.delai_consomme} />
                    </td>

                    {/* Budget prévu */}
                    <td className="px-4 py-4 text-right font-semibold text-gray-800 dark:text-gray-200 text-sm">
                      {formatNumber(projet.budget_prevu)}
                    </td>

                    {/* Montant décaissé */}
                    <td className="px-4 py-4 text-right font-semibold text-blue-700 dark:text-blue-400 text-sm">
                      {formatNumber(projet.montant_decaisse)}
                    </td>

                    {/* Taux décaissement */}
                    <td className="px-4 py-4 min-w-[100px]">
                      <ProgressBar value={projet.taux_decaissement} />
                    </td>

                    {/* Avancement technique */}
                    <td className="px-4 py-4 min-w-[100px]">
                      <ProgressBar value={projet.taux_avancement_technique} />
                    </td>

                    {/* Statut */}
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.cls}`}
                      >
                        <span className="text-xs">{s.icon}</span>
                        {s.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Page {page} sur {totalPages} — {filtered.length} résultat
          {filtered.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pg =
              totalPages <= 5
                ? i + 1
                : Math.min(Math.max(page - 2 + i, 1), totalPages);
            return (
              <button
                key={pg}
                onClick={() => setPage(pg)}
                className={`w-7 h-7 text-xs rounded-lg font-medium transition ${pg === page
                    ? "text-white"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                style={pg === page ? { backgroundColor: stroke } : {}}
              >
                {pg}
              </button>
            );
          })}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectTable;