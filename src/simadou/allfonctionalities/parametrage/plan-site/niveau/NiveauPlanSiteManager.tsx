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
import { DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { type NiveauStructureConfigFormData } from '@/simadou/allTypes/entities'
import {
  useDeleteNiveauPlanSite,
  useGetNiveauxPlanSite,
  useSaveNiveauxPlanSite,
  useUpdateNiveauPlanSite,
} from '@/simadou/allHooks/admin/niveauPlanSiteHooks'

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
  const createMutation = useSaveNiveauxPlanSite()
  const updateMutation = useUpdateNiveauPlanSite()
  const deleteMutation = useDeleteNiveauPlanSite()

  const sorted = useMemo(
    () => [...niveaux].sort((a: any, b: any) => a.nombre_nsc - b.nombre_nsc),
    [niveaux]
  )

  const [rows, setRows] = useState<NiveauRow[]>([])
  const [initialized, setInitialized] = useState(false)
  const isSaving = createMutation.isPending || updateMutation.isPending

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

    const originalById = new Map(
      sorted.map((n: any) => [
        n.id_nsc as number,
        {
          libelle: String(n.libelle_nsc ?? ''),
          codeNumber: Number(n.code_number_nsc) || 1,
          nombre: Number(n.nombre_nsc) || 0,
        },
      ])
    )

    try {
      let order = 0
      const toCreate: NiveauStructureConfigFormData[] = []
      let updatedCount = 0

      for (const row of rows) {
        if (!row.libelle.trim()) continue
        order += 1
        const payload: NiveauStructureConfigFormData = {
          libelle_nsc: row.libelle.trim(),
          nombre_nsc: order,
          code_number_nsc: Number(row.codeNumber),
        }

        if (row.isNew) {
          toCreate.push(payload)
          continue
        }

        if (row.id == null) continue

        const original = originalById.get(row.id)
        const changed =
          !original ||
          original.libelle !== payload.libelle_nsc ||
          original.codeNumber !== Number(payload.code_number_nsc) ||
          original.nombre !== order

        if (!changed) continue

        await updateMutation.mutateAsync({ ...payload, id_nsc: row.id })
        updatedCount += 1
      }

      if (toCreate.length === 0 && updatedCount === 0) {
        toast.message('Aucune modification à enregistrer')
        return
      }

      if (toCreate.length > 0) {
        await createMutation.mutateAsync(toCreate)
      } else {
        toast.success(
          updatedCount === 1
            ? 'Niveau modifié avec succès'
            : 'Niveaux sauvegardés'
        )
      }

      setInitialized(false)
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    }
  }

  const onRemoveRow = async (index: number) => {
    const row = rows[index]
    if (!row) return

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

    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  if (isLoading && !initialized) {
    return <div className='py-6 text-sm text-muted-foreground'>Chargement…</div>
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-start justify-between gap-4 pe-8'>
        <div className='space-y-1'>
          <DialogTitle>Configuration des niveaux de structure</DialogTitle>
          <DialogDescription>
            Gérez les niveaux hiérarchiques (Ministère, Direction, Service, etc.)
          </DialogDescription>
        </div>
        <div className='flex shrink-0 flex-col gap-2 sm:flex-row'>
          <Button type='button' variant='outline' onClick={onAddRow}>
            <Plus className='h-4 w-4' />
            Ajouter un niveau
          </Button>
          <Button type='button' onClick={onSave} disabled={isSaving}>
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
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
                <TableCell className='font-medium'>{index + 1}</TableCell>
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
