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
} from "recharts";
import { CalendarIcon } from "lucide-react";
import { CHART_COLORS, useColor } from "@/stores/others/color-store";

export interface ComposanteData {
  composante: string;
  avancement_technique: number;
  indicateurs: number;
  decaissement: number;
}

interface PTBAComposanteChartProps {
  data: ComposanteData[];
  anneesDisponibles: number[];
  selectedAnnee: number | null;
  onAnneeChange: (annee: number | null) => void;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2 mb-1">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: entry.fill }}
          />
          <span className="text-gray-600 dark:text-gray-400">{entry.name}:</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{entry.value}%</span>
        </div>
      ))}
    </div>
  );
};

const PTBAComposanteChart: React.FC<PTBAComposanteChartProps> = ({
  data,
  anneesDisponibles,
  selectedAnnee,
  onAnneeChange,
}) => {
  const { color } = useColor();
  const { stroke } = CHART_COLORS[color];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            PTBA par composante
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Avancement technique · Indicateurs · Décaissement
          </p>
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
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
          barCategoryGap="30%"
          barGap={4}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="composante"
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
            iconType="circle"
            iconSize={8}
          />
          <Bar
            dataKey="avancement_technique"
            name="Avancement technique"
            fill="#EAB308"
            radius={[4, 4, 0, 0]}
            label={{ position: "top", fontSize: 10, fill: "#6b7280", formatter: (v) => `${v}%` }}
          />
          <Bar
            dataKey="indicateurs"
            name="Indicateurs"
            fill="#22C55E"
            radius={[4, 4, 0, 0]}
            label={{ position: "top", fontSize: 10, fill: "#6b7280", formatter: (v) => `${v}%` }}
          />
          <Bar
            dataKey="decaissement"
            name="Décaissement"
            fill={stroke}
            radius={[4, 4, 0, 0]}
            label={{ position: "top", fontSize: 10, fill: "#6b7280", formatter: (v) => `${v}%` }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PTBAComposanteChart;