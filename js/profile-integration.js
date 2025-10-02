/**
 * Module d'intégration du profil utilisateur
 * Gère l'affichage cohérent des informations utilisateur dans toute l'application
 */

class ProfileIntegration {
    constructor() {
        this.currentUser = null;
        this.companyData = null;
        this.init();
    }

    init() {
        this.loadUserData();
        this.loadCompanyData();
        this.setupEventListeners();
        this.updateAllDisplays();
    }

    // Charger les données utilisateur
    loadUserData() {
        try {
            // Essayer d'abord le système GECC
            const sessionData = localStorage.getItem('currentSession');
            if (sessionData) {
                const session = JSON.parse(sessionData);
                const geccData = JSON.parse(localStorage.getItem('gecc_data') || '{}');
                const users = geccData.users || [];
                this.currentUser = users.find(user => user.id === session.id);
            }
            
            // Fallback vers l'ancien système
            if (!this.currentUser) {
                const savedUser = localStorage.getItem('geccp-currentUser');
                if (savedUser) {
                    this.currentUser = JSON.parse(savedUser);
                }
            }
            
            // Fallback vers le profil settings
            if (!this.currentUser) {
                const profileData = JSON.parse(localStorage.getItem('userProfile') || '{}');
                if (profileData.fullName) {
                    this.currentUser = profileData;
                }
            }
            
            console.log('👤 Utilisateur chargé:', this.currentUser?.fullName || 'Aucun');
        } catch (error) {
            console.error('Erreur lors du chargement des données utilisateur:', error);
        }
    }

    // Charger les données d'entreprise
    loadCompanyData() {
        try {
            this.companyData = JSON.parse(localStorage.getItem('companyProfile') || '{}');
            console.log('🏢 Données entreprise chargées:', this.companyData?.name || 'Aucune');
        } catch (error) {
            console.error('Erreur lors du chargement des données d\'entreprise:', error);
        }
    }

    // Configurer les écouteurs d'événements
    setupEventListeners() {
        // Écouter les changements de profil
        window.addEventListener('storage', (e) => {
            if (e.key === 'geccp-currentUser' || e.key === 'userProfile') {
                this.loadUserData();
                this.updateAllDisplays();
            }
            if (e.key === 'companyProfile') {
                this.loadCompanyData();
                this.updateAllDisplays();
            }
        });

        // Écouter les événements personnalisés
        window.addEventListener('profileUpdated', (e) => {
            this.loadUserData();
            this.updateAllDisplays();
        });

        window.addEventListener('companyUpdated', (e) => {
            this.loadCompanyData();
            this.updateAllDisplays();
        });
    }

    // Mettre à jour l'affichage du header
    updateHeaderDisplay() {
        if (!this.currentUser) return;

        const initials = this.getUserInitials(this.currentUser.fullName);
        
        // Mettre à jour l'avatar
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar) {
            if (this.currentUser.avatarBase64) {
                userAvatar.innerHTML = `<img src="${this.currentUser.avatarBase64}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            } else {
                userAvatar.textContent = initials;
            }
        }

        // Mettre à jour le nom
        const userName = document.getElementById('userName');
        if (userName) {
            userName.textContent = this.currentUser.fullName || 'Utilisateur';
        }

        // Mettre à jour le rôle
        const userRole = document.getElementById('userRole');
        if (userRole) {
            const roleMap = {
                'architect': 'Architecte',
                'bct': 'Bureau de Contrôle Technique',
                'bet': 'Bureau d\'Études Techniques',
                'contractor': 'Entrepreneur',
                'admin': 'Administrateur',
                'ADMIN': 'Administrateur',
                'SUPER_ADMIN': 'Super Administrateur'
            };
            userRole.textContent = roleMap[this.currentUser.role] || this.currentUser.role || 'Utilisateur';
        }

        // Gérer l'affichage du lien d'administration
        const adminLink = document.getElementById('adminLink');
        if (adminLink) {
            const isAdmin = ['admin', 'ADMIN', 'SUPER_ADMIN', 'Administrator'].includes(this.currentUser.role);
            adminLink.style.display = isAdmin ? 'block' : 'none';
        }
    }

    // Mettre à jour l'affichage dans les projets
    updateProjectDisplay() {
        // Mettre à jour les créateurs de projets
        document.querySelectorAll('.project-creator').forEach(element => {
            if (this.currentUser) {
                this.displayUser(element, this.currentUser, { showRole: true, showCompany: true });
            }
        });

        // Mettre à jour les membres de projets
        document.querySelectorAll('.project-member').forEach(element => {
            const userId = element.dataset.userId;
            if (userId && this.currentUser && userId === this.currentUser.id) {
                this.displayUser(element, this.currentUser, { showCompany: true });
            }
        });

        // Mettre à jour les logos d'entreprise dans les projets
        if (this.companyData?.logoBase64) {
            document.querySelectorAll('.project-company-logo').forEach(element => {
                element.innerHTML = `<img src="${this.companyData.logoBase64}" alt="Logo entreprise" style="width: 100%; height: 100%; object-fit: contain;">`;
            });
        }
    }

    // Mettre à jour l'affichage dans les commentaires
    updateCommentsDisplay() {
        document.querySelectorAll('.comment-author').forEach(element => {
            if (this.currentUser) {
                this.displayUserInComment(element, this.currentUser);
            }
        });
    }

    // Afficher un utilisateur dans un élément
    displayUser(element, user, options = {}) {
        if (!user) return;

        const {
            showAvatar = true,
            showRole = false,
            showCompany = false,
            size = 'medium',
            className = ''
        } = options;

        const initials = this.getUserInitials(user.fullName || user.name);
        const displayName = user.fullName || user.name || 'Utilisateur';
        const role = user.role || '';
        const company = user.companyName || user.company || this.companyData?.name || '';

        let html = '';
        
        if (showAvatar) {
            const avatarSize = this.getAvatarSize(size);
            if (user.avatarBase64) {
                html += `<div class="user-avatar ${avatarSize} ${className}"><img src="${user.avatarBase64}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;"></div>`;
            } else {
                html += `<div class="user-avatar ${avatarSize} ${className}">${initials}</div>`;
            }
        }
        
        html += `<div class="user-info">`;
        html += `<div class="user-name">${displayName}</div>`;
        
        if (showRole && role) {
            html += `<div class="user-role">${role}</div>`;
        }
        
        if (showCompany && company) {
            html += `<div class="user-company">${company}</div>`;
        }
        
        html += `</div>`;

        element.innerHTML = html;
    }

    // Afficher un utilisateur dans un commentaire
    displayUserInComment(commentElement, user) {
        if (!user) return;

        const initials = this.getUserInitials(user.fullName || user.name);
        const displayName = user.fullName || user.name || 'Utilisateur';

        const userInfo = commentElement.querySelector('.comment-author');
        if (userInfo) {
            let avatarHtml = '';
            if (user.avatarBase64) {
                avatarHtml = `<div class="user-avatar small"><img src="${user.avatarBase64}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;"></div>`;
            } else {
                avatarHtml = `<div class="user-avatar small">${initials}</div>`;
            }
            
            userInfo.innerHTML = `
                ${avatarHtml}
                <div class="user-details">
                    <div class="user-name">${displayName}</div>
                    <div class="comment-time">${new Date().toLocaleString()}</div>
                </div>
            `;
        }
    }

    // Mettre à jour tous les affichages
    updateAllDisplays() {
        this.updateHeaderDisplay();
        this.updateProjectDisplay();
        this.updateCommentsDisplay();
    }

    // Utilitaires
    getUserInitials(name) {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }

    getAvatarSize(size) {
        const sizes = {
            small: 'avatar-sm',
            medium: 'avatar-md',
            large: 'avatar-lg'
        };
        return sizes[size] || sizes.medium;
    }

    // Obtenir les données utilisateur actuelles
    getCurrentUser() {
        return this.currentUser;
    }

    // Obtenir les données d'entreprise actuelles
    getCompanyData() {
        return this.companyData;
    }

    // Forcer la mise à jour
    refresh() {
        this.loadUserData();
        this.loadCompanyData();
        this.updateAllDisplays();
    }
}

// Instance globale
window.profileIntegration = new ProfileIntegration();

// Fonctions utilitaires globales
window.updateUserDisplay = function() {
    if (window.profileIntegration) {
        window.profileIntegration.updateAllDisplays();
    }
};

window.getCurrentUser = function() {
    return window.profileIntegration?.getCurrentUser();
};

window.getCompanyData = function() {
    return window.profileIntegration?.getCompanyData();
};

// Auto-refresh lors des changements de localStorage
window.addEventListener('storage', function(e) {
    if (e.key === 'geccp-currentUser' || e.key === 'userProfile' || e.key === 'companyProfile') {
        setTimeout(() => {
            if (window.profileIntegration) {
                window.profileIntegration.refresh();
            }
        }, 100);
    }
});

// Ajouter les styles CSS pour l'affichage des profils
const profileIntegrationStyles = `
<style>
/* Styles pour l'affichage des profils utilisateur */
.user-avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-weight: bold;
    color: white;
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    flex-shrink: 0;
}

.user-avatar.avatar-sm {
    width: 24px;
    height: 24px;
    font-size: 10px;
}

.user-avatar.avatar-md {
    width: 32px;
    height: 32px;
    font-size: 12px;
}

.user-avatar.avatar-lg {
    width: 48px;
    height: 48px;
    font-size: 18px;
}

.user-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.user-name {
    font-weight: 600;
    color: var(--text-primary, #1e293b);
    font-size: 14px;
}

.user-role {
    font-size: 12px;
    color: var(--text-secondary, #64748b);
}

.user-company {
    font-size: 11px;
    color: var(--text-muted, #94a3b8);
    font-style: italic;
}

/* Styles pour les commentaires */
.comment-author {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

.comment-time {
    font-size: 11px;
    color: var(--text-muted, #94a3b8);
}

/* Styles pour les logos d'entreprise */
.project-company-logo {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    overflow: hidden;
    background: var(--bg-secondary, #f8fafc);
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Responsive */
@media (max-width: 768px) {
    .user-avatar.avatar-lg {
        width: 40px;
        height: 40px;
        font-size: 16px;
    }
    
    .user-name {
        font-size: 13px;
    }
}
</style>
`;

// Injecter les styles dans le document
if (typeof document !== 'undefined') {
    const styleElement = document.createElement('div');
    styleElement.innerHTML = profileIntegrationStyles;
    document.head.appendChild(styleElement.firstElementChild);
}
