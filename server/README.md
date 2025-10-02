# 🚀 GECC Server - Backend API

Backend API sécurisé pour GECC - Gestion Électronique des Contrats de Construction.

## 📋 Table des matières

- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [API Endpoints](#api-endpoints)
- [Base de données](#base-de-données)
- [Sécurité](#sécurité)
- [Développement](#développement)

## 🛠️ Installation

### Prérequis

- Node.js 18+
- PostgreSQL 12+
- npm ou yarn

### Installation des dépendances

```bash
cd server
npm install
```

## ⚙️ Configuration

1. Copiez le fichier de configuration :
```bash
cp env.example .env
```

2. Modifiez les variables dans `.env` :
```env
# Serveur
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:8000

# Base de données PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gecc_db
DB_USER=gecc_user
DB_PASSWORD=gecc_password

# JWT (CHANGEZ CES CLÉS EN PRODUCTION !)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production-min-32-chars

# CORS
CORS_ORIGIN=http://localhost:8000
```

## 🚀 Démarrage

### 1. Initialiser la base de données

```bash
npm run migrate
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
| POST | `/api/auth/change-password` | Changer mot de passe | ✅ |

### 👥 Utilisateurs

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/users` | Liste des utilisateurs | Admin |
| GET | `/api/users/:id` | Profil d'un utilisateur | ✅ |
| PUT | `/api/users/:id` | Mettre à jour un utilisateur | ✅ |
| DELETE | `/api/users/:id` | Supprimer un utilisateur | Admin |
| PUT | `/api/users/:id/status` | Activer/Désactiver | Admin |

### ❤️ Santé

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Statut basique |
| GET | `/health` | Santé complète |
| GET | `/info` | Informations API |
| GET | `/api/docs` | Documentation API |

## 🗄️ Base de données

### Structure

- **users** - Utilisateurs du système
- **projects** - Projets de construction
- **documents** - Documents de projet
- **tasks** - Tâches de projet
- **comments** - Commentaires
- **notifications** - Notifications utilisateur
- **invites** - Invitations de projet
- **audit_logs** - Logs d'audit

### Migrations

```bash
# Exécuter toutes les migrations
npm run migrate

# Créer une nouvelle migration
npm run migrate:create -- --name create_new_table

# Peupler la base avec des données de test
npm run seed
```

## 🔒 Sécurité

### Fonctionnalités implémentées

- ✅ **JWT** avec refresh tokens
- ✅ **Hachage bcrypt** des mots de passe (coût 12)
- ✅ **CORS strict** configuré
- ✅ **Rate limiting** sur toutes les routes API
- ✅ **Helmet** pour les headers de sécurité
- ✅ **Validation Zod** des données
- ✅ **Audit logs** complets
- ✅ **Gestion d'erreurs** centralisée

### Recommandations production

- 🔐 Changer toutes les clés secrètes
- 🔐 Utiliser HTTPS obligatoire
- 🔐 Configurer un reverse proxy (nginx)
- 🔐 Limiter l'accès à la base de données
- 🔐 Configurer des sauvegardes automatiques
- 🔐 Monitorer les logs d'audit

## 🧪 Développement

### Scripts disponibles

```bash
npm run dev          # Démarrage en mode développement
npm start            # Démarrage en mode production
npm run migrate      # Exécuter les migrations
npm run seed         # Peupler avec des données de test
npm test             # Lancer les tests
npm run lint         # Vérifier le code
npm run lint:fix     # Corriger automatiquement
```

### Structure du projet

```
server/
├── src/
│   ├── config/          # Configuration
│   ├── controllers/     # Controllers (à créer)
│   ├── db/             # Base de données
│   ├── middleware/     # Middleware Express
│   ├── models/         # Modèles de données
│   ├── routes/         # Routes API
│   ├── utils/          # Utilitaires
│   └── app.js          # Application principale
├── migrations/         # Migrations SQL
├── logs/              # Logs de l'application
└── package.json
```

### Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|---------|
| `NODE_ENV` | Environnement | `development` |
| `PORT` | Port du serveur | `3000` |
| `APP_URL` | URL de l'application frontend | `http://localhost:8000` |
| `DB_HOST` | Hôte PostgreSQL | `localhost` |
| `DB_PORT` | Port PostgreSQL | `5432` |
| `DB_NAME` | Nom de la base | `gecc_db` |
| `DB_USER` | Utilisateur DB | `gecc_user` |
| `DB_PASSWORD` | Mot de passe DB | `gecc_password` |
| `JWT_SECRET` | Clé secrète JWT | **Requis** |
| `JWT_REFRESH_SECRET` | Clé refresh JWT | **Requis** |
| `CORS_ORIGIN` | Origine CORS autorisée | `http://localhost:8000` |

## 📊 Monitoring

### Logs

Les logs sont générés avec Pino et incluent :
- Requêtes HTTP
- Erreurs d'application
- Logs d'audit
- Métriques de performance

### Health Check

```bash
# Vérification basique
curl http://localhost:3000/

# Vérification complète
curl http://localhost:3000/health
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- 📧 Email : support@gecc.com
- 📚 Documentation : `/api/docs`
- 🐛 Issues : GitHub Issues
