import { LucideIcon } from "lucide-react";

interface StatRow {
  label: string;
  value: string | number;
  valueColor?: string;
  suffix?: string;
}

interface StatCardProps {
  title: string;
  icon: LucideIcon;
  color: string;
  rows: StatRow[];
  progressValue?: number;
  progressColor?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
}

const colorMap: Record<
  string,
  {
    bgLight: string;
    border: string;
    text: string;
    progress: string;
    iconBg: string;
  }
> = {
  blue: {
    bgLight: "bg-blue-50",
    border: "border-blue-100",
    text: "text-blue-600",
    progress: "bg-blue-500",
    iconBg: "bg-blue-100",
  },
  emerald: {
    bgLight: "bg-emerald-50",
    border: "border-emerald-100",
    text: "text-emerald-600",
    progress: "bg-emerald-500",
    iconBg: "bg-emerald-100",
  },
  purple: {
    bgLight: "bg-purple-50",
    border: "border-purple-100",
    text: "text-purple-600",
    progress: "bg-purple-500",
    iconBg: "bg-purple-100",
  },
  rose: {
    bgLight: "bg-rose-50",
    border: "border-rose-100",
    text: "text-rose-600",
    progress: "bg-rose-500",
    iconBg: "bg-rose-100",
  },
  orange: {
    bgLight: "bg-orange-50",
    border: "border-orange-100",
    text: "text-orange-600",
    progress: "bg-orange-500",
    iconBg: "bg-orange-100",
  },
  slate: {
    bgLight: "bg-slate-50",
    border: "border-slate-100",
    text: "text-slate-600",
    progress: "bg-slate-500",
    iconBg: "bg-slate-100",
  },
};

const valueColors: Record<string, string> = {
  red: "text-red-600",
  orange: "text-orange-500",
  emerald: "text-emerald-600",
  green: "text-green-600",
  purple: "text-purple-600",
  blue: "text-blue-600",
  rose: "text-rose-600",
  slate: "text-slate-600",
};

export default function StatCard({
  title,
  icon: Icon,
  color,
  rows,
  progressValue,
  progressColor,
  trend,
}: StatCardProps) {
  const theme = colorMap[color] || colorMap.blue;
  const progressTheme = colorMap[progressColor || color]?.progress || "bg-emerald-500";

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl
        border ${theme.border}
        bg-white
        p-5
        shadow-sm
        transition-all duration-300
        hover:-translate-y-1
        hover:shadow-lg
        dark:bg-gray-800
        dark:border-gray-700
      `}
    >
      {/* Icône en arrière-plan */}
      <div className="absolute -right-4 -top-4 opacity-10">
        <Icon className="h-24 w-24 text-gray-900 dark:text-white" strokeWidth={1} />
      </div>

      {/* Header avec titre et icône mini */}
      <div className="relative flex items-center gap-3 mb-4">
        <div
          className={`
            flex h-10 w-10 items-center justify-center
            rounded-xl ${theme.iconBg}
            ${theme.text}
          `}
        >
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wider ${theme.text}`}>
            {title}
          </p>
        </div>
      </div>

      {/* Trend */}
      {trend && (
        <div className="relative mb-4">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              trend.positive
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {trend.positive ? "↑" : "↓"} {trend.value}
          </span>
        </div>
      )}

      {/* Stats */}
      <div className="relative space-y-3">
        {rows.map((row, index) => (
          <div
            key={index}
            className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0 last:pb-0"
          >
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {row.label}
            </span>

            <div className="text-right">
              <span
                className={`text-base font-bold ${
                  valueColors[row.valueColor || ""] || "text-gray-800 dark:text-gray-200"
                }`}
              >
                {row.value}
              </span>

              {row.suffix && (
                <span className="ml-1 text-xs font-medium text-gray-400 dark:text-gray-500">
                  {row.suffix}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Progress */}
      {progressValue !== undefined && (
        <div className="relative mt-4">
          <div className="mb-1.5 flex justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Progression</span>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {progressValue.toFixed(0)}%
            </span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
            <div
              className={`h-full rounded-full ${progressTheme} transition-all duration-700`}
              style={{
                width: `${Math.min(progressValue, 100)}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}