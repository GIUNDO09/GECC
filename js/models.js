/* 
========================================
MODELES DE DONNEES GECC
========================================
Role : Definition des modeles de donnees
- Enums et constantes
- Constructeurs de classes
- Methodes utilitaires
- Validation des donnees
========================================
*/

/* ========================================
   ENUMS ET CONSTANTES
   ======================================== */

// Roles utilisateur - Défini dans store.js
// const ROLES = {
//     ARCHITECT: "architect",
//     BCT: "bct",
//     BET: "bet",
//     CONTRACTOR: "contractor",
//     ADMIN: "admin"
// };

// Statuts de projet - Défini dans store.js
// const PROJECT_STATUS = {
//     DRAFT: "draft",
//     ACTIVE: "active",
//     ON_HOLD: "on_hold",
//     COMPLETED: "completed",
//     CANCELLED: "cancelled"
// };

// Statuts de document - Défini dans store.js
// const DOC_STATUS = {
//     DRAFT: "draft",           // Brouillon
//     SUBMITTED: "submitted",   // Soumis
//     UNDER_REVIEW: "under_review", // En revue
//     OBSERVATIONS: "observations", // Observations
//     REVISED: "revised",       // Révisé
//     APPROVED: "approved",     // Validé
//     REJECTED: "rejected"      // Refusé
// };

// Statuts de tache - Défini dans store.js
// const TASK_STATUS = {
//     TODO: "todo",
//     IN_PROGRESS: "in_progress",
//     REVIEW: "review",
//     DONE: "done",
//     CANCELLED: "cancelled"
// };

// Priorites - Défini dans store.js
// const PRIORITY = {
//     LOW: "low",
//     MEDIUM: "medium",
//     HIGH: "high",
//     URGENT: "urgent"
// };

// Types de document BTP - Défini dans store.js
// const DOCUMENT_TYPES = {
//     // Plans et dessins
//     PLAN_ARCHITECTURAL: "plan_architectural",
//     PLAN_TECHNIQUE: "plan_technique",
//     PLAN_EXECUTION: "plan_execution",
//     PLAN_STRUCTURE: "plan_structure",
//     PLAN_VRD: "plan_vrd",
//     PLAN_ELECTRIQUE: "plan_electrique",
//     PLAN_PLOMBERIE: "plan_plomberie",
//     PLAN_CVC: "plan_cvc",
//     PLAN_SECURITE: "plan_securite",
//     
//     // Rapports et études
//     RAPPORT_CONTROLE: "rapport_controle",
//     RAPPORT_TECHNIQUE: "rapport_technique",
//     RAPPORT_GEOTECHNIQUE: "rapport_geotechnique",
//     RAPPORT_ACOUSTIQUE: "rapport_acoustique",
//     RAPPORT_THERMIQUE: "rapport_thermique",
//     RAPPORT_STRUCTURE: "rapport_structure",
//     RAPPORT_ELECTRIQUE: "rapport_electrique",
//     RAPPORT_PLOMBERIE: "rapport_plomberie",
//     RAPPORT_CVC: "rapport_cvc",
//     RAPPORT_SECURITE: "rapport_securite",
//     RAPPORT_ENVIRONNEMENTAL: "rapport_environnemental",
//     
//     // Procès-verbaux et attestations
//     PV_RECEPTION: "pv_reception",
//     PV_CONTROLE: "pv_controle",
//     PV_VERIFICATION: "pv_verification",
//     PV_ESSAI: "pv_essai",
//     PV_REUNION: "pv_reunion",
//     ATTESTATION_CONTROLE: "attestation_controle",
//     ATTESTATION_SUIVI: "attestation_suivi",
//     ATTESTATION_CONFORMITE: "attestation_conformite",
//     ATTESTATION_QUALITE: "attestation_qualite",
//     ATTESTATION_SECURITE: "attestation_securite",
//     
//     // Cahiers des charges et spécifications
//     CAHIER_CHARGES: "cahier_charges",
//     CAHIER_CLAUSES_TECHNIQUES: "cahier_clauses_techniques",
//     CAHIER_CLAUSES_PARTICULIERES: "cahier_clauses_particulieres",
//     SPECIFICATIONS_TECHNIQUES: "specifications_techniques",
//     SPECIFICATIONS_MATERIAUX: "specifications_materiaux",
//     
//     // Contrats et documents administratifs
//     CONTRAT_TRAVAUX: "contrat_travaux",
//     MARCHE_PUBLIC: "marche_public",
//     DEVIS: "devis",
//     FACTURE: "facture",
//     BON_COMMANDE: "bon_commande",
//     BON_LIVRAISON: "bon_livraison",
//     
//     // Permis et autorisations
//     PERMIS_CONSTRUIRE: "permis_construire",
//     PERMIS_AMENAGER: "permis_amenager",
//     AUTORISATION_TRAVAUX: "autorisation_travaux",
//     DECLARATION_TRAVAUX: "declaration_travaux",
//     AUTORISATION_ENVIRONNEMENTALE: "autorisation_environnementale",
//     
//     // Photos et médias
//     PHOTO_AVANT: "photo_avant",
//     PHOTO_PENDANT: "photo_pendant",
//     PHOTO_APRES: "photo_apres",
//     VIDEO_SUIVI: "video_suivi",
//     SCHEMA: "schema",
//     DIAGRAMME: "diagramme",
//     
//     // Autres documents
//     NOTE_CALCUL: "note_calcul",
//     FICHE_TECHNIQUE: "fiche_technique",
//     MODE_OPERATOIRE: "mode_operatoire",
//     PLAN_SECOURS: "plan_secours",
//     REGLEMENT_INTERIEUR: "reglement_interieur",
//     AUTRE: "autre"
// };

// Types de notification - Défini dans store.js
// const NOTIFICATION_TYPE = {
//     PROJECT_UPDATE: "project_update",
//     DOCUMENT_SUBMITTED: "document_submitted",
//     DOCUMENT_APPROVED: "document_approved",
//     DOCUMENT_REJECTED: "document_rejected",
//     TASK_ASSIGNED: "task_assigned",
//     TASK_COMPLETED: "task_completed",
//     COMMENT_ADDED: "comment_added",
//     INVITATION_SENT: "invitation_sent",
//     INVITATION_ACCEPTED: "invitation_accepted",
//     INVITATION_REJECTED: "invitation_rejected"
// };

// Statuts d'invitation - Défini dans store.js
// const INVITE_STATUS = {
//     PENDING: "pending",
//     ACCEPTED: "accepted",
//     CANCELLED: "cancelled",
//     EXPIRED: "expired"
// };

// Visibilité des projets - Défini dans store.js
// const PROJECT_VISIBILITY = {
//     PRIVATE: "private",
//     LINK: "link"
// };

/* ========================================
   FONCTIONS UTILITAIRES
   ======================================== */

// Generer un ID unique - Défini dans store.js
// function generateId() {
//     return Date.now().toString(36) + Math.random().toString(36).substr(2);
// }

// Valider un email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Formater une date
function formatDate(date) {
    return new Date(date).toLocaleDateString('fr-FR');
}

// Formater une date et heure
function formatDateTime(date) {
    return new Date(date).toLocaleString('fr-FR');
}

// Obtenir le label d'un type de document
function getDocumentTypeLabel(type) {
    const labels = {
        // Plans et dessins
        [DOCUMENT_TYPES.PLAN_ARCHITECTURAL]: "Plan architectural",
        [DOCUMENT_TYPES.PLAN_TECHNIQUE]: "Plan technique",
        [DOCUMENT_TYPES.PLAN_EXECUTION]: "Plan d'exécution",
        [DOCUMENT_TYPES.PLAN_STRUCTURE]: "Plan de structure",
        [DOCUMENT_TYPES.PLAN_VRD]: "Plan VRD",
        [DOCUMENT_TYPES.PLAN_ELECTRIQUE]: "Plan électrique",
        [DOCUMENT_TYPES.PLAN_PLOMBERIE]: "Plan plomberie",
        [DOCUMENT_TYPES.PLAN_CVC]: "Plan CVC",
        [DOCUMENT_TYPES.PLAN_SECURITE]: "Plan de sécurité",
        
        // Rapports et études
        [DOCUMENT_TYPES.RAPPORT_CONTROLE]: "Rapport de contrôle",
        [DOCUMENT_TYPES.RAPPORT_TECHNIQUE]: "Rapport technique",
        [DOCUMENT_TYPES.RAPPORT_GEOTECHNIQUE]: "Rapport géotechnique",
        [DOCUMENT_TYPES.RAPPORT_ACOUSTIQUE]: "Rapport acoustique",
        [DOCUMENT_TYPES.RAPPORT_THERMIQUE]: "Rapport thermique",
        [DOCUMENT_TYPES.RAPPORT_STRUCTURE]: "Rapport de structure",
        [DOCUMENT_TYPES.RAPPORT_ELECTRIQUE]: "Rapport électrique",
        [DOCUMENT_TYPES.RAPPORT_PLOMBERIE]: "Rapport plomberie",
        [DOCUMENT_TYPES.RAPPORT_CVC]: "Rapport CVC",
        [DOCUMENT_TYPES.RAPPORT_SECURITE]: "Rapport de sécurité",
        [DOCUMENT_TYPES.RAPPORT_ENVIRONNEMENTAL]: "Rapport environnemental",
        
        // Procès-verbaux et attestations
        [DOCUMENT_TYPES.PV_RECEPTION]: "PV de réception",
        [DOCUMENT_TYPES.PV_CONTROLE]: "PV de contrôle",
        [DOCUMENT_TYPES.PV_VERIFICATION]: "PV de vérification",
        [DOCUMENT_TYPES.PV_ESSAI]: "PV d'essai",
        [DOCUMENT_TYPES.PV_REUNION]: "PV de réunion",
        [DOCUMENT_TYPES.ATTESTATION_CONTROLE]: "Attestation de contrôle",
        [DOCUMENT_TYPES.ATTESTATION_SUIVI]: "Attestation de suivi",
        [DOCUMENT_TYPES.ATTESTATION_CONFORMITE]: "Attestation de conformité",
        [DOCUMENT_TYPES.ATTESTATION_QUALITE]: "Attestation de qualité",
        [DOCUMENT_TYPES.ATTESTATION_SECURITE]: "Attestation de sécurité",
        
        // Cahiers des charges et spécifications
        [DOCUMENT_TYPES.CAHIER_CHARGES]: "Cahier des charges",
        [DOCUMENT_TYPES.CAHIER_CLAUSES_TECHNIQUES]: "Cahier des clauses techniques",
        [DOCUMENT_TYPES.CAHIER_CLAUSES_PARTICULIERES]: "Cahier des clauses particulières",
        [DOCUMENT_TYPES.SPECIFICATIONS_TECHNIQUES]: "Spécifications techniques",
        [DOCUMENT_TYPES.SPECIFICATIONS_MATERIAUX]: "Spécifications matériaux",
        
        // Contrats et documents administratifs
        [DOCUMENT_TYPES.CONTRAT_TRAVAUX]: "Contrat de travaux",
        [DOCUMENT_TYPES.MARCHE_PUBLIC]: "Marché public",
        [DOCUMENT_TYPES.DEVIS]: "Devis",
        [DOCUMENT_TYPES.FACTURE]: "Facture",
        [DOCUMENT_TYPES.BON_COMMANDE]: "Bon de commande",
        [DOCUMENT_TYPES.BON_LIVRAISON]: "Bon de livraison",
        
        // Permis et autorisations
        [DOCUMENT_TYPES.PERMIS_CONSTRUIRE]: "Permis de construire",
        [DOCUMENT_TYPES.PERMIS_AMENAGER]: "Permis d'aménager",
        [DOCUMENT_TYPES.AUTORISATION_TRAVAUX]: "Autorisation de travaux",
        [DOCUMENT_TYPES.DECLARATION_TRAVAUX]: "Déclaration de travaux",
        [DOCUMENT_TYPES.AUTORISATION_ENVIRONNEMENTALE]: "Autorisation environnementale",
        
        // Photos et médias
        [DOCUMENT_TYPES.PHOTO_AVANT]: "Photo avant travaux",
        [DOCUMENT_TYPES.PHOTO_PENDANT]: "Photo pendant travaux",
        [DOCUMENT_TYPES.PHOTO_APRES]: "Photo après travaux",
        [DOCUMENT_TYPES.VIDEO_SUIVI]: "Vidéo de suivi",
        [DOCUMENT_TYPES.SCHEMA]: "Schéma",
        [DOCUMENT_TYPES.DIAGRAMME]: "Diagramme",
        
        // Autres documents
        [DOCUMENT_TYPES.NOTE_CALCUL]: "Note de calcul",
        [DOCUMENT_TYPES.FICHE_TECHNIQUE]: "Fiche technique",
        [DOCUMENT_TYPES.MODE_OPERATOIRE]: "Mode opératoire",
        [DOCUMENT_TYPES.PLAN_SECOURS]: "Plan de secours",
        [DOCUMENT_TYPES.REGLEMENT_INTERIEUR]: "Règlement intérieur",
        [DOCUMENT_TYPES.AUTRE]: "Autre"
    };
    
    return labels[type] || type;
}

// Obtenir le libelle d'un role
function getRoleLabel(role) {
    const labels = {
        [ROLES.ARCHITECT]: "Architecte",
        [ROLES.BCT]: "Bureau de Controle Technique",
        [ROLES.BET]: "Bureau d'Etudes Techniques",
        [ROLES.CONTRACTOR]: "Entreprise",
        [ROLES.ADMIN]: "Administrateur"
    };
    return labels[role] || role;
}

// Obtenir le libelle d'un statut de projet
function getProjectStatusLabel(status) {
    const labels = {
        [PROJECT_STATUS.DRAFT]: "Brouillon",
        [PROJECT_STATUS.ACTIVE]: "Actif",
        [PROJECT_STATUS.ON_HOLD]: "En attente",
        [PROJECT_STATUS.COMPLETED]: "Termine",
        [PROJECT_STATUS.CANCELLED]: "Annule"
    };
    return labels[status] || status;
}

// Obtenir le libelle d'un statut de document
function getDocStatusLabel(status) {
    const labels = {
        [DOC_STATUS.DRAFT]: "Brouillon",
        [DOC_STATUS.SUBMITTED]: "Soumis",
        [DOC_STATUS.UNDER_REVIEW]: "En revue",
        [DOC_STATUS.OBSERVATIONS]: "Observations",
        [DOC_STATUS.REVISED]: "Révisé",
        [DOC_STATUS.APPROVED]: "Validé",
        [DOC_STATUS.REJECTED]: "Refusé"
    };
    return labels[status] || status;
}

// Obtenir le libelle d'un statut de tache
function getTaskStatusLabel(status) {
    const labels = {
        [TASK_STATUS.TODO]: "A faire",
        [TASK_STATUS.IN_PROGRESS]: "En cours",
        [TASK_STATUS.REVIEW]: "En revision",
        [TASK_STATUS.DONE]: "Termine",
        [TASK_STATUS.CANCELLED]: "Annule"
    };
    return labels[status] || status;
}

// Obtenir le libelle d'une priorite
function getPriorityLabel(priority) {
    const labels = {
        [PRIORITY.LOW]: "Faible",
        [PRIORITY.MEDIUM]: "Moyenne",
        [PRIORITY.HIGH]: "Elevee",
        [PRIORITY.URGENT]: "Urgente"
    };
    return labels[priority] || priority;
}

/* ========================================
   FONCTIONS UTILITAIRES POUR LES INVITATIONS
   ======================================== */

function createInvitationJournalEntry(projectId, action, details) {
    return {
        id: generateId(),
        projectId: projectId,
        type: 'invitation',
        action: action,
        details: details,
        timestamp: new Date().toISOString()
    };
}

function createInvitationNotification(userId, projectId, type, title, message) {
    return new Notification({
        userId: userId,
        type: type,
        title: title,
        message: message,
        projectId: projectId
    });
}

/* ========================================
   FONCTIONS UTILITAIRES POUR LES ROLES
   ======================================== */

function getUserEffectiveRole(user, project) {
    if (user.isAdmin()) {
        return ROLES.ADMIN;
    }
    
    // Si un projet est fourni, utiliser le rôle dans le projet
    if (project && project.getEffectiveRole) {
        return project.getEffectiveRole(user.id, user.role);
    }
    
    // Fallback au rôle global
    return user.role;
}

function hasProjectPermission(user, project, action) {
    if (!user || !project) {
        return false;
    }
    
    // Vérifier d'abord si l'utilisateur est membre du projet
    if (!project.isMember(user.id)) {
        return false;
    }
    
    // Utiliser la méthode du projet pour vérifier les permissions
    return project.hasPermission(user.id, action, user.role);
}

function isProjectMember(user, project) {
    if (!user || !project) {
        return false;
    }
    return project.isMember(user.id);
}

function canPerformProjectActions(user, project) {
    return isProjectMember(user, project) && user.isActive;
}

/* ========================================
   EXPORTS
   ======================================== */

// Export supprimé pour compatibilité directe
// Toutes les classes et constantes sont maintenant disponibles globalement
