/* ========================================
   🎭 ÉTATS - GECC
   ======================================== */

class StateManager {
  constructor() {
    this.loadingStates = new Map();
    this.errorStates = new Map();
    this.emptyStates = new Map();
    this.init();
  }

  init() {
    this.setupLoadingStates();
    this.setupErrorStates();
    this.setupEmptyStates();
    this.setupToastNotifications();
  }

  /* ===== ÉTATS DE CHARGEMENT ===== */
  setupLoadingStates() {
    // Observer les boutons avec classe btn-loading
    document.addEventListener('click', (e) => {
      const button = e.target.closest('.btn-loading');
      if (button) {
        this.showButtonLoading(button);
      }
    });
  }

  showButtonLoading(button) {
    const originalText = button.textContent;
    const originalHTML = button.innerHTML;
    
    button.setAttribute('data-original-content', originalHTML);
    button.innerHTML = `
      <span class="loading-spinner"></span>
      Chargement...
    `;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    
    // Stocker l'état pour pouvoir le restaurer
    this.loadingStates.set(button, {
      originalHTML,
      originalText,
      timeout: setTimeout(() => {
        this.hideButtonLoading(button);
      }, 30000) // Timeout de 30 secondes
    });
  }

  hideButtonLoading(button) {
    const state = this.loadingStates.get(button);
    if (state) {
      clearTimeout(state.timeout);
      button.innerHTML = state.originalHTML;
      button.disabled = false;
      button.removeAttribute('aria-busy');
      this.loadingStates.delete(button);
    }
  }

  showSkeleton(container, type = 'default') {
    const skeletonHTML = this.getSkeletonHTML(type);
    container.innerHTML = skeletonHTML;
    container.classList.add('skeleton-container');
  }

  hideSkeleton(container) {
    container.classList.remove('skeleton-container');
  }

  getSkeletonHTML(type) {
    const skeletons = {
      default: `
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text short"></div>
        <div class="skeleton skeleton-text medium"></div>
      `,
      card: `
        <div class="skeleton skeleton-card">
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text short"></div>
        </div>
      `,
      table: `
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text short"></div>
      `,
      profile: `
        <div class="flex items-center gap-3">
          <div class="skeleton skeleton-avatar"></div>
          <div class="flex-1">
            <div class="skeleton skeleton-text short"></div>
            <div class="skeleton skeleton-text medium"></div>
          </div>
        </div>
      `,
      button: `
        <div class="skeleton skeleton-button"></div>
      `
    };
    
    return skeletons[type] || skeletons.default;
  }

  /* ===== ÉTATS D'ERREUR ===== */
  setupErrorStates() {
    // Gestionnaire global d'erreurs
    window.addEventListener('error', (e) => {
      this.showGlobalError('Une erreur inattendue s\'est produite');
    });

    // Gestionnaire pour les erreurs de promesses non capturées
    window.addEventListener('unhandledrejection', (e) => {
      this.showGlobalError('Une erreur réseau s\'est produite');
    });
  }

  showError(container, message, type = 'error') {
    const errorHTML = this.getErrorHTML(message, type);
    container.innerHTML = errorHTML;
    container.classList.add('error-state');
    
    // Annoncer l'erreur aux lecteurs d'écran
    if (window.accessibilityManager) {
      window.accessibilityManager.announce(`Erreur: ${message}`);
    }
  }

  showGlobalError(message) {
    this.showToast(message, 'danger');
  }

  getErrorHTML(message, type) {
    const icons = {
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    
    const icon = icons[type] || icons.error;
    
    return `
      <div class="error-state">
        <div class="error-icon">${icon}</div>
        <h3 class="error-title">Une erreur s'est produite</h3>
        <p class="error-message">${message}</p>
        <button class="btn btn-primary" onclick="this.closest('.error-state').remove()">
          Fermer
        </button>
      </div>
    `;
  }

  showFormError(input, message) {
    const formGroup = input.closest('.form-group');
    if (!formGroup) return;
    
    // Supprimer les erreurs existantes
    const existingError = formGroup.querySelector('.form-error');
    if (existingError) {
      existingError.remove();
    }
    
    // Ajouter la nouvelle erreur
    const errorElement = document.createElement('div');
    errorElement.className = 'form-error';
    errorElement.textContent = message;
    
    input.classList.add('error');
    formGroup.appendChild(errorElement);
    
    // Focus sur l'input en erreur
    input.focus();
    
    // Annoncer l'erreur
    if (window.accessibilityManager) {
      window.accessibilityManager.announce(`Erreur: ${message}`);
    }
  }

  clearFormError(input) {
    const formGroup = input.closest('.form-group');
    if (!formGroup) return;
    
    const errorElement = formGroup.querySelector('.form-error');
    if (errorElement) {
      errorElement.remove();
    }
    
    input.classList.remove('error');
  }

  /* ===== ÉTATS VIDES ===== */
  setupEmptyStates() {
    // Observer les conteneurs vides
    this.observeEmptyContainers();
  }

  observeEmptyContainers() {
    const containers = document.querySelectorAll('[data-empty-state]');
    
    containers.forEach(container => {
      this.checkEmptyState(container);
    });
  }

  checkEmptyState(container) {
    const isEmpty = this.isContainerEmpty(container);
    const emptyStateType = container.getAttribute('data-empty-state');
    
    if (isEmpty) {
      this.showEmptyState(container, emptyStateType);
    } else {
      this.hideEmptyState(container);
    }
  }

  isContainerEmpty(container) {
    const children = container.children;
    let visibleChildren = 0;
    
    for (let child of children) {
      if (child.style.display !== 'none' && 
          !child.classList.contains('empty-state') &&
          !child.classList.contains('skeleton-container')) {
        visibleChildren++;
      }
    }
    
    return visibleChildren === 0;
  }

  showEmptyState(container, type = 'default') {
    const emptyStateHTML = this.getEmptyStateHTML(type);
    container.innerHTML = emptyStateHTML;
    container.classList.add('empty-state-container');
  }

  hideEmptyState(container) {
    const emptyState = container.querySelector('.empty-state');
    if (emptyState) {
      emptyState.remove();
    }
    container.classList.remove('empty-state-container');
  }

  getEmptyStateHTML(type) {
    const emptyStates = {
      default: {
        icon: '📭',
        title: 'Aucun élément',
        description: 'Il n\'y a aucun élément à afficher pour le moment.',
        action: null
      },
      projects: {
        icon: '📁',
        title: 'Aucun projet',
        description: 'Vous n\'avez pas encore de projets. Créez votre premier projet pour commencer.',
        action: {
          text: 'Créer un projet',
          href: '#/projects/new'
        }
      },
      documents: {
        icon: '📄',
        title: 'Aucun document',
        description: 'Aucun document n\'a été trouvé. Ajoutez des documents pour les organiser.',
        action: {
          text: 'Ajouter un document',
          href: '#/documents/upload'
        }
      },
      tasks: {
        icon: '✅',
        title: 'Aucune tâche',
        description: 'Vous n\'avez aucune tâche en cours. Créez une nouvelle tâche pour commencer.',
        action: {
          text: 'Créer une tâche',
          href: '#/tasks/new'
        }
      },
      notifications: {
        icon: '🔔',
        title: 'Aucune notification',
        description: 'Vous êtes à jour ! Aucune nouvelle notification pour le moment.',
        action: null
      },
      search: {
        icon: '🔍',
        title: 'Aucun résultat',
        description: 'Aucun résultat trouvé pour votre recherche. Essayez avec d\'autres mots-clés.',
        action: {
          text: 'Nouvelle recherche',
          href: '#/search'
        }
      },
      error: {
        icon: '⚠️',
        title: 'Erreur de chargement',
        description: 'Impossible de charger les données. Vérifiez votre connexion et réessayez.',
        action: {
          text: 'Réessayer',
          onclick: 'window.location.reload()'
        }
      }
    };
    
    const state = emptyStates[type] || emptyStates.default;
    
    let actionHTML = '';
    if (state.action) {
      if (state.action.href) {
        actionHTML = `
          <a href="${state.action.href}" class="btn btn-primary">
            ${state.action.text}
          </a>
        `;
      } else if (state.action.onclick) {
        actionHTML = `
          <button class="btn btn-primary" onclick="${state.action.onclick}">
            ${state.action.text}
          </button>
        `;
      }
    }
    
    return `
      <div class="empty-state">
        <div class="empty-state-icon">${state.icon}</div>
        <h3 class="empty-state-title">${state.title}</h3>
        <p class="empty-state-description">${state.description}</p>
        ${actionHTML}
      </div>
    `;
  }

  /* ===== NOTIFICATIONS TOAST ===== */
  setupToastNotifications() {
    // Créer le conteneur de toasts s'il n'existe pas
    if (!document.querySelector('.toast-container')) {
      const container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
  }

  showToast(message, type = 'info', duration = 5000) {
    const container = document.querySelector('.toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
      success: '✅',
      warning: '⚠️',
      danger: '❌',
      info: 'ℹ️'
    };
    
    const icon = icons[type] || icons.info;
    
    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <div class="toast-content">
        <h4 class="toast-title">${this.getToastTitle(type)}</h4>
        <p class="toast-message">${message}</p>
      </div>
      <button class="toast-close" aria-label="Fermer">×</button>
    `;
    
    // Gestionnaire de fermeture
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
      this.hideToast(toast);
    });
    
    container.appendChild(toast);
    
    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => {
        this.hideToast(toast);
      }, duration);
    }
    
    // Annoncer aux lecteurs d'écran
    if (window.accessibilityManager) {
      window.accessibilityManager.announce(`${this.getToastTitle(type)}: ${message}`);
    }
    
    return toast;
  }

  hideToast(toast) {
    toast.style.animation = 'slideOut 0.3s ease-in forwards';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  getToastTitle(type) {
    const titles = {
      success: 'Succès',
      warning: 'Attention',
      danger: 'Erreur',
      info: 'Information'
    };
    
    return titles[type] || titles.info;
  }

  /* ===== MÉTHODES PUBLIQUES ===== */
  
  // Méthode pour afficher un état de chargement sur un conteneur
  showLoading(container, type = 'default') {
    this.showSkeleton(container, type);
  }

  // Méthode pour masquer un état de chargement
  hideLoading(container) {
    this.hideSkeleton(container);
  }

  // Méthode pour afficher une erreur
  showError(container, message, type = 'error') {
    this.showError(container, message, type);
  }

  // Méthode pour afficher un état vide
  showEmpty(container, type = 'default') {
    this.showEmptyState(container, type);
  }

  // Méthode pour masquer un état vide
  hideEmpty(container) {
    this.hideEmptyState(container);
  }

  // Méthode pour afficher une notification
  notify(message, type = 'info', duration = 5000) {
    return this.showToast(message, type, duration);
  }

  // Méthode pour gérer les états d'un formulaire
  setFormState(form, state, message = '') {
    const inputs = form.querySelectorAll('input, select, textarea');
    
    switch (state) {
      case 'loading':
        inputs.forEach(input => {
          input.disabled = true;
        });
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          this.showButtonLoading(submitBtn);
        }
        break;
        
      case 'error':
        inputs.forEach(input => {
          input.classList.add('error');
        });
        if (message) {
          this.showToast(message, 'danger');
        }
        break;
        
      case 'success':
        inputs.forEach(input => {
          input.classList.remove('error');
          input.disabled = false;
        });
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
          this.hideButtonLoading(submitButton);
        }
        if (message) {
          this.showToast(message, 'success');
        }
        break;
        
      case 'reset':
        inputs.forEach(input => {
          input.classList.remove('error');
          input.disabled = false;
          this.clearFormError(input);
        });
        const resetButton = form.querySelector('button[type="submit"]');
        if (resetButton) {
          this.hideButtonLoading(resetButton);
        }
        break;
    }
  }
}

// Initialiser le gestionnaire d'états
document.addEventListener('DOMContentLoaded', () => {
  window.stateManager = new StateManager();
});

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StateManager;
}
