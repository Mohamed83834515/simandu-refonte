// simadou/allfonctionalities/parametrage/plan-site/NiveauPlanSiteManager.tsx
import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
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
import { NiveauStructureConfigFormData } from '@/simadou/allTypes/entities'
import { useDeleteNiveauPlanSite, useGetNiveauxPlanSite, useSaveNiveauxPlanSite } from '@/simadou/allHooks/admin/niveauPlanSiteHooks'

type NiveauRow = {
  id?: number
  libelle: string
  codeNumber: number
  isNew: boolean
}

function toRow(n: any): NiveauRow {
  return {
    id: n.id_nsc,
    libelle: n.libelle_nsc,
    codeNumber: Number(n.code_number_nsc) || 1,
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

export default function NiveauPlanSiteManager({ onSuccess }: Props) {
  const { data: niveaux = [], isLoading } = useGetNiveauxPlanSite()
  const saveMutation = useSaveNiveauxPlanSite()
  const deleteMutation = useDeleteNiveauPlanSite()

  const sorted = useMemo(
    () => [...niveaux].sort((a: any, b: any) => a.nombre_nsc - b.nombre_nsc),
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
    // ✅ Ne prendre que les nouveaux niveaux (ceux avec isNew = true)
    const newRows = rows.filter((row) => row.isNew && row.libelle.trim())
    
    if (newRows.length === 0) {
      toast.error('Ajoutez au moins un nouveau niveau')
      return
    }

    const codeNumbers = newRows.map((r) => Number(r.codeNumber))
    if (new Set(codeNumbers).size !== codeNumbers.length) {
      toast.error('Chaque niveau doit avoir un code numérique unique')
      return
    }

    try {
      let order = niveaux.length // Commencer après les niveaux existants
      const niveauxToSave: NiveauStructureConfigFormData[] = []
      
      for (const row of newRows) {
        if (!row.libelle.trim()) continue
        order += 1
        niveauxToSave.push({
          libelle_nsc: row.libelle.trim(),
          nombre_nsc: order,
          code_number_nsc: Number(row.codeNumber),
        })
      }
      
      await saveMutation.mutateAsync(niveauxToSave)
      setInitialized(false)
      onSuccess?.()
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    }
  }

  const onRemoveRow = async (index: number) => {
    const row = rows[index]
    if (!row) return

    // ✅ Si c'est un niveau existant (avec ID), on le supprime
    if (row.id != null && !row.isNew) {
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

    // ✅ Si c'est un nouveau niveau (sans ID), on l'enlève juste de l'état
    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  if (isLoading && !initialized) {
    return <div className='py-6 text-sm text-muted-foreground'>Chargement…</div>
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h3 className='text-base font-semibold'>Configuration des niveaux de structure</h3>
          <p className='text-sm text-muted-foreground'>
            Gérez les niveaux hiérarchiques (Ministère, Direction, Service, etc.)
          </p>
        </div>
        <div className='flex flex-col gap-2 sm:flex-row'>
          <Button type='button' variant='outline' onClick={onAddRow}>
            <Plus className='h-4 w-4' />
            Ajouter un niveau
          </Button>
          <Button type='button' onClick={onSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      <div className='rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-16'>Niveau</TableHead>
              <TableHead>Libellé</TableHead>
              <TableHead className='w-32'>Taille code</TableHead>
              <TableHead className='w-20 text-end'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.id ?? `new-${index}`}>
                <TableCell className='font-medium'>
                  {index + 1}
                </TableCell>
                <TableCell>
                  <Input
                    value={row.libelle}
                    placeholder='Ex: Ministère, Direction, Service...'
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