# 🔄 Guide de Migration - localStorage vers API Backend

## 📋 Vue d'ensemble

Ce guide explique comment migrer progressivement le frontend GECC du localStorage vers l'API backend sécurisée.

## 🎯 Objectifs de la Migration

- ✅ **Sécurité** : Remplacer le stockage local par une API sécurisée
- ✅ **Authentification** : JWT au lieu de sessions localStorage
- ✅ **Contrôle d'accès** : RBAC côté serveur
- ✅ **Persistance** : Base de données SQLite
- ✅ **Scalabilité** : Architecture client-serveur

## 🚀 Étape 1 : Préparation

### 1.1 Démarrer le Backend

```bash
cd backend
npm install
cp env.example .env
npm run init-db
npm run seed
npm run dev
```

Le serveur sera accessible sur `http://localhost:3001`

### 1.2 Vérifier la Connexion

```bash
curl http://localhost:3001/api/health
```

Réponse attendue :
```json
{
  "status": "OK",
  "message": "GECC Backend API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

## 🔐 Étape 2 : Migration de l'Authentification

### 2.1 Créer un Service API

Créer `js/api.js` :

```javascript
/*
 * GECC - Service API
 * Remplace progressivement le localStorage par des appels API
 */

class ApiService {
    constructor() {
        this.baseUrl = 'http://localhost:3001/api';
        this.token = localStorage.getItem('accessToken');
        this.refreshToken = localStorage.getItem('refreshToken');
    }

    // Méthode utilitaire pour les requêtes
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Ajouter le token d'authentification
        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            
            // Gérer l'expiration du token
            if (response.status === 401) {
                await this.refreshAccessToken();
                // Retry avec le nouveau token
                config.headers.Authorization = `Bearer ${this.token}`;
                return fetch(url, config);
            }

            return response;
        } catch (error) {
            console.error('Erreur API:', error);
            throw error;
        }
    }

    // Authentification
    async login(email, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            this.setTokens(data.token, data.refreshToken);
            return data;
        }

        throw new Error('Échec de la connexion');
    }

    async register(userData) {
        const response = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            const data = await response.json();
            this.setTokens(data.token, data.refreshToken);
            return data;
        }

        throw new Error('Échec de l\'inscription');
    }

    async logout() {
        if (this.refreshToken) {
            await this.request('/auth/logout', {
                method: 'POST',
                body: JSON.stringify({ refreshToken: this.refreshToken })
            });
        }
        this.clearTokens();
    }

    async getCurrentUser() {
        const response = await this.request('/auth/me');
        if (response.ok) {
            return response.json();
        }
        throw new Error('Impossible de récupérer l\'utilisateur');
    }

    async refreshAccessToken() {
        if (!this.refreshToken) {
            throw new Error('Pas de refresh token');
        }

        const response = await this.request('/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refreshToken: this.refreshToken })
        });

        if (response.ok) {
            const data = await response.json();
            this.token = data.token;
            localStorage.setItem('accessToken', this.token);
            return data.token;
        }

        // Refresh token expiré, rediriger vers login
        this.clearTokens();
        window.location.href = 'index.html';
    }

    setTokens(accessToken, refreshToken) {
        this.token = accessToken;
        this.refreshToken = refreshToken;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    }

    clearTokens() {
        this.token = null;
        this.refreshToken = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }

    // Projets
    async getProjects() {
        const response = await this.request('/projects');
        return response.json();
    }

    async getProject(id) {
        const response = await this.request(`/projects/${id}`);
        return response.json();
    }

    async createProject(projectData) {
        const response = await this.request('/projects', {
            method: 'POST',
            body: JSON.stringify(projectData)
        });
        return response.json();
    }

    async updateProject(id, projectData) {
        const response = await this.request(`/projects/${id}`, {
            method: 'PUT',
            body: JSON.stringify(projectData)
        });
        return response.json();
    }

    // Documents
    async getDocuments(projectId = null) {
        const params = projectId ? `?projectId=${projectId}` : '';
        const response = await this.request(`/documents${params}`);
        return response.json();
    }

    async createDocument(documentData, file = null) {
        const formData = new FormData();
        
        // Ajouter les données du document
        Object.keys(documentData).forEach(key => {
            if (key === 'targets') {
                formData.append(key, JSON.stringify(documentData[key]));
            } else {
                formData.append(key, documentData[key]);
            }
        });

        // Ajouter le fichier si présent
        if (file) {
            formData.append('file', file);
        }

        const response = await fetch(`${this.baseUrl}/documents`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`
            },
            body: formData
        });

        return response.json();
    }

    async updateDocumentAction(id, action, description = '') {
        const response = await this.request(`/documents/${id}/action`, {
            method: 'PUT',
            body: JSON.stringify({ action, description })
        });
        return response.json();
    }

    // Tâches
    async getTasks(projectId = null) {
        const params = projectId ? `?projectId=${projectId}` : '';
        const response = await this.request(`/tasks${params}`);
        return response.json();
    }

    async getKanbanTasks(projectId) {
        const response = await this.request(`/tasks/project/${projectId}/kanban`);
        return response.json();
    }

    async createTask(taskData) {
        const response = await this.request('/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData)
        });
        return response.json();
    }

    async updateTask(id, taskData) {
        const response = await this.request(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(taskData)
        });
        return response.json();
    }

    // Commentaires
    async getComments(projectId = null) {
        const params = projectId ? `?projectId=${projectId}` : '';
        const response = await this.request(`/comments${params}`);
        return response.json();
    }

    async createComment(commentData) {
        const response = await this.request('/comments', {
            method: 'POST',
            body: JSON.stringify(commentData)
        });
        return response.json();
    }

    // Notifications
    async getNotifications() {
        const response = await this.request('/notifications');
        return response.json();
    }

    async getUnreadNotificationCount() {
        const response = await this.request('/notifications/unread-count');
        return response.json();
    }

    async markNotificationAsRead(id) {
        const response = await this.request(`/notifications/${id}/read`, {
            method: 'PUT'
        });
        return response.json();
    }
}

// Instance globale
const apiService = new ApiService();
export default apiService;
```

### 2.2 Modifier js/auth.js

```javascript
// Remplacer les méthodes d'authentification
import apiService from './api.js';

class AuthManager {
    // ... code existant ...

    async login(email, password) {
        try {
            const result = await apiService.login(email, password);
            this.currentUser = result.user;
            this.saveSession(result.user);
            return { success: true, user: result.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async register(userData) {
        try {
            const result = await apiService.register(userData);
            this.currentUser = result.user;
            this.saveSession(result.user);
            return { success: true, user: result.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async logout() {
        try {
            await apiService.logout();
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        } finally {
            this.clearSession();
        }
    }

    async getCurrentUser() {
        try {
            const result = await apiService.getCurrentUser();
            this.currentUser = result.user;
            return result.user;
        } catch (error) {
            this.clearSession();
            return null;
        }
    }

    // ... reste du code ...
}
```

## 📁 Étape 3 : Migration des Projets

### 3.1 Modifier js/store.js

```javascript
import apiService from './api.js';

class LocalRepository {
    // ... code existant ...

    // Remplacer les méthodes de projets
    async getAllProjects() {
        try {
            const result = await apiService.getProjects();
            return result.projects;
        } catch (error) {
            console.error('Erreur lors de la récupération des projets:', error);
            return [];
        }
    }

    async getProject(projectId) {
        try {
            const result = await apiService.getProject(projectId);
            return result;
        } catch (error) {
            console.error('Erreur lors de la récupération du projet:', error);
            return null;
        }
    }

    async addProject(projectData) {
        try {
            const result = await apiService.createProject(projectData);
            return result.project;
        } catch (error) {
            console.error('Erreur lors de la création du projet:', error);
            throw error;
        }
    }

    async updateProject(project) {
        try {
            const result = await apiService.updateProject(project.id, project);
            return result.project;
        } catch (error) {
            console.error('Erreur lors de la mise à jour du projet:', error);
            throw error;
        }
    }

    // ... autres méthodes ...
}
```

### 3.2 Modifier projects.html

```javascript
// Remplacer le chargement des projets
async function loadProjects() {
    try {
        const projects = await localRepository.getAllProjects();
        renderProjectsTable(projects);
    } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
        showError('Impossible de charger les projets');
    }
}

// Modifier la création de projet
async function createProject() {
    const formData = new FormData(document.getElementById('createProjectForm'));
    const projectData = {
        name: formData.get('name'),
        code: formData.get('code'),
        description: formData.get('description') || '',
        team: [currentUser.id] // Ajouter l'utilisateur courant
    };

    try {
        const project = await localRepository.addProject(projectData);
        console.log('Projet créé:', project);
        closeModal('createProjectModal');
        loadProjects(); // Recharger la liste
        showSuccess('Projet créé avec succès');
    } catch (error) {
        console.error('Erreur lors de la création du projet:', error);
        showError('Impossible de créer le projet');
    }
}
```

## 📄 Étape 4 : Migration des Documents

### 4.1 Modifier la gestion des documents

```javascript
// Dans project.html, modifier la gestion des documents
async function loadDocuments() {
    try {
        const result = await apiService.getDocuments(currentProject.id);
        renderDocumentsTable(result.documents);
    } catch (error) {
        console.error('Erreur lors du chargement des documents:', error);
        showError('Impossible de charger les documents');
    }
}

async function createDocument() {
    const formData = new FormData(document.getElementById('createDocumentForm'));
    const fileInput = document.getElementById('documentFile');
    const file = fileInput.files[0];

    const documentData = {
        title: formData.get('title'),
        type: formData.get('type'),
        description: formData.get('description') || '',
        targets: JSON.parse(formData.get('targets') || '[]'),
        projectId: currentProject.id
    };

    try {
        const result = await apiService.createDocument(documentData, file);
        console.log('Document créé:', result);
        closeModal('createDocumentModal');
        loadDocuments();
        showSuccess('Document créé avec succès');
    } catch (error) {
        console.error('Erreur lors de la création du document:', error);
        showError('Impossible de créer le document');
    }
}

async function performDocumentAction(documentId, action, description = '') {
    try {
        const result = await apiService.updateDocumentAction(documentId, action, description);
        console.log('Action effectuée:', result);
        loadDocuments(); // Recharger la liste
        showSuccess('Action effectuée avec succès');
    } catch (error) {
        console.error('Erreur lors de l\'action sur le document:', error);
        showError('Impossible d\'effectuer cette action');
    }
}
```

## ✅ Étape 5 : Migration des Tâches

### 5.1 Modifier la gestion Kanban

```javascript
// Dans project.html, modifier la gestion des tâches
async function loadTasks() {
    try {
        const kanbanData = await apiService.getKanbanTasks(currentProject.id);
        renderKanbanBoard(kanbanData);
    } catch (error) {
        console.error('Erreur lors du chargement des tâches:', error);
        showError('Impossible de charger les tâches');
    }
}

async function createTask() {
    const formData = new FormData(document.getElementById('createTaskForm'));
    const taskData = {
        title: formData.get('title'),
        description: formData.get('description') || '',
        status: 'todo',
        priority: formData.get('priority') || 'medium',
        assigneeId: formData.get('assigneeId') || null,
        projectId: currentProject.id,
        dueDate: formData.get('dueDate') || null
    };

    try {
        const result = await apiService.createTask(taskData);
        console.log('Tâche créée:', result);
        closeModal('createTaskModal');
        loadTasks();
        showSuccess('Tâche créée avec succès');
    } catch (error) {
        console.error('Erreur lors de la création de la tâche:', error);
        showError('Impossible de créer la tâche');
    }
}

async function updateTaskStatus(taskId, newStatus) {
    try {
        const result = await apiService.updateTask(taskId, { status: newStatus });
        console.log('Statut mis à jour:', result);
        loadTasks(); // Recharger le Kanban
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        showError('Impossible de mettre à jour le statut');
    }
}
```

## 💬 Étape 6 : Migration des Commentaires

### 6.1 Modifier la gestion des commentaires

```javascript
// Dans project.html, modifier la gestion des commentaires
async function loadComments() {
    try {
        const result = await apiService.getComments(currentProject.id);
        renderCommentsList(result.comments);
    } catch (error) {
        console.error('Erreur lors du chargement des commentaires:', error);
        showError('Impossible de charger les commentaires');
    }
}

async function createComment() {
    const formData = new FormData(document.getElementById('commentForm'));
    const commentData = {
        text: formData.get('text'),
        projectId: currentProject.id,
        isInternal: formData.get('isInternal') === 'on'
    };

    try {
        const result = await apiService.createComment(commentData);
        console.log('Commentaire créé:', result);
        document.getElementById('commentForm').reset();
        loadComments();
        showSuccess('Commentaire ajouté avec succès');
    } catch (error) {
        console.error('Erreur lors de la création du commentaire:', error);
        showError('Impossible d\'ajouter le commentaire');
    }
}
```

## 🔔 Étape 7 : Migration des Notifications

### 7.1 Modifier le dashboard

```javascript
// Dans dashboard.html, modifier la gestion des notifications
async function loadNotifications() {
    try {
        const result = await apiService.getNotifications();
        renderNotificationsList(result.notifications);
    } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error);
        showError('Impossible de charger les notifications');
    }
}

async function updateNotificationBadge() {
    try {
        const result = await apiService.getUnreadNotificationCount();
        const badge = document.getElementById('notificationBadge');
        if (result.unreadCount > 0) {
            badge.textContent = result.unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour du badge:', error);
    }
}

async function markNotificationAsRead(notificationId) {
    try {
        await apiService.markNotificationAsRead(notificationId);
        loadNotifications(); // Recharger la liste
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la notification:', error);
    }
}
```

## 🧪 Étape 8 : Tests et Validation

### 8.1 Tests Fonctionnels

1. **Authentification**
   - [ ] Inscription d'un nouvel utilisateur
   - [ ] Connexion avec les comptes de test
   - [ ] Déconnexion
   - [ ] Renouvellement automatique du token

2. **Projets**
   - [ ] Création d'un projet
   - [ ] Modification d'un projet
   - [ ] Suppression d'un projet
   - [ ] Accès aux projets selon les rôles

3. **Documents**
   - [ ] Création d'un document
   - [ ] Upload de fichier
   - [ ] Actions sur les documents (soumettre, valider, etc.)
   - [ ] Téléchargement de document

4. **Tâches**
   - [ ] Création de tâches
   - [ ] Drag & drop dans le Kanban
   - [ ] Modification des tâches
   - [ ] Suppression de tâches

5. **Commentaires**
   - [ ] Ajout de commentaires
   - [ ] Commentaires internes vs publics
   - [ ] Modification/suppression

6. **Notifications**
   - [ ] Affichage des notifications
   - [ ] Marquage comme lues
   - [ ] Badge de compteur

### 8.2 Tests de Sécurité

1. **Authentification**
   - [ ] Token expiré
   - [ ] Token invalide
   - [ ] Accès sans authentification

2. **Autorisation**
   - [ ] Accès aux projets selon les rôles
   - [ ] Actions sur les documents selon les permissions
   - [ ] Isolation des données

3. **Validation**
   - [ ] Données malformées
   - [ ] Fichiers non autorisés
   - [ ] Taille des fichiers

## 🚀 Étape 9 : Déploiement

### 9.1 Configuration de Production

1. **Variables d'environnement**
```bash
NODE_ENV=production
JWT_SECRET=your-super-secure-secret-key
FRONTEND_URL=https://votre-domaine.com
DATABASE_PATH=/var/lib/gecc/gecc.db
```

2. **Base de données**
```bash
# Créer le dossier de données
sudo mkdir -p /var/lib/gecc
sudo chown $USER:$USER /var/lib/gecc

# Initialiser la base de production
npm run init-db
```

3. **Serveur web**
```nginx
# Configuration nginx
server {
    listen 80;
    server_name votre-domaine.com;
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location / {
        root /var/www/gecc;
        try_files $uri $uri/ /index.html;
    }
}
```

### 9.2 Processus de Déploiement

1. **Backup des données**
```bash
cp database/gecc.db database/gecc.db.backup
```

2. **Déploiement du backend**
```bash
# Arrêter le serveur
pm2 stop gecc-backend

# Mettre à jour le code
git pull origin main
npm install --production

# Redémarrer le serveur
pm2 start server.js --name gecc-backend
```

3. **Déploiement du frontend**
```bash
# Mettre à jour le frontend
git pull origin main

# Rebuild si nécessaire
npm run build

# Redémarrer nginx
sudo systemctl reload nginx
```

## 🔧 Dépannage

### Problèmes Courants

1. **Erreur CORS**
```javascript
// Vérifier la configuration CORS dans server.js
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8000',
    credentials: true
}));
```

2. **Token expiré**
```javascript
// Vérifier la gestion automatique du refresh token
async function request(endpoint, options = {}) {
    // ... code existant ...
    
    if (response.status === 401) {
        await this.refreshAccessToken();
        // Retry avec le nouveau token
        config.headers.Authorization = `Bearer ${this.token}`;
        return fetch(url, config);
    }
}
```

3. **Erreur de permissions**
```javascript
// Vérifier les rôles et permissions
const hasAccess = req.user.role === 'admin' || 
                project.manager_id === req.user.id || 
                team.includes(req.user.id);
```

4. **Upload de fichiers**
```javascript
// Vérifier la configuration multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024
    }
});
```

## 📊 Monitoring

### Métriques à Surveiller

1. **Performance**
   - Temps de réponse des API
   - Utilisation de la base de données
   - Mémoire et CPU

2. **Sécurité**
   - Tentatives de connexion échouées
   - Accès non autorisés
   - Erreurs d'authentification

3. **Fonctionnalités**
   - Nombre de projets créés
   - Documents uploadés
   - Tâches complétées
   - Notifications envoyées

### Logs

```javascript
// Ajouter des logs dans les méthodes critiques
console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
console.log(`User: ${req.user?.email}, Role: ${req.user?.role}`);
```

## ✅ Checklist de Migration

- [ ] Backend démarré et accessible
- [ ] Base de données initialisée
- [ ] Données de test ajoutées
- [ ] Service API créé
- [ ] Authentification migrée
- [ ] Projets migrés
- [ ] Documents migrés
- [ ] Tâches migrées
- [ ] Commentaires migrés
- [ ] Notifications migrées
- [ ] Tests fonctionnels passés
- [ ] Tests de sécurité passés
- [ ] Configuration de production
- [ ] Déploiement effectué
- [ ] Monitoring en place

## 🎉 Conclusion

La migration du localStorage vers l'API backend apporte :

- ✅ **Sécurité renforcée** avec JWT et RBAC
- ✅ **Persistance des données** avec SQLite
- ✅ **Contrôle d'accès** côté serveur
- ✅ **Scalabilité** pour de futurs développements
- ✅ **Audit trail** complet des actions
- ✅ **Notifications** en temps réel
- ✅ **Gestion des fichiers** sécurisée

Le système est maintenant prêt pour un usage en production avec toutes les mesures de sécurité nécessaires.
