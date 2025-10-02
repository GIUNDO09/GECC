# 🛠️ Scripts de Déploiement GECC

Ce dossier contient tous les scripts nécessaires pour le déploiement et la maintenance de l'application GECC.

## 📁 Structure des Scripts

```
scripts/
├── deploy.sh          # Script de déploiement principal (Linux/Mac)
├── deploy.bat         # Script de déploiement principal (Windows)
├── setup-git.sh       # Configuration du repository Git
└── README.md          # Ce fichier
```

## 🚀 Scripts de Déploiement

### `deploy.sh` (Linux/Mac)

Script principal de déploiement avec support complet des options.

```bash
# Vérification de la configuration
./scripts/deploy.sh --check

# Déploiement en production
./scripts/deploy.sh -e prod

# Déploiement backend seulement
./scripts/deploy.sh -b -e prod

# Simulation du déploiement
./scripts/deploy.sh -d -e prod

# Aide
./scripts/deploy.sh --help
```

### `deploy.bat` (Windows)

Version Windows du script de déploiement.

```cmd
REM Vérification de la configuration
scripts\deploy.bat --check

REM Déploiement en production
scripts\deploy.bat -e prod

REM Déploiement backend seulement
scripts\deploy.bat -b -e prod

REM Simulation du déploiement
scripts\deploy.bat -d -e prod
```

## ⚙️ Options Disponibles

| Option | Description |
|--------|-------------|
| `-h, --help` | Afficher l'aide |
| `-e, --env ENV` | Environnement (dev, staging, prod) |
| `-b, --backend-only` | Déployer seulement le backend |
| `-f, --frontend-only` | Déployer seulement le frontend |
| `-c, --check` | Vérifier la configuration |
| `-d, --dry-run` | Simulation du déploiement |
| `--skip-tests` | Ignorer les tests |
| `--skip-migration` | Ignorer les migrations |

## 🔧 Script de Configuration Git

### `setup-git.sh`

Configure le repository Git pour le déploiement.

```bash
# Initialiser un nouveau repository
./scripts/setup-git.sh -i

# Configurer le remote
./scripts/setup-git.sh -r https://github.com/user/repo.git

# Vérifier la configuration
./scripts/setup-git.sh -c

# Configurer les hooks Git
./scripts/setup-git.sh -s
```

## 📋 Processus de Déploiement

### 1. Vérifications Préliminaires
- ✅ Git installé et configuré
- ✅ Node.js 18+ installé
- ✅ npm installé
- ✅ Repository Git propre
- ✅ Fichiers de configuration présents

### 2. Installation des Dépendances
- ✅ Frontend: `npm install`
- ✅ Backend: `cd server && npm install`

### 3. Tests
- ✅ Tests frontend (si configurés)
- ✅ Tests backend (si configurés)
- ✅ Audit de sécurité

### 4. Build
- ✅ Frontend statique (pas de build nécessaire)
- ✅ Backend Node.js (pas de build nécessaire)

### 5. Migrations
- ✅ Migrations de base de données
- ✅ Vérification de la connectivité

### 6. Déploiement
- ✅ Commit des changements
- ✅ Push vers le repository
- ✅ Déclenchement du déploiement automatique

### 7. Vérification Post-Déploiement
- ✅ Vérification de la santé de l'application
- ✅ Tests des endpoints critiques

## 🔐 Sécurité

### Hooks Git
Les hooks Git sont configurés pour :
- ✅ Empêcher le commit de fichiers `.env`
- ✅ Détecter les secrets en dur
- ✅ Vérifier la syntaxe des fichiers JS
- ✅ Exécuter les tests avant le push

### Variables d'Environnement
- ❌ Ne jamais commiter les fichiers `.env`
- ✅ Utiliser les variables d'environnement des plateformes
- ✅ Roter régulièrement les clés API

## 🚨 Dépannage

### Problèmes Courants

1. **Permission Denied**
   ```bash
   chmod +x scripts/deploy.sh
   chmod +x scripts/setup-git.sh
   ```

2. **Git Not Found**
   ```bash
   # Installer Git
   # Ubuntu/Debian
   sudo apt install git
   
   # macOS
   brew install git
   
   # Windows
   # Télécharger depuis git-scm.com
   ```

3. **Node.js Version**
   ```bash
   # Vérifier la version
   node --version
   
   # Installer Node.js 18+
   # Utiliser nvm pour gérer les versions
   nvm install 18
   nvm use 18
   ```

4. **Repository Not Clean**
   ```bash
   # Voir les modifications
   git status
   
   # Commiter ou ignorer les changements
   git add .
   git commit -m "Save changes"
   
   # Ou ignorer les changements
   git stash
   ```

### Logs et Debug

```bash
# Mode verbose
./scripts/deploy.sh -e prod --verbose

# Mode dry-run pour tester
./scripts/deploy.sh -d -e prod

# Vérification seulement
./scripts/deploy.sh --check
```

## 📊 Monitoring

### GitHub Actions
- ✅ Tests automatiques sur chaque push
- ✅ Déploiement automatique
- ✅ Vérifications de sécurité
- ✅ Rapports de déploiement

### Plateformes de Déploiement
- **Railway**: Dashboard → Logs
- **Render**: Dashboard → Logs
- **Vercel**: Dashboard → Functions → Logs
- **Netlify**: Dashboard → Functions → Logs

## 🔄 Maintenance

### Mise à Jour des Dépendances
```bash
# Frontend
npm update

# Backend
cd server && npm update
```

### Nettoyage
```bash
# Nettoyer les node_modules
rm -rf node_modules server/node_modules
npm install
cd server && npm install
```

### Sauvegarde
```bash
# Sauvegarder la configuration
cp .env.example .env.backup
cp server/env.example server/env.backup
```

## 📞 Support

- 📖 Documentation: `../DEPLOYMENT.md`
- 🐛 Issues: GitHub Issues
- 📊 Monitoring: Dashboards des plateformes
- 🔧 Scripts: Ce dossier

## 🎯 Prochaines Améliorations

- [ ] Support Docker
- [ ] Déploiement multi-environnement
- [ ] Rollback automatique
- [ ] Monitoring avancé
- [ ] Notifications Slack/Discord
- [ ] Tests de performance
- [ ] Déploiement blue-green
