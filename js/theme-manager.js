/**
 * Gestionnaire de thème global pour l'application GECC
 * Synchronise le thème entre toutes les pages
 */

class GlobalThemeManager {
    constructor() {
        this.init();
    }

    init() {
        this.loadTheme();
        this.setupEventListeners();
        this.setupStorageListener();
    }

    /**
     * Charge le thème depuis localStorage et l'applique
     */
    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.applyTheme(savedTheme);
    }

    /**
     * Applique le thème à la page courante
     * @param {string} theme - 'light' ou 'dark'
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        // Mettre à jour le bouton de thème s'il existe
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.innerHTML = theme === 'light' ? '☀️' : '🌙';
            themeToggle.title = `Passer au thème ${theme === 'light' ? 'sombre' : 'clair'}`;
        }

        // Mettre à jour les sélecteurs de thème dans les formulaires
        const themeSelects = document.querySelectorAll('select[name="theme"]');
        themeSelects.forEach(select => {
            select.value = theme;
        });

        // Mettre à jour les radio buttons de thème
        const themeRadios = document.querySelectorAll('input[name="theme"]');
        themeRadios.forEach(radio => {
            if (radio.value === theme) {
                radio.checked = true;
            }
        });

        // Déclencher un événement personnalisé pour notifier les autres composants
        window.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme: theme } 
        }));
    }

    /**
     * Bascule entre les thèmes clair et sombre
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    /**
     * Définit un thème spécifique
     * @param {string} theme - 'light' ou 'dark'
     */
    setTheme(theme) {
        localStorage.setItem('theme', theme);
        this.applyTheme(theme);
        this.showToast(`Thème ${theme === 'light' ? 'clair' : 'sombre'} activé`);
    }

    /**
     * Écoute les changements de localStorage pour synchroniser entre les onglets
     */
    setupStorageListener() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'theme' && e.newValue) {
                this.applyTheme(e.newValue);
            }
        });
    }

    /**
     * Configure les écouteurs d'événements
     */
    setupEventListeners() {
        // Écouter les clics sur les boutons de thème
        document.addEventListener('click', (e) => {
            if (e.target.id === 'themeToggle' || e.target.closest('#themeToggle')) {
                e.preventDefault();
                this.toggleTheme();
            }
        });

        // Écouter les changements dans les formulaires de préférences
        document.addEventListener('change', (e) => {
            if (e.target.name === 'theme') {
                this.setTheme(e.target.value);
            }
        });

        // Écouter les soumissions de formulaires de préférences
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'preferencesForm') {
                e.preventDefault();
                const formData = new FormData(e.target);
                const theme = formData.get('theme');
                if (theme) {
                    this.setTheme(theme);
                }
            }
        });
    }

    /**
     * Crée un bouton de thème dans la navigation si nécessaire
     */
    createThemeToggle() {
        const nav = document.querySelector('.nav');
        if (nav && !document.getElementById('themeToggle')) {
            const themeBtn = document.createElement('button');
            themeBtn.id = 'themeToggle';
            themeBtn.className = 'btn btn-secondary';
            themeBtn.title = 'Changer le thème';
            themeBtn.innerHTML = '☀️';
            themeBtn.style.marginLeft = '8px';
            
            nav.appendChild(themeBtn);
        }
    }

    /**
     * Affiche une notification toast
     * @param {string} message - Message à afficher
     */
    showToast(message) {
        // Créer un toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--card-gradient, linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%));
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            z-index: 10000;
            font-weight: 600;
            font-size: 14px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Animation d'entrée
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Suppression automatique
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Obtient le thème actuel
     * @returns {string} - 'light' ou 'dark'
     */
    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }

    /**
     * Vérifie si le thème sombre est actif
     * @returns {boolean}
     */
    isDarkTheme() {
        return this.getCurrentTheme() === 'dark';
    }
}

// Initialiser le gestionnaire de thème global
let globalThemeManager;

// Attendre que le DOM soit chargé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        globalThemeManager = new GlobalThemeManager();
    });
} else {
    globalThemeManager = new GlobalThemeManager();
}

// Exporter pour utilisation dans d'autres modules
window.GlobalThemeManager = GlobalThemeManager;
window.globalThemeManager = globalThemeManager;
