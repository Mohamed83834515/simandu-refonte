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
import { useGetIndicateurCmr } from '@/simadou/allHooks/admin/indicateurCmrHooks'
import { resolveResultatCmrLabel } from '@/simadou/allfonctionalities/politique/indicateurs-cmr/indicateurCmrFormUtils'
import { resolveRelationCode } from '@/simadou/lib/resolveApiRelation'

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

export default function IndicateurCmrDetailView({
  indicateurId,
  onClose,
}: {
  indicateurId: number
  onClose: () => void
}) {
  const { data: indicateur, isLoading, isError } = useGetIndicateurCmr(indicateurId)

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
        <DetailHighlight label='Résultat CMR'>
          {resolveResultatCmrLabel(indicateur.resultat_cmr)}
        </DetailHighlight>
      ) : null}

      <DetailSection title='Informations générales'>
        <DetailFieldGrid>
          <DetailField label='Référence CMR' value={indicateur.reference_cmr} />
          <DetailField
            label='Année de référence'
            value={indicateur.annee_reference}
          />
          <DetailField
            label='Référentiel'
            value={formatReferentiel(indicateur.referentiel_cmr)}
            className='sm:col-span-2'
          />
        </DetailFieldGrid>
      </DetailSection>

      <DetailSection title='Collecte & agrégation'>
        <DetailFieldGrid>
          <DetailField
            label='Responsable collecte'
            value={indicateur.responsable_collecte_cmr}
          />
          <DetailField label='Cible CMR' value={indicateur.cible_cmr} />
          <DetailField
            label="Fonction d'agrégation"
            value={indicateur.fonction_agregat_cmr || 'Non définie'}
            className='sm:col-span-2'
          />
        </DetailFieldGrid>
      </DetailSection>

      <DetailSection title='Informations système'>
        <DetailFieldGrid className='sm:grid-cols-3'>
          <DetailField
            label='ID'
            value={indicateur.id_ref_ind_cmr}
            mono
          />
          {indicateur.created_at ? (
            <DetailField
              label='Créé le'
              value={new Date(indicateur.created_at).toLocaleDateString('fr-FR')}
            />
          ) : null}
          {indicateur.updated_at ? (
            <DetailField
              label='Modifié le'
              value={new Date(indicateur.updated_at).toLocaleDateString('fr-FR')}
            />
          ) : null}
        </DetailFieldGrid>
      </DetailSection>

      <DetailViewFooter onClose={onClose} />
    </div>
  )
}
