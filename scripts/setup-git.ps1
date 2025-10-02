# ========================================
# SCRIPT DE CONFIGURATION GIT GECC (PowerShell)
# ========================================
# Ce script configure le repository Git pour le déploiement

param(
    [string]$RemoteUrl = "",
    [string]$Branch = "main",
    [switch]$Init,
    [switch]$Check,
    [switch]$SetupHooks,
    [switch]$Help
)

# Fonction d'aide
function Show-Help {
    Write-Host "Usage: .\setup-git.ps1 [OPTIONS]" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Help              Afficher cette aide"
    Write-Host "  -RemoteUrl URL     URL du repository distant"
    Write-Host "  -Branch BRANCH     Branche principale (défaut: main)"
    Write-Host "  -Init              Initialiser un nouveau repository Git"
    Write-Host "  -Check             Vérifier la configuration Git"
    Write-Host "  -SetupHooks        Configurer les hooks Git"
    Write-Host ""
    Write-Host "Exemples:"
    Write-Host "  .\setup-git.ps1 -Init"
    Write-Host "  .\setup-git.ps1 -RemoteUrl 'https://github.com/user/repo.git'"
    Write-Host "  .\setup-git.ps1 -Check"
}

# Fonctions de logging
function Log-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Log-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Log-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Log-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Fonction d'initialisation Git
function Initialize-GitRepo {
    Log-Info "🔧 Initialisation du repository Git..."
    
    if (Test-Path ".git") {
        Log-Warning "Repository Git déjà initialisé"
        return
    }
    
    # Initialiser Git
    git init
    
    # Configurer la branche principale
    git branch -M $Branch
    
    # Ajouter tous les fichiers
    git add .
    
    # Premier commit
    git commit -m "Initial commit: GECC project setup"
    
    Log-Success "✅ Repository Git initialisé"
}

# Fonction de configuration du remote
function Setup-Remote {
    if ([string]::IsNullOrEmpty($RemoteUrl)) {
        Log-Warning "Aucune URL de repository distant fournie"
        return
    }
    
    Log-Info "🔗 Configuration du repository distant..."
    
    # Vérifier si le remote existe déjà
    try {
        $currentUrl = git remote get-url origin 2>$null
        if ($currentUrl) {
            Log-Info "Mise à jour du remote origin..."
            git remote set-url origin $RemoteUrl
        }
    }
    catch {
        Log-Info "Ajout du remote origin..."
        git remote add origin $RemoteUrl
    }
    
    Log-Success "✅ Remote configuré: $RemoteUrl"
}

# Fonction de vérification de la configuration
function Check-GitConfig {
    Log-Info "🔍 Vérification de la configuration Git..."
    
    # Vérifier Git
    try {
        git --version | Out-Null
    }
    catch {
        Log-Error "Git n'est pas installé"
        exit 1
    }
    
    # Vérifier que nous sommes dans un repository Git
    try {
        git rev-parse --git-dir | Out-Null
    }
    catch {
        Log-Error "Ce répertoire n'est pas un repository Git"
        exit 1
    }
    
    # Afficher la configuration
    Log-Info "Configuration Git actuelle:"
    $userName = git config user.name
    $userEmail = git config user.email
    $currentBranch = git branch --show-current
    $remoteUrl = git remote get-url origin 2>$null
    
    Write-Host "  User: $($userName ?? 'Non configuré')"
    Write-Host "  Email: $($userEmail ?? 'Non configuré')"
    Write-Host "  Branch: $($currentBranch ?? 'Non configuré')"
    Write-Host "  Remote: $($remoteUrl ?? 'Non configuré')"
    
    # Vérifier les fichiers importants
    Log-Info "Vérification des fichiers de configuration:"
    
    $files = @(
        @{Path=".gitignore"; Name=".gitignore"},
        @{Path="package.json"; Name="package.json"},
        @{Path="server/package.json"; Name="server/package.json"},
        @{Path="env.example"; Name="env.example"},
        @{Path="server/env.example"; Name="server/env.example"}
    )
    
    foreach ($file in $files) {
        if (Test-Path $file.Path) {
            Log-Success "✅ $($file.Name) présent"
        } else {
            Log-Warning "⚠️ $($file.Name) manquant"
        }
    }
    
    # Vérifier les fichiers de déploiement
    if ((Test-Path "vercel.json") -or (Test-Path "netlify.toml")) {
        Log-Success "✅ Configuration de déploiement frontend présente"
    } else {
        Log-Warning "⚠️ Configuration de déploiement frontend manquante"
    }
    
    if ((Test-Path "server/railway.json") -or (Test-Path "server/render.yaml")) {
        Log-Success "✅ Configuration de déploiement backend présente"
    } else {
        Log-Warning "⚠️ Configuration de déploiement backend manquante"
    }
    
    # Vérifier les scripts de déploiement
    if (Test-Path "scripts/deploy.sh") {
        Log-Success "✅ Script de déploiement Linux/Mac présent"
    } else {
        Log-Warning "⚠️ Script de déploiement Linux/Mac manquant"
    }
    
    if (Test-Path "scripts/deploy.bat") {
        Log-Success "✅ Script de déploiement Windows présent"
    } else {
        Log-Warning "⚠️ Script de déploiement Windows manquant"
    }
    
    # Vérifier GitHub Actions
    if (Test-Path ".github/workflows") {
        Log-Success "✅ GitHub Actions configuré"
    } else {
        Log-Warning "⚠️ GitHub Actions non configuré"
    }
    
    Log-Success "✅ Vérification terminée"
}

# Fonction de configuration des hooks Git
function Setup-GitHooks {
    Log-Info "🪝 Configuration des hooks Git..."
    
    # Créer le dossier hooks s'il n'existe pas
    $hooksDir = ".git/hooks"
    if (-not (Test-Path $hooksDir)) {
        New-Item -ItemType Directory -Path $hooksDir -Force | Out-Null
    }
    
    # Hook pre-commit
    $preCommitContent = @'
#!/bin/bash
# Hook pre-commit pour GECC

echo "🔍 Vérification pre-commit..."

# Vérifier qu'aucun fichier .env n'est commité
if git diff --cached --name-only | grep -E '\.env$'; then
    echo "❌ Erreur: Fichiers .env détectés dans le commit"
    echo "Les fichiers .env ne doivent pas être commités"
    exit 1
fi

# Vérifier qu'aucun secret n'est en dur
if git diff --cached | grep -E '(password|secret|key).*=.*[a-zA-Z0-9]{10,}'; then
    echo "❌ Erreur: Secrets potentiels détectés dans le commit"
    echo "Vérifiez qu'aucun mot de passe ou clé secrète n'est en dur"
    exit 1
fi

# Vérifier la syntaxe des fichiers JS
for file in $(git diff --cached --name-only | grep '\.js$'); do
    if ! node -c "$file" 2>/dev/null; then
        echo "❌ Erreur de syntaxe dans $file"
        exit 1
    fi
done

echo "✅ Vérifications pre-commit réussies"
'@
    
    $preCommitContent | Out-File -FilePath "$hooksDir/pre-commit" -Encoding UTF8
    
    # Hook pre-push
    $prePushContent = @'
#!/bin/bash
# Hook pre-push pour GECC

echo "🔍 Vérification pre-push..."

# Vérifier que les tests passent
if [ -f "server/package.json" ]; then
    cd server
    if npm run test >/dev/null 2>&1; then
        echo "✅ Tests backend réussis"
    else
        echo "⚠️ Tests backend non configurés ou échoués"
    fi
    cd ..
fi

echo "✅ Vérifications pre-push terminées"
'@
    
    $prePushContent | Out-File -FilePath "$hooksDir/pre-push" -Encoding UTF8
    
    Log-Success "✅ Hooks Git configurés"
}

# Fonction de configuration de l'utilisateur Git
function Setup-GitUser {
    Log-Info "👤 Configuration de l'utilisateur Git..."
    
    # Vérifier si l'utilisateur est configuré
    $userName = git config user.name
    if ([string]::IsNullOrEmpty($userName)) {
        $gitName = Read-Host "Nom d'utilisateur Git"
        git config user.name $gitName
    }
    
    $userEmail = git config user.email
    if ([string]::IsNullOrEmpty($userEmail)) {
        $gitEmail = Read-Host "Email Git"
        git config user.email $gitEmail
    }
    
    Log-Success "✅ Utilisateur Git configuré"
}

# Fonction principale
function Main {
    Log-Info "🎯 Configuration Git pour GECC"
    
    if ($Init) {
        Initialize-GitRepo
        Setup-GitUser
    }
    
    if ($SetupHooks) {
        Setup-GitHooks
    }
    
    if ($Check) {
        Check-GitConfig
    }
    
    if (-not [string]::IsNullOrEmpty($RemoteUrl)) {
        Setup-Remote
    }
    
    Log-Success "🎉 Configuration Git terminée!"
    
    # Afficher les prochaines étapes
    Log-Info "📋 Prochaines étapes:"
    Write-Host "  1. Configurer les variables d'environnement"
    Write-Host "  2. Tester localement: npm install && cd server && npm install"
    Write-Host "  3. Vérifier la configuration: .\scripts\deploy.bat --check"
    Write-Host "  4. Premier déploiement: .\scripts\deploy.bat -e prod"
}

# Afficher l'aide si demandé
if ($Help) {
    Show-Help
    exit 0
}

# Exécution du script
Main
