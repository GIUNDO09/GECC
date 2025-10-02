/* 
========================================
AMÉLIORATIONS UX POUR LA PAGE PROJETS
========================================
Rôle : Améliorations d'expérience utilisateur
- Animations et transitions
- Gestion des états de chargement
- Effets visuels
- Gestion des erreurs
========================================
*/

// ========================================
// CLASSE PRINCIPALE UX
// ========================================

class ProjectsUX {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupSmoothScrolling();
        this.setupLoadingStates();
        this.setupHoverEffects();
        this.setupAnimations();
        this.setupErrorHandling();
        this.setupPerformanceOptimizations();
    }
    
    // ========================================
    // SMOOTH SCROLLING
    // ========================================
    
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    // ========================================
    // ÉTATS DE CHARGEMENT
    // ========================================
    
    setupLoadingStates() {
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (this.type === 'submit' || this.classList.contains('btn-primary')) {
                    this.style.opacity = '0.7';
                    this.style.pointerEvents = 'none';
                    
                    setTimeout(() => {
                        this.style.opacity = '1';
                        this.style.pointerEvents = 'auto';
                    }, 1000);
                }
            });
        });
    }
    
    // ========================================
    // EFFETS DE HOVER
    // ========================================
    
    setupHoverEffects() {
        document.querySelectorAll('.projects-container, .filters-section, .page-header').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = 'var(--shadow-lg)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = 'var(--shadow-md)';
            });
        });
    }
    
    // ========================================
    // ANIMATIONS
    // ========================================
    
    setupAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        });
        
        document.querySelectorAll('.projects-container, .filters-section, .page-header').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }
    
    // ========================================
    // GESTION DES ERREURS
    // ========================================
    
    setupErrorHandling() {
        window.addEventListener('error', function(e) {
            console.error('Erreur JavaScript:', e.error);
        });
    }
    
    // ========================================
    // OPTIMISATIONS DE PERFORMANCE
    // ========================================
    
    setupPerformanceOptimizations() {
        // Lazy loading pour les images
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }
}

// ========================================
// GESTION DE L'EN-TÊTE UTILISATEUR
// ========================================

class UserHeaderManager {
    constructor() {
        this.init();
    }
    
    init() {
        this.loadUserHeaderInfo();
        this.setupHomeNavigation();
        this.setupEventListeners();
    }
    
    loadUserHeaderInfo() {
        try {
            const savedUser = localStorage.getItem('geccp-currentUser');
            if (!savedUser) {
                console.log('Aucun utilisateur connecté');
                return;
            }
            
            const currentUser = JSON.parse(savedUser);
            this.updateUserAvatar(currentUser);
            this.updateUserName(currentUser);
            this.updateUserRole(currentUser);
            this.updateAdminLink(currentUser);
            
        } catch (error) {
            console.error('Erreur lors du chargement des informations utilisateur:', error);
        }
    }
    
    updateUserAvatar(currentUser) {
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar) {
            if (currentUser.fullName) {
                const initials = currentUser.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
                userAvatar.textContent = initials;
            } else {
                userAvatar.textContent = 'U';
            }
        }
    }
    
    updateUserName(currentUser) {
        const userName = document.getElementById('userName');
        if (userName) {
            userName.textContent = currentUser.fullName || 'Utilisateur';
        }
    }
    
    updateUserRole(currentUser) {
        const userRole = document.getElementById('userRole');
        if (userRole) {
            const roleMap = {
                'ADMIN': 'Administrateur',
                'SUPER_ADMIN': 'Super Administrateur',
                'ARCHITECT': 'Architecte',
                'ENGINEER': 'Ingénieur',
                'CONTRACTOR': 'Entrepreneur',
                'BET': 'Bureau d\'Études Techniques',
                'CLIENT': 'Client'
            };
            userRole.textContent = roleMap[currentUser.role] || currentUser.role;
        }
    }
    
    updateAdminLink(currentUser) {
        const adminLink = document.getElementById('adminLink');
        if (adminLink) {
            const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'Administrator', 'admin'].includes(currentUser.role);
            adminLink.style.display = isAdmin ? 'block' : 'none';
        }
    }
    
    setupHomeNavigation() {
        const homeBtn = document.getElementById('logoutBtn');
        if (homeBtn) {
            // Le lien redirigera naturellement vers landing.html
        }
    }
    
    setupEventListeners() {
        // Écouter les mises à jour de profil
        window.addEventListener('profileUpdated', () => {
            console.log('🔄 Profil mis à jour, rechargement des informations...');
            this.loadUserHeaderInfo();
        });
        
        // Écouter les changements de localStorage
        window.addEventListener('storage', (event) => {
            if (event.key === 'geccp-currentUser') {
                console.log('🔄 Utilisateur modifié dans localStorage, mise à jour...');
                this.loadUserHeaderInfo();
            }
        });
    }
}

// ========================================
// INITIALISATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les améliorations UX
    new ProjectsUX();
    
    // Initialiser la gestion de l'en-tête utilisateur
    new UserHeaderManager();
});

// ========================================
// EXPORT POUR UTILISATION EXTERNE
// ========================================

window.ProjectsUX = ProjectsUX;
window.UserHeaderManager = UserHeaderManager;
