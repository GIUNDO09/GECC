// ========================================
// GESTIONNAIRE D'AUTHENTIFICATION API GECC
// ========================================
// Remplace le système localStorage par l'API backend

class AuthManagerAPI {
    constructor() {
        this.currentUser = null;
        this.apiClient = window.apiClient;
        this.initializeAuth();
    }

    async initializeAuth() {
        // Vérifier s'il y a une session active
        await this.checkSession();
    }

    // ========================================
    // GESTION DES SESSIONS
    // ========================================

    async checkSession() {
        if (this.apiClient.isAuthenticated()) {
            try {
                const result = await this.apiClient.getCurrentUser();
                if (result.success) {
                    this.currentUser = result.user;
                    console.log('👤 Session active trouvée:', this.currentUser.fullName);
                    return this.currentUser;
                } else {
                    console.log('❌ Session invalide, déconnexion...');
                    await this.logout();
                    return null;
                }
            } catch (error) {
                console.error('❌ Erreur lors de la vérification de la session:', error);
                await this.logout();
                return null;
            }
        }
        return null;
    }

    isLoggedIn() {
        return this.currentUser !== null && this.apiClient.isAuthenticated();
    }

    getCurrentUser() {
        return this.currentUser;
    }

    // ========================================
    // AUTHENTIFICATION
    // ========================================

    async authenticateUser(email, password) {
        try {
            const result = await this.apiClient.login(email, password);
            
            if (result.success) {
                this.currentUser = result.user;
                console.log('✅ Connexion réussie:', result.user.fullName);
                return result.user;
            } else {
                console.error('❌ Échec de la connexion:', result.error);
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('❌ Erreur lors de la connexion:', error);
            throw error;
        }
    }

    async createUser(userData) {
        try {
            const result = await this.apiClient.signup(userData);
            
            if (result.success) {
                this.currentUser = result.user;
                console.log('✅ Inscription réussie:', result.user.fullName);
                return result.user;
            } else {
                console.error('❌ Échec de l\'inscription:', result.error);
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('❌ Erreur lors de l\'inscription:', error);
            throw error;
        }
    }

    // ========================================
    // DÉCONNEXION
    // ========================================

    async logout() {
        try {
            await this.apiClient.logout();
        } catch (error) {
            console.error('❌ Erreur lors de la déconnexion:', error);
        } finally {
            this.currentUser = null;
            console.log('👋 Utilisateur déconnecté');
        }
    }

    // ========================================
    // PROTECTION DES PAGES
    // ========================================

    async requireAuth() {
        if (!this.isLoggedIn()) {
            console.log('🔒 Accès non autorisé - redirection vers la connexion');
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }

    // ========================================
    // MISE À JOUR DU PROFIL
    // ========================================

    async updateProfile(profileData) {
        try {
            const result = await this.apiClient.updateProfile(profileData);
            
            if (result.success) {
                this.currentUser = result.user;
                console.log('✅ Profil mis à jour:', result.user.fullName);
                return result.user;
            } else {
                console.error('❌ Échec de la mise à jour:', result.error);
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('❌ Erreur lors de la mise à jour:', error);
            throw error;
        }
    }

    // ========================================
    // UTILITAIRES
    // ========================================

    getRoleDisplayName(role) {
        const roleNames = {
            'admin': 'Administrateur',
            'super_admin': 'Super Administrateur',
            'architect': 'Architecte',
            'engineer': 'Ingénieur',
            'contractor': 'Entrepreneur',
            'bet': 'BET',
            'client': 'Client'
        };
        return roleNames[role] || role;
    }

    // ========================================
    // COMPATIBILITÉ AVEC L'ANCIEN SYSTÈME
    // ========================================

    // Méthodes pour maintenir la compatibilité avec l'ancien code
    emailExists(email) {
        // Cette méthode n'est plus nécessaire avec l'API
        // Le serveur gère la validation des emails
        return false;
    }

    createDemoUsers() {
        // Cette méthode n'est plus nécessaire avec l'API
        // Les utilisateurs sont créés via l'API
        console.log('ℹ️ Création d\'utilisateurs démo non disponible avec l\'API');
    }
}

// ========================================
// FONCTIONS GLOBALES
// ========================================

// Fonction pour vérifier l'authentification sur toutes les pages
async function checkAuthentication() {
    if (!window.authManager) {
        window.authManager = new AuthManagerAPI();
    }
    
    // Si on est sur la page de connexion, ne pas rediriger
    if (window.location.pathname.includes('index.html') || 
        window.location.pathname.includes('landing.html')) {
        return null;
    }
    
    // Vérifier l'authentification pour les autres pages
    if (!(await window.authManager.requireAuth())) {
        return null;
    }
    
    return window.authManager.getCurrentUser();
}

// Fonction pour afficher les informations utilisateur dans le header
function displayUserInfo() {
    const currentUser = window.authManager?.getCurrentUser();
    if (!currentUser) return;

    // Mettre à jour le nom d'utilisateur dans le header
    const userNameElements = document.querySelectorAll('.user-name, #userName');
    userNameElements.forEach(element => {
        element.textContent = currentUser.fullName;
    });

    // Mettre à jour le rôle
    const userRoleElements = document.querySelectorAll('.user-role, #userRole');
    userRoleElements.forEach(element => {
        element.textContent = window.authManager.getRoleDisplayName(currentUser.role);
    });

    // Mettre à jour l'email
    const userEmailElements = document.querySelectorAll('.user-email, #userEmail');
    userEmailElements.forEach(element => {
        element.textContent = currentUser.email;
    });

    // Mettre à jour l'avatar si disponible
    const userAvatarElements = document.querySelectorAll('.user-avatar, #userAvatar');
    userAvatarElements.forEach(element => {
        if (currentUser.avatarUrl) {
            element.src = currentUser.avatarUrl;
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
    });
}

// Fonction de déconnexion
async function handleLogout() {
    if (window.authManager) {
        await window.authManager.logout();
    }
    window.location.href = 'index.html';
}

// ========================================
// INITIALISATION GLOBALE
// ========================================

// Initialiser le gestionnaire d'authentification
document.addEventListener('DOMContentLoaded', async () => {
    if (!window.authManager) {
        window.authManager = new AuthManagerAPI();
    }
    
    // Vérifier l'authentification (sauf sur index.html et landing.html)
    const currentUser = await checkAuthentication();
    
    if (currentUser) {
        // Afficher les informations utilisateur
        displayUserInfo();
        
        // Configurer le bouton de déconnexion
        const logoutButtons = document.querySelectorAll('.logout-btn, #logoutBtn');
        logoutButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                await handleLogout();
            });
        });
    }
    
    console.log('✅ Système d\'authentification API initialisé');
});

// Exporter pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthManagerAPI, checkAuthentication, displayUserInfo, handleLogout };
}
