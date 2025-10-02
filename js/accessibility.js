/* ========================================
   ♿ ACCESSIBILITY - GECC
   ======================================== */

class AccessibilityManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.setupARIA();
    this.setupScreenReaderSupport();
    this.setupColorContrast();
    this.setupReducedMotion();
  }

  /* ===== NAVIGATION CLAVIER ===== */
  setupKeyboardNavigation() {
    // Navigation par onglets
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });

    // Navigation dans les tabs
    this.setupTabsNavigation();
    
    // Navigation dans les modales
    this.setupModalNavigation();
    
    // Navigation dans les menus
    this.setupMenuNavigation();
  }

  setupTabsNavigation() {
    const tabLists = document.querySelectorAll('[role="tablist"]');
    
    tabLists.forEach(tabList => {
      const tabs = tabList.querySelectorAll('[role="tab"]');
      const panels = document.querySelectorAll('[role="tabpanel"]');
      
      tabs.forEach((tab, index) => {
        tab.addEventListener('keydown', (e) => {
          let targetIndex;
          
          switch (e.key) {
            case 'ArrowLeft':
              e.preventDefault();
              targetIndex = index > 0 ? index - 1 : tabs.length - 1;
              break;
            case 'ArrowRight':
              e.preventDefault();
              targetIndex = index < tabs.length - 1 ? index + 1 : 0;
              break;
            case 'Home':
              e.preventDefault();
              targetIndex = 0;
              break;
            case 'End':
              e.preventDefault();
              targetIndex = tabs.length - 1;
              break;
            default:
              return;
          }
          
          this.activateTab(tabs[targetIndex], panels);
        });
      });
    });
  }

  activateTab(tab, panels) {
    // Désactiver tous les onglets
    const allTabs = document.querySelectorAll('[role="tab"]');
    const allPanels = document.querySelectorAll('[role="tabpanel"]');
    
    allTabs.forEach(t => {
      t.setAttribute('aria-selected', 'false');
      t.setAttribute('tabindex', '-1');
    });
    
    allPanels.forEach(p => {
      p.setAttribute('aria-hidden', 'true');
    });
    
    // Activer l'onglet sélectionné
    tab.setAttribute('aria-selected', 'true');
    tab.setAttribute('tabindex', '0');
    tab.focus();
    
    // Afficher le panel correspondant
    const panelId = tab.getAttribute('aria-controls');
    const panel = document.getElementById(panelId);
    if (panel) {
      panel.setAttribute('aria-hidden', 'false');
    }
  }

  setupModalNavigation() {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      modal.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        } else if (e.key === 'Escape') {
          this.closeModal(modal);
        }
      });
    });
  }

  setupMenuNavigation() {
    const menus = document.querySelectorAll('[role="menu"]');
    
    menus.forEach(menu => {
      const menuItems = menu.querySelectorAll('[role="menuitem"]');
      
      menuItems.forEach((item, index) => {
        item.addEventListener('keydown', (e) => {
          let targetIndex;
          
          switch (e.key) {
            case 'ArrowDown':
              e.preventDefault();
              targetIndex = index < menuItems.length - 1 ? index + 1 : 0;
              break;
            case 'ArrowUp':
              e.preventDefault();
              targetIndex = index > 0 ? index - 1 : menuItems.length - 1;
              break;
            case 'Home':
              e.preventDefault();
              targetIndex = 0;
              break;
            case 'End':
              e.preventDefault();
              targetIndex = menuItems.length - 1;
              break;
            case 'Escape':
              e.preventDefault();
              menu.setAttribute('aria-expanded', 'false');
              menu.previousElementSibling?.focus();
              break;
            default:
              return;
          }
          
          menuItems[targetIndex].focus();
        });
      });
    });
  }

  /* ===== GESTION DU FOCUS ===== */
  setupFocusManagement() {
    // Focus visible pour la navigation clavier
    const style = document.createElement('style');
    style.textContent = `
      .keyboard-navigation *:focus {
        outline: 2px solid var(--primary) !important;
        outline-offset: 2px !important;
      }
      
      .keyboard-navigation *:focus:not(:focus-visible) {
        outline: none !important;
      }
    `;
    document.head.appendChild(style);

    // Skip links
    this.createSkipLinks();
    
    // Focus trap pour les modales
    this.setupFocusTrap();
  }

  createSkipLinks() {
    const skipLinks = document.createElement('div');
    skipLinks.className = 'skip-links';
    skipLinks.innerHTML = `
      <a href="#main-content" class="skip-link">Aller au contenu principal</a>
      <a href="#navigation" class="skip-link">Aller à la navigation</a>
      <a href="#search" class="skip-link">Aller à la recherche</a>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      .skip-links {
        position: absolute;
        top: -100px;
        left: 0;
        z-index: 1000;
      }
      
      .skip-link {
        position: absolute;
        top: 0;
        left: 0;
        background: var(--primary);
        color: var(--primary-contrast);
        padding: var(--space-2) var(--space-4);
        text-decoration: none;
        border-radius: 0 0 var(--radius-md) 0;
        transform: translateY(-100%);
        transition: transform var(--transition-fast);
      }
      
      .skip-link:focus {
        transform: translateY(0);
      }
    `;
    
    document.head.appendChild(style);
    document.body.insertBefore(skipLinks, document.body.firstChild);
  }

  setupFocusTrap() {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        // Focus initial sur le premier élément
        modal.addEventListener('modal:open', () => {
          firstElement.focus();
        });
      }
    });
  }

  /* ===== ARIA ===== */
  setupARIA() {
    // Labels automatiques pour les inputs
    this.setupAutoLabels();
    
    // États ARIA pour les composants interactifs
    this.setupARIAStates();
    
    // Live regions pour les notifications
    this.setupLiveRegions();
  }

  setupAutoLabels() {
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
        const label = document.querySelector(`label[for="${input.id}"]`);
        const placeholder = input.getAttribute('placeholder');
        
        if (label) {
          input.setAttribute('aria-labelledby', label.id || `label-${input.id}`);
          if (!label.id) {
            label.id = `label-${input.id}`;
          }
        } else if (placeholder) {
          input.setAttribute('aria-label', placeholder);
        }
      }
    });
  }

  setupARIAStates() {
    // Boutons avec états
    const buttons = document.querySelectorAll('button');
    
    buttons.forEach(button => {
      if (button.classList.contains('btn-loading')) {
        button.setAttribute('aria-busy', 'true');
        button.setAttribute('aria-disabled', 'true');
      }
    });

    // Modales
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      
      const title = modal.querySelector('.modal-title');
      if (title) {
        modal.setAttribute('aria-labelledby', title.id || `modal-title-${Date.now()}`);
        if (!title.id) {
          title.id = `modal-title-${Date.now()}`;
        }
      }
    });

    // Tables
    const tables = document.querySelectorAll('table');
    
    tables.forEach(table => {
      if (!table.getAttribute('role')) {
        table.setAttribute('role', 'table');
      }
      
      const caption = table.querySelector('caption');
      if (caption) {
        table.setAttribute('aria-labelledby', caption.id || `table-caption-${Date.now()}`);
        if (!caption.id) {
          caption.id = `table-caption-${Date.now()}`;
        }
      }
    });
  }

  setupLiveRegions() {
    // Créer une région live pour les notifications
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'live-region';
    
    const style = document.createElement('style');
    style.textContent = `
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(liveRegion);
  }

  /* ===== SUPPORT LECTEURS D'ÉCRAN ===== */
  setupScreenReaderSupport() {
    // Annonces pour les changements d'état
    this.setupStateAnnouncements();
    
    // Descriptions contextuelles
    this.setupContextualDescriptions();
  }

  setupStateAnnouncements() {
    // Observer les changements de contenu
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Annoncer les nouveaux éléments importants
              if (node.classList.contains('toast') || 
                  node.classList.contains('modal') ||
                  node.classList.contains('alert')) {
                this.announceToScreenReader(node.textContent);
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  setupContextualDescriptions() {
    // Ajouter des descriptions pour les icônes
    const icons = document.querySelectorAll('i[class*="icon"], svg');
    
    icons.forEach(icon => {
      if (!icon.getAttribute('aria-label') && !icon.getAttribute('aria-hidden')) {
        const parent = icon.closest('button, a, [role="button"]');
        if (!parent) {
          icon.setAttribute('aria-hidden', 'true');
        }
      }
    });
  }

  /* ===== CONTRASTE COULEURS ===== */
  setupColorContrast() {
    // Vérifier le contraste des couleurs
    this.checkColorContrast();
    
    // Mode haut contraste
    this.setupHighContrastMode();
  }

  checkColorContrast() {
    const elements = document.querySelectorAll('*');
    
    elements.forEach(element => {
      const style = window.getComputedStyle(element);
      const color = style.color;
      const backgroundColor = style.backgroundColor;
      
      // Vérifier si les couleurs sont valides
      if (color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const contrast = this.calculateContrast(color, backgroundColor);
        
        if (contrast < 4.5) {
          console.warn('Contraste insuffisant:', element, contrast);
        }
      }
    });
  }

  calculateContrast(color1, color2) {
    // Conversion simplifiée pour le calcul de contraste
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return 0;
    
    const luminance1 = this.getLuminance(rgb1);
    const luminance2 = this.getLuminance(rgb2);
    
    const brightest = Math.max(luminance1, luminance2);
    const darkest = Math.min(luminance1, luminance2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  getLuminance(rgb) {
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  setupHighContrastMode() {
    // Détecter le mode haut contraste
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      document.documentElement.classList.add('high-contrast');
    }
    
    window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
      if (e.matches) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
    });
  }

  /* ===== MOUVEMENT RÉDUIT ===== */
  setupReducedMotion() {
    // Respecter la préférence de mouvement réduit
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.classList.add('reduced-motion');
    }
    
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      if (e.matches) {
        document.documentElement.classList.add('reduced-motion');
      } else {
        document.documentElement.classList.remove('reduced-motion');
      }
    });
  }

  /* ===== MÉTHODES UTILITAIRES ===== */
  announceToScreenReader(message) {
    const liveRegion = document.getElementById('live-region');
    if (liveRegion) {
      liveRegion.textContent = message;
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  }

  closeModal(modal) {
    const backdrop = modal.closest('.modal-backdrop');
    if (backdrop) {
      backdrop.classList.remove('open');
      modal.dispatchEvent(new CustomEvent('modal:close'));
    }
  }

  // Méthode publique pour annoncer des messages
  announce(message) {
    this.announceToScreenReader(message);
  }

  // Méthode publique pour gérer le focus
  trapFocus(element) {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }
}

// Initialiser l'accessibilité
document.addEventListener('DOMContentLoaded', () => {
  window.accessibilityManager = new AccessibilityManager();
});

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AccessibilityManager;
}
