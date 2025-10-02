/* 
========================================
DONNÉES DE DÉMONSTRATION (SEED DATA)
========================================
Role : Données d'exemple pour la démo
- Comptes utilisateurs de test
- Projet de démonstration
- Documents avec différents états
- Tâches réparties sur les colonnes
- Commentaires et notifications
========================================
*/

// Comptes utilisateurs de test
const DEMO_USERS = [
    {
        id: "demo-architect-1",
        name: "Marie Dubois",
        email: "marie.dubois@architecte.fr",
        role: "architect",
        password: "demo123",
        companyId: "demo-company-1"
    },
    {
        id: "demo-bct-1",
        name: "Pierre Martin",
        email: "pierre.martin@bct.fr",
        role: "bct",
        password: "demo123",
        companyId: "demo-company-2"
    },
    {
        id: "demo-bet-1",
        name: "Sophie Leroy",
        email: "sophie.leroy@bet.fr",
        role: "bet",
        password: "demo123",
        companyId: "demo-company-3"
    },
    {
        id: "demo-contractor-1",
        name: "Jean Bernard",
        email: "jean.bernard@entreprise.fr",
        role: "contractor",
        password: "demo123",
        companyId: "demo-company-4"
    },
    {
        id: "demo-admin-1",
        name: "Admin GECC",
        email: "admin@gecc.fr",
        role: "admin",
        password: "demo123",
        companyId: "demo-company-1"
    },
    {
        id: "demo-outsider-1",
        name: "Marie Martin",
        email: "marie.martin@externe.fr",
        role: "architect",
        password: "demo123",
        companyId: "demo-company-1"
    }
];

// Entreprises de démonstration
const DEMO_COMPANIES = [
    {
        id: "demo-company-1",
        name: "Cabinet Dubois Architecture",
        logoBase64: null,
        address: "123 Avenue des Architectes, 75001 Paris",
        website: "https://dubois-architecte.fr",
        phone: "01 23 45 67 89",
        vatNumber: "FR12345678901"
    },
    {
        id: "demo-company-2",
        name: "BCT Paris Nord",
        logoBase64: null,
        address: "456 Rue du Contrôle, 75018 Paris",
        website: "https://bct-paris-nord.fr",
        phone: "01 23 45 67 90",
        vatNumber: "FR12345678902"
    },
    {
        id: "demo-company-3",
        name: "BET Technique Plus",
        logoBase64: null,
        address: "789 Boulevard des Études, 75011 Paris",
        website: "https://bet-technique.fr",
        phone: "01 23 45 67 91",
        vatNumber: "FR12345678903"
    },
    {
        id: "demo-company-4",
        name: "Entreprise Bernard Construction",
        logoBase64: null,
        address: "321 Rue des Bâtisseurs, 75020 Paris",
        website: "https://bernard-construction.fr",
        phone: "01 23 45 67 92",
        vatNumber: "FR12345678904"
    }
];

// Projet de démonstration
const DEMO_PROJECT = {
    id: "demo-project-1",
    name: "Résidence Les Jardins du Marais",
    code: "RJM-2024",
    client: "Promoteur Immobilier ABC",
    description: "Construction d'une résidence de 24 logements avec parking souterrain",
    location: "Paris 3ème, 15 rue du Temple",
    status: "active",
    startDate: "2024-01-15",
    endDate: "2024-12-31",
    progress: 35,
    ownerId: "demo-architect-1",
    members: [
        { userId: "demo-architect-1", roleInProject: "architect", joinedAt: "2024-01-10T10:00:00.000Z" },
        { userId: "demo-bct-1", roleInProject: "bct", joinedAt: "2024-01-12T14:30:00.000Z" },
        { userId: "demo-bet-1", roleInProject: "bet", joinedAt: "2024-01-15T09:15:00.000Z" },
        { userId: "demo-contractor-1", roleInProject: "contractor", joinedAt: "2024-01-18T16:45:00.000Z" }
    ],
    createdAt: "2024-01-10T10:00:00.000Z"
};

// Deuxième projet de démonstration - Même utilisateur avec rôle différent
const DEMO_PROJECT_2 = {
    id: "demo-project-2",
    name: "Rénovation École Primaire",
    code: "REP-2024",
    client: "Mairie de Lyon",
    description: "Rénovation complète d'une école primaire avec mise aux normes",
    location: "Lyon 1er, 8 place des Terreaux",
    status: "active",
    startDate: "2024-02-01",
    endDate: "2024-08-31",
    progress: 20,
    ownerId: "demo-bet-1", // BET comme propriétaire
    members: [
        { userId: "demo-bet-1", roleInProject: "bet", joinedAt: "2024-02-01T09:00:00.000Z" },
        { userId: "demo-architect-1", roleInProject: "contractor", joinedAt: "2024-02-05T14:00:00.000Z" }, // Architecte devient Entrepreneur
        { userId: "demo-bct-1", roleInProject: "bct", joinedAt: "2024-02-10T10:30:00.000Z" },
        { userId: "demo-contractor-1", roleInProject: "architect", joinedAt: "2024-02-15T16:20:00.000Z" } // Entrepreneur devient Architecte
    ],
    createdAt: "2024-02-01T09:00:00.000Z"
};

// Documents de démonstration
const DEMO_DOCUMENTS = [
    {
        id: "demo-doc-1",
        projectId: "demo-project-1",
        name: "Plan architectural - Niveau RDC",
        type: "plan_architectural",
        targetRoles: ["bct", "bet"],
        status: "approved",
        submittedBy: "demo-architect-1",
        submittedAt: "2024-01-20T14:30:00.000Z",
        fileName: "plan-rdc.pdf",
        fileSize: 2048576,
        fileType: "application/pdf",
        history: [
            {
                action: "created",
                userId: "demo-architect-1",
                timestamp: "2024-01-20T14:30:00.000Z",
                comment: "Création du plan architectural"
            },
            {
                action: "submitted",
                userId: "demo-architect-1",
                timestamp: "2024-01-20T15:00:00.000Z",
                comment: "Soumission pour validation"
            },
            {
                action: "approved",
                userId: "demo-bct-1",
                timestamp: "2024-01-22T09:15:00.000Z",
                comment: "Plan conforme aux normes"
            }
        ]
    },
    {
        id: "demo-doc-2",
        projectId: "demo-project-1",
        name: "Rapport technique - Fondations",
        type: "rapport_technique",
        targetRoles: ["bct", "contractor"],
        status: "observations",
        submittedBy: "demo-bet-1",
        submittedAt: "2024-01-25T11:20:00.000Z",
        fileName: "rapport-fondations.pdf",
        fileSize: 1536000,
        fileType: "application/pdf",
        history: [
            {
                action: "created",
                userId: "demo-bet-1",
                timestamp: "2024-01-25T11:20:00.000Z",
                comment: "Rapport technique des fondations"
            },
            {
                action: "submitted",
                userId: "demo-bet-1",
                timestamp: "2024-01-25T12:00:00.000Z",
                comment: "Soumission pour validation"
            },
            {
                action: "observations",
                userId: "demo-bct-1",
                timestamp: "2024-01-26T16:45:00.000Z",
                comment: "Précisions nécessaires sur les calculs de portance"
            }
        ]
    },
    {
        id: "demo-doc-3",
        projectId: "demo-project-1",
        name: "Cahier des charges - Électricité",
        type: "cahier_charges",
        targetRoles: ["contractor"],
        status: "draft",
        submittedBy: "demo-architect-1",
        submittedAt: "2024-01-28T09:00:00.000Z",
        fileName: "cahier-electricite.pdf",
        fileSize: 1024000,
        fileType: "application/pdf",
        history: [
            {
                action: "created",
                userId: "demo-architect-1",
                timestamp: "2024-01-28T09:00:00.000Z",
                comment: "Cahier des charges en cours de rédaction"
            }
        ]
    },
    {
        id: "demo-doc-4",
        projectId: "demo-project-1",
        name: "PV de contrôle - Fondations",
        type: "pv_controle",
        targetRoles: ["bct"],
        status: "approved",
        submittedBy: "demo-bct-1",
        submittedAt: "2024-01-30T10:00:00.000Z",
        fileName: "pv-controle-fondations.pdf",
        fileSize: 512000,
        fileType: "application/pdf",
        history: [
            {
                action: "created",
                userId: "demo-bct-1",
                timestamp: "2024-01-30T10:00:00.000Z",
                comment: "PV de contrôle des fondations"
            },
            {
                action: "approved",
                userId: "demo-architect-1",
                timestamp: "2024-01-30T14:30:00.000Z",
                comment: "Contrôle validé"
            }
        ]
    },
    {
        id: "demo-doc-5",
        projectId: "demo-project-1",
        name: "Attestation de suivi - Gros œuvre",
        type: "attestation_suivi",
        targetRoles: ["architect", "bct"],
        status: "submitted",
        submittedBy: "demo-contractor-1",
        submittedAt: "2024-02-01T09:00:00.000Z",
        fileName: "attestation-gros-oeuvre.pdf",
        fileSize: 256000,
        fileType: "application/pdf",
        history: [
            {
                action: "created",
                userId: "demo-contractor-1",
                timestamp: "2024-02-01T09:00:00.000Z",
                comment: "Attestation de suivi des travaux"
            }
        ]
    },
    {
        id: "demo-doc-6",
        projectId: "demo-project-1",
        name: "Photo avant travaux - Terrain",
        type: "photo_avant",
        targetRoles: ["architect", "bct", "bet"],
        status: "approved",
        submittedBy: "demo-architect-1",
        submittedAt: "2024-01-10T08:00:00.000Z",
        fileName: "photo-terrain-avant.jpg",
        fileSize: 1024000,
        fileType: "image/jpeg",
        history: [
            {
                action: "created",
                userId: "demo-architect-1",
                timestamp: "2024-01-10T08:00:00.000Z",
                comment: "Photo de l'état initial du terrain"
            }
        ]
    }
];

// Tâches de démonstration
const DEMO_TASKS = [
    {
        id: "demo-task-1",
        projectId: "demo-project-1",
        title: "Finaliser les plans d'exécution",
        description: "Compléter les détails d'exécution pour le niveau RDC",
        status: "in_progress",
        priority: "high",
        assignedTo: "demo-architect-1",
        assigneeName: "Marie Dubois",
        createdBy: "demo-architect-1",
        createdAt: "2024-01-15T10:00:00.000Z",
        dueDate: "2024-02-15"
    },
    {
        id: "demo-task-2",
        projectId: "demo-project-1",
        title: "Contrôle des fondations",
        description: "Vérification de la conformité des fondations",
        status: "review",
        priority: "high",
        assignedTo: "demo-bct-1",
        assigneeName: "Jean Martin",
        createdBy: "demo-architect-1",
        createdAt: "2024-01-20T14:00:00.000Z",
        dueDate: "2024-02-01"
    },
    {
        id: "demo-task-3",
        projectId: "demo-project-1",
        title: "Calculs de structure",
        description: "Dimensionnement des éléments porteurs",
        status: "todo",
        priority: "medium",
        assignedTo: "demo-bet-1",
        assigneeName: "Sophie Leroy",
        createdBy: "demo-architect-1",
        createdAt: "2024-01-22T09:00:00.000Z",
        dueDate: "2024-02-20"
    },
    {
        id: "demo-task-4",
        projectId: "demo-project-1",
        title: "Préparation du chantier",
        description: "Installation des équipements et clôtures",
        status: "done",
        priority: "medium",
        assignedTo: "demo-contractor-1",
        assigneeName: "Pierre Durand",
        createdBy: "demo-architect-1",
        createdAt: "2024-01-10T08:00:00.000Z",
        dueDate: "2024-01-25"
    },
    {
        id: "demo-task-5",
        projectId: "demo-project-1",
        title: "Commande des matériaux",
        description: "Passation des commandes pour le gros œuvre",
        status: "todo",
        priority: "low",
        assignedTo: "demo-contractor-1",
        assigneeName: "Pierre Durand",
        createdBy: "demo-architect-1",
        createdAt: "2024-01-25T11:00:00.000Z",
        dueDate: "2024-02-10"
    },
    {
        id: "demo-task-6",
        projectId: "demo-project-1",
        title: "Révision du rapport technique",
        description: "Intégrer les observations du BCT",
        status: "in_progress",
        priority: "high",
        assignedTo: "demo-bet-1",
        assigneeName: "Sophie Leroy",
        createdBy: "demo-architect-1",
        createdAt: "2024-01-28T09:00:00.000Z",
        dueDate: "2024-01-30" // Échéance proche
    },
    {
        id: "demo-task-7",
        projectId: "demo-project-1",
        title: "⚠️ Tâche en retard - Validation plans",
        description: "Cette tâche est en retard pour tester l'affichage",
        status: "todo",
        priority: "urgent",
        assignedTo: "demo-architect-1",
        assigneeName: "Marie Dubois",
        createdBy: "demo-architect-1",
        createdAt: "2024-01-15T10:00:00.000Z",
        dueDate: "2024-01-20" // Date passée - en retard
    },
    {
        id: "demo-task-8",
        projectId: "demo-project-1",
        title: "Tâche future - Réception des travaux",
        description: "Réception finale des travaux",
        status: "todo",
        priority: "medium",
        assignedTo: "demo-architect-1",
        assigneeName: "Marie Dubois",
        createdBy: "demo-architect-1",
        createdAt: "2024-01-28T09:00:00.000Z",
        dueDate: "2024-03-15" // Date future - dans les temps
    },
    {
        id: "demo-task-9",
        projectId: "demo-project-1",
        title: "Tâche sans date limite",
        description: "Cette tâche n'a pas de date limite définie",
        status: "todo",
        priority: "low",
        assignedTo: "demo-contractor-1",
        assigneeName: "Pierre Durand",
        createdBy: "demo-architect-1",
        createdAt: "2024-01-28T09:00:00.000Z"
        // Pas de dueDate pour tester l'affichage sans date
    },
    {
        id: "demo-task-10",
        projectId: "demo-project-1",
        title: "Tâche terminée",
        description: "Cette tâche est déjà terminée",
        status: "done",
        priority: "high",
        assignedTo: "demo-bet-1",
        assigneeName: "Sophie Leroy",
        createdBy: "demo-bct-1",
        createdAt: "2024-01-26T17:00:00.000Z",
        dueDate: "2024-02-05"
    }
];

// Commentaires de démonstration
const DEMO_COMMENTS = [
    {
        id: "demo-comment-1",
        projectId: "demo-project-1",
        authorId: "demo-architect-1",
        content: "Bonjour à tous, j'ai soumis le plan architectural du RDC. Merci de votre retour.",
        authorName: "Marie Dubois",
        createdAt: "2024-01-20T15:30:00.000Z"
    },
    {
        id: "demo-comment-2",
        projectId: "demo-project-1",
        authorId: "demo-bct-1",
        content: "Le plan est conforme, validation accordée. Bon travail !",
        authorName: "Jean Martin",
        createdAt: "2024-01-22T09:30:00.000Z"
    },
    {
        id: "demo-comment-3",
        projectId: "demo-project-1",
        authorId: "demo-bet-1",
        content: "J'ai quelques questions sur les calculs de portance. Je vais vous envoyer un rapport détaillé.",
        authorName: "Sophie Leroy",
        createdAt: "2024-01-25T12:30:00.000Z"
    },
    {
        id: "demo-comment-4",
        projectId: "demo-project-1",
        authorId: "demo-contractor-1",
        content: "Le chantier est prêt, nous pouvons commencer les travaux de fondation.",
        authorName: "Marc Durand",
        createdAt: "2024-01-26T08:00:00.000Z"
    }
];

// Notifications de démonstration
const DEMO_NOTIFICATIONS = [
    {
        id: "demo-notif-1",
        userId: "demo-architect-1",
        type: "document_approved",
        title: "Document approuvé",
        message: "Le plan architectural - Niveau RDC a été approuvé par Pierre Martin (BCT)",
        projectId: "demo-project-1",
        documentId: "demo-doc-1",
        isRead: false,
        createdAt: "2024-01-22T09:15:00.000Z"
    },
    {
        id: "demo-notif-2",
        userId: "demo-bet-1",
        type: "document_observations",
        title: "Document avec observations",
        message: "Le rapport technique - Fondations nécessite des précisions",
        projectId: "demo-project-1",
        documentId: "demo-doc-2",
        isRead: false,
        createdAt: "2024-01-26T16:45:00.000Z"
    },
    {
        id: "demo-notif-3",
        userId: "demo-contractor-1",
        type: "task_assigned",
        title: "Nouvelle tâche assignée",
        message: "Commande des matériaux vous a été assignée",
        projectId: "demo-project-1",
        taskId: "demo-task-5",
        isRead: true,
        createdAt: "2024-01-25T11:00:00.000Z"
    }
];

// Export des données de démonstration
export {
    DEMO_USERS,
    DEMO_COMPANIES,
    DEMO_PROJECT,
    DEMO_PROJECT_2,
    DEMO_DOCUMENTS,
    DEMO_TASKS,
    DEMO_COMMENTS,
    DEMO_NOTIFICATIONS
};
