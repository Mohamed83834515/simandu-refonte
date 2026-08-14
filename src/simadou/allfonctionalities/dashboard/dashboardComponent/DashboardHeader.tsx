import React, { useState } from "react";
import { BellIcon, SearchIcon, XIcon, LayoutDashboardIcon } from "lucide-react";
import { CHART_COLORS, useColor } from "@/stores/others/color-store";

interface Notification {
  id: string | number;
  message: string;
  type: "info" | "warning" | "success" | "error";
  time: string;
  lu: boolean;
}

interface DashboardHeaderProps {
  nomProgramme?: string;
  notifications?: Notification[];
  onSearchProject?: (query: string) => void;
}

const notifDot: Record<Notification["type"], string> = {
  info: "bg-blue-500",
  warning: "bg-yellow-500",
  success: "bg-green-500",
  error: "bg-red-500",
};

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  nomProgramme,
  notifications = [],
  onSearchProject,
}) => {
  const [showNotif, setShowNotif] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const { color } = useColor();
  const { stroke } = CHART_COLORS[color];
  const nonLus = notifications.filter((n) => !n.lu).length;

  const handleSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearchProject) {
      onSearchProject(searchVal);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
      {/* Titre */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
          style={{ backgroundColor: stroke }}
        >
          <LayoutDashboardIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
            Tableau de bord
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Vue d'ensemble — Exécution PTBA
            {nomProgramme && (
              <span
                className="ml-1 font-medium transition-colors"
                style={{ color: stroke }}
              >
                · {nomProgramme}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Barre de recherche rapide */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher un projet…"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onKeyDown={handleSearchKey}
            className="pl-9 pr-10 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-56 shadow-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          {searchVal && (
            <button
              onClick={() => {
                setSearchVal("");
                onSearchProject?.("");
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Cloche notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotif((v) => !v)}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition"
          >
            <BellIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            {nonLus > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center min-w-[18px] h-[18px] px-1">
                {nonLus > 9 ? "9+" : nonLus}
              </span>
            )}
          </button>

          {/* Dropdown notifications */}
          {showNotif && (
            <div className="absolute right-0 top-11 z-50 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Notifications
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {nonLus} non lu{nonLus !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500 italic">
                    Aucune notification
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition ${!n.lu ? "bg-blue-50/30 dark:bg-blue-900/20" : ""
                        }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notifDot[n.type]}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 dark:text-gray-200">{n.message}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700">
                <button
                  className="text-xs font-medium hover:underline transition-colors"
                  style={{ color: stroke }}
                >
                  Tout marquer comme lu
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;