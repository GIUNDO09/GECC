// Import supprimé pour compatibilité directe

class GECCApp {
    constructor() {
        this.repository = new LocalRepository();
        this.initializeApp();
    }

    initializeApp() {
        const currentPage = this.getCurrentPage();
        
        // Créer un utilisateur par défaut si aucun n'existe
        this.ensureDefaultUser();
        
        this.applyUserPreferences();
        
        // Initialiser les fonctionnalités spécifiques à la page
        if (currentPage === 'dashboard') {
            this.initializeDashboard();
        }
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('dashboard')) return 'dashboard';
        if (path.includes('projects')) return 'projects';
        if (path.includes('project')) return 'project';
        if (path.includes('profile')) return 'profile';
        if (path.includes('settings')) return 'settings';
        return 'unknown';
    }

    ensureDefaultUser() {
        let currentUser = this.repository.getCurrentUser();
        
        if (!currentUser) {
            // Créer un utilisateur par défaut "Visiteur"
            currentUser = this.repository.createUser({
                email: 'visiteur@gecc.com',
                password: 'visiteur123',
                fullName: 'Visiteur GECC',
                role: 'architect',
                company: 'GECC Project',
                isActive: true
            });
            
            // Créer une session pour cet utilisateur
            this.repository.saveSession(currentUser.id);
            
            console.log('👤 Utilisateur par défaut créé:', currentUser.fullName);
        }
    }

    applyUserPreferences() {
        const currentUser = this.repository.getCurrentUser();
        if (!currentUser) return;

        if (currentUser.theme) {
            document.documentElement.setAttribute('data-theme', currentUser.theme);
        }
    }

    // ========================================
    // GESTION DU DASHBOARD
    // ========================================

    initializeDashboard() {
        console.log('🏠 Initialisation du dashboard...');
        
        // S'assurer qu'un utilisateur par défaut existe
        this.ensureDefaultUser();
        
        const currentUser = this.repository.getCurrentUser();
        console.log('👤 Utilisateur actuel:', currentUser);

        // Charger les statistiques du dashboard
        this.loadDashboardStats();
        
        console.log('✅ Dashboard initialisé');
    }

    loadDashboardStats() {
        const currentUser = this.repository.getCurrentUser();
        
        // Statistiques par défaut si pas d'utilisateur
        const activeProjects = 0;
        const pendingDocuments = 0;
        const unreadNotifications = 0;
        const teamMembers = 0;

        // Mettre à jour l'interface avec des valeurs par défaut
        this.updateStatElement('activeProjects', activeProjects);
        this.updateStatElement('pendingDocuments', pendingDocuments);
        this.updateStatElement('notificationsCount', unreadNotifications);
        this.updateStatElement('teamMembers', teamMembers);
    }

    updateStatElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.geccApp = new GECCApp();
});

// Export supprimé pour compatibilité directe