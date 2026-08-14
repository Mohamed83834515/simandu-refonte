import { useEffect, useMemo, useState } from 'react'
import { Plus, Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { NiveauActiviteProjet } from '@/simadou/allTypes'
import type { NiveauActiviteProjetFormData } from '@/simadou/schemas/activiteProjetSchemas'
import {
  useCreateNiveauActiviteProjet,
  useDeleteNiveauActiviteProjet,
  useGetNiveauxActiviteProjet,
  useUpdateNiveauActiviteProjet,
} from '@/simadou/allHooks/admin/activiteProjetHooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type NiveauRow = {
  id?: number
  libelle: string
  taille: number
  isNew: boolean
}

function toRow(niveau: NiveauActiviteProjet): NiveauRow {
  return {
    id: niveau.id_niveau_activite_projet,
    libelle: niveau.libelle_niveau_activite_projet,
    taille: niveau.taille_code_niveau_activite_projet,
    isNew: false,
  }
}

export default function NiveauActiviteProjetManager({
  codeProjet,
}: {
  codeProjet: string
}) {
  const { data: niveaux = [], isLoading } = useGetNiveauxActiviteProjet(codeProjet)
  const createMutation = useCreateNiveauActiviteProjet(codeProjet)
  const updateMutation = useUpdateNiveauActiviteProjet(codeProjet)
  const deleteMutation = useDeleteNiveauActiviteProjet()
  const sorted = useMemo(
    () =>
      [...niveaux].sort(
        (a, b) =>
          a.nombre_niveau_activite_projet - b.nombre_niveau_activite_projet
      ),
    [niveaux]
  )

  const [rows, setRows] = useState<NiveauRow[]>([])
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (initialized) return
    if (isLoading) return

    if (sorted.length === 0) {
      setRows([{ libelle: '', taille: 2, isNew: true }])
    } else {
      setRows(sorted.map(toRow))
    }
    setInitialized(true)
  }, [initialized, isLoading, sorted])

  const canDeleteRow = (index: number) => index === rows.length - 1

  const onAddRow = () => {
    setRows((prev) => [...prev, { libelle: '', taille: 2, isNew: true }])
  }

  const onRemoveRow = async (index: number) => {
    const row = rows[index]
    if (!row) return

    if (row.id != null) {
      const ok = window.confirm('Supprimer ce niveau ?')
      if (!ok) return
      try {
        await deleteMutation.mutateAsync(row.id)
        toast.success('Niveau supprimé')
        setInitialized(false)
      } catch {
        toast.error('Erreur lors de la suppression')
      }
      return
    }

    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  const onSave = async () => {
    const tasks = rows.map(async (row, idx) => {
      const data: NiveauActiviteProjetFormData = {
        libelle_niveau_activite_projet: row.libelle,
        nombre_niveau_activite_projet: idx + 1,
        taille_code_niveau_activite_projet: Number(row.taille),
        code_projet: codeProjet,
      }

      if (!row.libelle.trim()) return

      if (row.isNew) {
        await createMutation.mutateAsync(data)
      } else if (row.id != null) {
        await updateMutation.mutateAsync({ id: row.id, data })
      }
    })

    try {
      await Promise.all(tasks)
      toast.success('Niveaux sauvegardés')
      setInitialized(false)
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    }
  }

  if (isLoading && !initialized) {
    return <div className='py-6 text-sm text-muted-foreground'>Chargement…</div>
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h3 className='text-base font-semibold'>Configuration des niveaux</h3>
          <p className='text-sm text-muted-foreground'>
            Définissez l’ordre des niveaux et la taille des codes.
          </p>
        </div>
        <div className='flex flex-col gap-2 sm:flex-row'>
          <Button type='button' variant='outline' onClick={onAddRow}>
            <Plus className='h-4 w-4' />
            Ajouter un niveau
          </Button>
          <Button type='button' onClick={onSave}>
            <Save className='h-4 w-4' />
            Enregistrer
          </Button>
        </div>
      </div>

      <div className='rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Libellé</TableHead>
              <TableHead className='w-40'>Taille du code</TableHead>
              <TableHead className='w-24 text-end'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.id ?? `new-${index}`}>
                <TableCell className='align-top'>
                  <Input
                    value={row.libelle}
                    placeholder='Ex: Composante'
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r, i) =>
                          i === index ? { ...r, libelle: e.target.value } : r
                        )
                      )
                    }
                  />
                </TableCell>
                <TableCell className='align-top'>
                  <Input
                    type='number'
                    min={1}
                    max={10}
                    value={row.taille}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r, i) =>
                          i === index
                            ? { ...r, taille: Number(e.target.value) }
                            : r
                        )
                      )
                    }
                  />
                </TableCell>
                <TableCell className='text-end align-top'>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    disabled={!canDeleteRow(index)}
                    onClick={() => onRemoveRow(index)}
                    title={
                      canDeleteRow(index)
                        ? 'Supprimer'
                        : 'Supprimez uniquement le dernier niveau'
                    }
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

