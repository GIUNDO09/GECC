/**
 * ========================================
 * SERVEUR FRONTEND GECC
 * ========================================
 * Serveur simple pour servir les fichiers HTML
 * ========================================
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// Servir les fichiers statiques
app.use(express.static('.'));

// Route pour la page d'accueil
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route pour la page de test API
app.get('/test-api', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-frontend-api.html'));
});

// Route pour la page de test des fichiers
app.get('/test-files', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-files-api.html'));
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`
🌐 Serveur Frontend GECC démarré !
📍 Port: ${PORT}
🔗 URL: http://localhost:${PORT}
📄 Pages disponibles:
   - http://localhost:${PORT}/ (Accueil)
   - http://localhost:${PORT}/test-api (Test API)
   - http://localhost:${PORT}/test-files (Test Fichiers)
  `);
});
