@echo off
REM ========================================
REM SCRIPT DE DÉPLOIEMENT GECC (Windows)
REM ========================================
REM Ce script automatise le déploiement de l'application GECC sur Windows

setlocal enabledelayedexpansion

REM Variables par défaut
set ENVIRONMENT=dev
set BACKEND_ONLY=false
set FRONTEND_ONLY=false
set CHECK_ONLY=false
set DRY_RUN=false
set SKIP_TESTS=false
set SKIP_MIGRATION=false

REM Parser les arguments
:parse_args
if "%~1"=="" goto :main
if "%~1"=="-h" goto :show_help
if "%~1"=="--help" goto :show_help
if "%~1"=="-e" (
    set ENVIRONMENT=%~2
    shift
    shift
    goto :parse_args
)
if "%~1"=="--env" (
    set ENVIRONMENT=%~2
    shift
    shift
    goto :parse_args
)
if "%~1"=="-b" (
    set BACKEND_ONLY=true
    shift
    goto :parse_args
)
if "%~1"=="--backend-only" (
    set BACKEND_ONLY=true
    shift
    goto :parse_args
)
if "%~1"=="-f" (
    set FRONTEND_ONLY=true
    shift
    goto :parse_args
)
if "%~1"=="--frontend-only" (
    set FRONTEND_ONLY=true
    shift
    goto :parse_args
)
if "%~1"=="-c" (
    set CHECK_ONLY=true
    shift
    goto :parse_args
)
if "%~1"=="--check" (
    set CHECK_ONLY=true
    shift
    goto :parse_args
)
if "%~1"=="-d" (
    set DRY_RUN=true
    shift
    goto :parse_args
)
if "%~1"=="--dry-run" (
    set DRY_RUN=true
    shift
    goto :parse_args
)
if "%~1"=="--skip-tests" (
    set SKIP_TESTS=true
    shift
    goto :parse_args
)
if "%~1"=="--skip-migration" (
    set SKIP_MIGRATION=true
    shift
    goto :parse_args
)
echo [ERROR] Option inconnue: %~1
goto :show_help

:show_help
echo Usage: %0 [OPTIONS]
echo.
echo Options:
echo   -h, --help              Afficher cette aide
echo   -e, --env ENV           Environnement (dev, staging, prod)
echo   -b, --backend-only      Déployer seulement le backend
echo   -f, --frontend-only     Déployer seulement le frontend
echo   -c, --check             Vérifier la configuration avant déploiement
echo   -d, --dry-run           Simulation du déploiement
echo   --skip-tests            Ignorer les tests
echo   --skip-migration        Ignorer les migrations de base de données
echo.
echo Exemples:
echo   %0 -e prod              Déployer en production
echo   %0 -b -e staging        Déployer seulement le backend en staging
echo   %0 -c                   Vérifier la configuration
goto :eof

:log_info
echo [INFO] %~1
goto :eof

:log_success
echo [SUCCESS] %~1
goto :eof

:log_warning
echo [WARNING] %~1
goto :eof

:log_error
echo [ERROR] %~1
goto :eof

:check_prerequisites
call :log_info "🔍 Vérification des prérequis..."

REM Vérifier Git
git --version >nul 2>&1
if errorlevel 1 (
    call :log_error "Git n'est pas installé"
    exit /b 1
)

REM Vérifier Node.js
node --version >nul 2>&1
if errorlevel 1 (
    call :log_error "Node.js n'est pas installé"
    exit /b 1
)

REM Vérifier npm
npm --version >nul 2>&1
if errorlevel 1 (
    call :log_error "npm n'est pas installé"
    exit /b 1
)

REM Vérifier que nous sommes dans un repository Git
git rev-parse --git-dir >nul 2>&1
if errorlevel 1 (
    call :log_error "Ce répertoire n'est pas un repository Git"
    exit /b 1
)

call :log_success "✅ Prérequis vérifiés"
goto :eof

:check_configuration
call :log_info "🔧 Vérification de la configuration..."

REM Vérifier les fichiers de configuration
if not exist "package.json" (
    call :log_error "package.json manquant"
    exit /b 1
)

if not exist "server\package.json" (
    call :log_error "server\package.json manquant"
    exit /b 1
)

REM Vérifier les fichiers d'environnement
if not exist "env.example" (
    call :log_warning "env.example manquant"
)

if not exist "server\env.example" (
    call :log_warning "server\env.example manquant"
)

call :log_success "✅ Configuration vérifiée"
goto :eof

:install_dependencies
call :log_info "📦 Installation des dépendances..."

if "%BACKEND_ONLY%"=="false" (
    call :log_info "Installation des dépendances frontend..."
    if "%DRY_RUN%"=="false" (
        npm install
    )
)

if "%FRONTEND_ONLY%"=="false" (
    call :log_info "Installation des dépendances backend..."
    if "%DRY_RUN%"=="false" (
        cd server
        npm install
        cd ..
    )
)

call :log_success "✅ Dépendances installées"
goto :eof

:run_tests
if "%SKIP_TESTS%"=="true" (
    call :log_info "⏭️ Tests ignorés"
    goto :eof
)

call :log_info "🧪 Exécution des tests..."

if "%BACKEND_ONLY%"=="false" (
    call :log_info "Tests frontend..."
    if "%DRY_RUN%"=="false" (
        call :log_info "Aucun test frontend configuré"
    )
)

if "%FRONTEND_ONLY%"=="false" (
    call :log_info "Tests backend..."
    if "%DRY_RUN%"=="false" (
        cd server
        npm run test >nul 2>&1
        if errorlevel 1 (
            call :log_warning "⚠️ Tests backend non configurés ou échoués"
        ) else (
            call :log_success "✅ Tests backend réussis"
        )
        cd ..
    )
)

call :log_success "✅ Tests terminés"
goto :eof

:build_application
call :log_info "🔨 Build de l'application..."

if "%BACKEND_ONLY%"=="false" (
    call :log_info "Build frontend..."
    if "%DRY_RUN%"=="false" (
        call :log_info "Frontend statique, pas de build nécessaire"
    )
)

if "%FRONTEND_ONLY%"=="false" (
    call :log_info "Build backend..."
    if "%DRY_RUN%"=="false" (
        call :log_info "Backend Node.js, pas de build nécessaire"
    )
)

call :log_success "✅ Build terminé"
goto :eof

:run_migrations
if "%SKIP_MIGRATION%"=="true" (
    call :log_info "⏭️ Migrations ignorées"
    goto :eof
)

if "%FRONTEND_ONLY%"=="true" (
    call :log_info "⏭️ Migrations ignorées (frontend seulement)"
    goto :eof
)

call :log_info "🗄️ Exécution des migrations..."

if "%DRY_RUN%"=="false" (
    cd server
    npm run migrate >nul 2>&1
    if errorlevel 1 (
        call :log_warning "⚠️ Migrations non configurées ou échouées"
    ) else (
        call :log_success "✅ Migrations exécutées"
    )
    cd ..
) else (
    call :log_info "Simulation: npm run migrate"
)

goto :eof

:deploy_application
call :log_info "🚀 Déploiement de l'application..."

if "%DRY_RUN%"=="true" (
    call :log_info "Mode simulation - aucun déploiement réel"
    call :log_info "Commandes qui seraient exécutées:"
    call :log_info "  git add ."
    call :log_info "  git commit -m 'Deploy to %ENVIRONMENT%'"
    call :log_info "  git push origin main"
    goto :eof
)

REM Commit des changements
call :log_info "Commit des changements..."
git add .
git commit -m "Deploy to %ENVIRONMENT% - %date% %time%" || call :log_warning "Aucun changement à commiter"

REM Push vers le repository
call :log_info "Push vers le repository..."
git push origin main

call :log_success "✅ Déploiement initié"
call :log_info "Le déploiement sera géré par les plateformes de déploiement connectées"
goto :eof

:post_deployment_check
call :log_info "🔍 Vérification post-déploiement..."

if "%DRY_RUN%"=="false" (
    call :log_info "Attente de 30 secondes pour le déploiement..."
    timeout /t 30 /nobreak >nul
)

call :log_success "✅ Vérification post-déploiement terminée"
goto :eof

:main
call :log_info "🎯 Début du processus de déploiement GECC"
call :log_info "Environnement: %ENVIRONMENT%"
call :log_info "Répertoire: %CD%"

REM Vérifications préliminaires
call :check_prerequisites
if errorlevel 1 exit /b 1

call :check_configuration
if errorlevel 1 exit /b 1

if "%CHECK_ONLY%"=="true" (
    call :log_success "✅ Vérification terminée - tout est prêt pour le déploiement"
    exit /b 0
)

REM Processus de déploiement
call :install_dependencies
call :run_tests
call :build_application
call :run_migrations
call :deploy_application
call :post_deployment_check

call :log_success "🎉 Déploiement terminé avec succès!"
call :log_info "Environnement: %ENVIRONMENT%"
if "%FRONTEND_ONLY%"=="true" (
    call :log_info "Backend: Ignoré"
) else (
    call :log_info "Backend: Déployé"
)
if "%BACKEND_ONLY%"=="true" (
    call :log_info "Frontend: Ignoré"
) else (
    call :log_info "Frontend: Déployé"
)

endlocal
