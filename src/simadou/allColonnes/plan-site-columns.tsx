// simadou/allColonnes/planSite-columns.tsx
import { buildColumns } from "@/Global/Tableaux/column-builder"
import { GenericRowActions } from "@/Global/Tableaux/GenericRowActions"
import { UserPen, Trash2 } from "lucide-react"

export const buildPlanSiteColumns = (
    niveaux: any[],
    currentNiveauNombre: number,
    onEdit: (row: any) => void,
    onDeleteRequest: (row: any) => void
) => {
    const parentNiveaux = niveaux
        .filter((n: any) => n.nombre_nsc < currentNiveauNombre)
        .sort((a: any, b: any) => b.nombre_nsc - a.nombre_nsc)

    const getParentHierarchy = (row: any) => {
        const hierarchy: any[] = []
        let currentParent = row.parent_ds
        while (currentParent && typeof currentParent === 'object') {
            hierarchy.push(currentParent)
            currentParent = currentParent.parent_ds
        }
        return hierarchy
    }

    const baseColumns = buildColumns([
        {
            type: "text",
            key: "code_relai_ds",
            title: "Code",
        },
        {
            type: "text",
            key: "intutile_ds",
            title: "Libellé",
        },
    ])

    const parentColumns = parentNiveaux.map((parent: any) => ({
        id: `parent_${parent.id_nsc}`,
        header: parent.libelle_nsc,
        cell: ({ row }: any) => {
            const hierarchy = getParentHierarchy(row.original)
            const parentIndex = parentNiveaux.findIndex((p: any) => p.id_nsc === parent.id_nsc)
            return hierarchy[parentIndex]?.intutile_ds || '-'
        },
    }))

    const actionColumn = {
        id: "actions",
        header: "ACTIONS",
        cell: ({ row }: any) => (
            <GenericRowActions
                row={row}
                actions={[
                    {
                        label: "Modifier",
                        icon: <UserPen size={16} />,
                        onClick: () => onEdit(row.original),
                    },
                    {
                        label: "Supprimer",
                        icon: <Trash2 size={16} />,
                        className: "text-red-500!",
                        separator: true,
                        onClick: () => onDeleteRequest(row.original),
                    },
                ]}
            />
        ),
    }

    return [...baseColumns, ...parentColumns, actionColumn]
}