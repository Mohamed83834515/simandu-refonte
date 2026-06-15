import { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ChevronRight,
  LogOut,
  ShieldCheck,
  ShieldCog,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type ProfileDropdownUser = {
  
    nom_perso?: string
  prenom_perso?: string
  email?: string
   personnel_profile_picture : string | null
     id_personnel_perso?: string;
      statut?: number;
  
}

interface ProfileDropdownProps {
  user: ProfileDropdownUser;
  trigger: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;

  profileUrl?: string;
  profileLabel?: string;
  profileDescription?: string;

  onLogout?: () => void;

  extraItems?: ReactNode;
}

export function ProfileDropdown({
  user,
  trigger,
  side = "bottom",
  align = "end",
  sideOffset = 4,

  profileUrl = "/settings",
  profileLabel = "Gérer mon compte",
  profileDescription = "Profil & sécurité",

  onLogout,
  extraItems,
}: ProfileDropdownProps) {
  return (
  <>
  {user && (
      <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-60 rounded-xl p-0"
        side={side}
        align={align}
        sideOffset={sideOffset}
      >
        <div className="flex flex-col items-center gap-3 border-b border-border/50 px-4 py-5">
          <div className="relative">
            <Avatar className="size-18 border-2 border-background shadow-sm">
              <AvatarImage src={user?.personnel_profile_picture ?? ''} />
              <AvatarFallback className="bg-[#995F2F] text-3xl font-bold text-background">
                {user.nom_perso?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <span
              className="
                absolute bottom-0.5 right-0.5
                size-3 rounded-full
                border-2 border-background
                bg-emerald-500
              "
            />
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <p className="text-sm font-medium">{user.nom_perso}</p>
            <p className="text-xs text-muted-foreground">
              {user.email}
            </p>

            <div className="mt-1 flex items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                  user.statut === 1
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                    : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                )}
              >
                {user.statut === 1 ? (
                  <>
                    <ShieldCheck className="size-3" />
                    Compte actif
                  </>
                ) : (
                  <>
                    <AlertCircle className="size-3" />
                    Action requise
                  </>
                )}
              </span>

              <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground">
                {user.id_personnel_perso}
              </span>
            </div>
          </div>
        </div>

        <div className="p-1.5">
          <DropdownMenuItem
            asChild
            className="cursor-pointer rounded-lg px-3 py-2.5"
          >
            <Link
              to={profileUrl}
              className="flex items-center gap-3"
            >
              <div className="flex size-7 items-center justify-center rounded-md bg-muted">
                <ShieldCog className="size-3.5 text-muted-foreground" />
              </div>

              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {profileLabel}
                </span>
                <span className="text-xs text-muted-foreground">
                  {profileDescription}
                </span>
              </div>

              <ChevronRight className="ml-auto size-3.5 text-muted-foreground" />
            </Link>
          </DropdownMenuItem>

          {extraItems}
        </div>

        {onLogout && (
          <>
            <DropdownMenuSeparator className="my-0" />

            <div className="p-1.5">
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer rounded-lg px-3 py-2.5"
                onClick={onLogout}
              >
                <div className="flex size-7 items-center justify-center rounded-md bg-red-100 dark:bg-red-950">
                  <LogOut className="size-3.5 text-red-600 dark:text-red-400" />
                </div>

                <span className="text-sm font-medium">
                  Déconnexion
                </span>
              </DropdownMenuItem>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )}
  </>
  );
}