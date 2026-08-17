import { useCallback, useMemo, useState } from 'react'
import { GenericTable } from '@/Global/Generic/Generictable'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import { useGetModesPassation } from '@/simadou/allHooks/admin/modePassationHooks'
import { useGetNaturesMarche } from '@/simadou/allHooks/admin/natureMarcheHooks'
import { useGetPpms } from '@/simadou/allHooks/admin/ppmHooks'
import { useGetTypeFinancementPPM } from '@/simadou/allHooks/admin/typeFinancementPPM'
import { usePpmVersionContext } from './PpmVersionContext'
import { PtbaVersionSelect } from '@/simadou/allfonctionalities/ptba/PtbaVersionSelect'
import { resolveRelationId } from '@/simadou/lib/resolveApiRelation'
import type { Ppm } from '@/simadou/allTypes/ppm'
import { buildSuiviPpmColumns } from '@/simadou/allColonnes/suivi-ppm-columns'
import SuiviEtapesPassationDialog from '../suivi-etapes/SuiviEtapesPassationDialog'

export default function ListeSuiviPpm() {
  const { search, navigate } = useEmbeddedTableState()
  const [etapesPpm, setEtapesPpm] = useState<Ppm | null>(null)
  const [showEtapesDialog, setShowEtapesDialog] = useState(false)

  const { selectedVersionId, handleChangeVersion, versionOptions } =
    usePpmVersionContext()

  const { data: allPpms = [], isLoading } = useGetPpms()
  const { data: modes = [] } = useGetModesPassation()
  const { data: typesFinancement = [] } = useGetTypeFinancementPPM()
  const { data: natures = [] } = useGetNaturesMarche()

  const ppms = useMemo(() => {
    if (!selectedVersionId) return allPpms

    const versionId = Number(selectedVersionId)
    if (!Number.isFinite(versionId)) return allPpms

    return allPpms.filter(
      (ppm) =>
        resolveRelationId(ppm.version_ppm, 'id_version_ppm') === versionId
    )
  }, [allPpms, selectedVersionId])

  const onOpenSuiviEtapes = useCallback((ppm: Ppm) => {
    setEtapesPpm(ppm)
    setShowEtapesDialog(true)
  }, [])

  const lookups = useMemo(
    () => ({
      modesById: new Map(modes.map((m) => [m.id_mode_passation, m])),
      typesFinancementById: new Map(
        typesFinancement.map((t) => [t.id_type_financement_ppm, t])
      ),
      naturesById: new Map(natures.map((n) => [n.id_nature_marche, n])),
    }),
    [modes, typesFinancement, natures]
  )

  const columns = useMemo(
    () => buildSuiviPpmColumns(lookups, onOpenSuiviEtapes),
    [lookups, onOpenSuiviEtapes]
  )

  return (
    <div className='space-y-2'>
      <GenericTable
        data={ppms}
        columns={columns}
        search={search}
        navigate={navigate}
        isLoading={isLoading}
        searchKey='intitule_ppm'
        searchPlaceholder='Filtrer les marchés...'
        defaultPageSize={10}
        showViewOptions={false}
        emptyMessage='Aucun PPM trouvé pour cette version.'
        toolbarEndSlot={
          <PtbaVersionSelect
            options={versionOptions}
            value={selectedVersionId}
            onChange={handleChangeVersion}
          />
        }
      />
      <SuiviEtapesPassationDialog
        ppm={etapesPpm}
        open={showEtapesDialog}
        onOpenChange={(isOpen) => {
          setShowEtapesDialog(isOpen)
          if (!isOpen) setEtapesPpm(null)
        }}
      />
    </div>
  )
}