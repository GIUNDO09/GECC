# 🚀 Guide de Déploiement GECC

Ce guide explique comment déployer l'application GECC (Gestion Électronique des Contrats de Construction) sur différentes plateformes.

## 📋 Prérequis

- Node.js 18+ installé
- Compte GitHub
- Compte sur la plateforme de déploiement choisie

## 🏗️ Architecture de Déploiement

```
Frontend (Vercel/Netlify) ←→ Backend (Railway/Render) ←→ PostgreSQL
```

## 🔧 Backend (API)

### Option 1: Railway

1. **Créer un compte Railway**
   - Aller sur [railway.app](https://railway.app)
   - Se connecter avec GitHub

2. **Déployer le backend**
   ```bash
   # Cloner le repository
   git clone <votre-repo>
   cd GECC/server
   
   # Installer les dépendances
   npm install
   ```

3. **Configurer Railway**
   - Créer un nouveau projet sur Railway
   - Connecter le repository GitHub
   - Sélectionner le dossier `server/`
   - Railway détectera automatiquement le `package.json`

4. **Variables d'environnement**
   ```env
   NODE_ENV=production
   PORT=3000
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   APP_URL=https://votre-frontend.vercel.app
   DATABASE_URL=postgresql://user:pass@host:port/db
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_REGION=eu-west-1
   AWS_BUCKET_NAME=gecc-files
   AWS_ENDPOINT=https://s3.eu-west-1.amazonaws.com
   ```

5. **Base de données PostgreSQL**
   - Ajouter un service PostgreSQL sur Railway
   - Railway générera automatiquement `DATABASE_URL`

6. **Déploiement**
   - Railway déploiera automatiquement à chaque push
   - L'URL sera disponible dans le dashboard Railway

### Option 2: Render

1. **Créer un compte Render**
   - Aller sur [render.com](https://render.com)
   - Se connecter avec GitHub

2. **Déployer le backend**
   - Créer un nouveau "Web Service"
   - Connecter le repository GitHub
   - Sélectionner le dossier `server/`
   - Utiliser le fichier `render.yaml` fourni

3. **Variables d'environnement**
   - Configurer les mêmes variables que Railway
   - Render utilisera le fichier `render.yaml` pour la configuration

4. **Base de données**
   - Créer un service PostgreSQL sur Render
   - Utiliser la variable `DATABASE_URL` générée

## 🎨 Frontend

### Option 1: Vercel

1. **Créer un compte Vercel**
   - Aller sur [vercel.com](https://vercel.com)
   - Se connecter avec GitHub

2. **Déployer le frontend**
   ```bash
   # Installer Vercel CLI
   npm i -g vercel
   
   # Déployer
   vercel
   ```

3. **Configuration automatique**
   - Vercel utilisera le fichier `vercel.json`
   - Les variables d'environnement seront configurées automatiquement

4. **Variables d'environnement**
   ```env
   GECC_API_URL=https://votre-backend.railway.app
   ```

### Option 2: Netlify

1. **Créer un compte Netlify**
   - Aller sur [netlify.com](https://netlify.com)
   - Se connecter avec GitHub

2. **Déployer le frontend**
   - Créer un nouveau site
   - Connecter le repository GitHub
   - Netlify utilisera le fichier `netlify.toml`

3. **Variables d'environnement**
   ```env
   GECC_API_URL=https://votre-backend.railway.app
   ```

## 📁 Stockage des Fichiers (S3-compatible)

### Option 1: AWS S3

1. **Créer un bucket S3**
   - Aller sur [AWS Console](https://console.aws.amazon.com)
   - Créer un bucket nommé `gecc-files`

2. **Configurer les permissions**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::gecc-files/*"
       }
     ]
   }
   ```

3. **Variables d'environnement**
   ```env
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_REGION=eu-west-1
   AWS_BUCKET_NAME=gecc-files
   AWS_ENDPOINT=https://s3.eu-west-1.amazonaws.com
   ```

### Option 2: DigitalOcean Spaces

1. **Créer un Space**
   - Aller sur [DigitalOcean](https://cloud.digitalocean.com)
   - Créer un Space nommé `gecc-files`

2. **Variables d'environnement**
   ```env
   AWS_ACCESS_KEY_ID=your-spaces-key
   AWS_SECRET_ACCESS_KEY=your-spaces-secret
   AWS_REGION=nyc3
   AWS_BUCKET_NAME=gecc-files
   AWS_ENDPOINT=https://nyc3.digitaloceanspaces.com
   ```

### Option 3: MinIO (Auto-hébergé)

1. **Déployer MinIO**
   ```bash
   docker run -p 9000:9000 -p 9001:9001 \
     -e "MINIO_ROOT_USER=admin" \
     -e "MINIO_ROOT_PASSWORD=password123" \
     minio/minio server /data --console-address ":9001"
   ```

2. **Variables d'environnement**
   ```env
   AWS_ACCESS_KEY_ID=admin
   AWS_SECRET_ACCESS_KEY=password123
   AWS_REGION=us-east-1
   AWS_BUCKET_NAME=gecc-files
   AWS_ENDPOINT=http://localhost:9000
   ```

## 🔄 Processus de Déploiement

### 1. Préparation

```bash
# Cloner le repository
git clone <votre-repo>
cd GECC

# Configuration Git (optionnel)
./scripts/setup-git.sh -i -r <votre-repo-url>

# Vérifier la configuration
./scripts/deploy.sh --check

# Installer les dépendances backend
cd server
npm install

# Installer les dépendances frontend (si nécessaire)
cd ..
npm install
```

### 2. Configuration des Variables

1. **Backend** - Configurer les variables d'environnement sur Railway/Render
2. **Frontend** - Configurer `GECC_API_URL` sur Vercel/Netlify
3. **Base de données** - Créer et configurer PostgreSQL
4. **Stockage** - Configurer S3 ou service compatible

### 3. Déploiement

#### Option A: Scripts Automatisés (Recommandé)

```bash
# Déploiement complet en production
./scripts/deploy.sh -e prod

# Déploiement backend seulement
./scripts/deploy.sh -b -e prod

# Déploiement frontend seulement
./scripts/deploy.sh -f -e prod

# Simulation du déploiement
./scripts/deploy.sh -d -e prod
```

#### Option B: Déploiement Manuel

1. **Backend**
   ```bash
   cd server
   git add .
   git commit -m "Deploy backend"
   git push origin main
   ```

2. **Frontend**
   ```bash
   git add .
   git commit -m "Deploy frontend"
   git push origin main
   ```

### 4. Migration de la Base de Données

```bash
# Se connecter au serveur backend
cd server
npm run migrate
```

## 🔍 Vérification du Déploiement

### Backend
- ✅ `https://votre-backend.railway.app/health`
- ✅ `https://votre-backend.railway.app/api/docs`

### Frontend
- ✅ `https://votre-frontend.vercel.app`
- ✅ Test de connexion à l'API
- ✅ Test d'upload de fichiers

## 🛠️ Maintenance

### Logs
- **Railway**: Dashboard → Logs
- **Render**: Dashboard → Logs
- **Vercel**: Dashboard → Functions → Logs
- **Netlify**: Dashboard → Functions → Logs

### Monitoring
- Configurer des alertes sur les plateformes
- Surveiller les performances
- Vérifier les erreurs régulièrement

### Sauvegardes
- **Base de données**: Automatiques sur Railway/Render
- **Fichiers**: Réplication automatique sur S3
- **Code**: Repository GitHub

## 🚨 Dépannage

### Problèmes Courants

1. **CORS Errors**
   - Vérifier `APP_URL` dans les variables d'environnement
   - S'assurer que l'URL du frontend est correcte

2. **Database Connection**
   - Vérifier `DATABASE_URL`
   - S'assurer que la base de données est accessible

3. **File Upload Issues**
   - Vérifier les credentials S3
   - S'assurer que le bucket existe et est accessible

4. **Authentication Issues**
   - Vérifier `JWT_SECRET`
   - S'assurer que les cookies sont configurés correctement

### Commandes de Debug

```bash
# Vérifier les variables d'environnement
echo $DATABASE_URL
echo $JWT_SECRET

# Tester la connexion à la base de données
npm run migrate

# Vérifier les logs
npm run dev
```

## 📞 Support

- **Documentation**: Ce fichier et les commentaires dans le code
- **Issues**: Créer une issue sur GitHub
- **Logs**: Vérifier les logs des plateformes de déploiement

## 🔐 Sécurité

### Variables Sensibles
- Ne jamais commiter les fichiers `.env`
- Utiliser les variables d'environnement des plateformes
- Roter régulièrement les clés API

### Permissions
- Limiter les permissions S3 au minimum nécessaire
- Utiliser des tokens d'accès avec expiration
- Configurer les CORS correctement

### Monitoring
- Surveiller les tentatives d'accès non autorisées
- Configurer des alertes de sécurité
- Maintenir les dépendances à jour
