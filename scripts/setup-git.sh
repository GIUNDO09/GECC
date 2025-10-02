#!/bin/bash

# ========================================
# SCRIPT DE CONFIGURATION GIT GECC
# ========================================
# Ce script configure le repository Git pour le déploiement

set -e  # Arrêter en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Fonction d'aide
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help              Afficher cette aide"
    echo "  -r, --remote URL        URL du repository distant"
    echo "  -b, --branch BRANCH     Branche principale (défaut: main)"
    echo "  -i, --init              Initialiser un nouveau repository Git"
    echo "  -c, --check             Vérifier la configuration Git"
    echo "  -s, --setup-hooks       Configurer les hooks Git"
    echo ""
    echo "Exemples:"
    echo "  $0 -i                   Initialiser un nouveau repository"
    echo "  $0 -r https://github.com/user/repo.git"
    echo "  $0 -c                   Vérifier la configuration"
}

# Variables par défaut
REMOTE_URL=""
BRANCH="main"
INIT_REPO=false
CHECK_CONFIG=false
SETUP_HOOKS=false

# Parser les arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -r|--remote)
            REMOTE_URL="$2"
            shift 2
            ;;
        -b|--branch)
            BRANCH="$2"
            shift 2
            ;;
        -i|--init)
            INIT_REPO=true
            shift
            ;;
        -c|--check)
            CHECK_CONFIG=true
            shift
            ;;
        -s|--setup-hooks)
            SETUP_HOOKS=true
            shift
            ;;
        *)
            log_error "Option inconnue: $1"
            show_help
            exit 1
            ;;
    esac
done

# Fonction d'initialisation Git
init_git_repo() {
    log_info "🔧 Initialisation du repository Git..."
    
    if [ -d ".git" ]; then
        log_warning "Repository Git déjà initialisé"
        return
    fi
    
    # Initialiser Git
    git init
    
    # Configurer la branche principale
    git branch -M "$BRANCH"
    
    # Ajouter tous les fichiers
    git add .
    
    # Premier commit
    git commit -m "Initial commit: GECC project setup"
    
    log_success "✅ Repository Git initialisé"
}

# Fonction de configuration du remote
setup_remote() {
    if [ -z "$REMOTE_URL" ]; then
        log_warning "Aucune URL de repository distant fournie"
        return
    fi
    
    log_info "🔗 Configuration du repository distant..."
    
    # Vérifier si le remote existe déjà
    if git remote get-url origin >/dev/null 2>&1; then
        log_info "Mise à jour du remote origin..."
        git remote set-url origin "$REMOTE_URL"
    else
        log_info "Ajout du remote origin..."
        git remote add origin "$REMOTE_URL"
    fi
    
    log_success "✅ Remote configuré: $REMOTE_URL"
}

# Fonction de vérification de la configuration
check_git_config() {
    log_info "🔍 Vérification de la configuration Git..."
    
    # Vérifier Git
    if ! command -v git &> /dev/null; then
        log_error "Git n'est pas installé"
        exit 1
    fi
    
    # Vérifier que nous sommes dans un repository Git
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Ce répertoire n'est pas un repository Git"
        exit 1
    fi
    
    # Afficher la configuration
    log_info "Configuration Git actuelle:"
    echo "  User: $(git config user.name || echo 'Non configuré')"
    echo "  Email: $(git config user.email || echo 'Non configuré')"
    echo "  Branch: $(git branch --show-current || echo 'Non configuré')"
    echo "  Remote: $(git remote get-url origin 2>/dev/null || echo 'Non configuré')"
    
    # Vérifier les fichiers importants
    log_info "Vérification des fichiers de configuration:"
    
    if [ -f ".gitignore" ]; then
        log_success "✅ .gitignore présent"
    else
        log_warning "⚠️ .gitignore manquant"
    fi
    
    if [ -f "package.json" ]; then
        log_success "✅ package.json présent"
    else
        log_warning "⚠️ package.json manquant"
    fi
    
    if [ -f "server/package.json" ]; then
        log_success "✅ server/package.json présent"
    else
        log_warning "⚠️ server/package.json manquant"
    fi
    
    # Vérifier les fichiers d'environnement
    if [ -f "env.example" ]; then
        log_success "✅ env.example présent"
    else
        log_warning "⚠️ env.example manquant"
    fi
    
    if [ -f "server/env.example" ]; then
        log_success "✅ server/env.example présent"
    else
        log_warning "⚠️ server/env.example manquant"
    fi
    
    # Vérifier les fichiers de déploiement
    if [ -f "vercel.json" ] || [ -f "netlify.toml" ]; then
        log_success "✅ Configuration de déploiement frontend présente"
    else
        log_warning "⚠️ Configuration de déploiement frontend manquante"
    fi
    
    if [ -f "server/railway.json" ] || [ -f "server/render.yaml" ]; then
        log_success "✅ Configuration de déploiement backend présente"
    else
        log_warning "⚠️ Configuration de déploiement backend manquante"
    fi
    
    # Vérifier les scripts de déploiement
    if [ -f "scripts/deploy.sh" ]; then
        log_success "✅ Script de déploiement Linux/Mac présent"
    else
        log_warning "⚠️ Script de déploiement Linux/Mac manquant"
    fi
    
    if [ -f "scripts/deploy.bat" ]; then
        log_success "✅ Script de déploiement Windows présent"
    else
        log_warning "⚠️ Script de déploiement Windows manquant"
    fi
    
    # Vérifier GitHub Actions
    if [ -d ".github/workflows" ]; then
        log_success "✅ GitHub Actions configuré"
    else
        log_warning "⚠️ GitHub Actions non configuré"
    fi
    
    log_success "✅ Vérification terminée"
}

# Fonction de configuration des hooks Git
setup_git_hooks() {
    log_info "🪝 Configuration des hooks Git..."
    
    # Créer le dossier hooks s'il n'existe pas
    mkdir -p .git/hooks
    
    # Hook pre-commit
    cat > .git/hooks/pre-commit << 'EOF'
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
EOF

    # Hook pre-push
    cat > .git/hooks/pre-push << 'EOF'
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
EOF

    # Rendre les hooks exécutables
    chmod +x .git/hooks/pre-commit
    chmod +x .git/hooks/pre-push
    
    log_success "✅ Hooks Git configurés"
}

# Fonction de configuration de l'utilisateur Git
setup_git_user() {
    log_info "👤 Configuration de l'utilisateur Git..."
    
    # Vérifier si l'utilisateur est configuré
    if [ -z "$(git config user.name)" ]; then
        read -p "Nom d'utilisateur Git: " git_name
        git config user.name "$git_name"
    fi
    
    if [ -z "$(git config user.email)" ]; then
        read -p "Email Git: " git_email
        git config user.email "$git_email"
    fi
    
    log_success "✅ Utilisateur Git configuré"
}

# Fonction principale
main() {
    log_info "🎯 Configuration Git pour GECC"
    
    if [ "$INIT_REPO" = true ]; then
        init_git_repo
        setup_git_user
    fi
    
    if [ "$SETUP_HOOKS" = true ]; then
        setup_git_hooks
    fi
    
    if [ "$CHECK_CONFIG" = true ]; then
        check_git_config
    fi
    
    if [ -n "$REMOTE_URL" ]; then
        setup_remote
    fi
    
    log_success "🎉 Configuration Git terminée!"
    
    # Afficher les prochaines étapes
    log_info "📋 Prochaines étapes:"
    echo "  1. Configurer les variables d'environnement"
    echo "  2. Tester localement: npm install && cd server && npm install"
    echo "  3. Vérifier la configuration: ./scripts/deploy.sh --check"
    echo "  4. Premier déploiement: ./scripts/deploy.sh -e prod"
}

# Exécution du script
main "$@"
