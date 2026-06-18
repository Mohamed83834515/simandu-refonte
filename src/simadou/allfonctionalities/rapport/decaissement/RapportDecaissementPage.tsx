import { Wallet } from 'lucide-react'
import RapportPageLayout from '../RapportPageLayout'
import ListeRapportDecaissement from './ListeRapportDecaissement'

export default function RapportDecaissementPage() {
  return (
    <RapportPageLayout title='Rapport de décaissement' icon={Wallet}>
      <ListeRapportDecaissement />
    </RapportPageLayout>
  )
}
