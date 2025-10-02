/**
 * Module d'affichage des profils utilisateur
 * Gère l'affichage cohérent des informations utilisateur dans toute l'application
 */

class ProfileDisplay {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadCurrentUser();
    }

    loadCurrentUser() {
        try {
            const savedUser = localStorage.getItem('geccp-currentUser');
            if (savedUser) {
                this.currentUser = JSON.parse(savedUser);
            }
        } catch (error) {
            console.error('Erreur lors du chargement de l\'utilisateur:', error);
        }
    }

    /**
     * Met à jour l'affichage du header avec les informations utilisateur
     */
    updateHeaderDisplay() {
        if (!this.currentUser) return;

        const initials = this.getUserInitials(this.currentUser.fullName);
        
        // Mettre à jour l'avatar
        const userAvatar = document.querySelector('.user-avatar');
        if (userAvatar) {
            userAvatar.textContent = initials;
        }

        // Mettre à jour les détails utilisateur
        const userName = document.querySelector('.user-details h4');
        const userRole = document.querySelector('.user-details p');
        
        if (userName) userName.textContent = this.currentUser.fullName;
        if (userRole) userRole.textContent = this.currentUser.role;
    }

    /**
     * Affiche un utilisateur dans un élément avec avatar et nom
     */
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
        const company = user.companyName || user.company || '';

        let html = '';
        
        if (showAvatar) {
            const avatarSize = this.getAvatarSize(size);
            html += `<div class="user-avatar ${avatarSize} ${className}">${initials}</div>`;
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

    /**
     * Affiche un utilisateur dans un tableau de membres
     */
    displayMemberInTable(row, user, projectRole = null) {
        if (!user) return;

        const initials = this.getUserInitials(user.fullName || user.name);
        const displayName = user.fullName || user.name || 'Utilisateur';
        const role = projectRole || user.role || '';
        const company = user.companyName || user.company || '';

        row.innerHTML = `
            <td class="member-avatar">
                <div class="user-avatar small">${initials}</div>
            </td>
            <td class="member-name">
                <div class="user-name">${displayName}</div>
                ${company ? `<div class="user-company">${company}</div>` : ''}
            </td>
            <td class="member-role">
                <span class="role-badge">${role}</span>
            </td>
            <td class="member-actions">
                <button class="btn btn-sm btn-outline" onclick="editMember('${user.id}')">
                    <span>✏️</span> Modifier
                </button>
            </td>
        `;
    }

    /**
     * Affiche un utilisateur dans un commentaire
     */
    displayUserInComment(commentElement, user) {
        if (!user) return;

        const initials = this.getUserInitials(user.fullName || user.name);
        const displayName = user.fullName || user.name || 'Utilisateur';

        const userInfo = commentElement.querySelector('.comment-author');
        if (userInfo) {
            userInfo.innerHTML = `
                <div class="user-avatar small">${initials}</div>
                <div class="user-details">
                    <div class="user-name">${displayName}</div>
                    <div class="comment-time">${new Date().toLocaleString()}</div>
                </div>
            `;
        }
    }

    /**
     * Met à jour l'affichage dans les projets
     */
    updateProjectDisplay() {
        // Mettre à jour les créateurs de projets
        document.querySelectorAll('.project-creator').forEach(element => {
            if (this.currentUser) {
                this.displayUser(element, this.currentUser, { showRole: true });
            }
        });

        // Mettre à jour les membres de projets
        document.querySelectorAll('.project-member').forEach(element => {
            const userId = element.dataset.userId;
            if (userId && this.currentUser && userId === this.currentUser.id) {
                this.displayUser(element, this.currentUser, { showCompany: true });
            }
        });
    }

    /**
     * Utilitaires
     */
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

    /**
     * Met à jour toutes les affichages de l'application
     */
    updateAllDisplays() {
        this.loadCurrentUser();
        this.updateHeaderDisplay();
        this.updateProjectDisplay();
    }
}

// Instance globale
window.profileDisplay = new ProfileDisplay();

// Fonction utilitaire pour les autres modules
window.updateUserDisplay = function() {
    if (window.profileDisplay) {
        window.profileDisplay.updateAllDisplays();
    }
};

// Auto-update lors des changements de localStorage
window.addEventListener('storage', function(e) {
    if (e.key === 'geccp-currentUser') {
        window.updateUserDisplay();
    }
});

// Ajouter les styles CSS pour l'affichage des profils
const profileStyles = `
<style>
/* Styles pour l'affichage des profils utilisateur */
.user-avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-weight: bold;
    color: white;
    background: var(--secondary-gradient, linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%));
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

/* Styles pour les tableaux de membres */
.member-avatar {
    width: 50px;
    text-align: center;
}

.member-name {
    min-width: 200px;
}

.member-role {
    width: 120px;
}

.member-actions {
    width: 100px;
    text-align: center;
}

.role-badge {
    display: inline-block;
    padding: 4px 8px;
    background: var(--accent-gradient, linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%));
    color: white;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
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

/* Responsive */
@media (max-width: 768px) {
    .member-name {
        min-width: 150px;
    }
    
    .member-role {
        width: 100px;
    }
    
    .member-actions {
        width: 80px;
    }
}
</style>
`;

// Injecter les styles dans le document
if (typeof document !== 'undefined') {
    const styleElement = document.createElement('div');
    styleElement.innerHTML = profileStyles;
    document.head.appendChild(styleElement.firstElementChild);
}
