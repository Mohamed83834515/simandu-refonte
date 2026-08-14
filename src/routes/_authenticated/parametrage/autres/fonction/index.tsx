import AddFonction from '@/simadou/allfonctionalities/parametrage/autres/fonction/AddFonction'
import ListeFOnction from '@/simadou/allfonctionalities/parametrage/autres/fonction/ListeFonction'
import { Briefcase } from 'lucide-react'
import { useState } from 'react'

type Mode = 'list' | 'add' | 'edit'

export function FonctionPage() {
    const [mode, setMode] = useState<Mode>('list')
    const [currentRow, setCurrentRow] = useState<any | null>(null)

    const goList = () => { setMode('list'); setCurrentRow(null) }
    const goAdd = () => { setMode('add'); setCurrentRow(null) }
    const goEdit = (row: any) => { setMode('edit'); setCurrentRow(row) }

    return (
        <div className="flex flex-col gap-6">

            <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted">
                    <Briefcase className="size-4 text-muted-foreground" />
                </div>
                <div>
                    <h2 className="text-sm font-medium leading-none">
                        {mode === 'list' ? 'Fonctions'
                            : mode === 'add' ? 'Ajouter une fonction'
                                : 'Modifier une fonction'}
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {mode === 'list'
                            ? 'Gérez les fonctions  (COORDO, RSE, etc.)'
                            : mode === 'add'
                                ? 'Renseignez les informations d\'une nouvelle fonction'
                                : `Modification de « ${currentRow?.nom_fonction} »`}
                    </p>
                </div>
            </div>

            {mode === 'list' && (
                <ListeFOnction
                    key="list"
                    onAdd={goAdd}
                    onEdit={goEdit}
                />
            )}

            {mode === 'add' && (
                <AddFonction
                    key="add"
                    currentRow={null}
                    onBack={goList}
                    onCancel={goList}
                    onSuccess={goList}
                />
            )}

            {mode === 'edit' && currentRow && (
                <AddFonction
                    key={`edit-${currentRow.id_fonction}`}
                    currentRow={currentRow}
                    onBack={goList}
                    onCancel={goList}
                    onSuccess={goList}
                />
            )}

        </div>
    )
}