import { Badge } from '@/components/ui/badge'
import {
  DetailField,
  DetailFieldGrid,
  DetailHighlight,
  DetailSection,
  DetailViewError,
  DetailViewFooter,
  DetailViewHeader,
  DetailViewLoading,
} from '@/Global/Detail/DetailFields'
import { useGetIndicateurCmrProjet } from '@/simadou/allHooks/admin/indicateurCmrHooks'
import { resolveRelationCode } from '@/simadou/lib/resolveApiRelation'
import {
  resolveIndicateurIopLabel,
  resolveResultatCmrProjetLabel,
} from './indicateurCmrProjetFormUtils'

function resolveResultatFieldLabel(value: unknown): string {
  if (value != null && typeof value === 'object') {
    const niveau = (value as { niveau_cr?: unknown; niveau?: unknown }).niveau_cr
      ?? (value as { niveau?: { libelle_ncr?: string } }).niveau
    if (niveau && typeof niveau === 'object' && 'libelle_ncr' in niveau) {
      const libelle = (niveau as { libelle_ncr?: string }).libelle_ncr
      if (libelle) return libelle
    }
  }
  return 'Cadre de résultat'
}

function formatReferentiel(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'object') {
    const code = resolveRelationCode(value, 'code_ref_ind')
    const intitule =
      typeof (value as { intitule_ref_ind?: string }).intitule_ref_ind ===
      'string'
        ? (value as { intitule_ref_ind: string }).intitule_ref_ind
        : null
    if (code && intitule) return `${code} — ${intitule}`
    return intitule ?? code ?? ''
  }
  return String(value)
}

export default function IndicateurCmrProjetDetailView({
  indicateurId,
  onClose,
}: {
  indicateurId: number
  onClose: () => void
}) {
  const { data: indicateur, isLoading, isError } =
    useGetIndicateurCmrProjet(indicateurId)

  if (isLoading) return <DetailViewLoading />

  if (isError || !indicateur) {
    return <DetailViewError message='Indicateur non trouvé' />
  }

  return (
    <div className='space-y-5'>
      <DetailViewHeader
        title={indicateur.intitule_ref_ind}
        badge={
          <Badge variant='secondary' className='font-mono text-[11px]'>
            {indicateur.code_ref_ind}
          </Badge>
        }
      />

      {indicateur.resultat_cmr != null ? (
        <DetailHighlight
          label={resolveResultatFieldLabel(indicateur.resultat_cmr)}
        >
          {resolveResultatCmrProjetLabel(indicateur.resultat_cmr)}
        </DetailHighlight>
      ) : null}

      {indicateur.indicateur_iop != null ? (
        <DetailHighlight label='Indicateur'>
          {resolveIndicateurIopLabel(indicateur.indicateur_iop)}
        </DetailHighlight>
      ) : null}

      <DetailSection title='Informations générales'>
        <DetailFieldGrid>
          <DetailField label='Référence CMR' value={indicateur.reference_cmr} />
          <DetailField
            label='Année de référence'
            value={String(indicateur.annee_reference)}
          />
          <DetailField label='Cible CMR' value={indicateur.cible_cmr} />
          <DetailField
            label="Fonction d'agrégation"
            value={indicateur.fonction_agregat_cmr}
          />
          <DetailField
            label='Responsable de collecte'
            value={indicateur.responsable_collecte_cmr}
          />
          <DetailField
            label='Référentiel'
            value={formatReferentiel(indicateur.referentiel_cmr)}
          />
        </DetailFieldGrid>
      </DetailSection>

      <DetailViewFooter onClose={onClose} />
    </div>
  )
}
