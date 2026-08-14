import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { GenericTable } from '@/Global/Generic/Generictable'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import { DataTableToolbarOutlineButton } from '@/components/data-table/toolbar-outline-button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'
import {
    useGetVersions,
    useDeleteVersion,
    useValiderVersion,
    useArchiverVersion
} from '@/simadou/allHooks/admin/versionHooks'
import type { VersionPtba } from '@/simadou/allTypes'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import { buildVersionPtbaColumns } from '@/simadou/allColonnes/versions-columns'
import { useNiveauTabsTheme } from '@/components/ui/NiveauTabs'

type FilterType = 'toutes' | 'en_cours' | 'valide' | 'archive'

type ListeVersionPtbaProps = {
    onAdd: () => void
    onEdit: (row: VersionPtba) => void
}

export default function ListeVersionPtba({ onAdd, onEdit }: ListeVersionPtbaProps) {
    const { search, navigate } = useEmbeddedTableState()
    const { data: versions = [] } = useGetVersions()
    const deleteMutation = useDeleteVersion()
    const validerMutation = useValiderVersion()
    const archiverMutation = useArchiverVersion()
    const { tabsStyle } = useNiveauTabsTheme()

    const [filter, setFilter] = useState<FilterType>('toutes')
    const [deleteOpen, setDeleteOpen] = useState<boolean>(false)
    const [currentRow, setCurrentRow] = useState<VersionPtba | null>(null)

    // Compter les versions par statut
    const counts = useMemo(() => {
        const total = versions.length
        const enCours = versions.filter((v: VersionPtba) => v.statut_version === 0 || v.statut_version === undefined).length
        const valide = versions.filter((v: VersionPtba) => v.statut_version === 1).length
        const archive = versions.filter((v: VersionPtba) => v.statut_version === 2).length
        return { total, enCours, valide, archive }
    }, [versions])

    // Filtrer les versions
    const filteredVersions = useMemo(() => {
        let filtered = [...versions]

        switch (filter) {
            case 'en_cours':
                filtered = filtered.filter(v => v.statut_version === 0 || v.statut_version === undefined)
                break
            case 'valide':
                filtered = filtered.filter(v => v.statut_version === 1)
                break
            case 'archive':
                filtered = filtered.filter(v => v.statut_version === 2)
                break
            default:
                break
        }

        // Trier par année (plus récente d'abord)
        return filtered.sort((a, b) => (b.annee_ptba || 0) - (a.annee_ptba || 0))
    }, [versions, filter])

    const handleValidate = (row: VersionPtba) => {
        validerMutation.mutate(row.id_version_ptba, {
            onSuccess: () => {
                toast.success(`Version ${row.version_ptba || row.id_version_ptba} validée`)
            },
            onError: () => {
                toast.error("Erreur lors de la validation")
            },
        })
    }

    const handleArchive = (row: VersionPtba) => {
        archiverMutation.mutate(row.id_version_ptba, {
            onSuccess: () => {
                toast.success(`Version ${row.version_ptba || row.id_version_ptba} archivée`)
            },
            onError: () => {
                toast.error("Erreur lors de l'archivage")
            },
        })
    }

    const handleDelete = (row: VersionPtba) => {
        deleteMutation.mutate(row.id_version_ptba, {
            onSuccess: () => {
                toast.success('Version supprimée avec succès')
                setDeleteOpen(false)
                setCurrentRow(null)
            },
            onError: () => {
                toast.error("Erreur lors de la suppression")
            },
        })
    }

    const columns = useMemo(
        () =>
            buildVersionPtbaColumns({
                setOpen: setDeleteOpen,
                setCurrentRow,
                onEdit,
                onValidate: handleValidate,
                onArchive: handleArchive,
            }),
        [onEdit, handleValidate, handleArchive]
    )

    return (
        <div className="space-y-6">
            {/* Onglets avec compteurs */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Tabs
                    orientation='vertical'
                    defaultValue='overview'
                    className='space-y-2'
                    style={tabsStyle}
                    value={filter} onValueChange={(v) => setFilter(v as FilterType)}
                >
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="toutes">
                            Toutes
                            <span className='rounded-full bg-muted px-1.5 py-0.5 text-xs text-black'>
                                ({counts.total})
                            </span>
                        </TabsTrigger>
                        <TabsTrigger value="archive">
                            Archivées
                            <span className='rounded-full bg-muted px-1.5 py-0.5 text-xs text-black'>
                                ({counts.archive})
                            </span>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <DataTableToolbarOutlineButton onClick={onAdd}>
                    <Plus className="h-4 w-4" />
                    Nouvelle version
                </DataTableToolbarOutlineButton>
            </div>

            {/* Tableau des versions */}
            <GenericTable<VersionPtba>
                data={filteredVersions}
                columns={columns}
                search={search}
                navigate={navigate}
                searchKey="version_ptba"
                searchPlaceholder="Rechercher une version..."
                urlFilterConfig={[
                    { columnId: 'version_ptba', searchKey: 'version_ptba', type: 'string' },
                    { columnId: 'annee_ptba', searchKey: 'annee_ptba', type: 'string' },
                ]}
                showViewOptions={false}
                emptyMessage="Aucune version PTBA trouvée"
            />

            {/* Dialogue de suppression */}
            <GenericDeleteDialog<VersionPtba>
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                currentRow={currentRow as any}
                entityName="version PTBA"
                getEntityLabel={(row) => row?.version_ptba || `Version ${row?.id_version_ptba}`}
                onDelete={handleDelete}
            />
        </div>
    )
}