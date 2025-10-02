# 🧩 Documentation des Composants - GECC

## Vue d'ensemble
Ce document décrit tous les composants du système de design GECC, leurs variantes, états et bonnes pratiques d'utilisation.

## 🎨 Palette de Couleurs

### Couleurs Principales
- **Primary:** `#3b82f6` (Bleu) - Actions principales, liens
- **Success:** `#10b981` (Vert) - Succès, validation
- **Warning:** `#f59e0b` (Orange) - Avertissements
- **Danger:** `#ef4444` (Rouge) - Erreurs, suppression
- **Info:** `#06b6d4` (Cyan) - Informations

### Contraste WCAG
Toutes les couleurs respectent le contraste WCAG AA (4.5:1) minimum.

## 🔘 Boutons

### Variantes
```html
<!-- Primaire -->
<button class="btn btn-primary">Action Principale</button>

<!-- Secondaire -->
<button class="btn btn-secondary">Action Secondaire</button>

<!-- Ghost -->
<button class="btn btn-ghost">Action Subtile</button>

<!-- Danger -->
<button class="btn btn-danger">Supprimer</button>
```

### Tailles
```html
<button class="btn btn-primary btn-sm">Petit</button>
<button class="btn btn-primary">Normal</button>
<button class="btn btn-primary btn-lg">Grand</button>
```

### États
- **Normal:** État par défaut
- **Hover:** Survol avec élévation légère
- **Active:** Clic avec retour à la position
- **Focus:** Anneau de focus visible
- **Disabled:** Opacité réduite, non cliquable

### Bonnes Pratiques
- ✅ Aire cliquable minimum 44×44px
- ✅ Texte descriptif et action claire
- ✅ Icônes cohérentes avec le texte
- ❌ Éviter plus de 2 boutons primaires par écran

## 📝 Formulaires

### Structure
```html
<div class="form-group">
  <label class="form-label required" for="email">Email</label>
  <input type="email" id="email" class="form-input" required>
  <div class="form-error">Veuillez saisir un email valide</div>
</div>
```

### Types d'Inputs
- **Text/Email/Password:** `form-input`
- **Select:** `form-select`
- **Textarea:** `form-textarea`

### États de Validation
- **Normal:** Bordure grise
- **Focus:** Bordure bleue + anneau de focus
- **Error:** Bordure rouge + message d'erreur
- **Disabled:** Fond gris, non modifiable

### Bonnes Pratiques
- ✅ Labels explicites et obligatoires
- ✅ Messages d'erreur contextuels
- ✅ Validation en temps réel
- ✅ Groupement logique des champs

## 🏷️ Badges & Tags

### Variantes
```html
<span class="badge badge-primary">Nouveau</span>
<span class="badge badge-success">Actif</span>
<span class="badge badge-warning">En attente</span>
<span class="badge badge-danger">Erreur</span>
<span class="badge badge-info">Info</span>
<span class="badge badge-neutral">Neutre</span>
```

### Usage
- **Status:** État d'un élément
- **Catégories:** Classification
- **Notifications:** Compteurs, alertes

## 🃏 Cards

### Structure
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Titre</h3>
    <p class="card-subtitle">Sous-titre</p>
  </div>
  <div class="card-body">
    Contenu principal
  </div>
  <div class="card-footer">
    Actions
  </div>
</div>
```

### Comportement
- **Hover:** Élévation légère + ombre
- **Focus:** Anneau de focus si cliquable

## 📊 Tables

### Structure
```html
<div class="table-container">
  <table class="table">
    <thead>
      <tr>
        <th>Colonne 1</th>
        <th>Colonne 2</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Donnée 1</td>
        <td>Donnée 2</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Fonctionnalités
- **Header sticky:** Reste visible au scroll
- **Hover:** Surlignage de la ligne
- **Responsive:** Scroll horizontal sur mobile

## 📑 Tabs

### Structure
```html
<div class="tabs">
  <ul class="tabs-list" role="tablist">
    <li>
      <button class="tabs-trigger" role="tab" aria-selected="true">Onglet 1</button>
    </li>
    <li>
      <button class="tabs-trigger" role="tab" aria-selected="false">Onglet 2</button>
    </li>
  </ul>
</div>
<div class="tabs-content">
  <div class="tabs-panel" role="tabpanel" aria-hidden="false">
    Contenu onglet 1
  </div>
  <div class="tabs-panel" role="tabpanel" aria-hidden="true">
    Contenu onglet 2
  </div>
</div>
```

### Navigation
- **Clavier:** Flèches gauche/droite
- **Focus:** Anneau visible
- **Actif:** Soulignement bleu

## 🪟 Modales

### Structure
```html
<div class="modal-backdrop">
  <div class="modal">
    <div class="modal-header">
      <h2 class="modal-title">Titre</h2>
      <button class="modal-close" aria-label="Fermer">×</button>
    </div>
    <div class="modal-body">
      Contenu
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary">Annuler</button>
      <button class="btn btn-primary">Confirmer</button>
    </div>
  </div>
</div>
```

### Fonctionnalités
- **Focus trap:** Focus reste dans la modale
- **Escape:** Fermeture avec la touche Échap
- **Backdrop:** Fermeture en cliquant à l'extérieur
- **Responsive:** Pleine largeur sur mobile

## 🔔 Toasts

### Types
```html
<div class="toast toast-success">
  <span class="toast-icon">✅</span>
  <div class="toast-content">
    <h4 class="toast-title">Succès</h4>
    <p class="toast-message">Action réalisée avec succès</p>
  </div>
  <button class="toast-close">×</button>
</div>
```

### Variantes
- **Success:** Confirmation d'action
- **Warning:** Avertissement
- **Danger:** Erreur critique
- **Info:** Information générale

### Comportement
- **Auto-dismiss:** Disparition automatique (5s)
- **Stack:** Empilement vertical
- **Animation:** Slide-in depuis la droite

## 💀 Skeletons (États de chargement)

### Types
```html
<!-- Texte -->
<div class="skeleton skeleton-text"></div>
<div class="skeleton skeleton-text short"></div>
<div class="skeleton skeleton-text medium"></div>

<!-- Avatar -->
<div class="skeleton skeleton-avatar"></div>

<!-- Bouton -->
<div class="skeleton skeleton-button"></div>

<!-- Card -->
<div class="skeleton skeleton-card"></div>
```

### Usage
- **Chargement initial:** Remplacer le contenu
- **Chargement partiel:** Indiquer les zones en cours
- **Animation:** Effet shimmer fluide

## 🎭 Empty States

### Structure
```html
<div class="empty-state">
  <div class="empty-state-icon">📭</div>
  <h3 class="empty-state-title">Aucun élément</h3>
  <p class="empty-state-description">
    Vous n'avez pas encore d'éléments. Commencez par en créer un.
  </p>
  <button class="btn btn-primary">Créer un élément</button>
</div>
```

### Bonnes Pratiques
- ✅ Icône illustrative
- ✅ Message encourageant
- ✅ Action claire proposée
- ✅ Ton positif et utile

## 📱 Responsive

### Breakpoints
- **Mobile:** < 480px
- **Mobile Large:** 480px - 767px
- **Tablet:** 768px - 1023px
- **Desktop:** 1024px - 1279px
- **Desktop Large:** ≥ 1280px

### Adaptations
- **Tables:** Scroll horizontal sur mobile
- **Modales:** Pleine largeur sur mobile
- **Tabs:** Scroll horizontal si nécessaire
- **Boutons:** Pleine largeur dans les footers

## ♿ Accessibilité

### Standards
- **WCAG AA:** Contraste 4.5:1 minimum
- **Navigation clavier:** Tous les éléments accessibles
- **Screen readers:** Rôles ARIA appropriés
- **Focus:** Anneau visible sur tous les éléments

### Bonnes Pratiques
- ✅ Labels explicites
- ✅ Rôles ARIA appropriés
- ✅ Ordre de tabulation logique
- ✅ Messages d'erreur associés
- ✅ Contraste suffisant

## 🎨 Thème Sombre

### Activation
```javascript
// Activer le thème sombre
document.documentElement.setAttribute('data-theme', 'dark');

// Détecter la préférence système
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (prefersDark) {
  document.documentElement.setAttribute('data-theme', 'dark');
}
```

### Adaptation
Tous les composants s'adaptent automatiquement au thème sombre via les variables CSS.

---

*Cette documentation est mise à jour régulièrement avec l'évolution du système de design.*
