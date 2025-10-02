/* ========================================
   🌙 THÈME SOMBRE - GECC
   ======================================== */

class ThemeManager {
  constructor() {
    this.currentTheme = 'light';
    this.themeKey = 'gecc-theme';
    this.init();
  }

  init() {
    this.loadTheme();
    this.setupThemeToggle();
    this.setupSystemPreference();
    this.setupThemeTransition();
  }

  /* ===== CHARGEMENT DU THÈME ===== */
  loadTheme() {
    // 1. Vérifier le stockage local
    const savedTheme = localStorage.getItem(this.themeKey);
    
    // 2. Vérifier la préférence système
    const systemPreference = this.getSystemPreference();
    
    // 3. Déterminer le thème à utiliser
    const theme = savedTheme || systemPreference;
    
    this.setTheme(theme);
  }

  getSystemPreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  /* ===== CONFIGURATION DU THÈME ===== */
  setTheme(theme) {
    this.currentTheme = theme;
    
    // Appliquer le thème au document
    document.documentElement.setAttribute('data-theme', theme);
    
    // Sauvegarder la préférence
    localStorage.setItem(this.themeKey, theme);
    
    // Mettre à jour l'interface
    this.updateThemeToggle();
    
    // Déclencher l'événement de changement de thème
    this.dispatchThemeChange(theme);
    
    // Mettre à jour les meta tags
    this.updateMetaTags(theme);
  }

  updateThemeToggle() {
    const toggles = document.querySelectorAll('[data-theme-toggle]');
    
    toggles.forEach(toggle => {
      const icon = toggle.querySelector('.theme-icon');
      const text = toggle.querySelector('.theme-text');
      
      if (icon) {
        icon.textContent = this.currentTheme === 'dark' ? '☀️' : '🌙';
      }
      
      if (text) {
        text.textContent = this.currentTheme === 'dark' ? 'Mode clair' : 'Mode sombre';
      }
      
      // Mettre à jour l'état checked pour les inputs
      if (toggle.type === 'checkbox') {
        toggle.checked = this.currentTheme === 'dark';
      }
    });
  }

  updateMetaTags(theme) {
    // Mettre à jour la couleur de la barre d'adresse (mobile)
    const themeColor = theme === 'dark' ? '#0f172a' : '#ffffff';
    
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.content = themeColor;
    
    // Mettre à jour la couleur de fond pour éviter le flash
    document.documentElement.style.backgroundColor = theme === 'dark' ? '#0f172a' : '#ffffff';
  }

  /* ===== BOUTON DE BASCULEMENT ===== */
  setupThemeToggle() {
    // Créer le bouton de basculement s'il n'existe pas
    this.createThemeToggle();
    
    // Gérer les clics sur les boutons existants
    document.addEventListener('click', (e) => {
      const toggle = e.target.closest('[data-theme-toggle]');
      if (toggle) {
        e.preventDefault();
        this.toggleTheme();
      }
    });
  }

  createThemeToggle() {
    // Vérifier si un bouton existe déjà
    if (document.querySelector('[data-theme-toggle]')) {
      return;
    }
    
    // Créer le bouton de basculement
    const toggle = document.createElement('button');
    toggle.className = 'btn btn-ghost theme-toggle';
    toggle.setAttribute('data-theme-toggle', '');
    toggle.setAttribute('aria-label', 'Basculer le thème');
    toggle.innerHTML = `
      <span class="theme-icon">${this.currentTheme === 'dark' ? '☀️' : '🌙'}</span>
      <span class="theme-text hidden-mobile">${this.currentTheme === 'dark' ? 'Mode clair' : 'Mode sombre'}</span>
    `;
    
    // Ajouter au header s'il existe
    const headerActions = document.querySelector('.header-actions');
    if (headerActions) {
      headerActions.appendChild(toggle);
    } else {
      // Sinon, ajouter au body
      document.body.appendChild(toggle);
    }
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /* ===== PRÉFÉRENCE SYSTÈME ===== */
  setupSystemPreference() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      // Écouter les changements de préférence système
      mediaQuery.addEventListener('change', (e) => {
        // Seulement si l'utilisateur n'a pas de préférence sauvegardée
        if (!localStorage.getItem(this.themeKey)) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  /* ===== TRANSITIONS ===== */
  setupThemeTransition() {
    // Ajouter une transition fluide pour le changement de thème
    const style = document.createElement('style');
    style.textContent = `
      * {
        transition: background-color var(--transition-normal),
                    border-color var(--transition-normal),
                    color var(--transition-normal),
                    box-shadow var(--transition-normal) !important;
      }
      
      /* Désactiver les transitions pendant le changement de thème */
      .theme-transitioning * {
        transition: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  /* ===== ÉVÉNEMENTS ===== */
  dispatchThemeChange(theme) {
    const event = new CustomEvent('theme:change', {
      detail: { theme }
    });
    document.dispatchEvent(event);
  }

  /* ===== MÉTHODES PUBLIQUES ===== */
  
  // Obtenir le thème actuel
  getCurrentTheme() {
    return this.currentTheme;
  }

  // Forcer un thème spécifique
  setTheme(theme) {
    if (['light', 'dark'].includes(theme)) {
      this.setTheme(theme);
    }
  }

  // Basculer entre les thèmes
  toggle() {
    this.toggleTheme();
  }

  // Réinitialiser aux préférences système
  resetToSystem() {
    localStorage.removeItem(this.themeKey);
    const systemTheme = this.getSystemPreference();
    this.setTheme(systemTheme);
  }

  // Obtenir les statistiques d'utilisation
  getThemeStats() {
    const savedTheme = localStorage.getItem(this.themeKey);
    const systemPreference = this.getSystemPreference();
    
    return {
      current: this.currentTheme,
      saved: savedTheme,
      system: systemPreference,
      isUsingSystem: !savedTheme
    };
  }
}

/* ===== COMPOSANT THÈME TOGGLE ===== */
class ThemeToggle extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
    this.setupEventListeners();
  }

  render() {
    const theme = window.themeManager?.getCurrentTheme() || 'light';
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }
        
        .theme-toggle {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          background: none;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }
        
        .theme-toggle:hover {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
        }
        
        .theme-icon {
          font-size: var(--text-lg);
          transition: transform var(--transition-fast);
        }
        
        .theme-toggle:hover .theme-icon {
          transform: rotate(180deg);
        }
        
        .theme-text {
          font-weight: var(--font-medium);
        }
        
        @media (max-width: 768px) {
          .theme-text {
            display: none;
          }
        }
      </style>
      
      <button class="theme-toggle" data-theme-toggle>
        <span class="theme-icon">${theme === 'dark' ? '☀️' : '🌙'}</span>
        <span class="theme-text">${theme === 'dark' ? 'Mode clair' : 'Mode sombre'}</span>
      </button>
    `;
  }

  setupEventListeners() {
    const button = this.shadowRoot.querySelector('.theme-toggle');
    button.addEventListener('click', () => {
      if (window.themeManager) {
        window.themeManager.toggle();
      }
    });
    
    // Écouter les changements de thème
    document.addEventListener('theme:change', (e) => {
      this.render();
    });
  }
}

// Enregistrer le composant personnalisé
if (customElements) {
  customElements.define('theme-toggle', ThemeToggle);
}

/* ===== UTILITAIRES THÈME ===== */
class ThemeUtils {
  static getContrastColor(backgroundColor) {
    // Calculer la couleur de contraste optimale
    const rgb = this.hexToRgb(backgroundColor);
    if (!rgb) return '#000000';
    
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }

  static hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  static adjustColor(color, amount) {
    const rgb = this.hexToRgb(color);
    if (!rgb) return color;
    
    const newR = Math.max(0, Math.min(255, rgb.r + amount));
    const newG = Math.max(0, Math.min(255, rgb.g + amount));
    const newB = Math.max(0, Math.min(255, rgb.b + amount));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  static getThemeColors() {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    return {
      primary: computedStyle.getPropertyValue('--primary').trim(),
      background: computedStyle.getPropertyValue('--bg-primary').trim(),
      surface: computedStyle.getPropertyValue('--surface').trim(),
      text: computedStyle.getPropertyValue('--text-primary').trim(),
      border: computedStyle.getPropertyValue('--border-light').trim()
    };
  }
}

// Initialiser le gestionnaire de thème
document.addEventListener('DOMContentLoaded', () => {
  window.themeManager = new ThemeManager();
  window.ThemeUtils = ThemeUtils;
});

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ThemeManager, ThemeToggle, ThemeUtils };
}
