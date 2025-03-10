export default {
  error: 'Erreur',
  error_description: 'Merci de bien vouloir réessayer ultérieurement.',
  login: {
    invalidInput: 'Veuillez renseigner votre {{input}}.',
    errorMessage:
      "Votre compte n'a pas été retrouvé. Veuillez vérifier les informations et réessayer.",
    submit: 'Se connecter',
  },
  email: {
    label: 'Email',
    invalidMessage: 'Veuillez renseigner un email valide.',
  },
  password: 'Mot de passe',
  forgotPassword: 'Mot de passe oublié ?',
  type: {
    folder: 'Dossier de fichiers',
    file: 'Fichier',
  },
  modal: {
    close: 'Fermer',
    download: 'Télécharger',
    ok: 'Valider',
  },
  menu: {
    login: 'Se connecter',
    logout: 'Se déconnecter',
  },
  nodata: 'Pas de données',
  file: {
    upload: 'Téléverser fichier(s)',
    delete: 'Supprimer {{rows}} ligne',
  },
  folder: {
    new: 'Nouveau dossier',
  },
  new: 'Nouveau',
  form: {
    directoryName: 'Nom du dossier',
    invalidInput: 'Veuillez renseigner une valeur.',
    roles: 'Rôle(s)',
    users: 'Utilisateur(s)',
    operationName: "Nom de l'opération",
    name: 'Nom du module',
    code: 'Code du module',
    modules: 'Module(s)',
    pointerFieldName: 'Nom du champs',
    pointerFieldType: 'Type de champs',
    pointerFieldAllways: 'Toujours afficher lors du pointage',
    pointerFieldRequired: 'Champs obligatoire',
    limitDrive: 'Taille limite QR Drive (bits)',
    limitOperation: 'Nombre d\'opérations max',
    limitUser: 'Nombre d\'utilisateurs max',
    version: 'Version',
    content: 'Contenu',
    userOperations: 'Operation',
    canCreate: 'Droit de création',
    canEdit: 'Droit de modification',
    canDelete: 'Droit de suppression',
  },
  confirm: {
    title: 'Êtes-vous sûr?',
    ok: 'Oui',
    cancel: 'Non',
  },
  notification: {
    success: {
      title: 'Succès',
      fileImported: 'Le fichier {{file}} a été correctement téléversé.',
      directoryCreated: 'Le dossier {{directory}} a été créé avec succès.',
      fileUpdated: 'Le fichier {{file}} a été mis à jour avec succès',
      folderUpdated: 'Le dossier {{directory}} a été mis à jour avec succès',
      fileDeleted: 'Le fichier {{file}} a été supprimé avec succès.',
      folderDeleted: 'Le dossier {{directory}} a été supprimé avec succès.',
      userCreated: "L'utilisateur {{user}} a été créé avec succès.",
      userUpdated: "L'utilisateur {{user}} a été mis à jour avec succès.",
      userDeleted: "L'utilisateur {{user}} a été supprimé avec succès.",
      operationCreated: "L'opération {{operation}} a été créé avec succès.",
      operationUpdated:
        "L'opération {{operation}} a été mise à jour avec succès.",
      operationDeleted:
        "L'opération {{operation}} a été supprimée avec succès.",
      moduleDeleted: "Le module {{module}} a été supprimé avec succès.",
      moduleUpdated: "Le module {{module}} a été mis à jour avec succès.",
      moduleCreated: "Le module {{module}} a été créé avec succès.",
      updateDeleted: "La mise à jour {{update}} a été supprimé avec succès.",
      updateUpdated: "La mise à jour {{update}} a été mis à jour avec succès.",
      updateCreated: "La mise à jour {{update}} a été créé avec succès.",
      pointerFieldDeleted: 'Le champs {{field}} a été supprimé avec succès.',
      pointerFieldCreated: 'Le champs {{field}} a été créé avec succès.',
      pointerFieldUpdated: 'Le champs {{field}}  a été mis à jour avec succès.',
      folderAccessUpdated:
        'Les accès au dossier {{directory}} ont été mis à jour avec succès',
      fileAccessUpdated:
        'Les accès au fichier {{file}} ont été mis à jour avec succès',
        settingsUpdated: "Les paramètres ont bien été mis à jour avec succès",
    },
    error: {
      title: 'Erreur',
      unauthorized: "Vous n'êtes pas autorisé à effectuer cette action.",
      unknown: 'Une erreur est survenue, veuillez réessayer plus tard.',
    },
  },
  society: 'Société',
  home: 'Accueil',
  name: 'Nom',
  start: 'Début',
  end: 'Fin',
  createdAt: 'Créé le',
  updatedAt: 'Mis à jour le',
  user: {
    roles: 'Rôles',
    new: 'Nouvel utilisateur',
  },
  operation: {
    new: 'Nouvelle opération',
  },
  module: {
    new: 'Nouveau module',
  },
  field: {
    new: 'Nouveau champs',
  },
  welcome: 'Bienvenue sur Kiken.',
  appDescriptionConnected: 'Veuillez scanner un QR code pour continuer.',
  appDescriptionDisconnected:
    'Veuillez scanner un QR code ou vous connectez pour continuer.',
  admin: {
    usersTab: 'Utilisateurs',
    clientsTab: 'Clients',
    pointerFieldTabs: 'Champs',
    modulesTab: 'Modules',
    updateTab: 'Mises à jour',
    operationsTab: 'Opérations',
    pointersTab: 'Liste',
  },
  pointer: {
    form: {
      submit: 'S\'inscrire',
      firstname: 'Prénom',
      lastname: 'Nom',
      SST: 'SST'
    },
    error: {
      email: 'Email déjà utilisé.'
    }
  },
  errors: {
    accessDenied: "Vous n'avez pas accès à ce dossier",
    unauthenticated: "Vous devez vous connecter pour accéder à cette page.",
  },
};
