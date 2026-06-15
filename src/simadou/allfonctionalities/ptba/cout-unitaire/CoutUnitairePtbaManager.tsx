import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getApiErrorMessage } from '@/lib/api-error-message'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { CoutUnitairePtba, Ptba } from '@/simadou/allTypes'
import {
  coutUnitairePtbaQueryKeys,
  useCreateCoutUnitairePtba,
  useDeleteCoutUnitairePtba,
  useGetCoutsUnitairesByActivite,
  useUpdateCoutUnitairePtba,
} from '@/simadou/allHooks/admin/coutUnitairePtbaHooks'
import { useMe } from '@/simadou/allHooks/auth/authHooks'
import {
  buildCoutUnitairePtbaPayload,
} from '@/simadou/lib/coutUnitairePtbaUtils'
import { resolveRelationId } from '@/simadou/lib/resolveApiRelation'
import { useGeneralParamsQuery } from '@/simadou/allHooks/generalParams/queries'
import { formatNumber } from '@/simadou/allSercices/montantFormater'

type CoutUnitaireRow = {
  id?: number
  prix_unitaire: number
  quantite_cu: number
  unite_cu: string
  intitule_tache: string
  ordre: number
  id_personnel: number
  isNew: boolean
}

function toRow(item: CoutUnitairePtba): CoutUnitaireRow {
  const personnelId =
    resolveRelationId(item.id_personnel, 'n_personnel') ??
    resolveRelationId(item.id_personnel, 'id_personnel') ??
    0

  return {
    id: item.id_cout_unitaire,
    prix_unitaire: item.prix_unitaire ?? 0,
    quantite_cu: item.quantite_cu ?? 0,
    unite_cu: item.unite_cu ?? '',
    intitule_tache: item.intitule_tache ?? '',
    ordre: Number(item.ordre) || 0,
    id_personnel: personnelId,
    isNew: false,
  }
}

function createEmptyRow(defaultPersonnelId?: number): CoutUnitaireRow {
  return {
    prix_unitaire: 0,
    quantite_cu: 0,
    unite_cu: '',
    intitule_tache: '',
    ordre: 0,
    id_personnel: defaultPersonnelId ?? 0,
    isNew: true,
  }
}

function rowHasData(row: CoutUnitaireRow): boolean {
  return (
    !!row.intitule_tache.trim() ||
    !!row.prix_unitaire ||
    !!row.quantite_cu ||
    !!row.unite_cu.trim()
  )
}

function syncRowsFromItems(
  items: CoutUnitairePtba[],
  defaultPersonnelId?: number
): CoutUnitaireRow[] {
  return items.length === 0
    ? []
    : [...items.map(toRow), createEmptyRow(defaultPersonnelId)]
}

type CoutUnitairePtbaManagerProps = {
  activite: Ptba
}

export default function CoutUnitairePtbaManager({
  activite,
}: CoutUnitairePtbaManagerProps) {
  const queryClient = useQueryClient()
  const idActivite = activite.id_ptba
  const { data: user } = useMe()
  const modifierPar = user?.n_personnel ?? 0

  const {
    data: coutsUnitaires = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetCoutsUnitairesByActivite(idActivite)
  const createMutation = useCreateCoutUnitairePtba(idActivite)
  const updateMutation = useUpdateCoutUnitairePtba(idActivite)
  const deleteMutation = useDeleteCoutUnitairePtba(idActivite)

  const [rows, setRows] = useState<CoutUnitaireRow[]>([])
  const [initialized, setInitialized] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  useEffect(() => {
    if (initialized || isLoading || isFetching) return
    setRows(syncRowsFromItems(coutsUnitaires, modifierPar))
    setInitialized(true)
  }, [initialized, isLoading, isFetching, coutsUnitaires, modifierPar])

  const refreshRows = async () => {
    await Promise.all([
      refetch(),
      queryClient.refetchQueries({
        queryKey: coutUnitairePtbaQueryKeys.byActivite(idActivite),
      }),
    ])
  }

  const updateRow = (index: number, patch: Partial<CoutUnitaireRow>) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row))
    )
  }

  const onAddRow = () => {
    setRows((prev) => [...prev, createEmptyRow(modifierPar)])
  }

  const onRemoveRow = async (index: number) => {
    const row = rows[index]
    if (!row) return

    if (row.id != null) {
      const ok = window.confirm('Supprimer ce coût unitaire ?')
      if (!ok) return
      try {
        await deleteMutation.mutateAsync(row.id)
        setInitialized(false)
        await refreshRows()
        toast.success('Coût unitaire supprimé')
      } catch (error) {
        toast.error(
          getApiErrorMessage(error, 'Erreur lors de la suppression')
        )
      }
      return
    }

    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  const { data: config } = useGeneralParamsQuery()
  const currencyCode = config?.currencyCode

  const onSave = async () => {
    const rowsToSave = rows.filter(rowHasData)
    if (rowsToSave.length === 0) {
      toast.error('Renseignez au moins une ligne de coût unitaire')
      return
    }

    for (const row of rowsToSave) {
      if (!row.intitule_tache.trim()) {
        toast.error("L'intitulé de la tâche est requis sur chaque ligne")
        return
      }
      if (!row.prix_unitaire) {
        toast.error('Le prix unitaire est requis sur chaque ligne')
        return
      }
      if (!row.quantite_cu) {
        toast.error('La quantité est requise sur chaque ligne')
        return
      }
      if (!row.unite_cu.trim()) {
        toast.error("L'unité est requise sur chaque ligne")
        return
      }
      if (!row.id_personnel) {
        toast.error('Le personnel est requis sur chaque ligne')
        return
      }
    }

    if (!modifierPar) {
      toast.error('Utilisateur non identifié')
      return
    }

    setIsSaving(true)
    try {
      for (const row of rowsToSave) {
        const payload = buildCoutUnitairePtbaPayload(
          {
            prix_unitaire: row.prix_unitaire || 0,
            quantite_cu: row.quantite_cu || 0,
            unite_cu: row.unite_cu,
            intitule_tache: row.intitule_tache,
            ordre: row.ordre,
            id_personnel: user?.n_personnel || 0,
          },
          idActivite,
          modifierPar
        )

        if (row.isNew) {
          await createMutation.mutateAsync(payload)
        } else if (row.id != null) {
          await updateMutation.mutateAsync({ id: row.id, data: payload })
        }
      }
      toast.success('Coûts unitaires enregistrés')
      setInitialized(false)
      await refreshRows()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Erreur lors de la sauvegarde'))
    } finally {
      setIsSaving(false)
    }
  }

  const calculerCoutTotal = (rows: any[]): number => {
    return rows.reduce((total, row) => {
      const qte = parseInt(row.quantite_cu) || 0
      const prix = parseInt(row.prix_unitaire) || 0
      return total + (qte * prix)
    }, 0)
  }

  if ((isLoading || isFetching) && !initialized) {
    return (
      <div className='py-6 text-sm text-muted-foreground'>Chargement…</div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* En-tête avec boutons */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <p className='text-sm text-muted-foreground'>
            Saisissez les coûts unitaires directement dans le tableau.
          </p>
          <p className='text-xs text-muted-foreground mt-1'>
            Les prix unitaires sont exprimés en Francs Guinéens ({currencyCode})
          </p>
        </div>
        <div className='flex flex-col gap-2 sm:flex-row'>
          <Button type='button' variant='outline' onClick={onAddRow} disabled={isSaving}>
            <Plus className='h-4 w-4' />
            Ajouter une ligne
          </Button>
          <Button type='button' onClick={onSave} disabled={isSaving}>
            <Save className='h-4 w-4' />
            {isSaving ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      {/* Tableau des lignes */}
      <div className='overflow-x-auto rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/30'>
              <TableHead className='w-20'>Ordre</TableHead>
              <TableHead className='min-w-48'>Intitulé tâche</TableHead>
              <TableHead className='min-w-24'>Unité</TableHead>
              <TableHead className='min-w-28'>Quantité</TableHead>
              <TableHead className='min-w-28'>Prix unitaire (GNF)</TableHead>
              <TableHead className='min-w-28'>Montant (GNF)</TableHead>
              <TableHead className='w-16 text-end'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => {
              const qte = row.quantite_cu || 0
              const prix = row.prix_unitaire  || 0
              const ligneTotal = qte * prix

              return (
                <TableRow key={row.id ?? `new-${index}`} className='group'>
                  <TableCell className='align-top'>
                    <Input
                      type='number'
                      value={row.ordre}
                      onChange={(e) =>
                        updateRow(index, {
                          ordre: Number(e.target.value) || 0,
                        })
                      }
                      className='h-9 w-20'
                    />
                  </TableCell>
                  <TableCell className='align-top'>
                    <Input
                      placeholder='Intitulé'
                      value={row.intitule_tache}
                      onChange={(e) =>
                        updateRow(index, { intitule_tache: e.target.value })
                      }
                      className='h-9'
                    />
                  </TableCell>
                  <TableCell className='align-top'>
                    <Input
                      placeholder='Unité'
                      value={row.unite_cu}
                      onChange={(e) =>
                        updateRow(index, { unite_cu: e.target.value })
                      }
                      className='h-9'
                    />
                  </TableCell>
                  <TableCell className='align-top'>
                    <Input
                      type='number'
                      placeholder='0'
                      value={Number(row.quantite_cu)}
                      onChange={(e) => {
                        const value = parseInt(e.target.value)
                        updateRow(index, { quantite_cu: value })
                      }}
                      className='h-9'
                    />
                  </TableCell>
                  <TableCell className='align-top'>
                    <Input
                      type='number'
                      placeholder='0'
                      value={Number(row.prix_unitaire)}
                      onChange={(e) => {
                        const value = parseInt(e.target.value)
                        updateRow(index, { prix_unitaire: value })
                      }}
                      className='h-9'
                    />
                  </TableCell>
                  <TableCell className='text-right align-middle'>
                    {ligneTotal > 0 && (
                      <span className='text-sm font-medium text-emerald-600 dark:text-emerald-400'>
                        {formatNumber(ligneTotal)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className='text-end align-top'>
                    <div className='flex items-center justify-end gap-1'>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        disabled={isSaving}
                        onClick={() => onRemoveRow(index)}
                        title='Supprimer la ligne'
                        className='h-8 w-8 text-muted-foreground hover:text-red-500'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
          {rows.length > 0 && (
            <TableFooter>
              <TableRow className='border-t border-border/60 bg-gradient-to-r from-muted/30 via-muted/10 to-muted/30'>
                <TableCell colSpan={3} className='py-3'>
                  <div className='flex items-center gap-2'>
                    <div className='h-1.5 w-1.5 rounded-full bg-primary' />
                    <span className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                      Récapitulatif
                    </span>
                  </div>
                </TableCell>
                <TableCell colSpan={1} className='py-3'>
                  <div className='text-center'>
                    <p className='text-[10px] uppercase text-muted-foreground'>Lignes</p>
                    <p className='text-sm font-semibold'>{rows.length}</p>
                  </div>
                </TableCell>
                <TableCell colSpan={3} className='py-3'>
                  <div className='flex items-center justify-end gap-3'>
                    <div className='text-right'>
                      <p className='text-[10px] uppercase text-muted-foreground'>Total général</p>
                      <p className='text-xl font-bold text-primary'>
                        {formatNumber(calculerCoutTotal(rows))} {currencyCode}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>
    </div>
  )
}