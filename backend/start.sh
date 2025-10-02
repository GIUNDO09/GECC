#!/bin/bash

# ========================================
# SCRIPT DE DÉMARRAGE RAPIDE GECC BACKEND
# ========================================

echo "🚀 Démarrage du serveur GECC Backend..."

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez installer Node.js 16+"
    exit 1
fi

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé. Veuillez installer npm"
    exit 1
fi

# Vérifier si le fichier .env existe
if [ ! -f .env ]; then
    echo "⚠️  Fichier .env non trouvé. Copie depuis env.example..."
    cp env.example .env
    echo "✅ Fichier .env créé. Veuillez le modifier avec vos paramètres."
fi

# Installer les dépendances si node_modules n'existe pas
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Initialiser la base de données si elle n'existe pas
if [ ! -f "database/gecc.db" ]; then
    echo "🗄️  Initialisation de la base de données..."
    npm run init-db
fi

# Créer le dossier uploads s'il n'existe pas
if [ ! -d "uploads" ]; then
    echo "📁 Création du dossier uploads..."
    mkdir -p uploads
fi

# Démarrer le serveur
echo "🌟 Démarrage du serveur en mode développement..."
echo "📍 URL: http://localhost:3000"
echo "📊 Health Check: http://localhost:3000/health"
echo "🔗 API Docs: Voir README.md"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter le serveur"
echo ""

npm run dev


