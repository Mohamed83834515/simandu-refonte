import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  niveauCadreStrategiqueQueryKeys,
  useCreateNiveauCadreStrategique,
  useDeleteNiveauCadreStrategique,
  useGetNiveauxCadreStrategique,
  useUpdateNiveauCadreStrategique,
} from '@/simadou/allHooks/admin/cadreStrategiqueHooks'
import { niveauCadreStrategiqueService } from '@/simadou/allSercices/niveauCadreStrategiqueService'
import type { NiveauCadreStrategique } from '@/simadou/allTypes/niveauCadreStrategique'
import { typeNiveauOptions } from '@/simadou/schemas/niveauCadreStrategiqueSchema'
import { Plus, Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useActiveProgrammeCode } from '@/hooks/use-active-programme'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  codeLength: number
  typeNiveau: number
  isNew: boolean
}

function toRow(n: NiveauCadreStrategique): NiveauRow {
  return {
    id: n.id_nsc,
    libelle: n.libelle_nsc,
    codeLength: Number(n.code_number_nsc) || 2,
    typeNiveau: Number(n.type_niveau) || 1,
    isNew: false,
  }
}

function createEmptyRow(): NiveauRow {
  return { libelle: '', codeLength: 2, typeNiveau: 1, isNew: true }
}

function rowsFromNiveaux(niveaux: NiveauCadreStrategique[]): NiveauRow[] {
  return niveaux.length > 0 ? niveaux.map(toRow) : [createEmptyRow()]
}

function niveauxQueryKey(codeProgramme: string | undefined) {
  return [niveauCadreStrategiqueQueryKeys.all, codeProgramme] as const
}

function withoutDeletedIds(
  niveaux: NiveauCadreStrategique[],
  deletedIds: Set<number>
) {
  if (deletedIds.size === 0) return niveaux
  return niveaux.filter((n) => !deletedIds.has(n.id_nsc))
}

export default function NiveauCadreStrategiqueManager() {
  const queryClient = useQueryClient()
  const codeProgramme = useActiveProgrammeCode()
  const { data: niveaux = [], isLoading } = useGetNiveauxCadreStrategique()
  const createMutation = useCreateNiveauCadreStrategique()
  const updateMutation = useUpdateNiveauCadreStrategique()
  const deleteMutation = useDeleteNiveauCadreStrategique()

  const [rows, setRows] = useState<NiveauRow[]>([createEmptyRow()])
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const pendingDeletedIdsRef = useRef<Set<number>>(new Set())

  const applyNiveaux = useCallback((next: NiveauCadreStrategique[]) => {
    const pending = pendingDeletedIdsRef.current
    const filtered = withoutDeletedIds(next, pending)

    // Drop pending ids once the server no longer returns them.
    for (const id of [...pending]) {
      if (!next.some((n) => n.id_nsc === id)) pending.delete(id)
    }

    setRows(rowsFromNiveaux(filtered))
    setIsDirty(false)
  }, [])

  useEffect(() => {
    setIsDirty(false)
    pendingDeletedIdsRef.current.clear()
  }, [codeProgramme])

  // Keep local rows in sync with the query unless the user is editing.
  useEffect(() => {
    if (isLoading || isDirty) return
    applyNiveaux(niveaux)
  }, [isLoading, isDirty, niveaux, applyNiveaux])

  const removeNiveauFromCache = useCallback(
    (id: number) => {
      queryClient.setQueriesData<NiveauCadreStrategique[]>(
        { queryKey: niveauCadreStrategiqueQueryKeys.all },
        (old) => withoutDeletedIds(old ?? [], new Set([id]))
      )
    },
    [queryClient]
  )

  const refreshNiveaux = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: niveauxQueryKey(codeProgramme),
    })
    const fresh = await queryClient.fetchQuery({
      queryKey: niveauxQueryKey(codeProgramme),
      queryFn: () => niveauCadreStrategiqueService.getAll(codeProgramme),
    })
    applyNiveaux(fresh)
    return fresh
  }, [applyNiveaux, codeProgramme, queryClient])

  const markDirty = () => setIsDirty(true)

  const onAddRow = () => {
    markDirty()
    setRows((prev) => [...prev, createEmptyRow()])
  }

  const onSave = async () => {
    if (!codeProgramme) {
      toast.error('Sélectionnez un programme actif')
      return
    }

    const rowsToSave = rows.filter((row) => row.libelle.trim())
    if (rowsToSave.length === 0) {
      toast.error('Renseignez au moins un libellé de niveau')
      return
    }

    setIsSaving(true)
    try {
      let order = 0
      for (const row of rows) {
        if (!row.libelle.trim()) continue
        order += 1
        const data = {
          libelle_nsc: row.libelle.trim(),
          nombre_nsc: order,
          code_number_nsc: Number(row.codeLength) || 2,
          type_niveau: Number(row.typeNiveau) || 1,
          programme: codeProgramme,
        }

        if (row.isNew) {
          await createMutation.mutateAsync(data)
        } else if (row.id != null) {
          await updateMutation.mutateAsync({ id: row.id, data })
        }
      }

      await refreshNiveaux()
      toast.success('Niveaux sauvegardés avec succès')
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  const onRemoveRow = async (index: number) => {
    const row = rows[index]
    if (!row) return

    if (row.id != null) {
      if (!window.confirm('Supprimer ce niveau ?')) return
      const deletedId = row.id
      pendingDeletedIdsRef.current.add(deletedId)

      // Remove immediately so a stale refetch cannot bring it back.
      removeNiveauFromCache(deletedId)
      setRows((prev) => {
        const next = prev.filter((r) => r.id !== deletedId)
        return next.length > 0 ? next : [createEmptyRow()]
      })
      setIsDirty(false)

      try {
        await deleteMutation.mutateAsync(deletedId)
        removeNiveauFromCache(deletedId)
        await refreshNiveaux()
        toast.success('Niveau supprimé')
      } catch {
        pendingDeletedIdsRef.current.delete(deletedId)
        toast.error('Erreur lors de la suppression')
        await refreshNiveaux()
      }
      return
    }

    markDirty()
    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  if (!codeProgramme) {
    return (
      <p className='py-4 text-sm text-muted-foreground'>
        Sélectionnez un programme dans l&apos;en-tête pour configurer les
        niveaux.
      </p>
    )
  }

  if (isLoading && !isDirty && rows.every((r) => r.isNew && !r.libelle)) {
    return <div className='py-6 text-sm text-muted-foreground'>Chargement…</div>
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-sm text-muted-foreground'>
          Définissez les niveaux du cadre stratégique pour le programme actif.
        </p>
        <div className='flex flex-col gap-2 sm:flex-row'>
          <Button
            type='button'
            variant='outline'
            onClick={onAddRow}
            disabled={isSaving}
          >
            <Plus className='h-4 w-4' />
            Ajouter un niveau
          </Button>
          <Button
            type='button'
            onClick={onSave}
            disabled={isSaving || rows.every((r) => !r.libelle.trim())}
          >
            <Save className='h-4 w-4' />
            {isSaving ? 'Sauvegarde…' : 'Sauvegarder'}
          </Button>
        </div>
      </div>

      <div className='rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Libellé du niveau</TableHead>
              <TableHead className='w-36'>Taille du code</TableHead>
              <TableHead className='w-40'>Type de niveau</TableHead>
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
                    disabled={isSaving}
                    onChange={(e) => {
                      markDirty()
                      setRows((p) =>
                        p.map((r, i) =>
                          i === index ? { ...r, libelle: e.target.value } : r
                        )
                      )
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type='number'
                    min={1}
                    max={10}
                    value={row.codeLength}
                    disabled={isSaving}
                    onChange={(e) => {
                      markDirty()
                      setRows((p) =>
                        p.map((r, i) =>
                          i === index
                            ? { ...r, codeLength: Number(e.target.value) }
                            : r
                        )
                      )
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={String(row.typeNiveau)}
                    disabled={isSaving}
                    onValueChange={(v) => {
                      markDirty()
                      setRows((p) =>
                        p.map((r, i) =>
                          i === index ? { ...r, typeNiveau: Number(v) } : r
                        )
                      )
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {typeNiveauOptions.map((opt) => (
                        <SelectItem key={opt.value} value={String(opt.value)}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className='text-end'>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    disabled={isSaving || index !== rows.length - 1}
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
