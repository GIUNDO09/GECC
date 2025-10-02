// ========================================
// CLIENT API PARAMÈTRES GECC
// ========================================
// Client API pour la gestion des paramètres utilisateur

class SettingsApiClient {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    // ========================================
    // MÉTHODES PARAMÈTRES
    // ========================================

    async getSettings(options = {}) {
        try {
            const queryParams = new URLSearchParams();
            
            if (options.keys) {
                queryParams.append('keys', options.keys.join(','));
            }
            if (options.publicOnly) {
                queryParams.append('public', 'true');
            }

            const endpoint = `/settings${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            const response = await this.apiClient.request(endpoint);

            if (response.ok) {
                const data = await response.json();
                
                // Mettre en cache
                this.cache.set('settings', {
                    data: data.settings,
                    timestamp: Date.now()
                });

                return {
                    success: true,
                    settings: data.settings
                };
            } else {
                const error = await response.json();
                return {
                    success: false,
                    error: error.error || 'Erreur lors de la récupération des paramètres',
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

    async updateSettings(settings) {
        try {
            const response = await this.apiClient.request('/settings', {
                method: 'PUT',
                body: JSON.stringify({ settings })
            });

            if (response.ok) {
                const data = await response.json();
                
                // Mettre à jour le cache
                const cached = this.cache.get('settings');
                if (cached) {
                    Object.assign(cached.data, data.settings);
                    cached.timestamp = Date.now();
                }

                return {
                    success: true,
                    settings: data.settings,
                    message: data.message
                };
            } else {
                const error = await response.json();
                return {
                    success: false,
                    error: error.error || 'Erreur lors de la mise à jour des paramètres',
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

    async deleteSetting(key) {
        try {
            const response = await this.apiClient.request(`/settings/${key}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                const data = await response.json();
                
                // Supprimer du cache
                const cached = this.cache.get('settings');
                if (cached && cached.data[key]) {
                    delete cached.data[key];
                }

                return {
                    success: true,
                    message: data.message
                };
            } else {
                const error = await response.json();
                return {
                    success: false,
                    error: error.error || 'Erreur lors de la suppression du paramètre',
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

    async getPublicSettings(userId) {
        try {
            const response = await fetch(`${this.apiClient.baseURL}/settings/public/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    user: data.user,
                    publicSettings: data.publicSettings
                };
            } else {
                const error = await response.json();
                return {
                    success: false,
                    error: error.error || 'Erreur lors de la récupération des paramètres publics',
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

    async resetSettings() {
        try {
            const response = await this.apiClient.request('/settings/reset', {
                method: 'POST'
            });

            if (response.ok) {
                const data = await response.json();
                
                // Vider le cache
                this.cache.clear();

                return {
                    success: true,
                    defaultSettings: data.defaultSettings,
                    message: data.message
                };
            } else {
                const error = await response.json();
                return {
                    success: false,
                    error: error.error || 'Erreur lors de la réinitialisation des paramètres',
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

    // ========================================
    // MÉTHODES DE CACHE ET UTILITAIRES
    // ========================================

    getCachedSettings() {
        const cached = this.cache.get('settings');
        if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    clearCache() {
        this.cache.clear();
    }

    async getSetting(key, defaultValue = null) {
        // Essayer le cache d'abord
        const cached = this.getCachedSettings();
        if (cached && cached[key]) {
            return cached[key].value;
        }

        // Récupérer depuis l'API
        const result = await this.getSettings({ keys: [key] });
        if (result.success && result.settings[key]) {
            return result.settings[key].value;
        }

        return defaultValue;
    }

    async setSetting(key, value) {
        const result = await this.updateSettings({ [key]: value });
        return result.success;
    }

    // ========================================
    // MÉTHODES SPÉCIALISÉES
    // ========================================

    async getTheme() {
        return await this.getSetting('theme', 'light');
    }

    async setTheme(theme) {
        return await this.setSetting('theme', theme);
    }

    async getLanguage() {
        return await this.getSetting('language', 'fr');
    }

    async setLanguage(language) {
        return await this.setSetting('language', language);
    }

    async getNotifications() {
        const notifications = await this.getSetting('notifications', {
            email: true,
            push: true,
            project_updates: true,
            invitations: true
        });
        return notifications;
    }

    async setNotifications(notifications) {
        return await this.setSetting('notifications', notifications);
    }

    async getDashboardLayout() {
        const layout = await this.getSetting('dashboard_layout', {
            widgets: ['projects', 'tasks', 'notifications'],
            columns: 2
        });
        return layout;
    }

    async setDashboardLayout(layout) {
        return await this.setSetting('dashboard_layout', layout);
    }

    // ========================================
    // UTILITAIRES D'AFFICHAGE
    // ========================================

    getThemeDisplayName(theme) {
        const themes = {
            'light': 'Clair',
            'dark': 'Sombre',
            'auto': 'Automatique'
        };
        return themes[theme] || theme;
    }

    getLanguageDisplayName(language) {
        const languages = {
            'fr': 'Français',
            'en': 'English',
            'es': 'Español',
            'de': 'Deutsch'
        };
        return languages[language] || language;
    }

    getSettingTypeDisplayName(type) {
        const types = {
            'string': 'Texte',
            'number': 'Nombre',
            'boolean': 'Booléen',
            'json': 'Objet JSON',
            'array': 'Liste'
        };
        return types[type] || type;
    }

    // ========================================
    // MÉTHODES D'INITIALISATION
    // ========================================

    async initializeSettings() {
        try {
            const result = await this.getSettings();
            if (result.success) {
                // Appliquer les paramètres au DOM
                await this.applySettings(result.settings);
                return result.settings;
            }
        } catch (error) {
            console.error('Erreur lors de l\'initialisation des paramètres:', error);
        }
        return null;
    }

    async applySettings(settings) {
        // Appliquer le thème
        if (settings.theme) {
            this.applyTheme(settings.theme.value);
        }

        // Appliquer la langue
        if (settings.language) {
            this.applyLanguage(settings.language.value);
        }

        // Appliquer le layout du dashboard
        if (settings.dashboard_layout) {
            this.applyDashboardLayout(settings.dashboard_layout.value);
        }
    }

    applyTheme(theme) {
        const body = document.body;
        body.classList.remove('theme-light', 'theme-dark', 'theme-auto');
        body.classList.add(`theme-${theme}`);
        
        // Stocker dans localStorage pour la persistance
        localStorage.setItem('gecc-theme', theme);
    }

    applyLanguage(language) {
        // Changer l'attribut lang du document
        document.documentElement.lang = language;
        
        // Stocker dans localStorage
        localStorage.setItem('gecc-language', language);
    }

    applyDashboardLayout(layout) {
        // Appliquer le layout du dashboard si on est sur la page dashboard
        if (window.location.pathname.includes('dashboard.html')) {
            // Logique d'application du layout
            console.log('Application du layout dashboard:', layout);
        }
    }

    // ========================================
    // MÉTHODES DE SYNCHRONISATION
    // ========================================

    async syncWithLocalStorage() {
        try {
            // Récupérer les paramètres depuis localStorage
            const localSettings = {};
            
            const theme = localStorage.getItem('gecc-theme');
            if (theme) localSettings.theme = theme;
            
            const language = localStorage.getItem('gecc-language');
            if (language) localSettings.language = language;
            
            const notifications = localStorage.getItem('gecc-notifications');
            if (notifications) {
                try {
                    localSettings.notifications = JSON.parse(notifications);
                } catch (e) {
                    console.warn('Erreur de parsing des notifications:', e);
                }
            }

            // Synchroniser avec l'API si des paramètres locaux existent
            if (Object.keys(localSettings).length > 0) {
                const result = await this.updateSettings(localSettings);
                if (result.success) {
                    console.log('Paramètres synchronisés avec l\'API');
                }
            }
        } catch (error) {
            console.error('Erreur lors de la synchronisation:', error);
        }
    }
}

// ========================================
// INSTANCE GLOBALE
// ========================================

// Créer une instance globale du client API paramètres
window.settingsApiClient = new SettingsApiClient(window.apiClient);

// Exporter pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SettingsApiClient;
}
