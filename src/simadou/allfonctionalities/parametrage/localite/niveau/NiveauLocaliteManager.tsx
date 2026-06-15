// simadou/allfonctionalities/parametrage/localite/NiveauLocaliteManager.tsx
import { useEffect, useMemo, useState } from 'react'
import { Plus, Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  useDeleteNiveauLocalite,
  useGetNiveauxLocalite,
  useSaveNiveauxLocalite,
} from '@/simadou/allHooks/admin/niveauLocaliteHooks'
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
  isNew: boolean
}

function toRow(n: any): NiveauRow {
  return {
    id: n.id_nlc,
    libelle: n.libelle_nlc,
    codeNumber: Number(n.Code_number_nlc) || 1,
    isNew: false,
  }
}

function getNextCodeNumber(rows: NiveauRow[]): number {
  const used = new Set(rows.map((r) => Number(r.codeNumber)).filter((n) => n > 0))
  let candidate = 1
  while (used.has(candidate)) candidate++
  return candidate
}

function createEmptyRow(existingRows: NiveauRow[]): NiveauRow {
  return {
    libelle: '',
    codeNumber: getNextCodeNumber(existingRows),
    isNew: true,
  }
}

type Props = {
  onSuccess?: () => void
}

export default function NiveauLocaliteManager({ onSuccess }: Props) {
  const { data: niveaux = [], isLoading } = useGetNiveauxLocalite()
  const createMutation = useSaveNiveauxLocalite()
  const deleteMutation = useDeleteNiveauLocalite()

  const sorted = useMemo(
    () => [...niveaux].sort((a: any, b: any) => a.nombre_nlc - b.nombre_nlc),
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
      const newNiveaux: any[] = []

      for (const row of rows) {
        if (!row.libelle.trim()) continue
        order += 1
        newNiveaux.push({
          libelle_nlc: row.libelle.trim(),
          nombre_nlc: order,
          Code_number_nlc: Number(row.codeNumber),
        })
      }

      await createMutation.mutateAsync(newNiveaux)
      toast.success('Niveaux sauvegardés')
      setInitialized(false)
      onSuccess?.()
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
        onSuccess?.()
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
            Gérez les niveaux des localités. Le numéro d&apos;ordre est attribué
            automatiquement.
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
              <TableHead className='w-20 text-end'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.id ?? `new-${index}`}>
                <TableCell>
                  <Input
                    value={row.libelle}
                    placeholder='Ex: Région, Préfecture, Commune...'
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