/**
 * ========================================
 * APPLICATION PRINCIPALE GECC SERVER
 * ========================================
 * Point d'entrée de l'application Express
 * ========================================
 */

import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

// Configuration et middleware
import config from './config/index.js';
import { logger, requestLogger } from './config/logger.js';
import { corsMiddleware, corsLogger, corsErrorHandler } from './middleware/cors.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { initializeDatabase } from './db/connection.js';

// Routes
import healthRoutes from './routes/health.js';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import projectsRoutes from './routes/projects.js';
import invitesRoutes from './routes/invites.js';
import settingsRoutes from './routes/settings.js';
import filesRoutes from './routes/files.js';

const app = express();

// ========================================
// MIDDLEWARE DE SÉCURITÉ
// ========================================

// Helmet pour les headers de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS
app.use(corsMiddleware);
app.use(corsLogger);

// Rate limiting général
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: {
    error: 'Trop de requêtes, veuillez réessayer plus tard.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting strict pour l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives par fenêtre
  message: {
    error: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// ========================================
// MIDDLEWARE GÉNÉRAL
// ========================================

// Compression
app.use(compression());

// Parser pour les cookies
app.use(cookieParser(config.COOKIE_SECRET));

// Parser pour JSON
app.use(express.json({ limit: '10mb' }));

// Parser pour les données de formulaire
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging des requêtes
if (config.NODE_ENV === 'development') {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
} else {
  app.use(requestLogger);
}

// ========================================
// ROUTES
// ========================================

// Routes de santé
app.use('/', healthRoutes);

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api', invitesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api', filesRoutes);

// Route de documentation API (basique)
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'GECC API Documentation',
    version: '1.0.0',
    description: 'API Backend pour GECC - Gestion Électronique des Contrats de Construction',
    endpoints: {
      health: {
        'GET /': 'Vérifier que le serveur fonctionne',
        'GET /health': 'Vérifier la santé complète du système',
        'GET /info': 'Informations sur l\'API'
      },
      auth: {
        'POST /signup': 'Inscription d\'un nouvel utilisateur',
        'POST /login': 'Connexion d\'un utilisateur',
        'POST /refresh': 'Renouveler le token d\'accès',
        'POST /logout': 'Déconnexion',
        'GET /me': 'Profil de l\'utilisateur connecté',
        'PATCH /me': 'Mettre à jour le profil utilisateur',
        'POST /change-password': 'Changer le mot de passe'
      },
      users: {
        'GET /': 'Liste des utilisateurs (admin)',
        'GET /:id': 'Profil d\'un utilisateur',
        'PUT /:id': 'Mettre à jour un utilisateur',
        'DELETE /:id': 'Supprimer un utilisateur (admin)',
        'PUT /:id/status': 'Activer/Désactiver un utilisateur (admin)'
      },
      projects: {
        'GET /': 'Liste de mes projets (membre ou owner)',
        'POST /': 'Créer un nouveau projet',
        'GET /:id': 'Détails d\'un projet',
        'PATCH /:id': 'Mettre à jour un projet (owner/admin)',
        'GET /:id/members': 'Liste des membres du projet',
        'POST /:id/members': 'Ajouter un membre au projet (owner/admin)',
        'DELETE /:id/members/:userId': 'Supprimer un membre du projet (owner/admin)'
      },
      invites: {
        'POST /projects/:id/invites': 'Créer une invitation (owner/admin)',
        'GET /projects/:id/invites': 'Liste des invitations du projet (owner/admin)',
        'GET /invites/:token': 'Détails d\'une invitation (public)',
        'POST /invites/:token/accept': 'Accepter une invitation',
        'POST /invites/:id/cancel': 'Annuler une invitation (owner/admin)'
      },
      settings: {
        'GET /': 'Récupérer les paramètres utilisateur',
        'PUT /': 'Mettre à jour les paramètres utilisateur',
        'DELETE /:key': 'Supprimer un paramètre utilisateur',
        'GET /public/:userId': 'Récupérer les paramètres publics d\'un utilisateur',
        'POST /reset': 'Réinitialiser les paramètres par défaut'
      },
      files: {
        'POST /projects/:id/files': 'Uploader un fichier dans un projet',
        'GET /projects/:id/files': 'Lister les fichiers d\'un projet',
        'GET /files/:id/download': 'Télécharger un fichier',
        'GET /files/:id/info': 'Informations sur un fichier',
        'DELETE /files/:id': 'Supprimer un fichier',
        'POST /files/upload-url': 'Générer une URL d\'upload presignée'
      }
    },
    authentication: {
      type: 'Bearer Token',
      description: 'Inclure le token JWT dans l\'header Authorization: Bearer <token>'
    },
    examples: {
      login: {
        url: 'POST /api/auth/login',
        body: {
          email: 'user@example.com',
          password: 'password123'
        }
      },
      signup: {
        url: 'POST /api/auth/signup',
        body: {
          email: 'user@example.com',
          password: 'password123',
          fullName: 'John Doe',
          role: 'architect',
          companyName: 'Mon Entreprise',
          jobTitle: 'Architecte'
        }
      },
      updateProfile: {
        url: 'PATCH /api/auth/me',
        headers: {
          'Authorization': 'Bearer <accessToken>'
        },
        body: {
          fullName: 'John Doe Updated',
          companyName: 'Nouvelle Entreprise',
          jobTitle: 'Senior Architecte',
          avatarUrl: 'https://example.com/avatar.jpg'
        }
      }
    }
  });
});

// ========================================
// GESTION D'ERREURS
// ========================================

// Gestion des erreurs CORS
app.use(corsErrorHandler);

// Route non trouvée
app.use(notFound);

// Gestionnaire d'erreurs global
app.use(errorHandler);

// ========================================
// INITIALISATION DU SERVEUR
// ========================================

const startServer = async () => {
  try {
    // Initialiser la base de données
    logger.info('🔧 Initialisation de la base de données...');
    await initializeDatabase();
    logger.info('✅ Base de données initialisée');

    // Démarrer le serveur
    const server = app.listen(config.PORT, () => {
      logger.info(`🚀 Serveur GECC démarré sur le port ${config.PORT}`);
      logger.info(`📊 Environnement: ${config.NODE_ENV}`);
      logger.info(`🌐 URL: http://localhost:${config.PORT}`);
      logger.info(`📚 Documentation: http://localhost:${config.PORT}/api/docs`);
      logger.info(`❤️  Health Check: http://localhost:${config.PORT}/health`);
    });

    // Gestion propre de l'arrêt
    const gracefulShutdown = (signal) => {
      logger.info(`📴 Signal ${signal} reçu, arrêt du serveur...`);
      
      server.close(() => {
        logger.info('✅ Serveur fermé proprement');
        process.exit(0);
      });

      // Forcer l'arrêt après 10 secondes
      setTimeout(() => {
        logger.error('⚠️ Arrêt forcé du serveur');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('💥 Erreur lors du démarrage du serveur', error);
    process.exit(1);
  }
};

// Démarrer le serveur
startServer();

export default app;
