import { type ColumnDef } from "@tanstack/react-table"
import {
  Archive,
  CheckCircle,
  Trash2,
  UserPen,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/data-table/column-header"

import { buildColumns } from "@/Global/Tableaux/column-builder"
import { GenericRowActions } from "@/Global/Tableaux/GenericRowActions"
import type { VersionPtba } from "@/simadou/allTypes"

// Mapping des statuts pour l'affichage
const getStatusBadge = (statut: number | undefined) => {
  if (statut === undefined) return <Badge variant="secondary">⚠️ Non défini</Badge>
  
  switch (statut) {
    case 1:
      return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">✓ Validée</Badge>
    case 2:
      return <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">📦 Archivée</Badge>
    default:
      return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">⚙️ En cours</Badge>
  }
}

// Colonne pour l'année avec formatage
const AnneeColumn: ColumnDef<VersionPtba> = {
  id: "annee_ptba",
  accessorKey: "annee_ptba",
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Année" />
  ),
  cell: ({ row }) => {
    const annee = row.original.annee_ptba
    return <span>{annee ? annee.toString() : "—"}</span>
  },
}

// Colonne pour la date de validation
const DateValidationColumn: ColumnDef<VersionPtba> = {
  id: "date_validation",
  accessorKey: "date_validation",
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Date validation" />
  ),
  cell: ({ row }) => {
    const date = row.original.date_validation
    if (!date) return <span className="text-muted-foreground">—</span>
    return <span>{new Date(date).toLocaleDateString('fr-FR')}</span>
  },
}

// Colonne pour le statut
const StatutColumn: ColumnDef<VersionPtba> = {
  id: "statut_version",
  accessorKey: "statut_version",
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Statut" />
  ),
  cell: ({ row }) => getStatusBadge(row.original.statut_version),
}

type BuildVersionPtbaColumnsProps = {
  setOpen: (value: boolean) => void
  setCurrentRow: (row: VersionPtba | null) => void
  onEdit: (row: VersionPtba) => void
  onValidate: (row: VersionPtba) => void
  onArchive: (row: VersionPtba) => void
}

export function buildVersionPtbaColumns({
  setOpen,
  setCurrentRow,
  onEdit,
  onValidate,
  onArchive,
}: BuildVersionPtbaColumnsProps): ColumnDef<VersionPtba>[] {
  // Colonnes de base avec buildColumns (sans format)
  const baseColumns = buildColumns<VersionPtba>([
    {
      type: "text",
      key: "version_ptba",
      title: "Version",
      sticky: true,
    },
    {
      type: "text",
      key: "observation",
      title: "Observation",
      maxWidth: "max-w-md",
    },
  ])

  // Colonne des actions
  const actionsColumn: ColumnDef<VersionPtba> = {
    id: "actions",
    accessorKey: "id_version_ptba",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actions" />
    ),
    cell: ({ row }) => {
      const item = row.original
      const isEnCours = item.statut_version === 0 || item.statut_version === undefined
      const isValide = item.statut_version === 1
      // const isArchive = item.statut_version === 2

      return (
        <GenericRowActions
          row={row}
          actions={[
            // Modifier - seulement si en cours
            {
              label: "Modifier",
              icon: <UserPen size={16} />,
              onClick: () => {
                if (isEnCours) onEdit(item)
              },
            },
            // Valider - seulement si en cours
            ...(isEnCours
              ? [
                  {
                    label: "Valider",
                    icon: <CheckCircle size={16} />,
                    className: "text-green-600!",
                    onClick: () => onValidate(item),
                  },
                ]
              : []),
            // Archiver - seulement si validée
            ...(isValide
              ? [
                  {
                    label: "Archiver",
                    icon: <Archive size={16} />,
                    className: "text-orange-600!",
                    onClick: () => onArchive(item),
                  },
                ]
              : []),
            // Supprimer - seulement si en cours
            ...(isEnCours
              ? [
                  {
                    label: "Supprimer",
                    icon: <Trash2 size={16} />,
                    className: "text-red-500!",
                    separator: true,
                    onClick: () => {
                      setCurrentRow(item)
                      setOpen(true)
                    },
                  },
                ]
              : []),
          ]}
        />
      )
    },
    enableSorting: false,
    enableHiding: false,
  }

  return [
    ...baseColumns,
    AnneeColumn,
    DateValidationColumn,
    StatutColumn,
    actionsColumn,
  ]
}