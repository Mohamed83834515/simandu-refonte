import React from "react";
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
import { CHART_COLORS, useColor } from "@/stores/others/color-store";

export interface ServiceData {
  service: string;
  tachesTerminees: number;
  tachesTotal: number;
  pourcentage: number;
}

interface AvancementServiceChartProps {
  data: ServiceData[];
  mode?: "pourcentage" | "detail";
  anneesDisponibles: number[];
  selectedAnnee: number | null;
  onAnneeChange: (annee: number | null) => void;
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

const AvancementServiceChart: React.FC<AvancementServiceChartProps> = ({
  data,
  mode = "pourcentage",
  anneesDisponibles,
  selectedAnnee,
  onAnneeChange,
  title,
  subtitle,
}) => {
  const truncatedData = data.slice(0, 10);
  const { color } = useColor();
  const { stroke } = CHART_COLORS[color];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-3">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-gray-400" />
          <select
            value={selectedAnnee ?? 0}
            onChange={(e) => {
              const v = Number(e.target.value);
              onAnneeChange(v === 0 ? null : v);
            }}
            className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-300"
          >
            <option value={0}>Toutes les années</option>
            {anneesDisponibles.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={truncatedData}
          margin={{ top: 8, right: 8, left: 0, bottom: 40 }}
          barCategoryGap="30%"
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
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickLine={false}
            axisLine={false}
            domain={mode === "pourcentage" ? [0, 100] : undefined}
            tickFormatter={mode === "pourcentage" ? (v) => `${v}%` : undefined}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
            iconType="circle"
            iconSize={8}
          />
          {mode === "pourcentage" ? (
            <Bar
              dataKey="pourcentage"
              name="Taux de réalisation"
              radius={[4, 4, 0, 0]}
              label={{ position: "top", fontSize: 10, fill: "#6b7280", formatter: (value) => `${value}%` }}
            >
              {truncatedData.map((entry, index) => (
                <Cell key={index} fill={getBarColor(entry.pourcentage)} />
              ))}
            </Bar>
          ) : (
            <>
              <Bar
                dataKey="tachesTerminees"
                name="Tâches terminées"
                fill={stroke}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="tachesTotal"
                name="Total tâches"
                fill="#D1D5DB"
                radius={[4, 4, 0, 0]}
              />
            </>
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AvancementServiceChart;