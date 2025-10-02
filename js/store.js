/* 
========================================
STOCKAGE LOCAL GECC - LOCALSTORAGE REPO
========================================
Rôle : Gestion du stockage local des données
- CRUD pour tous les modèles
- Gestion des sessions
- Génération d'ID
- Notifications et journal

⚠️  LIMITES DE SÉCURITÉ DU MVP ⚠️
Ce module utilise localStorage (non sécurisé pour la production)
========================================
*/

// Import supprimé pour compatibilité directe
// Les classes sont maintenant disponibles globalement

// Définition simple des classes nécessaires
class User {
    constructor(data = {}) {
        this.id = data.id || Date.now().toString();
        this.name = data.name || data.fullName || '';
        this.fullName = data.fullName || data.name || '';
        this.email = data.email || '';
        this.password = data.password || '';
        this.role = data.role || 'architect';
        this.company = data.company || '';
        this.isActive = data.isActive !== undefined ? data.isActive : true;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }
    
    validate() {
        const errors = [];
        if (!this.email || this.email.trim().length === 0) {
            errors.push("Email requis");
        }
        if (!this.name || this.name.trim().length < 2) {
            errors.push("Nom requis");
        }
        if (!this.password || this.password.length < 6) {
            errors.push("Mot de passe doit contenir au moins 6 caractères");
        }
        return errors;
    }
}

class Project {
    constructor(data = {}) {
        this.id = data.id || Date.now().toString();
        this.name = data.name || '';
        this.description = data.description || '';
        this.status = data.status || 'active';
        this.ownerId = data.ownerId || '';
        this.members = data.members || [];
        this.createdAt = data.createdAt || new Date().toISOString();
    }
    
    validate() {
        const errors = [];
        if (!this.name || this.name.trim().length < 2) {
            errors.push("Nom du projet requis");
        }
        return errors;
    }
    
    getEffectiveRole(userId) {
        // Vérifier si l'utilisateur est le propriétaire
        if (this.ownerId === userId) {
            return 'owner';
        }
        
        // Vérifier si l'utilisateur est membre du projet
        const member = this.members.find(m => m.userId === userId);
        if (member) {
            return member.role || 'member';
        }
        
        // Par défaut, pas de rôle
        return null;
    }
}

class Document {
    constructor(data = {}) {
        this.id = data.id || Date.now().toString();
        this.name = data.name || '';
        this.type = data.type || '';
        this.status = data.status || 'pending';
        this.projectId = data.projectId || '';
        this.fileName = data.fileName || '';
        this.fileSize = data.fileSize || 0;
        this.fileType = data.fileType || '';
        this.fileBase64 = data.fileBase64 || null;
        this.externalUrl = data.externalUrl || '';
        this.targetRoles = data.targetRoles || [];
        this.submittedBy = data.submittedBy || '';
        this.submittedAt = data.submittedAt || null;
        this.createdAt = data.createdAt || new Date().toISOString();
    }
    
    validate() {
        const errors = [];
        if (!this.name || this.name.trim().length < 2) {
            errors.push("Nom du document requis");
        }
        if (!this.projectId) {
            errors.push("Projet requis");
        }
        return errors;
    }
}

class Task {
    constructor(data = {}) {
        this.id = data.id || Date.now().toString();
        this.title = data.title || '';
        this.description = data.description || '';
        this.status = data.status || 'pending';
        this.createdAt = data.createdAt || new Date().toISOString();
    }
}

class Comment {
    constructor(data = {}) {
        this.id = data.id || Date.now().toString();
        this.content = data.content || '';
        this.createdAt = data.createdAt || new Date().toISOString();
    }
}

class Notification {
    constructor(data = {}) {
        this.id = data.id || Date.now().toString();
        this.title = data.title || '';
        this.message = data.message || '';
        this.type = data.type || 'info';
        this.read = data.read || false;
        this.createdAt = data.createdAt || new Date().toISOString();
    }
}

class Invite {
    constructor(data = {}) {
        this.id = data.id || Date.now().toString();
        this.email = data.email || '';
        this.status = data.status || 'pending';
        this.createdAt = data.createdAt || new Date().toISOString();
    }
}

// Constantes nécessaires
const ROLES = {
    ARCHITECT: 'architect',
    BCT: 'bct',
    BET: 'bet',
    ENTERPRISE: 'entreprise',
    ADMIN: 'admin'
};

const PROJECT_STATUS = {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    ON_HOLD: 'on_hold',
    CANCELLED: 'cancelled'
};

const DOC_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
};

const TASK_STATUS = {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed'
};

const PRIORITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
};

const DOCUMENT_TYPES = {
    PLAN: 'plan',
    PERMIT: 'permit',
    REPORT: 'report',
    OTHER: 'other'
};

const NOTIFICATION_TYPE = {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    SUCCESS: 'success'
};

const INVITE_STATUS = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected'
};

const PROJECT_VISIBILITY = {
    PUBLIC: 'public',
    PRIVATE: 'private',
    RESTRICTED: 'restricted'
};

// Fonction utilitaire
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

/* ========================================
   CLASSE PRINCIPALE DE STOCKAGE
   ======================================== */

class LocalRepository {
    constructor() {
        this.storageKey = 'gecc_data';
        this.sessionKey = 'gecc_session';
        this.data = null;
        this.currentUser = null;
        this.init();
    }

    // Initialisation du stockage
    init() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.data = JSON.parse(stored);
            } else {
                this.data = {
                    users: [],
                    projects: [],
                    documents: [],
                    tasks: [],
                    comments: [],
                    notifications: [],
                    invitations: [],
                    companies: [],
                    journal: [],
                    passwordResets: []
                };
                this.save();
                
                // Charger les données de démonstration si aucune donnée n'existe
                this.loadDemoData();
            }
            
            // Initialiser le journal s'il n'existe pas
            if (!this.data.journal) {
                this.data.journal = [];
            }
            
            // Initialiser les entreprises s'il n'existe pas
            if (!this.data.companies) {
                this.data.companies = [];
            }
            
            // Charger les données de démonstration SEULEMENT si c'est la première fois
            if (this.data.users.length === 0 && this.data.projects.length === 0 && !localStorage.getItem('gecc_demo_loaded')) {
                console.log('🔄 Premier chargement - Chargement des données de démonstration...');
                this.loadDemoData();
                localStorage.setItem('gecc_demo_loaded', 'true');
            }
            
            // Initialiser les réinitialisations de mot de passe s'il n'existe pas
            if (!this.data.passwordResets) {
                this.data.passwordResets = [];
            }
            
            // Charger la session actuelle
            this.loadSession();
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du stockage:', error);
            this.data = {
                users: [],
                projects: [],
                documents: [],
                tasks: [],
                comments: [],
                notifications: [],
                invitations: [],
                companies: [],
                journal: []
            };
        }
    }

    // Sauvegarder les donnees
    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    }

    // Charger la session
    loadSession() {
        try {
            const session = localStorage.getItem(this.sessionKey);
            if (session) {
                const sessionData = JSON.parse(session);
                this.currentUser = this.getUser(sessionData.userId);
            }
        } catch (error) {
            console.error('Erreur lors du chargement de la session:', error);
        }
    }

    // Sauvegarder la session
    saveSession(userId) {
        try {
            const sessionData = {
                userId: userId,
                loginAt: new Date().toISOString()
            };
            localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
            this.currentUser = this.getUser(userId);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de la session:', error);
        }
    }

    // Supprimer la session (deconnexion)
    clearSession() {
        try {
            localStorage.removeItem(this.sessionKey);
            this.currentUser = null;
        } catch (error) {
            console.error('Erreur lors de la suppression de la session:', error);
        }
    }

    // Obtenir l'utilisateur actuel
    getCurrentUser() {
        if (!this.currentUser) {
            // Vérifier d'abord la session active
            const sessionData = localStorage.getItem('currentSession');
            if (sessionData) {
                try {
                    const session = JSON.parse(sessionData);
                    this.currentUser = this.getUser(session.id);
                    if (this.currentUser) {
                        console.log('👤 Session active trouvée:', this.currentUser.name);
                        return this.currentUser;
                    }
                } catch (error) {
                    console.error('Erreur lors de la lecture de la session:', error);
                }
            }
            
            // Créer un utilisateur par défaut seulement si aucune session n'existe
            this.currentUser = this.createUser({
                email: 'visiteur@gecc.com',
                password: 'visiteur123',
                fullName: 'Visiteur GECC',
                role: 'architect',
                company: 'GECC Project',
                isActive: true
            });
            this.saveSession(this.currentUser.id);
        }
        return this.currentUser;
    }

    // Définir l'utilisateur actuel
    setCurrentUser(user) {
        this.currentUser = user;
        if (user) {
            this.saveSession(user.id);
        } else {
            this.clearSession();
        }
    }

    // Verifier si un utilisateur est connecte
    // Plus de vérification de connexion nécessaire

    /* ========================================
       GESTION DES UTILISATEURS
       ======================================== */

    // Creer un utilisateur
    createUser(userData) {
        const user = new User(userData);
        const errors = user.validate();
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
        
        // Verifier que l'email n'existe pas deja
        if (this.getUserByEmail(user.email)) {
            throw new Error('Un utilisateur avec cet email existe deja');
        }
        
        this.data.users.push(user);
        this.save();
        return user;
    }

    // Obtenir un utilisateur par ID
    getUser(userId) {
        const userData = this.data.users.find(u => u.id === userId);
        return userData ? new User(userData) : null;
    }

    // Obtenir un utilisateur par email
    getUserByEmail(email) {
        const userData = this.data.users.find(u => u.email === email);
        return userData ? new User(userData) : null;
    }

    /**
     * Obtient le rôle d'un utilisateur dans un projet spécifique
     * Retourne le rôle dans le projet (roleInProject) ou le rôle global en fallback
     */
    getUserRoleInProject(userId, projectId) {
        const project = this.getProject(projectId);
        if (!project) {
            return null;
        }

        // Vérifier si l'utilisateur est le propriétaire du projet
        if (project.ownerId === userId) {
            return 'owner';
        }

        // Chercher le membre dans le projet
        const member = project.members.find(member => member.userId === userId);
        if (member && member.roleInProject) {
            return member.roleInProject;
        }

        // Fallback au rôle global de l'utilisateur
        const user = this.getUser(userId);
        return user ? user.role : null;
    }

    // Mettre a jour un utilisateur
    updateUser(userId, updateData) {
        const userIndex = this.data.users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            throw new Error('Utilisateur non trouve');
        }
        
        const user = new User(this.data.users[userIndex]);
        user.update(updateData);
        
        const errors = user.validate();
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
        
        this.data.users[userIndex] = user;
        this.save();
        
        // Mettre a jour l'utilisateur actuel si c'est lui
        if (this.currentUser && this.currentUser.id === userId) {
            this.currentUser = user;
        }
        
        return user;
    }

    // Supprimer un utilisateur
    deleteUser(userId) {
        const userIndex = this.data.users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            throw new Error('Utilisateur non trouve');
        }
        
        this.data.users.splice(userIndex, 1);
        this.save();
        
        // Deconnecter si c'est l'utilisateur actuel
        if (this.currentUser && this.currentUser.id === userId) {
            this.clearSession();
        }
        
        return true;
    }

    // Obtenir tous les utilisateurs
    getAllUsers() {
        return this.data.users.map(userData => new User(userData));
    }

    // Plus d'authentification nécessaire - utilisateur par défaut créé automatiquement

    // Navigation vers l'accueil (remplace la déconnexion)
    logout() {
        // Rediriger vers la page d'accueil au lieu de déconnecter
        window.location.href = 'landing.html';
        return true;
    }

    /* ========================================
       GESTION DES PROJETS
       ======================================== */

    // Creer un projet
    createProject(projectData) {
        const project = new Project(projectData);
        const errors = project.validate();
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
        
        this.data.projects.push(project);
        this.save();
        return project;
    }

    // Obtenir un projet par ID
    getProject(projectId) {
        const projectData = this.data.projects.find(p => p.id === projectId);
        return projectData ? new Project(projectData) : null;
    }

    // Mettre a jour un projet
    updateProject(projectId, updateData) {
        const projectIndex = this.data.projects.findIndex(p => p.id === projectId);
        if (projectIndex === -1) {
            throw new Error('Projet non trouve');
        }
        
        const project = new Project(this.data.projects[projectIndex]);
        project.update(updateData);
        
        const errors = project.validate();
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
        
        this.data.projects[projectIndex] = project;
        this.save();
        return project;
    }

    // Supprimer un projet
    deleteProject(projectId) {
        const projectIndex = this.data.projects.findIndex(p => p.id === projectId);
        if (projectIndex === -1) {
            throw new Error('Projet non trouve');
        }
        
        this.data.projects.splice(projectIndex, 1);
        
        // Supprimer les documents, taches et commentaires associes
        this.data.documents = this.data.documents.filter(d => d.projectId !== projectId);
        this.data.tasks = this.data.tasks.filter(t => t.projectId !== projectId);
        this.data.comments = this.data.comments.filter(c => c.projectId !== projectId);
        
        this.save();
        return true;
    }

    // Obtenir tous les projets
    getAllProjects() {
        return this.data.projects.map(projectData => new Project(projectData));
    }

    // Obtenir les projets d'un utilisateur
    getUserProjects(userId) {
        return this.data.projects
            .filter(p => p.ownerId === userId || (p.members && p.members.some(m => m.userId === userId)))
            .map(projectData => new Project(projectData));
    }

    /* ========================================
       GESTION DES DOCUMENTS
       ======================================== */

    // Creer un document
    createDocument(documentData) {
        const document = new Document(documentData);
        const errors = document.validate();
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
        
        this.data.documents.push(document);
        this.save();
        return document;
    }

    // Obtenir un document par ID
    getDocument(documentId) {
        const documentData = this.data.documents.find(d => d.id === documentId);
        return documentData ? new Document(documentData) : null;
    }

    // Obtenir tous les documents d'un projet
    getDocumentsByProject(projectId) {
        return this.data.documents
            .filter(d => d.projectId === projectId)
            .map(documentData => new Document(documentData));
    }

    // Mettre a jour un document
    updateDocument(document) {
        const documentIndex = this.data.documents.findIndex(d => d.id === document.id);
        if (documentIndex === -1) {
            throw new Error('Document non trouve');
        }
        
        const errors = document.validate();
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
        
        this.data.documents[documentIndex] = document;
        this.save();
        return document;
    }

    // Supprimer un document
    deleteDocument(documentId) {
        const documentIndex = this.data.documents.findIndex(d => d.id === documentId);
        if (documentIndex === -1) {
            throw new Error('Document non trouve');
        }
        
        this.data.documents.splice(documentIndex, 1);
        this.save();
        return true;
    }

    // Obtenir les documents d'un projet
    getProjectDocuments(projectId) {
        return this.data.documents
            .filter(d => d.projectId === projectId)
            .map(documentData => new Document(documentData));
    }

    // Obtenir tous les documents
    getAllDocuments() {
        return this.data.documents.map(documentData => new Document(documentData));
    }

    // Obtenir les documents d'un utilisateur (basé sur les projets auxquels il participe)
    getUserDocuments(userId) {
        // Récupérer tous les projets de l'utilisateur
        const userProjects = this.getUserProjects(userId);
        const projectIds = userProjects.map(p => p.id);
        
        // Récupérer tous les documents de ces projets
        return this.data.documents
            .filter(d => projectIds.includes(d.projectId))
            .map(documentData => new Document(documentData));
    }

    /* ========================================
       GESTION DES TACHES
       ======================================== */

    // Creer une tache
    createTask(taskData) {
        const task = new Task(taskData);
        const errors = task.validate();
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
        
        this.data.tasks.push(task);
        this.save();
        return task;
    }

    // Obtenir une tache par ID
    getTask(taskId) {
        const taskData = this.data.tasks.find(t => t.id === taskId);
        return taskData ? new Task(taskData) : null;
    }

    // Mettre a jour une tache
    updateTask(taskId, updateData) {
        const taskIndex = this.data.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) {
            throw new Error('Tache non trouvee');
        }
        
        const task = new Task(this.data.tasks[taskIndex]);
        task.update(updateData);
        
        const errors = task.validate();
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
        
        this.data.tasks[taskIndex] = task;
        this.save();
        return task;
    }

    // Supprimer une tache
    deleteTask(taskId) {
        const taskIndex = this.data.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) {
            throw new Error('Tache non trouvee');
        }
        
        this.data.tasks.splice(taskIndex, 1);
        this.save();
        return true;
    }

    // Obtenir toutes les taches d'un projet
    getTasksByProject(projectId) {
        return this.data.tasks
            .filter(t => t.projectId === projectId)
            .map(taskData => new Task(taskData));
    }

    // ========================================
    // COMMENTAIRES
    // ========================================

    // Obtenir tous les commentaires d'un projet
    getCommentsByProject(projectId) {
        return this.data.comments
            .filter(c => c.projectId === projectId)
            .map(commentData => new Comment(commentData));
    }

    // Obtenir les taches d'un projet
    getProjectTasks(projectId) {
        return this.data.tasks
            .filter(t => t.projectId === projectId)
            .map(taskData => new Task(taskData));
    }

    // Obtenir toutes les taches
    getAllTasks() {
        return this.data.tasks.map(taskData => new Task(taskData));
    }

    /* ========================================
       GESTION DES COMMENTAIRES
       ======================================== */

    // Creer un commentaire
    createComment(commentData) {
        const comment = new Comment(commentData);
        const errors = comment.validate();
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
        
        this.data.comments.push(comment);
        this.save();
        return comment;
    }

    // Obtenir un commentaire par ID
    getComment(commentId) {
        const commentData = this.data.comments.find(c => c.id === commentId);
        return commentData ? new Comment(commentData) : null;
    }

    // Mettre a jour un commentaire
    updateComment(commentId, updateData) {
        const commentIndex = this.data.comments.findIndex(c => c.id === commentId);
        if (commentIndex === -1) {
            throw new Error('Commentaire non trouve');
        }
        
        const comment = new Comment(this.data.comments[commentIndex]);
        comment.update(updateData);
        
        const errors = comment.validate();
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
        
        this.data.comments[commentIndex] = comment;
        this.save();
        return comment;
    }

    // Supprimer un commentaire
    deleteComment(commentId) {
        const commentIndex = this.data.comments.findIndex(c => c.id === commentId);
        if (commentIndex === -1) {
            throw new Error('Commentaire non trouve');
        }
        
        this.data.comments.splice(commentIndex, 1);
        this.save();
        return true;
    }

    // Obtenir les commentaires d'un projet
    getProjectComments(projectId) {
        return this.data.comments
            .filter(c => c.projectId === projectId)
            .map(commentData => new Comment(commentData));
    }

    // Obtenir tous les commentaires
    getAllComments() {
        return this.data.comments.map(commentData => new Comment(commentData));
    }

    /* ========================================
       GESTION DES NOTIFICATIONS
       ======================================== */

    // Creer une notification
    createNotification(notificationData) {
        const notification = new Notification(notificationData);
        this.data.notifications.push(notification);
        this.save();
        return notification;
    }

    // Obtenir une notification par ID
    getNotification(notificationId) {
        const notificationData = this.data.notifications.find(n => n.id === notificationId);
        return notificationData ? new Notification(notificationData) : null;
    }

    // Obtenir toutes les notifications d'un utilisateur
    getNotificationsByUser(userId) {
        return this.data.notifications
            .filter(n => n.userId === userId)
            .map(notificationData => new Notification(notificationData))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Obtenir le nombre de notifications non lues d'un utilisateur
    getUnreadNotificationsCount(userId) {
        return this.data.notifications.filter(n => n.userId === userId && !n.isRead).length;
    }

    // ========================================
    // FONCTIONS DE SEED (DONNÉES DE DÉMO)
    // ========================================

    /**
     * Charge les données de démonstration
     */
    async loadDemoData() {
        try {
            // Importer les données de démonstration
            // Import dynamique supprimé pour compatibilité directe
            // Les données de démo sont maintenant définies directement
            const DEMO_USERS = [
                {
                    id: 'demo-architect-1',
                    name: 'Marie Dubois',
                    email: 'architecte@demo.com',
                    password: 'demo123',
                    role: 'architect',
                    company: 'Architecture Dubois',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'demo-bct-1',
                    name: 'Jean Martin',
                    email: 'bct@demo.com',
                    password: 'demo123',
                    role: 'bct',
                    company: 'BCT Martin',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'demo-bet-1',
                    name: 'Sophie Leroy',
                    email: 'bet@demo.com',
                    password: 'demo123',
                    role: 'bet',
                    company: 'BET Leroy',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'demo-contractor-1',
                    name: 'Pierre Moreau',
                    email: 'entreprise@demo.com',
                    password: 'demo123',
                    role: 'contractor',
                    company: 'Entreprise Moreau',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'demo-admin-1',
                    name: 'Admin GECC',
                    email: 'admin@demo.com',
                    password: 'demo123',
                    role: 'admin',
                    company: 'GECC',
                    createdAt: new Date().toISOString()
                }
            ];
            const DEMO_COMPANIES = [];
            const DEMO_PROJECT = {
                id: 'demo-project-1',
                name: 'Résidence Les Jardins',
                description: 'Construction d\'une résidence de 20 logements avec parking souterrain',
                status: 'active',
                ownerId: 'demo-architect-1',
                members: [
                    { userId: 'demo-architect-1', roleInProject: 'architect', joinedAt: new Date().toISOString() },
                    { userId: 'demo-bct-1', roleInProject: 'bct', joinedAt: new Date().toISOString() },
                    { userId: 'demo-bet-1', roleInProject: 'bet', joinedAt: new Date().toISOString() },
                    { userId: 'demo-contractor-1', roleInProject: 'contractor', joinedAt: new Date().toISOString() }
                ],
                startDate: '2024-01-15',
                endDate: '2024-12-31',
                budget: 2500000,
                location: 'Paris 15ème',
                client: 'Promoteur Immobilier SA',
                type: 'Résidentiel',
                progress: 35,
                createdAt: new Date().toISOString()
            };
            
            const DEMO_PROJECT_2 = {
                id: 'demo-project-2',
                name: 'Bureaux Technopole',
                description: 'Construction de bureaux modernes pour une entreprise tech',
                status: 'active',
                ownerId: 'demo-architect-1',
                members: [
                    { userId: 'demo-architect-1', roleInProject: 'architect', joinedAt: new Date().toISOString() },
                    { userId: 'demo-bct-1', roleInProject: 'bct', joinedAt: new Date().toISOString() }
                ],
                startDate: '2024-03-01',
                endDate: '2024-10-15',
                budget: 1800000,
                location: 'La Défense',
                client: 'TechCorp',
                type: 'Tertiaire',
                progress: 15,
                createdAt: new Date().toISOString()
            };
            const DEMO_DOCUMENTS = [
                {
                    id: 'demo-doc-1',
                    projectId: 'demo-project-1',
                    name: 'Plan architectural RDC',
                    description: 'Plan du rez-de-chaussée avec aménagements',
                    type: 'plan_architectural',
                    status: 'approved',
                    fileName: 'plan_rdc.pdf',
                    fileSize: 2048000,
                    fileType: 'application/pdf',
                    version: 1,
                    submittedBy: 'demo-architect-1',
                    submittedAt: new Date().toISOString(),
                    approvedBy: 'demo-bct-1',
                    approvedAt: new Date().toISOString(),
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'demo-doc-2',
                    projectId: 'demo-project-1',
                    name: 'Rapport de contrôle structure',
                    description: 'Rapport de contrôle technique de la structure',
                    type: 'rapport_controle',
                    status: 'submitted',
                    fileName: 'rapport_structure.pdf',
                    fileSize: 1536000,
                    fileType: 'application/pdf',
                    version: 1,
                    submittedBy: 'demo-bet-1',
                    submittedAt: new Date().toISOString(),
                    createdAt: new Date().toISOString()
                }
            ];
            const DEMO_TASKS = [
                {
                    id: 'demo-task-1',
                    projectId: 'demo-project-1',
                    title: 'Finaliser les plans d\'exécution',
                    description: 'Compléter les plans d\'exécution pour le RDC',
                    status: 'in_progress',
                    priority: 'high',
                    assignedTo: 'demo-architect-1',
                    assigneeName: 'Marie Dubois',
                    createdBy: 'demo-architect-1',
                    dueDate: '2024-02-15',
                    estimatedHours: 40,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'demo-task-2',
                    projectId: 'demo-project-1',
                    title: 'Contrôle technique structure',
                    description: 'Effectuer le contrôle technique de la structure',
                    status: 'todo',
                    priority: 'medium',
                    assignedTo: 'demo-bct-1',
                    assigneeName: 'Jean Martin',
                    createdBy: 'demo-architect-1',
                    dueDate: '2024-02-20',
                    estimatedHours: 16,
                    createdAt: new Date().toISOString()
                }
            ];
            const DEMO_COMMENTS = [];
            const DEMO_NOTIFICATIONS = [
                {
                    id: 'demo-notif-1',
                    userId: 'demo-architect-1',
                    type: 'document_approved',
                    title: 'Document approuvé',
                    message: 'Le plan architectural RDC a été approuvé par le BCT',
                    projectId: 'demo-project-1',
                    documentId: 'demo-doc-1',
                    isRead: false,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'demo-notif-2',
                    userId: 'demo-bct-1',
                    type: 'document_submitted',
                    title: 'Nouveau document soumis',
                    message: 'Un rapport de contrôle structure a été soumis',
                    projectId: 'demo-project-1',
                    documentId: 'demo-doc-2',
                    isRead: false,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'demo-notif-3',
                    userId: 'demo-architect-1',
                    type: 'task_assigned',
                    title: 'Nouvelle tâche assignée',
                    message: 'Vous avez une nouvelle tâche : Finaliser les plans d\'exécution',
                    projectId: 'demo-project-1',
                    taskId: 'demo-task-1',
                    isRead: true,
                    createdAt: new Date().toISOString()
                }
            ];

            console.log('🌱 Chargement des données de démonstration...');

            // Vider les données existantes SEULEMENT si c'est la première fois
            this.clearAllData();

            // Charger les entreprises
            DEMO_COMPANIES.forEach(companyData => {
                const company = {
                    id: companyData.id || generateId(),
                    ...companyData,
                    createdAt: companyData.createdAt || new Date().toISOString(),
                    updatedAt: companyData.updatedAt || new Date().toISOString()
                };
                this.data.companies.push(company);
            });

            // Charger les utilisateurs
            DEMO_USERS.forEach(userData => {
                const user = new User(userData);
                this.data.users.push(user);
            });

            // Charger les projets
            if (DEMO_PROJECT) {
                const project1 = new Project(DEMO_PROJECT);
                this.data.projects.push(project1);
            }
            
            if (DEMO_PROJECT_2) {
                const project2 = new Project(DEMO_PROJECT_2);
                this.data.projects.push(project2);
            }

            // Charger les documents
            DEMO_DOCUMENTS.forEach(docData => {
                const document = new Document(docData);
                this.data.documents.push(document);
            });

            // Charger les tâches
            DEMO_TASKS.forEach(taskData => {
                const task = new Task(taskData);
                this.data.tasks.push(task);
            });

            // Charger les commentaires
            DEMO_COMMENTS.forEach(commentData => {
                const comment = new Comment(commentData);
                this.data.comments.push(comment);
            });

            // Charger les notifications
            DEMO_NOTIFICATIONS.forEach(notifData => {
                const notification = new Notification(notifData);
                this.data.notifications.push(notification);
            });

            // Sauvegarder en localStorage
            this.save();

            console.log('✅ Données de démonstration chargées avec succès');
            console.log(`📊 Statistiques:`);
            console.log(`   - ${DEMO_USERS.length} utilisateurs`);
            console.log(`   - ${DEMO_COMPANIES.length} entreprises`);
            console.log(`   - 1 projet`);
            console.log(`   - ${DEMO_DOCUMENTS.length} documents`);
            console.log(`   - ${DEMO_TASKS.length} tâches`);
            console.log(`   - ${DEMO_COMMENTS.length} commentaires`);
            console.log(`   - ${DEMO_NOTIFICATIONS.length} notifications`);

            return true;
        } catch (error) {
            console.error('❌ Erreur lors du chargement des données de démonstration:', error);
            return false;
        }
    }

    /**
     * Vide toutes les données (pour le seed)
     */
    clearAllData() {
        this.data.users = [];
        this.data.projects = [];
        this.data.documents = [];
        this.data.tasks = [];
        this.data.comments = [];
        this.data.notifications = [];
        this.data.companies = [];
        this.data.invitations = [];
        this.data.journalEntries = [];
        this.data.passwordResets = [];
        this.save();
        console.log('🗑️ Toutes les données ont été supprimées');
    }

    /**
     * Obtient la liste des utilisateurs de démonstration
     */
    getDemoUsers() {
        return this.data.users.filter(user => user.id.startsWith('demo-'));
    }

    /**
     * Bascule vers un utilisateur de démonstration
     */
    switchToDemoUser(userId) {
        const user = this.getUser(userId);
        if (user && user.id.startsWith('demo-')) {
            this.setCurrentUser(user);
            console.log(`🔄 Basculement vers ${user.name} (${user.role})`);
            return true;
        }
        return false;
    }

    // Mettre a jour une notification
    updateNotification(notificationId, updateData) {
        const notificationIndex = this.data.notifications.findIndex(n => n.id === notificationId);
        if (notificationIndex === -1) {
            throw new Error('Notification non trouvee');
        }
        
        const notification = new Notification(this.data.notifications[notificationIndex]);
        Object.assign(notification, updateData);
        
        this.data.notifications[notificationIndex] = notification;
        this.save();
        return notification;
    }

    // Supprimer une notification
    deleteNotification(notificationId) {
        const notificationIndex = this.data.notifications.findIndex(n => n.id === notificationId);
        if (notificationIndex === -1) {
            throw new Error('Notification non trouvee');
        }
        
        this.data.notifications.splice(notificationIndex, 1);
        this.save();
        return true;
    }

    // Obtenir les notifications d'un utilisateur
    getUserNotifications(userId) {
        return this.data.notifications
            .filter(n => n.userId === userId)
            .map(notificationData => new Notification(notificationData))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Obtenir le nombre de notifications non lues
    getUnreadNotificationCount(userId) {
        return this.data.notifications.filter(n => n.userId === userId && !n.isRead).length;
    }

    // Marquer une notification comme lue
    markNotificationAsRead(notificationId) {
        const notification = this.getNotification(notificationId);
        if (notification) {
            notification.markAsRead();
            this.updateNotification(notificationId, notification);
        }
        return notification;
    }

    // Marquer toutes les notifications comme lues
    markAllNotificationsAsRead(userId) {
        const userNotifications = this.data.notifications.filter(n => n.userId === userId && !n.isRead);
        userNotifications.forEach(notification => {
            notification.isRead = true;
            notification.readAt = new Date().toISOString();
        });
        this.save();
        return userNotifications.length;
    }

    // Obtenir toutes les notifications
    getAllNotifications() {
        return this.data.notifications.map(notificationData => new Notification(notificationData));
    }

    /* ========================================
       GESTION DES INVITATIONS
       ======================================== */

    // Creer une invitation
    createInvitation(invitationData) {
        const invitation = {
            id: generateId(),
            projectId: invitationData.projectId,
            email: invitationData.email,
            role: invitationData.role,
            status: invitationData.status || 'pending',
            token: invitationData.token || generateId(),
            invitedBy: invitationData.invitedBy,
            invitedAt: invitationData.invitedAt || new Date().toISOString(),
            expiresAt: invitationData.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            acceptedAt: invitationData.acceptedAt || null,
            rejectedAt: invitationData.rejectedAt || null,
            cancelledAt: invitationData.cancelledAt || null
        };
        
        this.data.invitations.push(invitation);
        this.save();
        return invitation;
    }

    // Obtenir une invitation par ID
    getInvitation(invitationId) {
        return this.data.invitations.find(i => i.id === invitationId);
    }

    // Obtenir une invitation par token
    getInvitationByToken(token) {
        return this.data.invitations.find(i => i.token === token);
    }

    // Mettre a jour une invitation
    updateInvitation(invitationId, updateData) {
        const invitationIndex = this.data.invitations.findIndex(i => i.id === invitationId);
        if (invitationIndex === -1) {
            throw new Error('Invitation non trouvee');
        }
        
        Object.assign(this.data.invitations[invitationIndex], updateData);
        this.save();
        return this.data.invitations[invitationIndex];
    }

    // Supprimer une invitation
    deleteInvitation(invitationId) {
        const invitationIndex = this.data.invitations.findIndex(i => i.id === invitationId);
        if (invitationIndex === -1) {
            throw new Error('Invitation non trouvee');
        }
        
        this.data.invitations.splice(invitationIndex, 1);
        this.save();
        return true;
    }

    // Obtenir les invitations d'un projet
    getProjectInvitations(projectId) {
        return this.data.invitations.filter(i => i.projectId === projectId);
    }

    // Obtenir toutes les invitations
    getAllInvitations() {
        return this.data.invitations;
    }

    /* ========================================
       GESTION DES ENTREPRISES
       ======================================== */

    // Creer une entreprise
    createCompany(companyData) {
        const company = {
            id: generateId(),
            name: companyData.name,
            logoBase64: companyData.logoBase64 || null,
            address: companyData.address || '',
            website: companyData.website || '',
            phone: companyData.phone || '',
            vatNumber: companyData.vatNumber || '',
            ownerId: companyData.ownerId,
            members: companyData.members || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.data.companies.push(company);
        this.save();
        return company;
    }

    // Obtenir une entreprise par ID
    getCompany(companyId) {
        return this.data.companies.find(c => c.id === companyId);
    }

    // Mettre a jour une entreprise
    updateCompany(companyId, updateData) {
        const companyIndex = this.data.companies.findIndex(c => c.id === companyId);
        if (companyIndex === -1) {
            throw new Error('Entreprise non trouvee');
        }
        
        Object.assign(this.data.companies[companyIndex], updateData);
        this.data.companies[companyIndex].updatedAt = new Date().toISOString();
        this.save();
        return this.data.companies[companyIndex];
    }

    // Supprimer une entreprise
    deleteCompany(companyId) {
        const companyIndex = this.data.companies.findIndex(c => c.id === companyId);
        if (companyIndex === -1) {
            throw new Error('Entreprise non trouvee');
        }
        
        this.data.companies.splice(companyIndex, 1);
        this.save();
        return true;
    }

    // Obtenir toutes les entreprises
    getAllCompanies() {
        return this.data.companies;
    }

    /* ========================================
       GESTION DU JOURNAL
       ======================================== */

    // Initialiser le journal
    initJournal() {
        if (!this.data.journal) {
            this.data.journal = [];
        }
    }

    // Ajouter une entree au journal
    addJournalEntry(entry) {
        this.initJournal();
        this.data.journal.push(entry);
        this.save();
        return entry;
    }

    // Obtenir le journal d'un projet
    getProjectJournal(projectId) {
        this.initJournal();
        return this.data.journal.filter(entry => entry.projectId === projectId);
    }

    // Obtenir le journal par type
    getJournalByType(type) {
        this.initJournal();
        return this.data.journal.filter(entry => entry.type === type);
    }

    // Obtenir toutes les entrees du journal
    getAllJournalEntries() {
        this.initJournal();
        return this.data.journal;
    }

    // Supprimer le journal d'un projet
    clearProjectJournal(projectId) {
        this.initJournal();
        this.data.journal = this.data.journal.filter(entry => entry.projectId !== projectId);
        this.save();
        return true;
    }

    /* ========================================
       METHODES UTILITAIRES
       ======================================== */

    // Vider toutes les donnees (pour les tests)
    clearAllData() {
        this.data = {
            users: [],
            projects: [],
            documents: [],
            tasks: [],
            comments: [],
            notifications: [],
            invitations: [],
            companies: [],
            journal: []
        };
        this.save();
        this.clearSession();
    }

    // Obtenir les statistiques
    getStats() {
        return {
            users: this.data.users.length,
            projects: this.data.projects.length,
            documents: this.data.documents.length,
            tasks: this.data.tasks.length,
            comments: this.data.comments.length,
            notifications: this.data.notifications.length,
            invitations: this.data.invitations.length,
            companies: this.data.companies.length,
            journalEntries: this.data.journal.length
        };
    }

    // Diagnostic des données
    diagnoseData() {
        console.log('🔍 Diagnostic des données GECC:');
        console.log('📊 Statistiques:', this.getStats());
        console.log('👥 Utilisateurs:', this.data.users);
        console.log('💾 Données brutes:', this.data);
        console.log('🔑 Clé de stockage:', this.storageKey);
        console.log('📦 localStorage disponible:', localStorage.getItem(this.storageKey) ? 'Oui' : 'Non');
        
        return {
            stats: this.getStats(),
            users: this.data.users,
            hasData: !!localStorage.getItem(this.storageKey),
            demoLoaded: !!localStorage.getItem('gecc_demo_loaded')
        };
    }

    // Réparer les données utilisateur
    repairUserData() {
        console.log('🔧 Réparation des données utilisateur...');
        
        // Vérifier si les utilisateurs de démonstration existent
        const adminExists = this.data.users.some(u => u.email === 'admin@gecc.com');
        const testExists = this.data.users.some(u => u.email === 'test@gecc.com');
        
        if (!adminExists || !testExists) {
            console.log('⚠️ Utilisateurs de démonstration manquants, recréation...');
            this.createDefaultUsers();
        }
        
        // Sauvegarder les données réparées
        this.save();
        console.log('✅ Données utilisateur réparées');
        
        return this.diagnoseData();
    }

    // Exporter toutes les donnees
    exportData() {
        return JSON.stringify(this.data, null, 2);
    }

    // Importer des donnees
    importData(jsonData) {
        try {
            const importedData = JSON.parse(jsonData);
            this.data = importedData;
            this.save();
            return true;
        } catch (error) {
            throw new Error('Donnees invalides: ' + error.message);
        }
    }

    // ========================================
    // GESTION DES RÉINITIALISATIONS DE MOT DE PASSE
    // ========================================

    createPasswordReset(email) {
        try {
            // Vérifier que l'utilisateur existe
            const user = this.getUserByEmail(email);
            if (!user) {
                throw new Error('Aucun compte trouvé avec cet email');
            }

            // Invalider les anciennes demandes pour cet email
            this.data.passwordResets = this.data.passwordResets.filter(
                reset => reset.email !== email
            );

            // Créer une nouvelle demande de réinitialisation
            const passwordReset = new PasswordReset({
                email: email,
                token: generateId()
            });

            this.data.passwordResets.push(passwordReset);
            this.save();

            console.log('Demande de réinitialisation créée:', passwordReset);
            return passwordReset;

        } catch (error) {
            console.error('Erreur lors de la création de la demande de réinitialisation:', error);
            throw error;
        }
    }

    // Créer une demande de réinitialisation avec un objet complet
    createPasswordResetRequest(resetData) {
        try {
            // Invalider les anciennes demandes pour cet email
            this.data.passwordResets = this.data.passwordResets.filter(
                reset => reset.email !== resetData.email
            );

            // Ajouter la nouvelle demande
            this.data.passwordResets.push(resetData);
            this.save();

            console.log('Demande de réinitialisation créée:', resetData);
            return resetData;
        } catch (error) {
            console.error('Erreur lors de la création de la demande de réinitialisation:', error);
            throw error;
        }
    }

    // Récupérer une demande de réinitialisation par code
    getPasswordResetByCode(code) {
        return this.data.passwordResets.find(reset => reset.code === code);
    }

    // Mettre à jour une demande de réinitialisation
    updatePasswordReset(resetData) {
        try {
            const index = this.data.passwordResets.findIndex(reset => reset.id === resetData.id);
            if (index !== -1) {
                this.data.passwordResets[index] = resetData;
                this.save();
                console.log('Demande de réinitialisation mise à jour:', resetData);
                return resetData;
            } else {
                throw new Error('Demande de réinitialisation non trouvée');
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la demande de réinitialisation:', error);
            throw error;
        }
    }

    getPasswordResetByToken(token) {
        try {
            const reset = this.data.passwordResets.find(r => r.token === token);
            if (!reset) {
                throw new Error('Token de réinitialisation invalide');
            }

            if (!reset.isValid()) {
                throw new Error('Token de réinitialisation expiré ou déjà utilisé');
            }

            return reset;
        } catch (error) {
            console.error('Erreur lors de la récupération de la demande:', error);
            throw error;
        }
    }

    updatePasswordWithToken(token, newPassword) {
        try {
            const reset = this.getPasswordResetByToken(token);
            
            // Mettre à jour le mot de passe de l'utilisateur
            const user = this.getUserByEmail(reset.email);
            if (!user) {
                throw new Error('Utilisateur non trouvé');
            }

            user.password = newPassword;
            user.updatedAt = new Date();

            // Marquer la demande comme utilisée
            reset.used = true;
            reset.usedAt = new Date();

            this.save();

            console.log('Mot de passe mis à jour pour:', user.email);
            return user;

        } catch (error) {
            console.error('Erreur lors de la mise à jour du mot de passe:', error);
            throw error;
        }
    }

    cleanupExpiredPasswordResets() {
        try {
            const now = new Date();
            const initialCount = this.data.passwordResets.length;
            
            this.data.passwordResets = this.data.passwordResets.filter(
                reset => new Date(reset.expiresAt) > now
            );

            const cleanedCount = initialCount - this.data.passwordResets.length;
            if (cleanedCount > 0) {
                this.save();
                console.log(`${cleanedCount} demande(s) de réinitialisation expirée(s) supprimée(s)`);
            }

            return cleanedCount;
        } catch (error) {
            console.error('Erreur lors du nettoyage des demandes expirées:', error);
            return 0;
        }
    }

    // ========================================
    // GESTION DES INVITATIONS
    // ========================================

    /**
     * Créer une nouvelle invitation
     * @param {Object} inviteData - Données de l'invitation
     * @param {string} inviteData.projectId - ID du projet
     * @param {string} inviteData.emailCible - Email de la personne à inviter
     * @param {string} inviteData.rolePropose - Rôle proposé
     * @param {string} inviteData.creePar - ID de l'utilisateur qui crée l'invitation
     * @param {Date} inviteData.expiresAt - Date d'expiration (optionnel, +7 jours par défaut)
     * @returns {Invite} L'invitation créée
     */
    createInvite(inviteData) {
        try {
            // Vérifier que le projet existe
            const project = this.getProject(inviteData.projectId);
            if (!project) {
                throw new Error('Projet non trouvé');
            }

            // Vérifier que l'utilisateur créateur existe
            const creator = this.getUser(inviteData.creePar);
            if (!creator) {
                throw new Error('Utilisateur créateur non trouvé');
            }

            // Vérifier qu'il n'y a pas déjà une invitation en attente pour cet email sur ce projet
            const existingInvite = this.data.invitations.find(invite => 
                invite.projectId === inviteData.projectId && 
                invite.emailCible === inviteData.emailCible && 
                invite.status === INVITE_STATUS.PENDING
            );

            if (existingInvite) {
                throw new Error('Une invitation est déjà en attente pour cet email sur ce projet');
            }

            // Créer l'invitation
            const invite = new Invite({
                projectId: inviteData.projectId,
                emailCible: inviteData.emailCible,
                rolePropose: inviteData.rolePropose,
                creePar: inviteData.creePar,
                expiresAt: inviteData.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // +7 jours par défaut
            });

            this.data.invitations.push(invite);
            this.save();

            console.log('Invitation créée:', invite);
            return invite;

        } catch (error) {
            console.error('Erreur lors de la création de l\'invitation:', error);
            throw error;
        }
    }

    /**
     * Lister les invitations d'un projet
     * @param {string} projectId - ID du projet
     * @returns {Array<Invite>} Liste des invitations
     */
    listInvites(projectId) {
        try {
            const invites = this.data.invitations.filter(invite => invite.projectId === projectId);
            
            // Marquer les invitations expirées
            invites.forEach(invite => {
                if (invite.status === INVITE_STATUS.PENDING && invite.isExpired()) {
                    invite.markAsExpired();
                }
            });

            // Sauvegarder si des invitations ont été marquées comme expirées
            const hasExpiredInvites = invites.some(invite => invite.status === INVITE_STATUS.EXPIRED);
            if (hasExpiredInvites) {
                this.save();
            }

            return invites;
        } catch (error) {
            console.error('Erreur lors de la récupération des invitations:', error);
            return [];
        }
    }

    /**
     * Accepter une invitation
     * @param {string} token - Token de l'invitation
     * @param {string} userId - ID de l'utilisateur qui accepte
     * @returns {Invite} L'invitation acceptée
     */
    acceptInvite(token, userId) {
        try {
            // Trouver l'invitation par token
            const invite = this.data.invitations.find(inv => inv.token === token);
            if (!invite) {
                throw new Error('Invitation non trouvée');
            }

            // Vérifier que l'invitation est valide
            if (!invite.isValid()) {
                throw new Error('Invitation invalide ou expirée');
            }

            // Vérifier que l'utilisateur existe
            const user = this.getUser(userId);
            if (!user) {
                throw new Error('Utilisateur non trouvé');
            }

            // Vérifier que l'email correspond
            if (user.email !== invite.emailCible) {
                throw new Error('Cette invitation ne correspond pas à votre compte');
            }

            // Accepter l'invitation
            invite.accept(userId);

            // Ajouter l'utilisateur au projet
            const project = this.getProject(invite.projectId);
            if (project) {
                // Vérifier qu'il n'est pas déjà membre
                const isAlreadyMember = project.members.some(member => member.userId === userId);
                if (!isAlreadyMember) {
                    project.members.push({
                        userId: userId,
                        role: invite.rolePropose,
                        addedAt: new Date().toISOString()
                    });
                    this.updateProject(project);
                }
            }

            this.save();

            console.log('Invitation acceptée:', invite);
            return invite;

        } catch (error) {
            console.error('Erreur lors de l\'acceptation de l\'invitation:', error);
            throw error;
        }
    }

    /**
     * Annuler une invitation
     * @param {string} inviteId - ID de l'invitation
     * @returns {Invite} L'invitation annulée
     */
    cancelInvite(inviteId) {
        try {
            const invite = this.data.invitations.find(inv => inv.id === inviteId);
            if (!invite) {
                throw new Error('Invitation non trouvée');
            }

            // Annuler l'invitation
            invite.cancel();
            this.save();

            console.log('Invitation annulée:', invite);
            return invite;

        } catch (error) {
            console.error('Erreur lors de l\'annulation de l\'invitation:', error);
            throw error;
        }
    }

    /**
     * Obtenir une invitation par token
     * @param {string} token - Token de l'invitation
     * @returns {Invite|null} L'invitation ou null si non trouvée
     */
    getInviteByToken(token) {
        try {
            const invite = this.data.invitations.find(inv => inv.token === token);
            if (invite && invite.isValid()) {
                return invite;
            }
            return null;
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'invitation:', error);
            return null;
        }
    }

    /**
     * Nettoyer les invitations expirées
     * @returns {number} Nombre d'invitations nettoyées
     */
    cleanupExpiredInvites() {
        try {
            const initialCount = this.data.invitations.length;
            
            // Marquer les invitations expirées
            this.data.invitations.forEach(invite => {
                if (invite.status === INVITE_STATUS.PENDING && invite.isExpired()) {
                    invite.markAsExpired();
                }
            });

            // Optionnel : supprimer les invitations expirées depuis plus de 30 jours
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            this.data.invitations = this.data.invitations.filter(invite => {
                if (invite.status === INVITE_STATUS.EXPIRED) {
                    const expiredDate = new Date(invite.expiresAt);
                    return expiredDate > thirtyDaysAgo;
                }
                return true;
            });

            const cleanedCount = initialCount - this.data.invitations.length;
            if (cleanedCount > 0) {
                this.save();
                console.log(`${cleanedCount} invitation(s) expirée(s) supprimée(s)`);
            }

            return cleanedCount;
        } catch (error) {
            console.error('Erreur lors du nettoyage des invitations expirées:', error);
            return 0;
        }
    }
}

/* ========================================
   INSTANCE GLOBALE
   ======================================== */

// Creer une instance globale du repository
const localRepository = new LocalRepository();

// Exporter l'instance
// Export supprimé pour compatibilité directe
// window.LocalRepository = LocalRepository;
