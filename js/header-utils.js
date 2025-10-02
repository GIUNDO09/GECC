/**
 * Utilitaires pour la mise à jour du header
 * Gestion de l'avatar, du nom et du logo d'entreprise
 */

/**
 * Met à jour l'avatar et le nom dans le header
 * @param {Object} user - Utilisateur actuel (optionnel, récupéré automatiquement si non fourni)
 */
function updateHeaderUser(user = null) {
    const currentUser = user || localRepository.getCurrentUser();
    if (!currentUser) return;

    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');

    if (userAvatar) {
        if (currentUser.avatarBase64) {
            userAvatar.innerHTML = `<img src="${currentUser.avatarBase64}" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
        } else {
            userAvatar.textContent = (currentUser.firstName?.[0] || '') + (currentUser.lastName?.[0] || '');
        }
    }

    if (userName) {
        userName.textContent = currentUser.getFullName();
    }
}

/**
 * Met à jour le logo d'entreprise dans le header
 * @param {Object} company - Entreprise (optionnel, récupérée automatiquement si non fournie)
 */
function updateHeaderCompany(company = null) {
    const currentUser = localRepository.getCurrentUser();
    if (!currentUser || !currentUser.companyId) return;

    const companyData = company || localRepository.getCompany(currentUser.companyId);
    if (!companyData) return;

    // Chercher l'élément logo dans le header
    const logoElement = document.querySelector('.logo img');
    if (logoElement && companyData.logoBase64) {
        // Créer un élément temporaire pour tester l'image
        const tempImg = new Image();
        tempImg.onload = () => {
            logoElement.src = companyData.logoBase64;
            logoElement.alt = `${companyData.name} Logo`;
        };
        tempImg.onerror = () => {
            // Si l'image ne charge pas, garder le logo par défaut
            console.warn('Impossible de charger le logo de l\'entreprise');
        };
        tempImg.src = companyData.logoBase64;
    }
}

/**
 * Met à jour le badge de notification dans la navigation
 */
function updateNotificationBadge() {
    const currentUser = localRepository.getCurrentUser();
    if (!currentUser) return;

    const unreadCount = localRepository.getUnreadNotificationsCount(currentUser.id);
    const badge = document.getElementById('dashboardNotificationBadge');
    
    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
}

/**
 * Met à jour complètement le header (utilisateur + entreprise + notifications)
 */
function updateHeader() {
    updateHeaderUser();
    updateHeaderCompany();
    updateNotificationBadge();
}

/**
 * Initialise le header au chargement de la page
 */
function initHeader() {
    // Attendre que le DOM soit chargé
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateHeader);
    } else {
        updateHeader();
    }
}
