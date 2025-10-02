/* 
========================================
CONFIGURATION DE LA PAGE D'ACCUEIL GECC
========================================
Role : Configuration centralisée pour la page d'accueil
- Liens de navigation
- Contenu personnalisable
- Paramètres de thème
- Analytics et tracking
========================================
*/

const LandingConfig = {
    // ========================================
    // CONFIGURATION DES LIENS
    // ========================================
    links: {
        // Pages de destination
        login: './index.html',
        signup: './index.html',
        
        // Liens internes (smooth scroll)
        features: '#features',
        benefits: '#benefits',
        testimonials: '#testimonials',
        contact: '#contact',
        
        // Liens externes (optionnels)
        documentation: '#',
        support: '#',
        pricing: '#',
        whatsapp: 'https://wa.me/221777935765'
    },

    // ========================================
    // CONFIGURATION DU CONTENU
    // ========================================
    content: {
        // Hero Section
        hero: {
            badge: {
                text: 'Nouvelle version disponible',
                icon: '🚀'
            },
            title: 'Gérez vos projets de construction avec <span style="color: var(--accent-color);">intelligence</span>',
            subtitle: 'Plateforme collaborative pour architectes, BCT, BET et entrepreneurs. Simplifiez la gestion de vos contrats, documents et équipes en temps réel.',
            cta: {
                primary: {
                    text: 'Commencer gratuitement',
                    href: './index.html'
                },
                secondary: {
                    text: 'Découvrir les fonctionnalités',
                    href: '#features'
                }
            }
        },

        // Navigation
        navigation: {
            logo: {
                text: 'GECC PROJECT',
                icon: 'GP'
            },
            links: [
                { text: 'Fonctionnalités', href: '#features' },
                { text: 'Avantages', href: '#benefits' },
                { text: 'Témoignages', href: '#testimonials' },
                { text: 'Contact', href: '#contact' }
            ],
            actions: [
                { text: 'Connexion', href: './login.html', type: 'secondary' },
                { text: 'Inscription', href: './index.html', type: 'primary' }
            ]
        }
    },

    // ========================================
    // CONFIGURATION DU THÈME
    // ========================================
    theme: {
        // Thème par défaut
        default: 'light',
        
        // Clés de localStorage
        storageKeys: {
            theme: 'geccp-theme',
            animations: 'geccp-animations'
        },
        
        // Icônes des contrôles
        icons: {
            light: '🌙',
            dark: '☀️',
            animationsOn: '🎬',
            animationsOff: '⏸️'
        }
    },

    // ========================================
    // CONFIGURATION DES ANIMATIONS
    // ========================================
    animations: {
        // Particules de fond
        particles: {
            count: 50,
            minSize: 2,
            maxSize: 6,
            minDuration: 15,
            maxDuration: 25
        },
        
        // Animations d'entrée
        entrance: {
            heroText: 'slideInLeft',
            heroVisual: 'slideInRight',
            sections: 'fadeInUp'
        },
        
        // Durées
        durations: {
            fast: '0.15s',
            normal: '0.3s',
            slow: '0.5s'
        }
    },

    // ========================================
    // CONFIGURATION RESPONSIVE
    // ========================================
    responsive: {
        breakpoints: {
            mobile: '480px',
            tablet: '768px',
            desktop: '1024px',
            large: '1200px'
        },
        
        // Comportements par breakpoint
        behaviors: {
            mobile: {
                heroLayout: 'stack',
                navigation: 'hidden',
                themeControls: 'right: 1rem'
            },
            tablet: {
                heroLayout: 'stack',
                navigation: 'visible',
                themeControls: 'right: 1.5rem'
            },
            desktop: {
                heroLayout: 'grid',
                navigation: 'visible',
                themeControls: 'right: 1.5rem'
            }
        }
    },

    // ========================================
    // CONFIGURATION DES NOTIFICATIONS
    // ========================================
    notifications: {
        // Durée d'affichage (ms)
        duration: 3000,
        
        // Position
        position: {
            top: '2rem',
            right: '2rem'
        },
        
        // Types supportés
        types: ['success', 'error', 'info', 'warning']
    },

    // ========================================
    // CONFIGURATION ANALYTICS
    // ========================================
    analytics: {
        // Événements à tracker
        events: {
            heroCtaClick: 'hero_cta_click',
            loginClick: 'login_click',
            signupClick: 'signup_click',
            themeToggle: 'theme_toggle',
            animationsToggle: 'animations_toggle'
        },
        
        // Paramètres par défaut
        defaultParams: {
            page: 'landing',
            source: 'direct'
        }
    },

    // ========================================
    // CONFIGURATION DE PERFORMANCE
    // ========================================
    performance: {
        // Lazy loading
        lazyLoad: {
            enabled: true,
            threshold: 0.1
        },
        
        // Debounce pour les événements
        debounce: {
            scroll: 16, // ~60fps
            resize: 250
        }
    },

    // ========================================
    // MÉTHODES UTILITAIRES
    // ========================================
    utils: {
        // Obtenir un lien
        getLink: function(key) {
            return this.links[key] || '#';
        },

        // Obtenir le contenu
        getContent: function(path) {
            const keys = path.split('.');
            let content = this.content;
            
            for (const key of keys) {
                if (content && content[key]) {
                    content = content[key];
                } else {
                    return null;
                }
            }
            
            return content;
        },

        // Appliquer la configuration
        apply: function() {
            // Appliquer les liens
            this.applyLinks();
            
            // Appliquer le contenu
            this.applyContent();
            
            // Appliquer le thème
            this.applyTheme();
            
            console.log('✅ Configuration de la landing page appliquée');
        },

        // Appliquer les liens
        applyLinks: function() {
            // Liens de navigation
            const loginBtn = document.getElementById('loginBtn');
            const signupBtn = document.getElementById('signupBtn');
            const heroSignup = document.getElementById('heroSignup');
            
            if (loginBtn) loginBtn.href = this.links.login;
            if (signupBtn) signupBtn.href = this.links.signup;
            if (heroSignup) heroSignup.href = this.links.signup;
        },

        // Appliquer le contenu
        applyContent: function() {
            // Titre hero
            const heroTitle = document.querySelector('.hero-title');
            if (heroTitle && this.content.hero.title) {
                heroTitle.innerHTML = this.content.hero.title;
            }
            
            // Sous-titre hero
            const heroSubtitle = document.querySelector('.hero-subtitle');
            if (heroSubtitle && this.content.hero.subtitle) {
                heroSubtitle.textContent = this.content.hero.subtitle;
            }
            
            // Badge hero
            const heroBadge = document.querySelector('.hero-badge');
            if (heroBadge && this.content.hero.badge) {
                heroBadge.innerHTML = `
                    <span>${this.content.hero.badge.icon}</span>
                    <span>${this.content.hero.badge.text}</span>
                `;
            }
        },

        // Appliquer le thème
        applyTheme: function() {
            const theme = localStorage.getItem(this.theme.storageKeys.theme) || this.theme.default;
            document.documentElement.setAttribute('data-theme', theme);
        }
    }
};

// Auto-application si dans le contexte de la landing page
if (typeof window !== 'undefined' && window.location.pathname.includes('landing.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        LandingConfig.utils.apply();
    });
}

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LandingConfig;
}

// Export global
if (typeof window !== 'undefined') {
    window.LandingConfig = LandingConfig;
}

// Log de chargement
console.log('🔧 Configuration de la landing page GECC chargée');
console.log('📋 Utilisez LandingConfig.utils.apply() pour appliquer la configuration');
