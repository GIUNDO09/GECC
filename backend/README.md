# 🚀 GECC Backend API

API Backend sécurisée pour GECC - Gestion Électronique des Contrats de Construction.

## 📋 Table des matières

- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [API Endpoints](#api-endpoints)
- [Migration depuis localStorage](#migration-depuis-localstorage)
- [Sécurité](#sécurité)
- [Développement](#développement)

## 🛠️ Installation

### Prérequis

- Node.js 16+ 
- npm ou yarn

### Installation des dépendances

```bash
cd backend
npm install
```

## ⚙️ Configuration

1. Copiez le fichier de configuration :
```bash
cp env.example .env
```

2. Modifiez les variables dans `.env` :
```env
# Configuration du serveur
PORT=3000
NODE_ENV=development

# Base de données
DB_PATH=./database/gecc.db

# JWT Configuration (CHANGEZ CES CLÉS EN PRODUCTION !)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m
REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
REFRESH_EXPIRES_IN=7d

# Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:8000
```

## 🚀 Démarrage

### 1. Initialiser la base de données

```bash
npm run init-db
```

### 2. Démarrer le serveur

**Mode développement :**
```bash
npm run dev
```

**Mode production :**
```bash
npm start
```

Le serveur sera accessible sur `http://localhost:3000`

### 3. Vérifier la santé du serveur

```bash
curl http://localhost:3000/health
```

## 📡 API Endpoints

### 🔐 Authentification

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/auth/register` | Inscription | ❌ |
| POST | `/api/auth/login` | Connexion | ❌ |
| POST | `/api/auth/refresh` | Renouveler token | ❌ |
| POST | `/api/auth/logout` | Déconnexion | ✅ |
| GET | `/api/auth/me` | Profil utilisateur | ✅ |

### 🏗️ Projets

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/projects` | Mes projets | ✅ |
| GET | `/api/projects/all` | Tous les projets (admin) | ✅ |
| GET | `/api/projects/:id` | Détails projet | ✅ |
| POST | `/api/projects` | Créer projet | ✅ |
| PUT | `/api/projects/:id` | Modifier projet | ✅ |
| DELETE | `/api/projects/:id` | Supprimer projet | ✅ |
| GET | `/api/projects/:id/members` | Membres du projet | ✅ |
| POST | `/api/projects/:id/members` | Ajouter membre | ✅ |
| PUT | `/api/projects/:id/members/:userId` | Modifier rôle | ✅ |
| DELETE | `/api/projects/:id/members/:userId` | Supprimer membre | ✅ |

### 📄 Documents

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/documents/project/:projectId` | Documents du projet | ✅ |
| GET | `/api/documents/:id` | Détails document | ✅ |
| POST | `/api/documents` | Créer document | ✅ |
| PUT | `/api/documents/:id/status` | Changer statut | ✅ |
| GET | `/api/documents/:id/history` | Historique document | ✅ |
| GET | `/api/documents/:id/download` | Télécharger document | ✅ |
| DELETE | `/api/documents/:id` | Supprimer document | ✅ |

### ✅ Tâches

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/tasks/project/:projectId` | Tâches du projet | ✅ |
| POST | `/api/tasks` | Créer tâche | ✅ |
| PUT | `/api/tasks/:id` | Modifier tâche | ✅ |
| DELETE | `/api/tasks/:id` | Supprimer tâche | ✅ |

### 💬 Commentaires

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/comments/project/:projectId` | Commentaires du projet | ✅ |
| POST | `/api/comments` | Créer commentaire | ✅ |
| PUT | `/api/comments/:id` | Modifier commentaire | ✅ |
| DELETE | `/api/comments/:id` | Supprimer commentaire | ✅ |

### 🔔 Notifications

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/notifications` | Mes notifications | ✅ |
| PUT | `/api/notifications/:id/read` | Marquer comme lue | ✅ |
| PUT | `/api/notifications/read-all` | Tout marquer comme lu | ✅ |
| DELETE | `/api/notifications/:id` | Supprimer notification | ✅ |

## 🔄 Migration depuis localStorage

### Étape 1 : Modifier le frontend

Remplacez les appels à `localStorage` par des appels API :

**Avant (localStorage) :**
```javascript
// js/store.js
const projects = JSON.parse(localStorage.getItem('projects'));
localStorage.setItem('projects', JSON.stringify(projects));
```

**Après (API) :**
```javascript
// js/api.js
const response = await fetch('/api/projects', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
```

### Étape 2 : Gestion de l'authentification

**Avant :**
```javascript
// Session stockée en localStorage
localStorage.setItem('currentUser', JSON.stringify(user));
```

**Après :**
```javascript
// Token JWT stocké en localStorage
localStorage.setItem('accessToken', response.accessToken);
localStorage.setItem('refreshToken', response.refreshToken);
```

### Étape 3 : Migration des données

1. **Exporter les données localStorage :**
```javascript
// Script de migration
const exportData = () => {
  const data = {
    users: JSON.parse(localStorage.getItem('users') || '[]'),
    projects: JSON.parse(localStorage.getItem('projects') || '[]'),
    documents: JSON.parse(localStorage.getItem('documents') || '[]'),
    tasks: JSON.parse(localStorage.getItem('tasks') || '[]'),
    comments: JSON.parse(localStorage.getItem('comments') || '[]')
  };
  
  // Sauvegarder dans un fichier JSON
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gecc-data-export.json';
  a.click();
};
```

2. **Importer via l'API :**
```javascript
// Script d'import
const importData = async (data) => {
  // Créer les utilisateurs
  for (const user of data.users) {
    await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: user.name,
        email: user.email,
        password: 'temp-password-123', // À changer après
        role: user.role
      })
    });
  }
  
  // Créer les projets
  for (const project of data.projects) {
    await fetch('/api/projects', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(project)
    });
  }
  
  // ... autres entités
};
```

### Étape 4 : Mise à jour du frontend

1. **Créer un module API :**
```javascript
// js/api.js
class APIClient {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('accessToken');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers
      },
      ...options
    };

    const response = await fetch(url, config);
    
    if (response.status === 401) {
      // Token expiré, essayer de le renouveler
      await this.refreshToken();
      return this.request(endpoint, options);
    }
    
    return response.json();
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    
    const data = await response.json();
    this.token = data.accessToken;
    localStorage.setItem('accessToken', data.accessToken);
  }

  // Méthodes pour chaque entité
  async getProjects() {
    return this.request('/api/projects');
  }

  async createProject(projectData) {
    return this.request('/api/projects', {
      method: 'POST',
      body: JSON.stringify(projectData)
    });
  }

  // ... autres méthodes
}

export default new APIClient();
```

2. **Remplacer les appels dans les modules :**
```javascript
// js/projects.js
import api from './api.js';

class ProjectsManager {
  async loadProjects() {
    try {
      const response = await api.getProjects();
      this.projects = response.projects;
      this.renderProjects();
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error);
    }
  }

  async createProject(projectData) {
    try {
      const response = await api.createProject(projectData);
      this.projects.push(response.project);
      this.renderProjects();
      return response.project;
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
      throw error;
    }
  }
}
```

## 🔒 Sécurité

### Authentification JWT

- **Access Token** : Expire en 15 minutes
- **Refresh Token** : Expire en 7 jours
- **Rotation automatique** des tokens

### Middleware de sécurité

- **Helmet** : Headers sécurisés
- **CORS** : Configuration restrictive
- **Rate Limiting** : Protection contre les attaques par déni de service
- **Validation** : Sanitisation des entrées

### Base de données

- **SQLite** avec contraintes d'intégrité
- **Clés étrangères** activées
- **Index** pour les performances

## 🛠️ Développement

### Structure du projet

```
backend/
├── database/
│   ├── init.js          # Initialisation SQLite
│   └── gecc.db          # Base de données (créée automatiquement)
├── middleware/
│   ├── auth.js          # Authentification JWT
│   └── errorHandler.js  # Gestion d'erreurs
├── models/
│   ├── User.js          # Modèle utilisateur
│   └── Project.js       # Modèle projet
├── routes/
│   ├── auth.js          # Routes authentification
│   ├── projects.js      # Routes projets
│   ├── documents.js     # Routes documents
│   ├── tasks.js         # Routes tâches
│   ├── comments.js      # Routes commentaires
│   └── notifications.js # Routes notifications
├── scripts/
│   └── init-database.js # Script d'initialisation
├── uploads/             # Fichiers uploadés
├── server.js            # Serveur principal
├── package.json
└── README.md
```

### Scripts disponibles

```bash
npm start          # Démarrer en production
npm run dev        # Démarrer en développement (nodemon)
npm run init-db    # Initialiser la base de données
```

### Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|---------|
| `PORT` | Port du serveur | `3000` |
| `NODE_ENV` | Environnement | `development` |
| `DB_PATH` | Chemin base de données | `./database/gecc.db` |
| `JWT_SECRET` | Clé secrète JWT | **OBLIGATOIRE** |
| `REFRESH_SECRET` | Clé refresh token | **OBLIGATOIRE** |
| `UPLOAD_PATH` | Dossier uploads | `./uploads` |
| `MAX_FILE_SIZE` | Taille max fichier | `10485760` (10MB) |
| `CORS_ORIGIN` | Origine CORS | `http://localhost:8000` |

## 🚀 Déploiement

### Production

1. **Variables d'environnement :**
```bash
export NODE_ENV=production
export JWT_SECRET=your-super-secure-secret-key
export REFRESH_SECRET=your-super-secure-refresh-key
export CORS_ORIGIN=https://yourdomain.com
```

2. **Démarrage :**
```bash
npm start
```

### Docker (optionnel)

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 Notes importantes

- ⚠️ **Changez les clés JWT** en production
- 🔒 **Utilisez HTTPS** en production
- 📊 **Configurez les logs** pour le monitoring
- 🗄️ **Sauvegardez régulièrement** la base de données
- 🔄 **Planifiez la rotation** des clés JWT

## 🆘 Support

Pour toute question ou problème :

1. Vérifiez les logs du serveur
2. Consultez la documentation des endpoints
3. Vérifiez la configuration des variables d'environnement
4. Testez avec les comptes de démonstration

---

**🎉 Félicitations !** Votre API GECC est maintenant prête pour la production avec une sécurité renforcée.