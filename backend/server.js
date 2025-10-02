/**
 * ========================================
 * SERVEUR GECC - API BACKEND
 * ========================================
 * Serveur Node.js/Express pour l'API GECC
 * - Authentification JWT sécurisée
 * - Persistance SQLite
 * - Routes pour tous les modules
 * - Middleware de sécurité
 * ========================================
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import des routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const documentRoutes = require('./routes/documents');
const taskRoutes = require('./routes/tasks');
const commentRoutes = require('./routes/comments');
const notificationRoutes = require('./routes/notifications');

// Import des middlewares
const { authenticateToken } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// MIDDLEWARE DE SÉCURITÉ
// ========================================

// Helmet pour les headers sécurisés
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limite chaque IP à 100 requêtes par windowMs
  message: {
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
  }
});
app.use(limiter);

// ========================================
// MIDDLEWARE GÉNÉRAUX
// ========================================

// Parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging des requêtes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ========================================
// ROUTES PUBLIQUES
// ========================================

// Route de santé
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Routes d'authentification (publiques)
app.use('/api/auth', authRoutes);

// ========================================
// ROUTES PROTÉGÉES
// ========================================

// Middleware d'authentification pour toutes les routes API
app.use('/api', authenticateToken);

// Routes des modules
app.use('/api/projects', projectRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);

// ========================================
// GESTION DES ERREURS
// ========================================

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method
  });
});

// Middleware de gestion d'erreurs
app.use(errorHandler);

// ========================================
// DÉMARRAGE DU SERVEUR
// ========================================

app.listen(PORT, () => {
  console.log(`
🚀 Serveur GECC démarré !
📍 Port: ${PORT}
🌍 Environnement: ${process.env.NODE_ENV || 'development'}
🔗 URL: http://localhost:${PORT}
📊 Health Check: http://localhost:${PORT}/health
  `);
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (err) => {
  console.error('Erreur non capturée:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesse rejetée non gérée:', reason);
  process.exit(1);
});

module.exports = app;