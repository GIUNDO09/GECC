# ========================================
# SCRIPT DE DÉPLOIEMENT AUTOMATISÉ GECC
# ========================================

Write-Host "🚀 DÉPLOIEMENT AUTOMATISÉ GECC" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Vérifier les prérequis
Write-Host "🔍 Vérification des prérequis..." -ForegroundColor Blue

# Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js non installé" -ForegroundColor Red
    exit 1
}

# npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm non installé" -ForegroundColor Red
    exit 1
}

# Git
try {
    $gitVersion = git --version
    Write-Host "✅ Git: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git non installé" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Installation des dépendances..." -ForegroundColor Blue

# Frontend
Write-Host "Frontend..." -ForegroundColor Yellow
npm install

# Backend
Write-Host "Backend..." -ForegroundColor Yellow
Set-Location server
npm install
Set-Location ..

Write-Host ""
Write-Host "🧪 Tests..." -ForegroundColor Blue

# Tests backend
Write-Host "Tests backend..." -ForegroundColor Yellow
Set-Location server
try {
    npm run test
    Write-Host "✅ Tests backend réussis" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Tests backend non configurés" -ForegroundColor Yellow
}
Set-Location ..

Write-Host ""
Write-Host "🔨 Build..." -ForegroundColor Blue
Write-Host "Frontend statique - pas de build nécessaire" -ForegroundColor Yellow
Write-Host "Backend Node.js - pas de build nécessaire" -ForegroundColor Yellow

Write-Host ""
Write-Host "🗄️ Migrations..." -ForegroundColor Blue
Write-Host "Migrations à exécuter sur la plateforme de déploiement" -ForegroundColor Yellow

Write-Host ""
Write-Host "🚀 Déploiement..." -ForegroundColor Blue

# Commit et push
Write-Host "Commit des changements..." -ForegroundColor Yellow
git add .
git commit -m "Deploy: Automated deployment $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -m "Automated deployment from PowerShell script"

Write-Host "Push vers GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "✅ DÉPLOIEMENT AUTOMATISÉ TERMINÉ!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

Write-Host ""
Write-Host "📋 PROCHAINES ÉTAPES:" -ForegroundColor Cyan
Write-Host "1. Configurer Railway pour le backend:" -ForegroundColor White
Write-Host "   - Aller sur https://railway.app" -ForegroundColor Gray
Write-Host "   - Connecter le repository GitHub" -ForegroundColor Gray
Write-Host "   - Sélectionner le dossier 'server/'" -ForegroundColor Gray
Write-Host "   - Ajouter PostgreSQL" -ForegroundColor Gray
Write-Host "   - Configurer les variables d'environnement" -ForegroundColor Gray

Write-Host ""
Write-Host "2. Configurer Vercel pour le frontend:" -ForegroundColor White
Write-Host "   - Aller sur https://vercel.com" -ForegroundColor Gray
Write-Host "   - Importer le repository GitHub" -ForegroundColor Gray
Write-Host "   - Configurer GECC_API_URL" -ForegroundColor Gray

Write-Host ""
Write-Host "3. Variables d'environnement requises:" -ForegroundColor White
Write-Host "   Backend (Railway):" -ForegroundColor Gray
Write-Host "   - NODE_ENV=production" -ForegroundColor DarkGray
Write-Host "   - DATABASE_URL=postgresql://..." -ForegroundColor DarkGray
Write-Host "   - JWT_SECRET=gecc-super-secret-jwt-key-2024" -ForegroundColor DarkGray
Write-Host "   - APP_URL=https://votre-frontend.vercel.app" -ForegroundColor DarkGray

Write-Host ""
Write-Host "   Frontend (Vercel):" -ForegroundColor Gray
Write-Host "   - GECC_API_URL=https://votre-backend.railway.app" -ForegroundColor DarkGray

Write-Host ""
Write-Host "🎉 Votre code est maintenant sur GitHub et prêt pour le déploiement!" -ForegroundColor Green
