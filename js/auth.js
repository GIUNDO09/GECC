// ========================================
// SYSTÈME D'AUTHENTIFICATION GECC
// ========================================

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.initializeAuth();
    }

    initializeAuth() {
        // Vérifier s'il y a une session active
        this.checkSession();
    }

    // ========================================
    // GESTION DES SESSIONS
    // ========================================

    checkSession() {
        const session = localStorage.getItem('currentSession');
        if (session) {
            try {
                this.currentUser = JSON.parse(session);
                console.log('👤 Session active trouvée:', this.currentUser.name);
                return this.currentUser;
            } catch (error) {
                console.error('❌ Erreur lors du parsing de la session:', error);
                this.logout();
                return null;
            }
        }
        return null;
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    // ========================================
    // AUTHENTIFICATION
    // ========================================

    authenticateUser(email, password) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => 
            u.email.toLowerCase() === email.toLowerCase() && 
            u.password === password
        );
        
        if (user) {
            this.createSession(user);
            return user;
        }
        
        return null;
    }

    createSession(user) {
        const session = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };
        
        this.currentUser = session;
        localStorage.setItem('currentSession', JSON.stringify(session));
        console.log('✅ Session créée pour:', user.name);
    }

    // ========================================
    // GESTION DES UTILISATEURS
    // ========================================

    createUser(name, email, password, role) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Vérifier si l'email existe déjà
        if (this.emailExists(email)) {
            throw new Error('Cet email est déjà utilisé');
        }

        const newUser = {
            id: Date.now().toString(),
            name: name,
            email: email.toLowerCase(),
            password: password,
            role: role,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        console.log('✅ Utilisateur créé:', newUser.name);
        return newUser;
    }

    emailExists(email) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        return users.some(user => user.email.toLowerCase() === email.toLowerCase());
    }

    // ========================================
    // DÉCONNEXION
    // ========================================

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentSession');
        console.log('👋 Utilisateur déconnecté');
    }

    // ========================================
    // PROTECTION DES PAGES
    // ========================================

    requireAuth() {
        if (!this.isLoggedIn()) {
            console.log('🔒 Accès non autorisé - redirection vers la connexion');
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }

    // ========================================
    // UTILITAIRES
    // ========================================

    getRoleDisplayName(role) {
        const roleNames = {
            'architect': 'Architecte',
            'bct': 'BCT',
            'bet': 'BET',
            'entreprise': 'Entreprise'
        };
        return roleNames[role] || role;
    }

    // ========================================
    // DONNÉES DE DÉMONSTRATION
    // ========================================

    createDemoUsers() {
        const demoUsers = [
            {
                name: 'Marie Dubois',
                email: 'marie@architecte.com',
                password: 'demo123',
                role: 'architect'
            },
            {
                name: 'Jean Martin',
                email: 'jean@bct.com',
                password: 'demo123',
                role: 'bct'
            },
            {
                name: 'Sophie Leroy',
                email: 'sophie@bet.com',
                password: 'demo123',
                role: 'bet'
            },
            {
                name: 'Pierre Durand',
                email: 'pierre@entreprise.com',
                password: 'demo123',
                role: 'entreprise'
            }
        ];

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        demoUsers.forEach(demoUser => {
            if (!this.emailExists(demoUser.email)) {
                const user = this.createUser(
                    demoUser.name,
                    demoUser.email,
                    demoUser.password,
                    demoUser.role
                );
                console.log('👤 Utilisateur démo créé:', user.name);
            }
        });
    }
}

// ========================================
// FONCTIONS GLOBALES
// ========================================

// Fonction pour vérifier l'authentification sur toutes les pages
function checkAuthentication() {
    if (!window.authManager) {
        window.authManager = new AuthManager();
    }
    
    // Si on est sur la page de connexion, ne pas rediriger
    if (window.location.pathname.includes('index.html') || 
        window.location.pathname.includes('landing.html')) {
        return null;
    }
    
    // Vérifier l'authentification pour les autres pages
    if (!window.authManager.requireAuth()) {
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
        element.textContent = currentUser.name;
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
}

// Fonction de déconnexion
function handleLogout() {
    if (window.authManager) {
        window.authManager.logout();
    }
    window.location.href = 'index.html';
}

// ========================================
// INITIALISATION GLOBALE
// ========================================

// Initialiser le gestionnaire d'authentification
document.addEventListener('DOMContentLoaded', () => {
    if (!window.authManager) {
        window.authManager = new AuthManager();
    }
    
    // Vérifier l'authentification (sauf sur index.html et landing.html)
    const currentUser = checkAuthentication();
    
    if (currentUser) {
        // Afficher les informations utilisateur
        displayUserInfo();
        
        // Configurer le bouton de déconnexion
        const logoutButtons = document.querySelectorAll('.logout-btn, #logoutBtn');
        logoutButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                handleLogout();
            });
        });
    }
    
    console.log('✅ Système d\'authentification initialisé');
});

// Exporter pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthManager, checkAuthentication, displayUserInfo, handleLogout };
}
