# 🚀 Guide de Déploiement Rapide GECC

Ce guide vous permet de déployer rapidement l'application GECC sur les plateformes de déploiement.

## 📋 Prérequis

- ✅ Compte GitHub
- ✅ Compte Railway (pour le backend)
- ✅ Compte Vercel ou Netlify (pour le frontend)
- ✅ Base de données PostgreSQL
- ✅ Service de stockage S3-compatible

## ⚡ Déploiement en 5 minutes

### 1. 🏗️ Préparation du Repository

```bash
# Cloner le repository
git clone <votre-repo-github>
cd GECC

# Vérifier la configuration
./scripts/deploy.sh --check
```

### 2. 🗄️ Configuration de la Base de Données

#### Option A: Railway PostgreSQL
1. Aller sur [railway.app](https://railway.app)
2. Créer un nouveau projet
3. Ajouter un service PostgreSQL
4. Copier l'URL de connexion

#### Option B: Render PostgreSQL
1. Aller sur [render.com](https://render.com)
2. Créer une nouvelle base de données PostgreSQL
3. Copier l'URL de connexion

### 3. 🔧 Configuration des Variables d'Environnement

#### Backend (Railway/Render)
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
APP_URL=https://votre-frontend.vercel.app
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=eu-west-1
AWS_BUCKET_NAME=gecc-files
AWS_ENDPOINT=https://s3.eu-west-1.amazonaws.com
```

#### Frontend (Vercel/Netlify)
```env
GECC_API_URL=https://votre-backend.railway.app
```

### 4. 🚀 Déploiement du Backend

#### Railway
1. Connecter le repository GitHub
2. Sélectionner le dossier `server/`
3. Configurer les variables d'environnement
4. Déployer automatiquement

#### Render
1. Créer un nouveau Web Service
2. Connecter le repository GitHub
3. Sélectionner le dossier `server/`
4. Utiliser le fichier `render.yaml`
5. Configurer les variables d'environnement

### 5. 🎨 Déploiement du Frontend

#### Vercel
1. Aller sur [vercel.com](https://vercel.com)
2. Importer le repository GitHub
3. Vercel détectera automatiquement la configuration
4. Configurer `GECC_API_URL`
5. Déployer

#### Netlify
1. Aller sur [netlify.com](https://netlify.com)
2. Importer le repository GitHub
3. Netlify utilisera le fichier `netlify.toml`
4. Configurer `GECC_API_URL`
5. Déployer

### 6. 🗄️ Migration de la Base de Données

```bash
# Se connecter au serveur backend déployé
# Ou utiliser les outils de la plateforme
npm run migrate
```

### 7. ✅ Vérification

- ✅ Backend: `https://votre-backend.railway.app/health`
- ✅ Frontend: `https://votre-frontend.vercel.app`
- ✅ Test de connexion API
- ✅ Test d'upload de fichiers

## 🔄 Déploiement Automatique

### GitHub Actions
Le repository est configuré avec GitHub Actions pour :
- ✅ Tests automatiques
- ✅ Déploiement automatique sur push
- ✅ Vérifications de sécurité
- ✅ Migrations automatiques

### Branches
- `main` → Production
- `develop` → Staging

## 🛠️ Scripts de Déploiement

### Linux/Mac
```bash
# Vérification
./scripts/deploy.sh --check

# Déploiement en production
./scripts/deploy.sh -e prod

# Déploiement backend seulement
./scripts/deploy.sh -b -e prod

# Simulation
./scripts/deploy.sh -d -e prod
```

### Windows
```cmd
REM Vérification
scripts\deploy.bat --check

REM Déploiement en production
scripts\deploy.bat -e prod

REM Déploiement backend seulement
scripts\deploy.bat -b -e prod

REM Simulation
scripts\deploy.bat -d -e prod
```

## 🔐 Sécurité

### Variables Sensibles
- ❌ Ne jamais commiter les fichiers `.env`
- ✅ Utiliser les variables d'environnement des plateformes
- ✅ Roter régulièrement les clés API

### Permissions
- ✅ Limiter les permissions S3 au minimum
- ✅ Utiliser des tokens d'accès avec expiration
- ✅ Configurer les CORS correctement

## 🚨 Dépannage

### Problèmes Courants

1. **CORS Errors**
   ```env
   APP_URL=https://votre-frontend.vercel.app
   ```

2. **Database Connection**
   ```env
   DATABASE_URL=postgresql://user:pass@host:port/db
   ```

3. **File Upload Issues**
   ```env
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   ```

### Logs
- **Railway**: Dashboard → Logs
- **Render**: Dashboard → Logs
- **Vercel**: Dashboard → Functions → Logs
- **Netlify**: Dashboard → Functions → Logs

## 📞 Support

- 📖 Documentation: `DEPLOYMENT.md`
- 🐛 Issues: GitHub Issues
- 📊 Monitoring: Dashboards des plateformes

## 🎯 Prochaines Étapes

1. ✅ Configurer le monitoring
2. ✅ Mettre en place les alertes
3. ✅ Configurer les sauvegardes
4. ✅ Optimiser les performances
5. ✅ Mettre en place la surveillance de sécurité
