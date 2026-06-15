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
  PieChart,
  Pie,
  Cell,
  PieLabelRenderProps,
} from "recharts";

import { CHART_COLORS, useColor } from "@/stores/others/color-store";

export interface DecaissementBailleurRow {
  bailleur: string;
  montant_prevu: number;
  montant_decaisse: number;
  taux: number;
}

export interface DecaissementMensuelRow {
  mois: string;
  montant: number;
}

interface DecaissementChartsProps {
  dataBailleur: DecaissementBailleurRow[];
  dataMensuel: DecaissementMensuelRow[];
}

const COLORS = [
  "#3B82F6", "#22C55E", "#F59E0B", "#EF4444",
  "#8B5CF6", "#EC4899", "#14B8A6", "#F97316",
];

const formatMontant = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
};

const CustomTooltipBailleur: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-800 mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: entry.fill }} />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-semibold text-gray-900">
            {formatMontant(entry.value)} USD
          </span>
        </div>
      ))}
    </div>
  );
};

const RADIAN = Math.PI / 180;
const CustomPieLabel = (props: PieLabelRenderProps) => {
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  } = props;

  if (!percent || percent < 0.05) return null;

  const r = Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 0.5;
  const x = Number(cx) + r * Math.cos(-Number(midAngle) * RADIAN);
  const y = Number(cy) + r * Math.sin(-Number(midAngle) * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={10}
      fontWeight={600}
    >
      {(percent * 100).toFixed(0)}%
    </text>
  );
};

const DecaissementCharts: React.FC<DecaissementChartsProps> = ({
  dataBailleur,
  dataMensuel,
}) => {
  const { color } = useColor();
  const { stroke } = CHART_COLORS[color];
  
  const pieData = dataBailleur.map((d) => ({
    name: d.bailleur,
    value: d.montant_decaisse,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Décaissement par bailleur - barres groupées */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Décaissement par bailleur
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500">Prévu vs Décaissé (GNF)</p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={dataBailleur}
            margin={{ top: 8, right: 8, left: 0, bottom: 20 }}
            barCategoryGap="30%"
            barGap={3}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="bailleur"
              tick={{ fontSize: 10, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
              angle={-20}
              textAnchor="end"
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatMontant}
            />
            <Tooltip content={<CustomTooltipBailleur />} cursor={{ fill: "#f9fafb" }} />
            <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={8} />
            <Bar dataKey="montant_prevu" name="Prévu" fill="#D1D5DB" radius={[4, 4, 0, 0]} />
            <Bar dataKey="montant_decaisse" name="Décaissé" fill={stroke} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Répartition des décaissements - camembert */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Répartition des décaissements
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500">Par bailleur de fonds</p>
        </div>
        {pieData.length > 0 ? (
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={40}
                  dataKey="value"
                  labelLine={false}
                  label={CustomPieLabel}
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${formatMontant(value as number)} USD`, "Montant"]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {pieData.map((entry, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{entry.name}</span>
                  <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 ml-auto">
                    {formatMontant(entry.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-[250px] flex items-center justify-center">
            <p className="text-sm text-gray-400 italic">Aucune donnée disponible</p>
          </div>
        )}
      </div>

      {/* Évolution mensuelle */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 lg:col-span-2">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Évolution mensuelle des décaissements
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500">Montants décaissés par mois (GNF)</p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={dataMensuel}
            margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
            barCategoryGap="40%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="mois"
              tick={{ fontSize: 11, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatMontant}
            />
            <Tooltip
              formatter={(value) => [`${formatMontant(value as number)} USD`, "Décaissé"]}
              cursor={{ fill: "#f9fafb" }}
            />
            <Bar
              dataKey="montant"
              name="Montant décaissé"
              fill={stroke}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DecaissementCharts;