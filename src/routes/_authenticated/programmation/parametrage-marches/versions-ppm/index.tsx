import AddVersionPPM from '@/simadou/allfonctionalities/ppm/version-ppm/AddVersionPPM'
import ListeVersionPPM from '@/simadou/allfonctionalities/ppm/version-ppm/ListeVersionPPM'
import { createFileRoute } from '@tanstack/react-router'
import { Briefcase } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute(
  '/_authenticated/programmation/parametrage-marches/versions-ppm/',
)({
  component: VersionPPMPage,
})

type Mode = 'list' | 'add' | 'edit'

function VersionPPMPage() {
    const [mode, setMode] = useState<Mode>('list')
    const [currentRow, setCurrentRow] = useState<any | null>(null)

    const goList = () => { setMode('list'); setCurrentRow(null) }
    const goAdd = () => { setMode('add'); setCurrentRow(null) }
    const goEdit = (row: any) => { setMode('edit'); setCurrentRow(row) }

    return (
        <div className="flex flex-col gap-6">

            <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted">
                    <Briefcase
                     className="size-4 text-muted-foreground" />
                </div>
                <div>
                    <h2 className="text-sm font-medium leading-none">
                        {mode === 'list' ? 'Versions'
                            : mode === 'add' ? 'Ajouter une version'
                                : 'Modifier une version'}
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {mode === 'list'
                            ? 'Gérez les Versions de Passations de marches (COORDO, RSE, etc.)'
                            : mode === 'add'
                                ? 'Renseignez les informations d\'une nouvelle version'
                                : `Modification de « ${currentRow?.numero_version_ppm} »`}
                    </p>
                </div>
            </div>

            {mode === 'list' && (
                <ListeVersionPPM
                    key="list"
                    onAdd={goAdd}
                    onEdit={goEdit}
                />
            )}

            {mode === 'add' && (
                <AddVersionPPM
                    key="add"
                    currentRow={null}
                    onBack={goList}
                    onCancel={goList}
                    onSuccess={goList}
                />
            )}

            {mode === 'edit' && currentRow && (
                <AddVersionPPM
                    key={`edit-${currentRow.id_version_ppm}`}
                    currentRow={currentRow}
                    onBack={goList}
                    onCancel={goList}
                    onSuccess={goList}
                />
            )}

        </div>
    )
}
