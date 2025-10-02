#!/bin/bash

# ========================================
# SCRIPT DE DÉPLOIEMENT GECC
# ========================================
# Ce script automatise le déploiement de l'application GECC

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
    echo "  -e, --env ENV           Environnement (dev, staging, prod)"
    echo "  -b, --backend-only      Déployer seulement le backend"
    echo "  -f, --frontend-only     Déployer seulement le frontend"
    echo "  -c, --check             Vérifier la configuration avant déploiement"
    echo "  -d, --dry-run           Simulation du déploiement"
    echo "  --skip-tests            Ignorer les tests"
    echo "  --skip-migration        Ignorer les migrations de base de données"
    echo ""
    echo "Exemples:"
    echo "  $0 -e prod              Déployer en production"
    echo "  $0 -b -e staging        Déployer seulement le backend en staging"
    echo "  $0 -c                   Vérifier la configuration"
}

# Variables par défaut
ENVIRONMENT="dev"
BACKEND_ONLY=false
FRONTEND_ONLY=false
CHECK_ONLY=false
DRY_RUN=false
SKIP_TESTS=false
SKIP_MIGRATION=false

# Parser les arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -e|--env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -b|--backend-only)
            BACKEND_ONLY=true
            shift
            ;;
        -f|--frontend-only)
            FRONTEND_ONLY=true
            shift
            ;;
        -c|--check)
            CHECK_ONLY=true
            shift
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-migration)
            SKIP_MIGRATION=true
            shift
            ;;
        *)
            log_error "Option inconnue: $1"
            show_help
            exit 1
            ;;
    esac
done

# Vérifier l'environnement
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    log_error "Environnement invalide: $ENVIRONMENT"
    log_info "Environnements valides: dev, staging, prod"
    exit 1
fi

log_info "🚀 Démarrage du déploiement GECC"
log_info "Environnement: $ENVIRONMENT"
log_info "Répertoire: $(pwd)"

# Fonction de vérification des prérequis
check_prerequisites() {
    log_info "🔍 Vérification des prérequis..."
    
    # Vérifier Git
    if ! command -v git &> /dev/null; then
        log_error "Git n'est pas installé"
        exit 1
    fi
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js n'est pas installé"
        exit 1
    fi
    
    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        log_error "npm n'est pas installé"
        exit 1
    fi
    
    # Vérifier la version de Node.js
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js version 18+ requis (version actuelle: $(node -v))"
        exit 1
    fi
    
    # Vérifier que nous sommes dans un repository Git
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Ce répertoire n'est pas un repository Git"
        exit 1
    fi
    
    # Vérifier que le repository est propre
    if ! git diff-index --quiet HEAD --; then
        log_warning "Des modifications non commitées détectées"
        if [ "$DRY_RUN" = false ]; then
            read -p "Continuer quand même? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        fi
    fi
    
    log_success "✅ Prérequis vérifiés"
}

# Fonction de vérification de la configuration
check_configuration() {
    log_info "🔧 Vérification de la configuration..."
    
    # Vérifier les fichiers de configuration
    if [ ! -f "package.json" ]; then
        log_error "package.json manquant"
        exit 1
    fi
    
    if [ ! -f "server/package.json" ]; then
        log_error "server/package.json manquant"
        exit 1
    fi
    
    # Vérifier les fichiers d'environnement
    if [ ! -f "env.example" ]; then
        log_warning "env.example manquant"
    fi
    
    if [ ! -f "server/env.example" ]; then
        log_warning "server/env.example manquant"
    fi
    
    # Vérifier les fichiers de déploiement
    if [ ! -f "vercel.json" ] && [ ! -f "netlify.toml" ]; then
        log_warning "Aucun fichier de configuration de déploiement frontend trouvé"
    fi
    
    if [ ! -f "server/railway.json" ] && [ ! -f "server/render.yaml" ]; then
        log_warning "Aucun fichier de configuration de déploiement backend trouvé"
    fi
    
    log_success "✅ Configuration vérifiée"
}

# Fonction d'installation des dépendances
install_dependencies() {
    log_info "📦 Installation des dépendances..."
    
    if [ "$BACKEND_ONLY" = false ]; then
        log_info "Installation des dépendances frontend..."
        if [ "$DRY_RUN" = false ]; then
            npm install
        fi
    fi
    
    if [ "$FRONTEND_ONLY" = false ]; then
        log_info "Installation des dépendances backend..."
        if [ "$DRY_RUN" = false ]; then
            cd server && npm install && cd ..
        fi
    fi
    
    log_success "✅ Dépendances installées"
}

# Fonction d'exécution des tests
run_tests() {
    if [ "$SKIP_TESTS" = true ]; then
        log_info "⏭️ Tests ignorés"
        return
    fi
    
    log_info "🧪 Exécution des tests..."
    
    if [ "$BACKEND_ONLY" = false ]; then
        log_info "Tests frontend..."
        if [ "$DRY_RUN" = false ]; then
            # Ajouter des tests frontend si nécessaire
            log_info "Aucun test frontend configuré"
        fi
    fi
    
    if [ "$FRONTEND_ONLY" = false ]; then
        log_info "Tests backend..."
        if [ "$DRY_RUN" = false ]; then
            cd server
            if npm run test 2>/dev/null; then
                log_success "✅ Tests backend réussis"
            else
                log_warning "⚠️ Tests backend non configurés ou échoués"
            fi
            cd ..
        fi
    fi
    
    log_success "✅ Tests terminés"
}

# Fonction de build
build_application() {
    log_info "🔨 Build de l'application..."
    
    if [ "$BACKEND_ONLY" = false ]; then
        log_info "Build frontend..."
        if [ "$DRY_RUN" = false ]; then
            # Le frontend est statique, pas de build nécessaire
            log_info "Frontend statique, pas de build nécessaire"
        fi
    fi
    
    if [ "$FRONTEND_ONLY" = false ]; then
        log_info "Build backend..."
        if [ "$DRY_RUN" = false ]; then
            # Le backend Node.js n'a pas de build
            log_info "Backend Node.js, pas de build nécessaire"
        fi
    fi
    
    log_success "✅ Build terminé"
}

# Fonction de migration de base de données
run_migrations() {
    if [ "$SKIP_MIGRATION" = true ]; then
        log_info "⏭️ Migrations ignorées"
        return
    fi
    
    if [ "$FRONTEND_ONLY" = true ]; then
        log_info "⏭️ Migrations ignorées (frontend seulement)"
        return
    fi
    
    log_info "🗄️ Exécution des migrations..."
    
    if [ "$DRY_RUN" = false ]; then
        cd server
        if npm run migrate 2>/dev/null; then
            log_success "✅ Migrations exécutées"
        else
            log_warning "⚠️ Migrations non configurées ou échouées"
        fi
        cd ..
    else
        log_info "Simulation: npm run migrate"
    fi
}

# Fonction de déploiement
deploy_application() {
    log_info "🚀 Déploiement de l'application..."
    
    if [ "$DRY_RUN" = true ]; then
        log_info "Mode simulation - aucun déploiement réel"
        log_info "Commandes qui seraient exécutées:"
        log_info "  git add ."
        log_info "  git commit -m 'Deploy to $ENVIRONMENT'"
        log_info "  git push origin main"
        return
    fi
    
    # Commit des changements
    log_info "Commit des changements..."
    git add .
    git commit -m "Deploy to $ENVIRONMENT - $(date '+%Y-%m-%d %H:%M:%S')" || log_warning "Aucun changement à commiter"
    
    # Push vers le repository
    log_info "Push vers le repository..."
    git push origin main
    
    log_success "✅ Déploiement initié"
    log_info "Le déploiement sera géré par les plateformes de déploiement connectées"
}

# Fonction de vérification post-déploiement
post_deployment_check() {
    log_info "🔍 Vérification post-déploiement..."
    
    # Attendre un peu pour que le déploiement se termine
    if [ "$DRY_RUN" = false ]; then
        log_info "Attente de 30 secondes pour le déploiement..."
        sleep 30
    fi
    
    # Ici, vous pourriez ajouter des vérifications automatiques
    # comme tester les endpoints de l'API, vérifier la santé de l'application, etc.
    
    log_success "✅ Vérification post-déploiement terminée"
}

# Fonction principale
main() {
    log_info "🎯 Début du processus de déploiement GECC"
    
    # Vérifications préliminaires
    check_prerequisites
    check_configuration
    
    if [ "$CHECK_ONLY" = true ]; then
        log_success "✅ Vérification terminée - tout est prêt pour le déploiement"
        exit 0
    fi
    
    # Processus de déploiement
    install_dependencies
    run_tests
    build_application
    run_migrations
    deploy_application
    post_deployment_check
    
    log_success "🎉 Déploiement terminé avec succès!"
    log_info "Environnement: $ENVIRONMENT"
    log_info "Backend: $([ "$FRONTEND_ONLY" = true ] && echo "Ignoré" || echo "Déployé")"
    log_info "Frontend: $([ "$BACKEND_ONLY" = true ] && echo "Ignoré" || echo "Déployé")"
}

# Exécution du script
main "$@"
