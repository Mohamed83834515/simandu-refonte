import { useEffect, useMemo, useState } from 'react'
import { Plus, Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { NiveauCadreResultat } from '@/simadou/allTypes'
import type { NiveauCadreResultatCreateData } from '@/simadou/schemas/cadreResultatSchemas'
import {
  useCreateNiveauCadreResultat,
  useDeleteNiveauCadreResultat,
  useGetNiveauxCadreResultat,
  useUpdateNiveauCadreResultat,
} from '@/simadou/allHooks/admin/cadreResultatHooks'
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
  codeNumber: number
  typeNiveau: 1 | 2 | 3
  isNew: boolean
}

const TYPE_OPTIONS: Array<{ value: 1 | 2 | 3; label: string }> = [
  { value: 1, label: 'Effet' },
  { value: 2, label: 'Produit' },
  { value: 3, label: 'Impact' },
]

function toRow(n: NiveauCadreResultat): NiveauRow {
  const type = Number(n.type_niveau)
  return {
    id: n.id_ncr,
    libelle: n.libelle_ncr,
    codeNumber: Number(n.code_number_ncr) || 1,
    typeNiveau: (type === 1 || type === 2 || type === 3 ? type : 1) as 1 | 2 | 3,
    isNew: false,
  }
}

function getNextCodeNumber(rows: NiveauRow[]): number {
  const used = new Set(
    rows
      .map((r) => Number(r.codeNumber))
      .filter((n) => Number.isFinite(n) && n > 0)
  )
  let candidate = 1
  while (used.has(candidate)) candidate++
  return candidate
}

function createEmptyRow(existingRows: NiveauRow[]): NiveauRow {
  return {
    libelle: '',
    codeNumber: getNextCodeNumber(existingRows),
    typeNiveau: 1,
    isNew: true,
  }
}

export default function NiveauCadreResultatManager({idProjet}:{idProjet:number}) {
  const { data: niveaux = [], isLoading } = useGetNiveauxCadreResultat(idProjet)
  const createMutation = useCreateNiveauCadreResultat()
  const updateMutation = useUpdateNiveauCadreResultat()
  const deleteMutation = useDeleteNiveauCadreResultat()
  console.log("codeProjet", idProjet)
  const sorted = useMemo(
    () => [...niveaux].sort((a, b) => a.nombre_ncr - b.nombre_ncr),
    [niveaux]
  )

  const [rows, setRows] = useState<NiveauRow[]>([])
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (initialized || isLoading) return
    if (sorted.length === 0) {
      setRows([createEmptyRow([])])
    } else {
      setRows(sorted.map(toRow))
    }
    setInitialized(true)
  }, [initialized, isLoading, sorted])

  const onAddRow = () => {
    setRows((prev) => [...prev, createEmptyRow(prev)])
  }

  const onSave = async () => {
    const rowsToSave = rows.filter((row) => row.libelle.trim())
    if (rowsToSave.length === 0) {
      toast.error('Renseignez au moins un libellé de niveau')
      return
    }

    const codeNumbers = rowsToSave.map((r) => Number(r.codeNumber))
    if (new Set(codeNumbers).size !== codeNumbers.length) {
      toast.error('Chaque niveau doit avoir un code numérique unique')
      return
    }

    try {
      let order = 0
      for (const row of rows) {
        if (!row.libelle.trim()) continue

        order += 1
        const data: NiveauCadreResultatCreateData = {
          nombre_ncr: order,
          libelle_ncr: row.libelle.trim(),
          code_number_ncr: Number(row.codeNumber),
          type_niveau: row.typeNiveau,
          projet_ncr: idProjet,
        }

        if (row.isNew) {
          await createMutation.mutateAsync(data)
        } else if (row.id != null) {
          await updateMutation.mutateAsync({ id: row.id, data })
        }
      }

      toast.success('Niveaux sauvegardés')
      setInitialized(false)
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    }
  }

  const onRemoveRow = async (index: number) => {
    const row = rows[index]
    if (!row) return

    if (row.id != null) {
      if (!window.confirm('Supprimer ce niveau ?')) return
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

  if (isLoading && !initialized) {
    return <div className='py-6 text-sm text-muted-foreground'>Chargement…</div>
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h3 className='text-base font-semibold'>Configuration des niveaux</h3>
          <p className='text-sm text-muted-foreground'>
            Gérez les niveaux du cadre de résultat. Le numéro d&apos;ordre est
            attribué automatiquement.
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
              <TableHead className='w-32'>Code num.</TableHead>
              <TableHead className='w-40'>Type</TableHead>
              <TableHead className='w-20 text-end'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.id ?? `new-${index}`}>
                <TableCell>
                  <Input
                    value={row.libelle}
                    placeholder='Ex: Objectif stratégique'
                    onChange={(e) =>
                      setRows((p) =>
                        p.map((r, i) => (i === index ? { ...r, libelle: e.target.value } : r))
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type='number'
                    min={1}
                    value={row.codeNumber}
                    onChange={(e) =>
                      setRows((p) =>
                        p.map((r, i) =>
                          i === index ? { ...r, codeNumber: Number(e.target.value) } : r
                        )
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  <select
                    className='h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm'
                    value={row.typeNiveau}
                    onChange={(e) =>
                      setRows((p) =>
                        p.map((r, i) =>
                          i === index
                            ? { ...r, typeNiveau: Number(e.target.value) as 1 | 2 | 3 }
                            : r
                        )
                      )
                    }
                  >
                    {TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </TableCell>
                <TableCell className='text-end'>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    disabled={index !== rows.length - 1}
                    onClick={() => onRemoveRow(index)}
                    title={
                      index === rows.length - 1
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
