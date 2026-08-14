export interface TauxGlobalPrevuAn {
  projet: number
  annee: number
  taux_an: number
}

export interface ViewTauxAnActivite {
  activite_pa: number
  projet: number
  annee: number
  taux_an_activite: number
}

export interface ViewRealiseAnActivite {
  activite_pa: number
  projet: number
  annee: number
  taux_an_activite: number
}

export interface ProjetAvancementAnnuelPoint {
  annee: number
  cible: number
  realise: number
}

export interface ProjetDecaissementAnnuelPoint {
  annee: number
  cible: number
  realise: number
}
