// Composant AvancementDirectionChart
import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { CalendarIcon } from "lucide-react";
import { AvancementDirection } from "@/simadou/allTypes/dashboardType";

interface AvancementDirectionChartProps {
  data: AvancementDirection[];
  mode?: "pourcentage" | "detail";
  anneesDisponibles: number[];
  selectedAnnee: number;
  onAnneeChange: (annee: number) => void;
  title: string;
  subtitle?: string;
  barColor?: string;
}

const getBarColor = (value: number): string => {
  if (value >= 75) return "#22C55E";
  if (value >= 40) return "#EAB308";
  return "#EF4444";
};

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-3 text-sm min-w-[160px]">
      <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2 truncate max-w-[200px]">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: entry.fill || entry.color }} />
          <span className="text-gray-600 dark:text-gray-400">{entry.name}:</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {entry.value}{entry.dataKey === "pourcentage" ? "%" : ""}
          </span>
        </div>
      ))}
    </div>
  );
};

const AvancementDirectionChart: React.FC<AvancementDirectionChartProps> = ({
  data,
  anneesDisponibles,
  selectedAnnee,
  onAnneeChange,
  title,
  subtitle,
}) => {
  // ✅ Filtrer les données par l'année sélectionnée (via version_info)
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.filter((item) => {
      const versionAnnee = item.version_info?.annee_ptba;
      return versionAnnee === selectedAnnee;
    });
  }, [data, selectedAnnee]);

  // ✅ Transformer les données pour le graphique et exclure les taux = 0
  const chartData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    return filteredData
      .filter((item) => (item.taux_execution_moyen || 0) > 0)
      .map((item) => ({
        service: item.abrege_ugl || item.nom_ugl || 'Non défini',
        code_ugl: item.code_ugl || '',
        nb_ptbas: item.nb_ptbas || 0,
        taux_execution_moyen: item.taux_execution_moyen || 0,
        pourcentage: item.taux_execution_moyen || 0,
        version_info: item.version_info,
        id_version: item.version_info?.id_version_ptba || null,
      }));
  }, [filteredData]);

  // ✅ Trier par taux d'exécution décroissant et prendre le top 10
  const topData = useMemo(() => {
    return [...chartData]
      .sort((a, b) => (b.taux_execution_moyen || 0) - (a.taux_execution_moyen || 0))
      .slice(0, 10);
  }, [chartData]);

  // ✅ Trouver la version correspondante pour l'année sélectionnée
  const selectedVersion = useMemo(() => {
    if (!data || data.length === 0) return null;
    const item = data.find((d) => d.version_info?.annee_ptba === selectedAnnee);
    return item?.version_info || null;
  }, [data, selectedAnnee]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          {subtitle && (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {subtitle} {selectedVersion && `- Version ${selectedVersion.version_ptba || selectedVersion.id_version_ptba}`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-gray-400" />
          <select
            value={selectedAnnee}
            onChange={(e) => {
              const v = Number(e.target.value);
              onAnneeChange(v);
            }}
            className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-300"
          >
            {anneesDisponibles.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {topData.length === 0 ? (
        <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
          Aucune direction avec un taux d'exécution &gt; 0 pour l'année {selectedAnnee}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={topData}
            margin={{ top: 30, right: 20, left: 10, bottom: 40 }} // ✅ Augmenté le top padding
            barCategoryGap="30%"
            barSize={36} // ✅ Largeur fixe des barres
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="service"
              tick={{ fontSize: 10, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
              angle={-30}
              textAnchor="end"
              interval={0}
              height={60} // ✅ Plus d'espace pour les labels
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
              domain={[0, 105]} // ✅ Légèrement au-dessus de 100% pour voir les barres à 100%
              tickFormatter={(v) => `${v}%`}
              ticks={[0, 25, 50, 75, 100]} // ✅ Ticks personnalisés
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
              iconType="circle"
              iconSize={8}
            />
            <Bar
              dataKey="pourcentage"
              name="Taux de réalisation"
              radius={[4, 4, 0, 0]}
              label={{
                position: "top",
                fontSize: 11,
                fill: "#374151",
                fontWeight: 600,
                formatter: (value: any) => `${value}%`,
                dy: -6, // ✅ Décale l'étiquette vers le haut
              }}
            >
              {topData.map((entry, index) => (
                <Cell key={index} fill={getBarColor(entry.pourcentage || 0)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default AvancementDirectionChart;