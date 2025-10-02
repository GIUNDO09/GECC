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
   CLASSE USER - Défini dans store.js
   ======================================== */

// class User {
//     constructor(data = {}) {
//         this.id = data.id || generateId();
//         this.email = data.email || "";
//         this.password = data.password || "";
//         this.fullName = data.fullName || "";
//         this.role = data.role || ROLES.ARCHITECT;
//         this.company = data.company || "";
//         this.phone = data.phone || "";
//         this.avatarBase64 = data.avatarBase64 || null;
//         this.isActive = data.isActive !== undefined ? data.isActive : true;
//         this.createdAt = data.createdAt || new Date().toISOString();
//         this.updatedAt = data.updatedAt || new Date().toISOString();
//         this.lastLoginAt = data.lastLoginAt || null;
//         this.preferences = data.preferences || {
//             language: "fr",
//             timezone: "Europe/Paris",
//             theme: "light",
//             units: "metric",
//             notifications: {
//                 email: true,
//                 push: true,
//                 projectUpdates: true,
//                 documentUpdates: true,
//                 taskUpdates: true,
//                 comments: true
//             }
//         };
//         
//         // Champs étendus pour l'étape 32 - Profil & Paramètres
//         this.companyName = data.companyName || data.company || "";
//         this.activity = data.activity || "";
//         this.description = data.description || "";
//         this.logo = data.logo || data.avatarBase64 || null;
//         
//         // Alias pour compatibilité
//         this.name = this.fullName;
//     }

//     validate() {
//         const errors = [];
//         
//         if (!this.email || !isValidEmail(this.email)) {
//             errors.push("Email invalide");
//         }
//         
//         if (!this.password || this.password.length < 6) {
//             errors.push("Mot de passe doit contenir au moins 6 caracteres");
//         }
//         
//         if (!this.fullName || this.fullName.trim().length < 2) {
//             errors.push("Nom complet requis");
//         }
//         
//         if (!Object.values(ROLES).includes(this.role)) {
//             errors.push("Role invalide");
//         }
//         
//         return errors;
//     }

//     update(data) {
//         Object.assign(this, data);
//         this.updatedAt = new Date().toISOString();
//     }

//     checkPassword(password) {
//         return this.password === password;
//     }

//     updatePassword(newPassword) {
//         if (newPassword.length < 6) {
//             throw new Error("Le mot de passe doit contenir au moins 6 caracteres");
//         }
//         this.password = newPassword;
//         this.updatedAt = new Date().toISOString();
//     }

//     getInitials() {
//         return this.fullName
//             .split(' ')
//             .map(name => name.charAt(0))
//             .join('')
//             .toUpperCase()
//             .substring(0, 2);
//     }

//     getDisplayName() {
//         return this.fullName || this.email;
//     }

//     getRoleLabel() {
//         return getRoleLabel(this.role);
//     }

//     isAdmin() {
//         return this.role === ROLES.ADMIN;
//     }

//     canManageProjects() {
//         return [ROLES.ADMIN, ROLES.ARCHITECT].includes(this.role);
//     }

//     canApproveDocuments() {
//         return [ROLES.ADMIN, ROLES.BCT, ROLES.BET].includes(this.role);
//     }
// }

/* ========================================
   CLASSE PROJECT - Défini dans store.js
   ======================================== */

// class Project {
//     constructor(data = {}) {
//         this.id = data.id || generateId();
//         this.name = data.name || "";
//         this.code = data.code || ""; // Code du projet
//         this.description = data.description || "";
//         this.status = data.status || PROJECT_STATUS.DRAFT;
//         this.ownerId = data.ownerId || "";
//         this.team = data.team || [];
//         this.members = data.members || [];
//         this.startDate = data.startDate || null;
//         this.endDate = data.endDate || null;
//         this.budget = data.budget || 0;
//         this.location = data.location || "";
//         this.client = data.client || "";
//         this.type = data.type || "";
//         this.visibility = data.visibility || "private";
//         this.progress = data.progress || 0; // Progression du projet (0-100)
//         this.createdAt = data.createdAt || new Date().toISOString();
//         this.updatedAt = data.updatedAt || new Date().toISOString();
//         this.settings = data.settings || {
//             allowComments: true,
//             allowFileUploads: true,
//             requireApproval: true,
//             notifications: {
//                 onDocumentSubmit: true,
//                 onTaskComplete: true,
//                 onCommentAdd: true
//             }
//         };
//     }

//     validate() {
//         const errors = [];
//         
//         if (!this.name || this.name.trim().length < 2) {
//             errors.push("Nom du projet requis");
//         }
//         
//         if (!this.ownerId) {
//             errors.push("Proprietaire du projet requis");
//         }
//         
//         if (!Object.values(PROJECT_STATUS).includes(this.status)) {
//             errors.push("Statut de projet invalide");
//         }
//         
//         return errors;
//     }

//     update(data) {
//         Object.assign(this, data);
//         this.updatedAt = new Date().toISOString();
//     }

//     addMember(userId, roleInProject, joinedAt = null) {
//         const existingMember = this.members.find(m => m.userId === userId);
//         if (existingMember) {
//             existingMember.roleInProject = roleInProject;
//             existingMember.updatedAt = new Date().toISOString();
//         } else {
//             this.members.push({
//                 userId: userId,
//                 roleInProject: roleInProject,
//                 joinedAt: joinedAt || new Date().toISOString(),
//                 updatedAt: new Date().toISOString()
//             });
//         }
//         this.updatedAt = new Date().toISOString();
//     }

//     removeMember(userId) {
//         this.members = this.members.filter(m => m.userId !== userId);
//         this.updatedAt = new Date().toISOString();
//     }

//     getMemberRole(userId) {
//         const member = this.members.find(m => m.userId === userId);
//         return member ? member.roleInProject : null;
//     }

//     isMember(userId) {
//         return this.members.some(m => m.userId === userId);
//     }

//     getMembers() {
//         return this.members;
//     }

//     getMembersByRole(role) {
//         return this.members.filter(m => m.roleInProject === role);
//     }

//     updateMemberRole(userId, newRole) {
//         const member = this.members.find(m => m.userId === userId);
//         if (member) {
//             member.roleInProject = newRole;
//             member.updatedAt = new Date().toISOString();
//             this.updatedAt = new Date().toISOString();
//         }
//     }

//     getStatusLabel() {
//         return getProjectStatusLabel(this.status);
//     }

//     getProgress() {
//         // Calculer le progres basique
//         return 0;
//     }

//     isActive() {
//         return this.status === PROJECT_STATUS.ACTIVE;
//     }

//     isCompleted() {
//         return this.status === PROJECT_STATUS.COMPLETED;
//     }

//     // Obtenir le rôle effectif d'un utilisateur dans ce projet
//     getEffectiveRole(userId, userGlobalRole = null) {
//         const member = this.members.find(m => m.userId === userId);
//         if (member && member.roleInProject) {
//             return member.roleInProject;
//         }
//         // Fallback au rôle global si pas de rôle spécifique au projet
//         return userGlobalRole || ROLES.ARCHITECT;
//     }

//     // Vérifier si un utilisateur a les permissions pour une action
//     hasPermission(userId, action, userGlobalRole = null) {
//         const effectiveRole = this.getEffectiveRole(userId, userGlobalRole);
//         
//         switch (action) {
//             case 'manage_project':
//                 return [ROLES.ADMIN, ROLES.ARCHITECT].includes(effectiveRole);
//             case 'approve_documents':
//                 return [ROLES.ADMIN, ROLES.BCT, ROLES.BET].includes(effectiveRole);
//             case 'submit_documents':
//                 return [ROLES.ADMIN, ROLES.ARCHITECT, ROLES.CONTRACTOR].includes(effectiveRole);
//             case 'manage_tasks':
//                 return [ROLES.ADMIN, ROLES.ARCHITECT, ROLES.BET].includes(effectiveRole);
//             case 'view_project':
//                 return this.isMember(userId) || effectiveRole === ROLES.ADMIN;
//             default:
//                 return false;
//         }
//     }
// }

/* ========================================
   CLASSE DOCUMENT
   ======================================== */

// class Document {
//     constructor(data = {}) {
//         this.id = data.id || generateId();
//         this.projectId = data.projectId || "";
//         this.name = data.name || "";
//         this.description = data.description || "";
//         this.type = data.type || DOCUMENT_TYPES.PLAN_ARCHITECTURAL;
//         this.status = data.status || DOC_STATUS.DRAFT;
//         this.fileName = data.fileName || "";
//         this.fileSize = data.fileSize || 0;
//         this.fileType = data.fileType || "";
//         this.fileBase64 = data.fileBase64 || null;
//         this.version = data.version || 1;
//         
//         // Workflow et permissions
//         this.submittedBy = data.submittedBy || "";
//         this.submittedAt = data.submittedAt || null;
//         this.targetRoles = data.targetRoles || []; // Rôles destinataires (BCT, BET, ENTREPRISE)
//         this.externalUrl = data.externalUrl || ""; // Lien URL facultatif
//         
//         // Historique des transitions
//         this.history = data.history || [];
//         
//         // Champs legacy (à conserver pour compatibilité)
//         this.reviewedBy = data.reviewedBy || "";
//         this.reviewedAt = data.reviewedAt || null;
//         this.approvedBy = data.approvedBy || "";
//         this.approvedAt = data.approvedAt || null;
//         this.rejectionReason = data.rejectionReason || "";
//         this.tags = data.tags || [];
//         this.createdAt = data.createdAt || new Date().toISOString();
//         this.updatedAt = data.updatedAt || new Date().toISOString();
//     }

//     validate() {
//         const errors = [];
//         
//         if (!this.name || this.name.trim().length < 2) {
//             errors.push("Nom du document requis");
//         }
//         
//         if (!this.projectId) {
//             errors.push("Projet requis");
//         }
//         
//         if (!Object.values(DOC_STATUS).includes(this.status)) {
//             errors.push("Statut de document invalide");
//         }
//         
//         return errors;
//     }

//     update(data) {
//         Object.assign(this, data);
//         this.updatedAt = new Date().toISOString();
//     }

//     getStatusLabel() {
//         return getDocStatusLabel(this.status);
//     }

//     getTypeLabel() {
//         return getDocumentTypeLabel(this.type);
//     }

//     isApproved() {
//         return this.status === DOC_STATUS.APPROVED;
//     }

//     // Méthodes de workflow
//     addHistoryEntry(action, userId, comment = "") {
//         this.history.push({
//             id: generateId(),
//             action: action,
//             userId: userId,
//             comment: comment,
//             timestamp: new Date().toISOString(),
//             previousStatus: this.status
//         });
//     }

//     canSubmit(userRole, project = null) {
//         // Vérifier d'abord si l'utilisateur est membre du projet
//         if (project && !project.isMember) {
//             return false;
//         }
//         return userRole === ROLES.ARCHITECT && this.status === DOC_STATUS.DRAFT;
//     }

//     canReview(userRole, project = null) {
//         // Vérifier d'abord si l'utilisateur est membre du projet
//         if (project && !project.isMember) {
//             return false;
//         }
//         return this.targetRoles.includes(userRole) && 
//                [DOC_STATUS.SUBMITTED, DOC_STATUS.UNDER_REVIEW].includes(this.status);
//     }

//     canRevise(userRole, project = null) {
//         // Vérifier d'abord si l'utilisateur est membre du projet
//         if (project && !project.isMember) {
//             return false;
//         }
//         return userRole === ROLES.ARCHITECT && 
//                [DOC_STATUS.OBSERVATIONS, DOC_STATUS.REJECTED].includes(this.status);
//     }

//     submit(userId) {
//         if (this.status !== DOC_STATUS.DRAFT) {
//             throw new Error("Seuls les documents en brouillon peuvent être soumis");
//         }
//         this.status = DOC_STATUS.SUBMITTED;
//         this.submittedBy = userId;
//         this.submittedAt = new Date().toISOString();
//         this.addHistoryEntry("submitted", userId, "Document soumis pour révision");
//         this.updatedAt = new Date().toISOString();
//     }

//     review(userId, action, comment = "") {
//         if (!this.canReview(this.getUserRole(userId))) {
//             throw new Error("Vous n'avez pas les permissions pour réviser ce document");
//         }
//         
//         const previousStatus = this.status;
//         
//         switch (action) {
//             case "approve":
//                 this.status = DOC_STATUS.APPROVED;
//                 this.approvedBy = userId;
//                 this.approvedAt = new Date().toISOString();
//                 break;
//             case "reject":
//                 this.status = DOC_STATUS.REJECTED;
//                 this.rejectionReason = comment;
//                 break;
//             case "observations":
//                 this.status = DOC_STATUS.OBSERVATIONS;
//                 break;
//             default:
//                 throw new Error("Action de révision invalide");
//         }
//         
//         this.addHistoryEntry(`review_${action}`, userId, comment);
//         this.updatedAt = new Date().toISOString();
//     }

//     revise(userId) {
//         if (!this.canRevise(this.getUserRole(userId))) {
//             throw new Error("Vous n'avez pas les permissions pour réviser ce document");
//         }
//         
//         this.status = DOC_STATUS.REVISED;
//         this.addHistoryEntry("revised", userId, "Document révisé");
//         this.updatedAt = new Date().toISOString();
//     }

//     getUserRole(userId, project = null) {
//         // Si un projet est fourni, utiliser le rôle effectif dans le projet
//         if (project && project.getEffectiveRole) {
//             return project.getEffectiveRole(userId);
//         }
//         // Fallback au rôle par défaut
//         return ROLES.ARCHITECT;
//     }

//     getStatusClass() {
//         const classes = {
//             [DOC_STATUS.DRAFT]: "secondary",
//             [DOC_STATUS.SUBMITTED]: "info",
//             [DOC_STATUS.UNDER_REVIEW]: "warning",
//             [DOC_STATUS.OBSERVATIONS]: "warning",
//             [DOC_STATUS.REVISED]: "info",
//             [DOC_STATUS.APPROVED]: "success",
//             [DOC_STATUS.REJECTED]: "danger"
//         };
//         return classes[this.status] || "secondary";
//     }
// }

/* ========================================
   CLASSE TASK
   ======================================== */

// class Task {
//     constructor(data = {}) {
//         this.id = data.id || generateId();
//         this.projectId = data.projectId || "";
//         this.title = data.title || "";
//         this.description = data.description || "";
//         this.status = data.status || TASK_STATUS.TODO;
//         this.priority = data.priority || PRIORITY.MEDIUM;
//         this.assignedTo = data.assignedTo || "";
//         this.assigneeName = data.assigneeName || "";
//         this.createdBy = data.createdBy || "";
//         this.dueDate = data.dueDate || null;
//         this.completedAt = data.completedAt || null;
//         this.estimatedHours = data.estimatedHours || 0;
//         this.actualHours = data.actualHours || 0;
//         this.tags = data.tags || [];
//         this.dependencies = data.dependencies || [];
//         this.attachments = data.attachments || [];
//         this.createdAt = data.createdAt || new Date().toISOString();
//         this.updatedAt = data.updatedAt || new Date().toISOString();
//     }

//     validate() {
//         const errors = [];
//         
//         if (!this.title || this.title.trim().length < 2) {
//             errors.push("Titre de la tache requis");
//         }
//         
//         if (!this.projectId) {
//             errors.push("Projet requis");
//         }
//         
//         if (!Object.values(TASK_STATUS).includes(this.status)) {
//             errors.push("Statut de tache invalide");
//         }
//         
//         if (!Object.values(PRIORITY).includes(this.priority)) {
//             errors.push("Priorite invalide");
//         }
//         
//         return errors;
//     }

//     update(data) {
//         Object.assign(this, data);
//         this.updatedAt = new Date().toISOString();
//     }

//     getStatusLabel() {
//         return getTaskStatusLabel(this.status);
//     }

//     getPriorityLabel() {
//         return getPriorityLabel(this.priority);
//     }

//     isCompleted() {
//         return this.status === TASK_STATUS.DONE;
//     }

//     // Vérifier si la tâche est en retard
//     isOverdue() {
//         if (!this.dueDate) return false;
//         return new Date(this.dueDate) < new Date();
//     }

//     // Vérifier si la tâche est proche de l'échéance (< 3 jours)
//     isDueSoon() {
//         if (!this.dueDate) return false;
//         const dueDate = new Date(this.dueDate);
//         const today = new Date();
//         const diffTime = dueDate - today;
//         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//         return diffDays <= 3 && diffDays >= 0;
//     }

//     // Obtenir le statut de la date limite
//     getDueDateStatus() {
//         if (!this.dueDate) return 'no-date';
//         if (this.isOverdue()) return 'overdue';
//         if (this.isDueSoon()) return 'due-soon';
//         return 'on-time';
//     }

//     // Formater la date limite pour l'affichage
//     getFormattedDueDate() {
//         if (!this.dueDate) return '';
//         const date = new Date(this.dueDate);
//         return date.toLocaleDateString('fr-FR', { 
//             day: '2-digit', 
//             month: '2-digit' 
//         });
//     }

//     // Obtenir la classe CSS pour le badge de date
//     getDueDateBadgeClass() {
//         const status = this.getDueDateStatus();
//         const classes = {
//             'no-date': 'badge-secondary',
//             'on-time': 'badge-success',
//             'due-soon': 'badge-warning',
//             'overdue': 'badge-danger'
//         };
//         return classes[status] || 'badge-secondary';
//     }
// }

/* ========================================
   CLASSE COMMENT
   ======================================== */

// class Comment {
//     constructor(data = {}) {
//         this.id = data.id || generateId();
//         this.projectId = data.projectId || "";
//         this.documentId = data.documentId || null;
//         this.taskId = data.taskId || null;
//         this.parentId = data.parentId || null;
//         this.content = data.content || "";
//         this.authorId = data.authorId || "";
//         this.authorName = data.authorName || "";
//         this.isEdited = data.isEdited || false;
//         this.editedAt = data.editedAt || null;
//         this.replies = data.replies || [];
//         this.attachments = data.attachments || [];
//         this.createdAt = data.createdAt || new Date().toISOString();
//         this.updatedAt = data.updatedAt || new Date().toISOString();
//     }

//     validate() {
//         const errors = [];
//         
//         if (!this.content || this.content.trim().length < 1) {
//             errors.push("Contenu du commentaire requis");
//         }
//         
//         if (!this.authorId) {
//             errors.push("Auteur requis");
//         }
//         
//         if (!this.projectId) {
//             errors.push("Projet requis");
//         }
//         
//         return errors;
//     }

//     update(data) {
//         Object.assign(this, data);
//         this.isEdited = true;
//         this.editedAt = new Date().toISOString();
//         this.updatedAt = new Date().toISOString();
//     }

//     getFormattedDate() {
//         return formatDateTime(this.createdAt);
//     }
// }

/* ========================================
   CLASSE NOTIFICATION
   ======================================== */

// class Notification {
//     constructor(data = {}) {
//         this.id = data.id || generateId();
//         this.userId = data.userId || "";
//         this.type = data.type || NOTIFICATION_TYPE.PROJECT_UPDATE;
//         this.title = data.title || "";
//         this.message = data.message || "";
//         this.projectId = data.projectId || null;
//         this.documentId = data.documentId || null;
//         this.taskId = data.taskId || null;
//         this.commentId = data.commentId || null;
//         this.isRead = data.isRead || false;
//         this.readAt = data.readAt || null;
//         this.actionUrl = data.actionUrl || null;
//         this.createdAt = data.createdAt || new Date().toISOString();
//     }

//     markAsRead() {
//         this.isRead = true;
//         this.readAt = new Date().toISOString();
//     }

//     getFormattedDate() {
//         return formatDateTime(this.createdAt);
//     }
// }

/* ========================================
   MODÈLE PASSWORD RESET
   ======================================== */

// class PasswordReset {
    constructor(data) {
        this.id = data.id || generateId();
        this.email = data.email;
        this.token = data.token || generateId();
        this.expiresAt = data.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
        this.used = data.used || false;
        this.createdAt = data.createdAt || new Date();
    }

    isExpired() {
        return new Date() > this.expiresAt;
    }

    isValid() {
        return !this.used && !this.isExpired();
    }
}

/* ========================================
   MODÈLE INVITATION
   ======================================== */

// class Invite {
    constructor(data = {}) {
        this.id = data.id || generateId();
        this.projectId = data.projectId || "";
        this.emailCible = data.emailCible || "";
        this.rolePropose = data.rolePropose || ROLES.ARCHITECT;
        this.creePar = data.creePar || ""; // ID de l'utilisateur qui a créé l'invitation
        this.status = data.status || INVITE_STATUS.PENDING;
        this.token = data.token || generateId();
        this.createdAt = data.createdAt || new Date();
        this.expiresAt = data.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // +7 jours par défaut
        this.acceptedAt = data.acceptedAt || null;
        this.cancelledAt = data.cancelledAt || null;
    }

    // Vérifier si l'invitation est expirée
    isExpired() {
        return new Date() > this.expiresAt;
    }

    // Vérifier si l'invitation est valide (non expirée et en attente)
    isValid() {
        return this.status === INVITE_STATUS.PENDING && !this.isExpired();
    }

    // Accepter l'invitation
    accept(userId) {
        if (!this.isValid()) {
            throw new Error('Invitation invalide ou expirée');
        }
        
        this.status = INVITE_STATUS.ACCEPTED;
        this.acceptedAt = new Date();
        return this;
    }

    // Annuler l'invitation
    cancel() {
        if (this.status === INVITE_STATUS.ACCEPTED) {
            throw new Error('Impossible d\'annuler une invitation déjà acceptée');
        }
        
        this.status = INVITE_STATUS.CANCELLED;
        this.cancelledAt = new Date();
        return this;
    }

    // Marquer comme expirée
    markAsExpired() {
        if (this.status === INVITE_STATUS.PENDING && this.isExpired()) {
            this.status = INVITE_STATUS.EXPIRED;
        }
        return this;
    }

    // Obtenir le statut avec libellé
    getStatusLabel() {
        const labels = {
            [INVITE_STATUS.PENDING]: 'En attente',
            [INVITE_STATUS.ACCEPTED]: 'Acceptée',
            [INVITE_STATUS.CANCELLED]: 'Annulée',
            [INVITE_STATUS.EXPIRED]: 'Expirée'
        };
        return labels[this.status] || this.status;
    }

    // Obtenir la classe CSS pour le statut
    getStatusClass() {
        const classes = {
            [INVITE_STATUS.PENDING]: 'badge-warning',
            [INVITE_STATUS.ACCEPTED]: 'badge-success',
            [INVITE_STATUS.CANCELLED]: 'badge-secondary',
            [INVITE_STATUS.EXPIRED]: 'badge-danger'
        };
        return classes[this.status] || 'badge-secondary';
    }

    // Obtenir le temps restant avant expiration
    getTimeRemaining() {
        if (this.status !== INVITE_STATUS.PENDING) {
            return null;
        }
        
        const now = new Date();
        const expires = new Date(this.expiresAt);
        const diff = expires - now;
        
        if (diff <= 0) {
            return 'Expirée';
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) {
            return `${days} jour${days > 1 ? 's' : ''} restant${days > 1 ? 's' : ''}`;
        } else if (hours > 0) {
            return `${hours} heure${hours > 1 ? 's' : ''} restante${hours > 1 ? 's' : ''}`;
        } else {
            return 'Expire bientôt';
        }
    }
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
   CLASSE USER - Défini dans store.js
   ======================================== */

// class User {
//     constructor(data = {}) {
//         this.id = data.id || generateId();
//         this.email = data.email || "";
//         this.password = data.password || "";
//         this.fullName = data.fullName || "";
//         this.role = data.role || ROLES.ARCHITECT;
//         this.company = data.company || "";
//         this.phone = data.phone || "";
//         this.avatarBase64 = data.avatarBase64 || null;
//         this.isActive = data.isActive !== undefined ? data.isActive : true;
//         this.createdAt = data.createdAt || new Date().toISOString();
//         this.updatedAt = data.updatedAt || new Date().toISOString();
//         this.lastLoginAt = data.lastLoginAt || null;
//         this.preferences = data.preferences || {
//             language: "fr",
//             timezone: "Europe/Paris",
//             theme: "light",
//             units: "metric",
//             notifications: {
//                 email: true,
//                 push: true,
//                 projectUpdates: true,
//                 documentUpdates: true,
//                 taskUpdates: true,
//                 comments: true
//             }
//         };
//         
//         // Champs étendus pour l'étape 32 - Profil & Paramètres
//         this.companyName = data.companyName || data.company || "";
//         this.activity = data.activity || "";
//         this.description = data.description || "";
//         this.logo = data.logo || data.avatarBase64 || null;
//         
//         // Alias pour compatibilité
//         this.name = this.fullName;
//     }

//     validate() {
//         const errors = [];
//         
//         if (!this.email || !isValidEmail(this.email)) {
//             errors.push("Email invalide");
//         }
//         
//         if (!this.password || this.password.length < 6) {
//             errors.push("Mot de passe doit contenir au moins 6 caracteres");
//         }
//         
//         if (!this.fullName || this.fullName.trim().length < 2) {
//             errors.push("Nom complet requis");
//         }
//         
//         if (!Object.values(ROLES).includes(this.role)) {
//             errors.push("Role invalide");
//         }
//         
//         return errors;
//     }

//     update(data) {
//         Object.assign(this, data);
//         this.updatedAt = new Date().toISOString();
//     }

//     checkPassword(password) {
//         return this.password === password;
//     }

//     updatePassword(newPassword) {
//         if (newPassword.length < 6) {
//             throw new Error("Le mot de passe doit contenir au moins 6 caracteres");
//         }
//         this.password = newPassword;
//         this.updatedAt = new Date().toISOString();
//     }

//     getInitials() {
//         return this.fullName
//             .split(' ')
//             .map(name => name.charAt(0))
//             .join('')
//             .toUpperCase()
//             .substring(0, 2);
//     }

//     getDisplayName() {
//         return this.fullName || this.email;
//     }

//     getRoleLabel() {
//         return getRoleLabel(this.role);
//     }

//     isAdmin() {
//         return this.role === ROLES.ADMIN;
//     }

//     canManageProjects() {
//         return [ROLES.ADMIN, ROLES.ARCHITECT].includes(this.role);
//     }

//     canApproveDocuments() {
//         return [ROLES.ADMIN, ROLES.BCT, ROLES.BET].includes(this.role);
//     }
// }

/* ========================================
   CLASSE PROJECT - Défini dans store.js
   ======================================== */

// class Project {
//     constructor(data = {}) {
//         this.id = data.id || generateId();
//         this.name = data.name || "";
//         this.code = data.code || ""; // Code du projet
//         this.description = data.description || "";
//         this.status = data.status || PROJECT_STATUS.DRAFT;
//         this.ownerId = data.ownerId || "";
//         this.team = data.team || [];
//         this.members = data.members || [];
//         this.startDate = data.startDate || null;
//         this.endDate = data.endDate || null;
//         this.budget = data.budget || 0;
//         this.location = data.location || "";
//         this.client = data.client || "";
//         this.type = data.type || "";
//         this.visibility = data.visibility || "private";
//         this.progress = data.progress || 0; // Progression du projet (0-100)
//         this.createdAt = data.createdAt || new Date().toISOString();
//         this.updatedAt = data.updatedAt || new Date().toISOString();
//         this.settings = data.settings || {
//             allowComments: true,
//             allowFileUploads: true,
//             requireApproval: true,
//             notifications: {
//                 onDocumentSubmit: true,
//                 onTaskComplete: true,
//                 onCommentAdd: true
//             }
//         };
//     }

//     validate() {
//         const errors = [];
//         
//         if (!this.name || this.name.trim().length < 2) {
//             errors.push("Nom du projet requis");
//         }
//         
//         if (!this.ownerId) {
//             errors.push("Proprietaire du projet requis");
//         }
//         
//         if (!Object.values(PROJECT_STATUS).includes(this.status)) {
//             errors.push("Statut de projet invalide");
//         }
//         
//         return errors;
//     }

//     update(data) {
//         Object.assign(this, data);
//         this.updatedAt = new Date().toISOString();
//     }

//     addMember(userId, roleInProject, joinedAt = null) {
//         const existingMember = this.members.find(m => m.userId === userId);
//         if (existingMember) {
//             existingMember.roleInProject = roleInProject;
//             existingMember.updatedAt = new Date().toISOString();
//         } else {
//             this.members.push({
//                 userId: userId,
//                 roleInProject: roleInProject,
//                 joinedAt: joinedAt || new Date().toISOString(),
//                 updatedAt: new Date().toISOString()
//             });
//         }
//         this.updatedAt = new Date().toISOString();
//     }

//     removeMember(userId) {
//         this.members = this.members.filter(m => m.userId !== userId);
//         this.updatedAt = new Date().toISOString();
//     }

//     getMemberRole(userId) {
//         const member = this.members.find(m => m.userId === userId);
//         return member ? member.roleInProject : null;
//     }

//     isMember(userId) {
//         return this.members.some(m => m.userId === userId);
//     }

//     getMembers() {
//         return this.members;
//     }

//     getMembersByRole(role) {
//         return this.members.filter(m => m.roleInProject === role);
//     }

//     updateMemberRole(userId, newRole) {
//         const member = this.members.find(m => m.userId === userId);
//         if (member) {
//             member.roleInProject = newRole;
//             member.updatedAt = new Date().toISOString();
//             this.updatedAt = new Date().toISOString();
//         }
//     }

//     getStatusLabel() {
//         return getProjectStatusLabel(this.status);
//     }

//     getProgress() {
//         // Calculer le progres basique
//         return 0;
//     }

//     isActive() {
//         return this.status === PROJECT_STATUS.ACTIVE;
//     }

//     isCompleted() {
//         return this.status === PROJECT_STATUS.COMPLETED;
//     }

//     // Obtenir le rôle effectif d'un utilisateur dans ce projet
//     getEffectiveRole(userId, userGlobalRole = null) {
//         const member = this.members.find(m => m.userId === userId);
//         if (member && member.roleInProject) {
//             return member.roleInProject;
//         }
//         // Fallback au rôle global si pas de rôle spécifique au projet
//         return userGlobalRole || ROLES.ARCHITECT;
//     }

//     // Vérifier si un utilisateur a les permissions pour une action
//     hasPermission(userId, action, userGlobalRole = null) {
//         const effectiveRole = this.getEffectiveRole(userId, userGlobalRole);
//         
//         switch (action) {
//             case 'manage_project':
//                 return [ROLES.ADMIN, ROLES.ARCHITECT].includes(effectiveRole);
//             case 'approve_documents':
//                 return [ROLES.ADMIN, ROLES.BCT, ROLES.BET].includes(effectiveRole);
//             case 'submit_documents':
//                 return [ROLES.ADMIN, ROLES.ARCHITECT, ROLES.CONTRACTOR].includes(effectiveRole);
//             case 'manage_tasks':
//                 return [ROLES.ADMIN, ROLES.ARCHITECT, ROLES.BET].includes(effectiveRole);
//             case 'view_project':
//                 return this.isMember(userId) || effectiveRole === ROLES.ADMIN;
//             default:
//                 return false;
//         }
//     }
// }

/* ========================================
   CLASSE DOCUMENT
   ======================================== */

// class Document {
//     constructor(data = {}) {
//         this.id = data.id || generateId();
//         this.projectId = data.projectId || "";
//         this.name = data.name || "";
//         this.description = data.description || "";
//         this.type = data.type || DOCUMENT_TYPES.PLAN_ARCHITECTURAL;
//         this.status = data.status || DOC_STATUS.DRAFT;
//         this.fileName = data.fileName || "";
//         this.fileSize = data.fileSize || 0;
//         this.fileType = data.fileType || "";
//         this.fileBase64 = data.fileBase64 || null;
//         this.version = data.version || 1;
//         
//         // Workflow et permissions
//         this.submittedBy = data.submittedBy || "";
//         this.submittedAt = data.submittedAt || null;
//         this.targetRoles = data.targetRoles || []; // Rôles destinataires (BCT, BET, ENTREPRISE)
//         this.externalUrl = data.externalUrl || ""; // Lien URL facultatif
//         
//         // Historique des transitions
//         this.history = data.history || [];
//         
//         // Champs legacy (à conserver pour compatibilité)
//         this.reviewedBy = data.reviewedBy || "";
//         this.reviewedAt = data.reviewedAt || null;
//         this.approvedBy = data.approvedBy || "";
//         this.approvedAt = data.approvedAt || null;
//         this.rejectionReason = data.rejectionReason || "";
//         this.tags = data.tags || [];
//         this.createdAt = data.createdAt || new Date().toISOString();
//         this.updatedAt = data.updatedAt || new Date().toISOString();
//     }

//     validate() {
//         const errors = [];
//         
//         if (!this.name || this.name.trim().length < 2) {
//             errors.push("Nom du document requis");
//         }
//         
//         if (!this.projectId) {
//             errors.push("Projet requis");
//         }
//         
//         if (!Object.values(DOC_STATUS).includes(this.status)) {
//             errors.push("Statut de document invalide");
//         }
//         
//         return errors;
//     }

//     update(data) {
//         Object.assign(this, data);
//         this.updatedAt = new Date().toISOString();
//     }

//     getStatusLabel() {
//         return getDocStatusLabel(this.status);
//     }

//     getTypeLabel() {
//         return getDocumentTypeLabel(this.type);
//     }

//     isApproved() {
//         return this.status === DOC_STATUS.APPROVED;
//     }

//     // Méthodes de workflow
//     addHistoryEntry(action, userId, comment = "") {
//         this.history.push({
//             id: generateId(),
//             action: action,
//             userId: userId,
//             comment: comment,
//             timestamp: new Date().toISOString(),
//             previousStatus: this.status
//         });
//     }

//     canSubmit(userRole, project = null) {
//         // Vérifier d'abord si l'utilisateur est membre du projet
//         if (project && !project.isMember) {
//             return false;
//         }
//         return userRole === ROLES.ARCHITECT && this.status === DOC_STATUS.DRAFT;
//     }

//     canReview(userRole, project = null) {
//         // Vérifier d'abord si l'utilisateur est membre du projet
//         if (project && !project.isMember) {
//             return false;
//         }
//         return this.targetRoles.includes(userRole) && 
//                [DOC_STATUS.SUBMITTED, DOC_STATUS.UNDER_REVIEW].includes(this.status);
//     }

//     canRevise(userRole, project = null) {
//         // Vérifier d'abord si l'utilisateur est membre du projet
//         if (project && !project.isMember) {
//             return false;
//         }
//         return userRole === ROLES.ARCHITECT && 
//                [DOC_STATUS.OBSERVATIONS, DOC_STATUS.REJECTED].includes(this.status);
//     }

//     submit(userId) {
//         if (this.status !== DOC_STATUS.DRAFT) {
//             throw new Error("Seuls les documents en brouillon peuvent être soumis");
//         }
//         this.status = DOC_STATUS.SUBMITTED;
//         this.submittedBy = userId;
//         this.submittedAt = new Date().toISOString();
//         this.addHistoryEntry("submitted", userId, "Document soumis pour révision");
//         this.updatedAt = new Date().toISOString();
//     }

//     review(userId, action, comment = "") {
//         if (!this.canReview(this.getUserRole(userId))) {
//             throw new Error("Vous n'avez pas les permissions pour réviser ce document");
//         }
//         
//         const previousStatus = this.status;
//         
//         switch (action) {
//             case "approve":
//                 this.status = DOC_STATUS.APPROVED;
//                 this.approvedBy = userId;
//                 this.approvedAt = new Date().toISOString();
//                 break;
//             case "reject":
//                 this.status = DOC_STATUS.REJECTED;
//                 this.rejectionReason = comment;
//                 break;
//             case "observations":
//                 this.status = DOC_STATUS.OBSERVATIONS;
//                 break;
//             default:
//                 throw new Error("Action de révision invalide");
//         }
//         
//         this.addHistoryEntry(`review_${action}`, userId, comment);
//         this.updatedAt = new Date().toISOString();
//     }

//     revise(userId) {
//         if (!this.canRevise(this.getUserRole(userId))) {
//             throw new Error("Vous n'avez pas les permissions pour réviser ce document");
//         }
//         
//         this.status = DOC_STATUS.REVISED;
//         this.addHistoryEntry("revised", userId, "Document révisé");
//         this.updatedAt = new Date().toISOString();
//     }

//     getUserRole(userId, project = null) {
//         // Si un projet est fourni, utiliser le rôle effectif dans le projet
//         if (project && project.getEffectiveRole) {
//             return project.getEffectiveRole(userId);
//         }
//         // Fallback au rôle par défaut
//         return ROLES.ARCHITECT;
//     }

//     getStatusClass() {
//         const classes = {
//             [DOC_STATUS.DRAFT]: "secondary",
//             [DOC_STATUS.SUBMITTED]: "info",
//             [DOC_STATUS.UNDER_REVIEW]: "warning",
//             [DOC_STATUS.OBSERVATIONS]: "warning",
//             [DOC_STATUS.REVISED]: "info",
//             [DOC_STATUS.APPROVED]: "success",
//             [DOC_STATUS.REJECTED]: "danger"
//         };
//         return classes[this.status] || "secondary";
//     }
// }

/* ========================================
   CLASSE TASK
   ======================================== */

// class Task {
//     constructor(data = {}) {
//         this.id = data.id || generateId();
//         this.projectId = data.projectId || "";
//         this.title = data.title || "";
//         this.description = data.description || "";
//         this.status = data.status || TASK_STATUS.TODO;
//         this.priority = data.priority || PRIORITY.MEDIUM;
//         this.assignedTo = data.assignedTo || "";
//         this.assigneeName = data.assigneeName || "";
//         this.createdBy = data.createdBy || "";
//         this.dueDate = data.dueDate || null;
//         this.completedAt = data.completedAt || null;
//         this.estimatedHours = data.estimatedHours || 0;
//         this.actualHours = data.actualHours || 0;
//         this.tags = data.tags || [];
//         this.dependencies = data.dependencies || [];
//         this.attachments = data.attachments || [];
//         this.createdAt = data.createdAt || new Date().toISOString();
//         this.updatedAt = data.updatedAt || new Date().toISOString();
//     }

//     validate() {
//         const errors = [];
//         
//         if (!this.title || this.title.trim().length < 2) {
//             errors.push("Titre de la tache requis");
//         }
//         
//         if (!this.projectId) {
//             errors.push("Projet requis");
//         }
//         
//         if (!Object.values(TASK_STATUS).includes(this.status)) {
//             errors.push("Statut de tache invalide");
//         }
//         
//         if (!Object.values(PRIORITY).includes(this.priority)) {
//             errors.push("Priorite invalide");
//         }
//         
//         return errors;
//     }

//     update(data) {
//         Object.assign(this, data);
//         this.updatedAt = new Date().toISOString();
//     }

//     getStatusLabel() {
//         return getTaskStatusLabel(this.status);
//     }

//     getPriorityLabel() {
//         return getPriorityLabel(this.priority);
//     }

//     isCompleted() {
//         return this.status === TASK_STATUS.DONE;
//     }

//     // Vérifier si la tâche est en retard
//     isOverdue() {
//         if (!this.dueDate) return false;
//         return new Date(this.dueDate) < new Date();
//     }

//     // Vérifier si la tâche est proche de l'échéance (< 3 jours)
//     isDueSoon() {
//         if (!this.dueDate) return false;
//         const dueDate = new Date(this.dueDate);
//         const today = new Date();
//         const diffTime = dueDate - today;
//         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//         return diffDays <= 3 && diffDays >= 0;
//     }

//     // Obtenir le statut de la date limite
//     getDueDateStatus() {
//         if (!this.dueDate) return 'no-date';
//         if (this.isOverdue()) return 'overdue';
//         if (this.isDueSoon()) return 'due-soon';
//         return 'on-time';
//     }

//     // Formater la date limite pour l'affichage
//     getFormattedDueDate() {
//         if (!this.dueDate) return '';
//         const date = new Date(this.dueDate);
//         return date.toLocaleDateString('fr-FR', { 
//             day: '2-digit', 
//             month: '2-digit' 
//         });
//     }

//     // Obtenir la classe CSS pour le badge de date
//     getDueDateBadgeClass() {
//         const status = this.getDueDateStatus();
//         const classes = {
//             'no-date': 'badge-secondary',
//             'on-time': 'badge-success',
//             'due-soon': 'badge-warning',
//             'overdue': 'badge-danger'
//         };
//         return classes[status] || 'badge-secondary';
//     }
// }

/* ========================================
   CLASSE COMMENT
   ======================================== */

// class Comment {
//     constructor(data = {}) {
//         this.id = data.id || generateId();
//         this.projectId = data.projectId || "";
//         this.documentId = data.documentId || null;
//         this.taskId = data.taskId || null;
//         this.parentId = data.parentId || null;
//         this.content = data.content || "";
//         this.authorId = data.authorId || "";
//         this.authorName = data.authorName || "";
//         this.isEdited = data.isEdited || false;
//         this.editedAt = data.editedAt || null;
//         this.replies = data.replies || [];
//         this.attachments = data.attachments || [];
//         this.createdAt = data.createdAt || new Date().toISOString();
//         this.updatedAt = data.updatedAt || new Date().toISOString();
//     }

//     validate() {
//         const errors = [];
//         
//         if (!this.content || this.content.trim().length < 1) {
//             errors.push("Contenu du commentaire requis");
//         }
//         
//         if (!this.authorId) {
//             errors.push("Auteur requis");
//         }
//         
//         if (!this.projectId) {
//             errors.push("Projet requis");
//         }
//         
//         return errors;
//     }

//     update(data) {
//         Object.assign(this, data);
//         this.isEdited = true;
//         this.editedAt = new Date().toISOString();
//         this.updatedAt = new Date().toISOString();
//     }

//     getFormattedDate() {
//         return formatDateTime(this.createdAt);
//     }
// }

/* ========================================
   CLASSE NOTIFICATION
   ======================================== */

// class Notification {
//     constructor(data = {}) {
//         this.id = data.id || generateId();
//         this.userId = data.userId || "";
//         this.type = data.type || NOTIFICATION_TYPE.PROJECT_UPDATE;
//         this.title = data.title || "";
//         this.message = data.message || "";
//         this.projectId = data.projectId || null;
//         this.documentId = data.documentId || null;
//         this.taskId = data.taskId || null;
//         this.commentId = data.commentId || null;
//         this.isRead = data.isRead || false;
//         this.readAt = data.readAt || null;
//         this.actionUrl = data.actionUrl || null;
//         this.createdAt = data.createdAt || new Date().toISOString();
//     }

//     markAsRead() {
//         this.isRead = true;
//         this.readAt = new Date().toISOString();
//     }

//     getFormattedDate() {
//         return formatDateTime(this.createdAt);
//     }
// }

/* ========================================
   MODÈLE PASSWORD RESET
   ======================================== */

// class PasswordReset {
    constructor(data) {
        this.id = data.id || generateId();
        this.email = data.email;
        this.token = data.token || generateId();
        this.expiresAt = data.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
        this.used = data.used || false;
        this.createdAt = data.createdAt || new Date();
    }

    isExpired() {
        return new Date() > this.expiresAt;
    }

    isValid() {
        return !this.used && !this.isExpired();
    }
}

/* ========================================
   MODÈLE INVITATION
   ======================================== */

// class Invite {
    constructor(data = {}) {
        this.id = data.id || generateId();
        this.projectId = data.projectId || "";
        this.emailCible = data.emailCible || "";
        this.rolePropose = data.rolePropose || ROLES.ARCHITECT;
        this.creePar = data.creePar || ""; // ID de l'utilisateur qui a créé l'invitation
        this.status = data.status || INVITE_STATUS.PENDING;
        this.token = data.token || generateId();
        this.createdAt = data.createdAt || new Date();
        this.expiresAt = data.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // +7 jours par défaut
        this.acceptedAt = data.acceptedAt || null;
        this.cancelledAt = data.cancelledAt || null;
    }

    // Vérifier si l'invitation est expirée
    isExpired() {
        return new Date() > this.expiresAt;
    }

    // Vérifier si l'invitation est valide (non expirée et en attente)
    isValid() {
        return this.status === INVITE_STATUS.PENDING && !this.isExpired();
    }

    // Accepter l'invitation
    accept(userId) {
        if (!this.isValid()) {
            throw new Error('Invitation invalide ou expirée');
        }
        
        this.status = INVITE_STATUS.ACCEPTED;
        this.acceptedAt = new Date();
        return this;
    }

    // Annuler l'invitation
    cancel() {
        if (this.status === INVITE_STATUS.ACCEPTED) {
            throw new Error('Impossible d\'annuler une invitation déjà acceptée');
        }
        
        this.status = INVITE_STATUS.CANCELLED;
        this.cancelledAt = new Date();
        return this;
    }

    // Marquer comme expirée
    markAsExpired() {
        if (this.status === INVITE_STATUS.PENDING && this.isExpired()) {
            this.status = INVITE_STATUS.EXPIRED;
        }
        return this;
    }

    // Obtenir le statut avec libellé
    getStatusLabel() {
        const labels = {
            [INVITE_STATUS.PENDING]: 'En attente',
            [INVITE_STATUS.ACCEPTED]: 'Acceptée',
            [INVITE_STATUS.CANCELLED]: 'Annulée',
            [INVITE_STATUS.EXPIRED]: 'Expirée'
        };
        return labels[this.status] || this.status;
    }

    // Obtenir la classe CSS pour le statut
    getStatusClass() {
        const classes = {
            [INVITE_STATUS.PENDING]: 'badge-warning',
            [INVITE_STATUS.ACCEPTED]: 'badge-success',
            [INVITE_STATUS.CANCELLED]: 'badge-secondary',
            [INVITE_STATUS.EXPIRED]: 'badge-danger'
        };
        return classes[this.status] || 'badge-secondary';
    }

    // Obtenir le temps restant avant expiration
    getTimeRemaining() {
        if (this.status !== INVITE_STATUS.PENDING) {
            return null;
        }
        
        const now = new Date();
        const expires = new Date(this.expiresAt);
        const diff = expires - now;
        
        if (diff <= 0) {
            return 'Expirée';
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) {
            return `${days} jour${days > 1 ? 's' : ''} restant${days > 1 ? 's' : ''}`;
        } else if (hours > 0) {
            return `${hours} heure${hours > 1 ? 's' : ''} restante${hours > 1 ? 's' : ''}`;
        } else {
            return 'Expire bientôt';
        }
    }
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
// Export supprimé pour compatibilité directe
// Toutes les classes et constantes sont maintenant disponibles globalement
