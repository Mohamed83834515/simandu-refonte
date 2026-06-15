import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, Save, Trash2 } from 'lucide-react'
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
import {
  useActiveProgrammeCode,
  useActiveProgrammeId,
} from '@/hooks/use-active-programme'
import type { NiveauCadreAnalytique } from '@/simadou/allTypes/cadreAnalytique'
import {
  niveauCadreAnalytiqueQueryKeys,
  useCreateNiveauCadreAnalytique,
  useDeleteNiveauCadreAnalytique,
  useGetNiveauxCadreAnalytique,
  useUpdateNiveauCadreAnalytique,
} from '@/simadou/allHooks/admin/cadreAnalytiqueHooks'
import { niveauCadreAnalytiqueService } from '@/simadou/allSercices/niveauCadreAnalytiqueService'
import {
  filterNiveauxByProgramme,
  sortNiveauxCadreAnalytique,
} from '@/simadou/lib/cadreAnalytiqueUtils'

type NiveauRow = {
  id?: number
  libelle: string
  codeLength: number
  isNew: boolean
}

function toRow(n: NiveauCadreAnalytique): NiveauRow {
  return {
    id: n.id_nca,
    libelle: n.libelle_nca,
    codeLength: Number(n.nombre_nca) || 2,
    isNew: false,
  }
}

function createEmptyRow(): NiveauRow {
  return { libelle: '', codeLength: 2, isNew: true }
}

function rowsFromNiveaux(niveaux: NiveauCadreAnalytique[]): NiveauRow[] {
  return niveaux.length > 0 ? niveaux.map(toRow) : [createEmptyRow()]
}

export default function NiveauCadreAnalytiqueManager() {
  const queryClient = useQueryClient()
  const codeProgramme = useActiveProgrammeCode()
  const programmeId = useActiveProgrammeId()
  const { data: niveaux = [], isLoading } = useGetNiveauxCadreAnalytique()
  const createMutation = useCreateNiveauCadreAnalytique()
  const updateMutation = useUpdateNiveauCadreAnalytique()
  const deleteMutation = useDeleteNiveauCadreAnalytique()

  const niveauxProgramme = useMemo(
    () =>
      sortNiveauxCadreAnalytique(
        filterNiveauxByProgramme(niveaux, codeProgramme, programmeId)
      ),
    [niveaux, codeProgramme, programmeId]
  )

  const [rows, setRows] = useState<NiveauRow[]>([createEmptyRow()])
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const skipSyncRef = useRef(false)

  const syncRowsFromQuery = useCallback(() => {
    setRows(rowsFromNiveaux(niveauxProgramme))
    setIsDirty(false)
  }, [niveauxProgramme])

  useEffect(() => {
    setIsDirty(false)
    skipSyncRef.current = false
  }, [codeProgramme])

  useEffect(() => {
    if (isLoading || isDirty) return
    if (skipSyncRef.current) {
      skipSyncRef.current = false
      return
    }
    syncRowsFromQuery()
  }, [isLoading, isDirty, syncRowsFromQuery])

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
          libelle_nca: row.libelle.trim(),
          code_number_nca: order,
          nombre_nca: Number(row.codeLength) || 2,
          programme: codeProgramme,
        }

        if (row.isNew) {
          await createMutation.mutateAsync(data)
        } else if (row.id != null) {
          await updateMutation.mutateAsync({ id: row.id, data })
        }
      }

      const fresh = await queryClient.fetchQuery({
        queryKey: niveauCadreAnalytiqueQueryKeys.all,
        queryFn: () => niveauCadreAnalytiqueService.getAll(),
      })
      const synced = sortNiveauxCadreAnalytique(
        filterNiveauxByProgramme(fresh, codeProgramme, programmeId)
      )
      skipSyncRef.current = true
      setRows(rowsFromNiveaux(synced))
      setIsDirty(false)
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
      try {
        await deleteMutation.mutateAsync(row.id)
        const fresh = await queryClient.fetchQuery({
          queryKey: niveauCadreAnalytiqueQueryKeys.all,
          queryFn: () => niveauCadreAnalytiqueService.getAll(),
        })
        const synced = sortNiveauxCadreAnalytique(
          filterNiveauxByProgramme(fresh, codeProgramme, programmeId)
        )
        skipSyncRef.current = true
        setRows(rowsFromNiveaux(synced))
        setIsDirty(false)
        toast.success('Niveau supprimé')
      } catch {
        toast.error('Erreur lors de la suppression')
      }
      return
    }

    markDirty()
    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  if (!codeProgramme) {
    return (
      <p className='py-4 text-sm text-muted-foreground'>
        Sélectionnez un programme dans l&apos;en-tête pour configurer les niveaux.
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
          Définissez les niveaux du cadre analytique pour le programme actif.
        </p>
        <div className='flex flex-col gap-2 sm:flex-row'>
          <Button type='button' variant='outline' onClick={onAddRow} disabled={isSaving}>
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
              <TableHead className='w-20 text-end'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.id ?? `new-${index}`}>
                <TableCell>
                  <Input
                    value={row.libelle}
                    placeholder='Ex: Objectif analytique'
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
