// ========================================
// CLIENT API GECC - AUTHENTIFICATION
// ========================================
// Client API pour communiquer avec le backend Express

class ApiClient {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.accessToken = null;
        this.refreshToken = null;
        this.isRefreshing = false;
        this.failedQueue = [];
        
        // Récupérer le token depuis la session
        this.loadTokenFromSession();
    }

    // ========================================
    // GESTION DES TOKENS
    // ========================================

    loadTokenFromSession() {
        // Le refresh token est géré par les cookies httpOnly
        // L'access token est stocké en mémoire (pas localStorage pour la sécurité)
        const session = sessionStorage.getItem('gecc_session');
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                this.accessToken = sessionData.accessToken;
                console.log('🔑 Token d\'accès chargé depuis la session');
            } catch (error) {
                console.error('❌ Erreur lors du chargement de la session:', error);
                this.clearSession();
            }
        }
    }

    saveTokenToSession(accessToken) {
        this.accessToken = accessToken;
        sessionStorage.setItem('gecc_session', JSON.stringify({ accessToken }));
    }

    clearSession() {
        this.accessToken = null;
        this.refreshToken = null;
        sessionStorage.removeItem('gecc_session');
    }

    // ========================================
    // REQUÊTES HTTP
    // ========================================

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            credentials: 'include', // Important pour les cookies
            ...options
        };

        // Ajouter le token d'authentification si disponible
        if (this.accessToken) {
            config.headers['Authorization'] = `Bearer ${this.accessToken}`;
        }

        try {
            const response = await fetch(url, config);
            
            // Si le token a expiré, essayer de le renouveler
            if (response.status === 401 && this.accessToken) {
                const refreshed = await this.refreshAccessToken();
                if (refreshed) {
                    // Retry la requête avec le nouveau token
                    config.headers['Authorization'] = `Bearer ${this.accessToken}`;
                    return await fetch(url, config);
                } else {
                    // Refresh échoué, rediriger vers login
                    this.handleAuthFailure();
                    throw new Error('Session expirée');
                }
            }

            return response;
        } catch (error) {
            console.error('❌ Erreur de requête API:', error);
            throw error;
        }
    }

    async refreshAccessToken() {
        if (this.isRefreshing) {
            // Attendre que le refresh en cours se termine
            return new Promise((resolve) => {
                this.failedQueue.push(resolve);
            });
        }

        this.isRefreshing = true;

        try {
            const response = await fetch(`${this.baseURL}/auth/refresh`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.saveTokenToSession(data.accessToken);
                
                // Résoudre toutes les requêtes en attente
                this.failedQueue.forEach(resolve => resolve(true));
                this.failedQueue = [];
                
                console.log('🔄 Token d\'accès renouvelé');
                return true;
            } else {
                throw new Error('Échec du renouvellement du token');
            }
        } catch (error) {
            console.error('❌ Erreur lors du renouvellement du token:', error);
            this.failedQueue.forEach(resolve => resolve(false));
            this.failedQueue = [];
            return false;
        } finally {
            this.isRefreshing = false;
        }
    }

    handleAuthFailure() {
        this.clearSession();
        // Rediriger vers la page de connexion
        if (!window.location.pathname.includes('index.html')) {
            window.location.href = 'index.html';
        }
    }

    // ========================================
    // MÉTHODES D'AUTHENTIFICATION
    // ========================================

    async signup(userData) {
        try {
            const response = await this.request('/auth/signup', {
                method: 'POST',
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                const data = await response.json();
                this.saveTokenToSession(data.accessToken);
                return {
                    success: true,
                    user: data.user,
                    message: data.message
                };
            } else {
                const error = await response.json();
                return {
                    success: false,
                    error: error.error || 'Erreur lors de l\'inscription',
                    code: error.code
                };
            }
        } catch (error) {
            return {
                success: false,
                error: 'Erreur de connexion au serveur',
                code: 'NETWORK_ERROR'
            };
        }
    }

    async login(email, password) {
        try {
            const response = await this.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                this.saveTokenToSession(data.accessToken);
                return {
                    success: true,
                    user: data.user,
                    message: data.message
                };
            } else {
                const error = await response.json();
                return {
                    success: false,
                    error: error.error || 'Email ou mot de passe incorrect',
                    code: error.code
                };
            }
        } catch (error) {
            return {
                success: false,
                error: 'Erreur de connexion au serveur',
                code: 'NETWORK_ERROR'
            };
        }
    }

    async logout() {
        try {
            await this.request('/auth/logout', {
                method: 'POST'
            });
        } catch (error) {
            console.error('❌ Erreur lors de la déconnexion:', error);
        } finally {
            this.clearSession();
        }
    }

    async getCurrentUser() {
        try {
            const response = await this.request('/auth/me');
            
            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    user: data.user
                };
            } else {
                return {
                    success: false,
                    error: 'Impossible de récupérer le profil utilisateur'
                };
            }
        } catch (error) {
            return {
                success: false,
                error: 'Erreur de connexion au serveur'
            };
        }
    }

    async updateProfile(profileData) {
        try {
            const response = await this.request('/auth/me', {
                method: 'PATCH',
                body: JSON.stringify(profileData)
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    user: data.user,
                    message: data.message
                };
            } else {
                const error = await response.json();
                return {
                    success: false,
                    error: error.error || 'Erreur lors de la mise à jour',
                    code: error.code
                };
            }
        } catch (error) {
            return {
                success: false,
                error: 'Erreur de connexion au serveur'
            };
        }
    }

    // ========================================
    // UTILITAIRES
    // ========================================

    isAuthenticated() {
        return this.accessToken !== null;
    }

    getAccessToken() {
        return this.accessToken;
    }
}

// ========================================
// INSTANCE GLOBALE
// ========================================

// Créer une instance globale du client API
window.apiClient = new ApiClient();

// Exporter pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiClient;
}
