// ==========staff/personnel "Exemple de initialisation"==================
export const STAFF = {
  nom: "",
  prenom: "",
  email: "",
  password: "",
  adresse: "",
  phone: "",
  roleId: undefined,
};

// ==========CATEGORIE_ACTEUR==================
export const CATEGORIE_ACTEUR = {
  nom_categorie: "",
  code_cat: "",
};

// =========ACTEUR==================
export const ACTEUR = {
  code_acteur: "",
  nom_acteur: "",
  description_acteur: "",
  personne_responsable: "",
  contact: "",
  adresse_email: "",
  categorie_acteur: null,
};

// =========PROGRAMME==================
export const PROGRAMME = {
  code_programme: "",
  sigle_programme: "",
  nom_programme: "",
  vision_programme: "",
  objectif_programme: "",
  annee_debut_programme: "",
  annee_fin_programme: "",
  actif_programme: true,
};

// =========ACTIVITE_PROGRAMME==================
export const ACTIVITE_PROGRAMME = {
  code_ap: "",
  intutile: "",
  niveau_ap: "",
  code_relai_ap: "",
  parent_ap: null,
  id_programme: null,
};

// =========ACTIVITE_PROJET==================
export const ACTIVITE_PROJET = {
  code_activite_projet: "",
  intitule_activite_projet: "",
  niveau_activite_projet: "",
  parent_activite_projet: null,
  code_activite_programme: null,
  code_projet: null,
};

// =========CADRE_ANALYTIQUE==================
export const CADRE_ANALYTIQUE = {
  code_ca: "",
  intutile_ca: "",
  abgrege_ca: "",
  niveau_ca: "",
  cout_axe: "",
  partenaire_ca: [],
  parent_ca: null,
  programme_ca: null,
};

// =========NIVEAU_CADRE_ANALYTIQUE==================
export const NIVEAU_CADRE_ANALYTIQUE = {
  nombre_nca: "",
  libelle_nca: "",
  code_number_nca: "",
  programme: null,
};

// =========CADRE_RESULTAT==================
export const CADRE_RESULTAT = {
  code_cr: "",
  intutile_cr: "",
  abgrege_cr: "",
  cout_axe: "",
  etat: null,
  niveau_cr: null,
  partenaire_cr: null,
  parent_cr: null,
  projet_cr: null,
};

// =========CADRE_STRATEGIQUE==================
export const CADRE_STRATEGIQUE = {
  code_cs: "",
  intutile_cs: "",
  abgrege_cs: "",
  niveau_cs: "",
  etat: null,
  partenaire_cs: [],
  parent_cs: null,
  programme_cs: null,
};

// =========CADRE_STRATEGIQUE_CONFIG==================
export const CADRE_STRATEGIQUE_CONFIG = {
  nombre: "",
  libelle_nsc: "",
  type_nsc: "",
  etat: null,
  programme: null,
};

// =========CIBLE_CMR_PROJET==================
export const CIBLE_CMR_PROJET = {
  annee: "",
  valeur_cible_indcateur_crp: "",
  code_indicateur_crp: null,
  code_ug: null,
  code_projet: null,
};

// =========FONCTION==================
export const FONCTION = {
  nom_fonction: "",
  description_fonction: "",
};

// =========INDICATEUR_CADRE_RESULTAT==================
export const INDICATEUR_CADRE_RESULTAT = {
  niveau_iop: "",
  code_indicateur_cr_iop: "",
  code_cr_iop: "",
  intitule_indicateur_cr_iop: "",
  periodicite_iop: "",
  source_iop: "",
  responsable_iop: "",
  description_iop: "",
  structure_iop: "",
  projet_iop: null,
};

// =========UNITE_INDICATEUR==================
export const UNITE_INDICATEUR = {
  unite_ui: "",
  definition_ui: "",
};

// =========INDICATEUR_CMR==================
export const INDICATEUR_CMR = {
  code_ref_ind: "",
  resultat_cmr: null,
  intitule_ref_ind: "",
  reference_cmr: "",
  annee_reference: "",
  responsable_collecte_cmr: "",
  cible_cmr: "",
  fonction_agregat_cmr: "",
  referentiel_cmr: null,
};

// =========NIVEAU_LOCALITE==================
export const NIVEAU_LOCALITE = {
  nombre_nlc: "",
  libelle_nlc: "",
  Code_number_nlc: "",
};

// =========LOCALITE==================
export const LOCALITE = {
  code_loca: "",
  intitule_loca: "",
  code_national_loca: "",
  parent_loca: null,
  niveau_loca: null,
};

// =========PLAN_SITE==================
export const PLAN_SITE = {
  code_ds: "",
  intutile_ds: "",
  niveau_ds: "",
  parent_ds: null,
  code_relai_ds: "",
};

// =========PTBA==================
export const PTBA = {
  localites_ptba: [],
  partenaire_conserne_ptba: [],
  code_activite_ptba: "",
  intitule_activite_ptba: "",
  chronogramme: "",
  observation: "",
  statut_activite: "",
  code_crp: null,
  cadre_analytique: null,
  responsable_ptba: null,
  direction_ptba: null,
  code_programme: null,
  version_ptba: "",
  type_activite: null,
};

// =========INDICATEUR_ACTIVITE_PTBA==================
export const INDICATEUR_ACTIVITE_PTBA = {
  code_indicateur_activite: "",
  intitule_indicateur_tache: "",
  activite_ptba: null,
  code_indicateur_performance: null,
  abrege_unite: null,
};

// =========INDICATEUR_PERFORMANCE_PROJET==================
export const INDICATEUR_PERFORMANCE_PROJET = {
  code_indicateur_performance: "",
  intitule_indicateur_tache: "",
  code_activite_projet: null,
  unite_indicateur_performance: null,
  code_projet: null,
};

// =========INDICATEUR_STRATEGIQUE==================
export const INDICATEUR_STRATEGIQUE = {
  niveau_istr: "",
  code_indicateur_istr: "",
  code_istr: "",
  intitule_indicateur_istr: "",
  periodicite_iop: "",
  source_istr: "",
  responsable_istr: "",
  description_istr: "",
  structure_istr: "",
  programme_istr: null,
};

// =========INDICATEUR_TACHE==================
export const INDICATEUR_TACHE = {
  tache: null,
  intitule_indicateur_tache: "",
  Responsable_ind_tache: "",
  unite_ind_tache: "",
  code_indicateur_ptba: "",
  indicateur_cmr: null,
  id_activite: null,
};

// =========Change password======

export const CHANGE_PASSWORD = {
  oldPassword : "",
  newPassword : "",
  confirmNewPassword : ""
}

// =========NBC==================
export const NBC = {
  code_number_nbc: "",
  nombre_nbc: "",
  libelle_nbc: "",
};

// =========NIVEAU_ACTION==================
export const NIVEAU_ACTION = {
  libelle_niveau_ap: "",
  taille_code_niveau_ap: "",
  code_programme: null,
};

// =========NIVEAU_ACTIVITE_PROGRAMME==================
export const NIVEAU_ACTIVITE_PROGRAMME = {
  nombre_niveau_ap: "",
  taille_code_niveau_ap: "",
  code_programme: null,
  libelle_niveau_ap: "",
};

// =========NIVEAU_ACTIVITE_PROJET==================
export const NIVEAU_ACTIVITE_PROJET = {
  nombre_niveau_activite_projet: "",
  libelle_niveau_activite_projet: "",
  taille_code_niveau_activite_projet: "",
  code_projet: null,
};

// =========NIVEAU_CADRE_RESULTAT==================
export const NIVEAU_CADRE_RESULTAT = {
  nombre_ncr: "",
  libelle_ncr: "",
  code_number_ncr: "",
  type_niveau: "",
};

// =========NIVEAU_CADRE_STRATEGIQUE==================
export const NIVEAU_CADRE_STRATEGIQUE = {
  nombre_nsc: "",
  libelle_nsc: "",
  code_number_nsc: "",
  type_niveau: "",
  programme: null,
};

// =========NIVEAU_STRUCTURE==================
export const NIVEAU_STRUCTURE = {
  nombre_nsc: "",
  libelle_nsc: "",
  code_number_nsc: "",
  id_programme: null,
};

// =========niveaux_structure_config==================
export const niveaux_structure_config = {
  nombre_nsc: "",
  libelle_nsc: "",
  code_number_nsc: "",
  id_programme: null,
};

// =========OBSERVATION_PTBA==================
export const OBSERVATION_PTBA = {
  observation: "",
  date_observation: "",
  ptba: null,
};

// =========TITRE_PERSONNEL==================
export const TITRE_PERSONNEL = {
  libelle_titre: "",
  description_titre: "",
};

// =========PERSONNEL==================
export const PERSONNEL = {
  is_admin: false,
  is_password_set: false,
  id_personnel_perso: "",
  titre_personnel: null,
  nom_perso: "",
  prenom_perso: "",
  email: "",
  contact_perso: "",
  fonction_perso: null,
  service_perso: null,
  niveau_perso: "",
  rapport_mensuel_perso: false,
  rapport_trimestriel_perso: false,
  rapport_semestriel_perso: false,
  rapport_annuel_perso: false,
  statut: null,
  region_perso: null,
  structure_perso: null,
  ugl_perso: null,
  pass: "",
};

// =========PROJET==================
export const PROJET = {
  code_projet: "",
  sigle_projet: "",
  intitule_projet: "",
  duree_projet: "",
  date_signature_projet: "",
  date_demarrage_projet: "",
  partenaire_projet: null,
  programme_projet: null,
  structure_projet: 0,
  signataires_projet: [],
  partenaires_execution_projet: [],
  zone_projet: [],
};

export const PROJET_CREATE_STEP1 = {
  code_projet: "",
  sigle_projet: "",
  intitule_projet: "",
  duree_projet: 0,
  date_signature_projet: "",
  date_demarrage_projet: "",
};

export const PROJET_CREATE_STEP2 = {
  partenaire_projet: 0,
  structure_projet: 0,
  signataires_projet: [] as number[],
  partenaires_execution_projet: [] as number[],
  zone_projet: [] as number[],
};

export const PROJET_CREATE = {
  ...PROJET_CREATE_STEP1,
  ...PROJET_CREATE_STEP2,
};

// =========PROJET_ACTIVE_PERSO==================
export const PROJET_ACTIVE_PERSO = {
  id_projet: null,
  code_projet: "",
  sigle_projet: "",
  intitule_projet: "",
  duree_projet: "",
  date_signature_projet: "",
  date_demarrage_projet: "",
  partenaire_projet: null,
  programme_projet: null,
  structure_projet: 0,
  signataires_projet: [],
  partenaires_execution_projet: [],
  zone_projet: [],
};

// =========SUIVI_AVANCEMENT_CONTRAT==================
export const SUIVI_AVANCEMENT_CONTRAT = {
  date_suivi: "",
  code_suivi: "",
  etat_avancement: "",
  statut_activite: "",
  retard_accuse: "",
  difficultes_rencontrees: "",
  pistes_solutions: "",
  observation: "",
  documents: null,
  etat: "",
  activite_ptba: null,
  sous_activite: null,
  id_personnel: null,
};

// =========SUIVI_INDICATEUR_ACTIVITE==================
export const SUIVI_INDICATEUR_ACTIVITE = {
  date_suivi_indicateur: "",
  valeur_suivi_indicateur: "",
  indicateur_activite: null,
  localite: null,
};

// =========SUIVI_TACHE_ACTIVITE==================
export const SUIVI_TACHE_ACTIVITE = {
  proportion_realisee: "",
  valide: false,
  date_reele: "",
  observation_suivi: "",
  id_groupe_tache: null,
  id_activite_ptba: null,
};

// =========TACHE_ACTIVITE_PTBA==================
export const TACHE_ACTIVITE_PTBA = {
  intutile_tache_gt: "",
  proportion_gt: "",
  code_tache_gt: "",
  date_debut_gt: "",
  date_fin_gt: "",
  date_reelle_gt: "",
  n_lot_gt: "",
  valider_gt: "",
  observation_gt: "",
  livrable_gt: "",
  id_personnel_gt: null,
  responsable_gt: null,
  id_activite: null,
};

// =========TYPE_ACTIVITE==================
export const TYPE_ACTIVITE = {
  code_type: "",
  intutile_type: "",
  description: "",
};

// =========TYPE_ZONE==================
export const TYPE_ZONE = {
  code_type_zone: "",
  nom_type_zone: "",
};

// =========UGL==================
export const UGL = {
  code_ugl: "",
  nom_ugl: "",
  abrege_ugl: "",
  couleur_ugl: "",
  chef_lieu_ugl: null,
  region_concerne_ugl: [],
};

// =========VERSION_PTBA==================
export const VERSION_PTBA = {
  annee_ptba: "",
  version_ptba: "",
  date_validation: "",
  observation: "",
  documentUrl: null,
  statut_version: null,
  etat: "",
  programme: null,
  id_personnel: null,
};

// =========ZONE_COLLECTE==================
export const ZONE_COLLECTE = {
  code_zone: "",
  nom_zone: "",
  type_zone: "",
};

// ======SET_PASSWORD=====
export const SET_PASSWORD = {
  new_password : "",
  confirm_new_password : ""
}


// =========GENERAL_PARAMS_IDENTITE==================
export const GENERAL_PARAMS_IDENTITE = {
  systemSigle:      '',
  systemTitle:      '',
  structureSigle:   '',
  structureName:    '',
  structureAddress: '',
}



// =========GENERAL_PARAMS_FINANCE==================
export const GENERAL_PARAMS_FINANCE = {
  currencyCode: '',
  baseCurrency: '',
  exchangeRate: 0,
}

// =========GENERAL_PARAMS_SECURITE==================
export const GENERAL_PARAMS_SECURITE = {
  maintenanceMode:            false,
  inactivityDelayMinutes:     0,
  maxSessions:                0,
  loginAttemptsLimit:         0,
  tpCodeDelayMinutes:         0,
  passwordChangeDelayMonths:  0,
  deleteOrUpdateDelaySeconds: 0,
}





// GENERAL_PARAMS_NOTIFICATIONS
export const GENERAL_PARAMS_NOTIFICATIONS = {
  whatsappInstanceCode:      '',
  whatsappNumberId:          '',
  notificationEmail:         '',
  notificationEmailPassword: '',
  smtpHost:                  '',
  smtpPort:                  587,
  smtpEncryption:            '',
  smtpFromName:              '',
}

// GENERAL_PARAMS_INTEGRATIONS
export const GENERAL_PARAMS_INTEGRATIONS = {
  parentApiUrl:            '',
  parentApiKey:            '',
  parentApiSecret:         '',
  parentApiTimeoutSeconds: 30,
  whatsappApiKey:          '',
}

// GENERAL_PARAMS_CONTACTS — trimmed to match API
export const GENERAL_PARAMS_CONTACTS = {
  structureEmail:    '',
  structurePhone:    '',
  structureWhatsapp: '',
}