// ========================================
// CONFIGURATION GECC FRONTEND
// ========================================
// Configuration des variables d'environnement pour le frontend

class GECCConfig {
    constructor() {
        this.loadConfig();
    }

    loadConfig() {
        // Configuration par défaut (développement)
        this.config = {
            // URL de l'API backend
            apiUrl: 'http://localhost:3000/api',
            
            // Configuration des fichiers
            maxFileSize: 50 * 1024 * 1024, // 50MB
            allowedFileTypes: [
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'text/plain',
                'application/zip',
                'application/x-rar-compressed'
            ],
            
            // Configuration des thèmes
            themes: {
                light: {
                    name: 'Clair',
                    primary: '#667eea',
                    secondary: '#764ba2',
                    background: '#ffffff',
                    text: '#333333'
                },
                dark: {
                    name: 'Sombre',
                    primary: '#667eea',
                    secondary: '#764ba2',
                    background: '#1a1a1a',
                    text: '#ffffff'
                },
                auto: {
                    name: 'Automatique',
                    primary: '#667eea',
                    secondary: '#764ba2',
                    background: 'auto',
                    text: 'auto'
                }
            },
            
            // Configuration des langues
            languages: {
                fr: { name: 'Français', code: 'fr' },
                en: { name: 'English', code: 'en' },
                es: { name: 'Español', code: 'es' },
                de: { name: 'Deutsch', code: 'de' }
            },
            
            // Configuration des notifications
            notifications: {
                default: {
                    email: true,
                    push: true,
                    project_updates: true,
                    invitations: true
                }
            },
            
            // Configuration du cache
            cache: {
                settings: 5 * 60 * 1000, // 5 minutes
                projects: 2 * 60 * 1000, // 2 minutes
                files: 1 * 60 * 1000 // 1 minute
            },
            
            // Configuration des timeouts
            timeouts: {
                api: 30000, // 30 secondes
                upload: 300000, // 5 minutes
                download: 60000 // 1 minute
            }
        };

        // Surcharger avec les variables d'environnement si disponibles
        this.overrideWithEnv();
    }

    overrideWithEnv() {
        // URL de l'API (peut être définie via Vercel/Netlify)
        if (typeof process !== 'undefined' && process.env && process.env.GECC_API_URL) {
            this.config.apiUrl = process.env.GECC_API_URL;
        } else if (window.GECC_API_URL) {
            this.config.apiUrl = window.GECC_API_URL;
        }

        // Détecter l'environnement de production
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            // En production, utiliser l'URL de l'API de production
            if (!this.config.apiUrl.includes('localhost')) {
                // L'URL est déjà configurée pour la production
            } else {
                // Fallback vers l'API de production
                this.config.apiUrl = 'https://gecc-backend.railway.app/api';
            }
        }
    }

    get(key) {
        return this.config[key];
    }

    set(key, value) {
        this.config[key] = value;
    }

    getApiUrl() {
        return this.config.apiUrl;
    }

    getMaxFileSize() {
        return this.config.maxFileSize;
    }

    getAllowedFileTypes() {
        return this.config.allowedFileTypes;
    }

    getThemes() {
        return this.config.themes;
    }

    getLanguages() {
        return this.config.languages;
    }

    getDefaultNotifications() {
        return this.config.notifications.default;
    }

    getCacheConfig() {
        return this.config.cache;
    }

    getTimeouts() {
        return this.config.timeouts;
    }

    // ========================================
    // MÉTHODES UTILITAIRES
    // ========================================

    isProduction() {
        return window.location.hostname !== 'localhost' && 
               window.location.hostname !== '127.0.0.1';
    }

    isDevelopment() {
        return !this.isProduction();
    }

    getEnvironment() {
        return this.isProduction() ? 'production' : 'development';
    }

    // ========================================
    // MÉTHODES DE CONFIGURATION DYNAMIQUE
    // ========================================

    updateApiUrl(newUrl) {
        this.config.apiUrl = newUrl;
        // Mettre à jour l'API client si disponible
        if (window.apiClient) {
            window.apiClient.baseURL = newUrl;
        }
    }

    updateFileConfig(maxSize, allowedTypes) {
        if (maxSize) {
            this.config.maxFileSize = maxSize;
        }
        if (allowedTypes) {
            this.config.allowedFileTypes = allowedTypes;
        }
    }

    // ========================================
    // MÉTHODES DE VALIDATION
    // ========================================

    validateConfig() {
        const errors = [];

        if (!this.config.apiUrl) {
            errors.push('URL de l\'API manquante');
        }

        if (!this.config.maxFileSize || this.config.maxFileSize <= 0) {
            errors.push('Taille maximale de fichier invalide');
        }

        if (!Array.isArray(this.config.allowedFileTypes) || this.config.allowedFileTypes.length === 0) {
            errors.push('Types de fichiers autorisés manquants');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    // ========================================
    // MÉTHODES DE DEBUG
    // ========================================

    logConfig() {
        console.log('GECC Configuration:', {
            environment: this.getEnvironment(),
            apiUrl: this.config.apiUrl,
            maxFileSize: this.config.maxFileSize,
            allowedFileTypes: this.config.allowedFileTypes.length,
            themes: Object.keys(this.config.themes),
            languages: Object.keys(this.config.languages)
        });
    }

    exportConfig() {
        return JSON.stringify(this.config, null, 2);
    }
}

// ========================================
// INSTANCE GLOBALE
// ========================================

// Créer une instance globale de la configuration
window.geccConfig = new GECCConfig();

// Logger la configuration au chargement (en développement)
if (window.geccConfig.isDevelopment()) {
    window.geccConfig.logConfig();
}

// Exporter pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GECCConfig;
}
