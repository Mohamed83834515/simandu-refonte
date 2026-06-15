import React from "react";
import type { ServiceData } from "./AvancementServiceChart";

interface RecapitulatifTableProps {
  data: ServiceData[];
}

const getStatusConfig = (pct: number) => {
  if (pct >= 75) return { label: "Bon", cls: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" };
  if (pct >= 40) return { label: "Moyen", cls: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" };
  return { label: "Faible", cls: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" };
};

const RecapitulatifTable: React.FC<RecapitulatifTableProps> = ({ data }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Récapitulatif par service / direction
        </h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          Suivi consolidé du taux de réalisation des tâches
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Service / Direction
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tâches terminées
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total tâches
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[200px]">
                Taux de réalisation
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Niveau
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-gray-400 dark:text-gray-500 text-sm italic"
                >
                  Aucune donnée disponible
                </td>
              </tr>
            ) : (
              data.map((row, idx) => {
                const s = getStatusConfig(row.pourcentage);
                return (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50/60 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                        {row.service}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                        {row.tachesTerminees}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{row.tachesTotal}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${row.pourcentage >= 75
                                ? "bg-green-500"
                                : row.pourcentage >= 40
                                  ? "bg-yellow-400"
                                  : "bg-red-400"
                              }`}
                            style={{ width: `${row.pourcentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200 min-w-[42px] text-right">
                          {row.pourcentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${s.cls}`}
                      >
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
    </div>
  );
};

export default RecapitulatifTable;