/**
 * Module de filtrage des notifications
 * Gère l'affichage des notifications selon les préférences utilisateur
 */

class NotificationFilter {
    constructor() {
        this.preferences = this.loadPreferences();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applyFilters();
    }

    loadPreferences() {
        try {
            return JSON.parse(localStorage.getItem('notificationPreferences') || '{}');
        } catch (error) {
            console.error('Erreur lors du chargement des préférences de notifications:', error);
            return {
                invitations: true,
                submissions: true,
                visas: true,
                comments: true,
                tasks: true
            };
        }
    }

    setupEventListeners() {
        // Écouter les changements de préférences
        window.addEventListener('notificationPreferencesChanged', (event) => {
            this.preferences = event.detail.preferences;
            this.applyFilters();
        });

        // Écouter les changements de localStorage
        window.addEventListener('storage', (event) => {
            if (event.key === 'notificationPreferences') {
                this.preferences = this.loadPreferences();
                this.applyFilters();
            }
        });
    }

    applyFilters() {
        this.filterDashboardNotifications();
        this.filterProjectNotifications();
        this.filterCommentNotifications();
    }

    filterDashboardNotifications() {
        const notificationCards = document.querySelectorAll('.notification-card, .activity-item, .notification-item');
        
        notificationCards.forEach(card => {
            const type = this.getNotificationType(card);
            const shouldShow = this.shouldShowNotification(type);
            
            if (shouldShow) {
                card.style.display = 'block';
                card.classList.remove('notification-hidden');
            } else {
                card.style.display = 'none';
                card.classList.add('notification-hidden');
            }
        });
    }

    filterProjectNotifications() {
        const projectNotifications = document.querySelectorAll('.project-notification, .project-activity');
        
        projectNotifications.forEach(notification => {
            const type = this.getNotificationType(notification);
            const shouldShow = this.shouldShowNotification(type);
            
            if (shouldShow) {
                notification.style.display = 'block';
                notification.classList.remove('notification-hidden');
            } else {
                notification.style.display = 'none';
                notification.classList.add('notification-hidden');
            }
        });
    }

    filterCommentNotifications() {
        const commentNotifications = document.querySelectorAll('.comment-notification, .comment-activity');
        
        commentNotifications.forEach(notification => {
            const type = this.getNotificationType(notification);
            const shouldShow = this.shouldShowNotification(type);
            
            if (shouldShow) {
                notification.style.display = 'block';
                notification.classList.remove('notification-hidden');
            } else {
                notification.style.display = 'none';
                notification.classList.add('notification-hidden');
            }
        });
    }

    getNotificationType(element) {
        // Déterminer le type de notification basé sur les classes CSS ou le contenu
        const classList = element.classList;
        const textContent = element.textContent.toLowerCase();
        
        if (classList.contains('invitation') || textContent.includes('invitation')) {
            return 'invitations';
        }
        if (classList.contains('submission') || textContent.includes('soumission') || textContent.includes('document')) {
            return 'submissions';
        }
        if (classList.contains('visa') || textContent.includes('visa') || textContent.includes('observation')) {
            return 'visas';
        }
        if (classList.contains('comment') || textContent.includes('commentaire')) {
            return 'comments';
        }
        if (classList.contains('task') || textContent.includes('tâche') || textContent.includes('task')) {
            return 'tasks';
        }
        
        return 'other';
    }

    shouldShowNotification(type) {
        // Si le type n'est pas dans les préférences, l'afficher par défaut
        if (!(type in this.preferences)) {
            return true;
        }
        
        return this.preferences[type] === true;
    }

    // Méthode pour forcer le rechargement des filtres
    refresh() {
        this.preferences = this.loadPreferences();
        this.applyFilters();
    }

    // Méthode pour obtenir les statistiques de filtrage
    getFilterStats() {
        const total = document.querySelectorAll('.notification-card, .activity-item, .notification-item').length;
        const hidden = document.querySelectorAll('.notification-hidden').length;
        const visible = total - hidden;
        
        return {
            total,
            visible,
            hidden,
            hiddenPercentage: total > 0 ? Math.round((hidden / total) * 100) : 0
        };
    }
}

// Initialiser le filtre de notifications
window.notificationFilter = new NotificationFilter();

// Exposer la classe globalement
window.NotificationFilter = NotificationFilter;
