/**
 * ========================================
 * MIDDLEWARE CORS GECC
 * ========================================
 * Configuration CORS stricte pour la sécurité
 * ========================================
 */

import cors from 'cors';
import { corsConfig } from '../config/index.js';
import { logger } from '../config/logger.js';

// Configuration CORS stricte
const corsOptions = {
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origin (mobile apps, Postman, etc.) en développement
    if (!origin && process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    // Vérifier si l'origin est autorisé
    if (corsConfig.origin === origin) {
      return callback(null, true);
    }

    // En production, rejeter les requêtes non autorisées
    logger.warn('Tentative de connexion CORS non autorisée', {
      origin,
      allowedOrigin: corsConfig.origin
    });

    callback(new Error('Non autorisé par la politique CORS'));
  },
  credentials: corsConfig.credentials,
  methods: corsConfig.methods,
  allowedHeaders: corsConfig.allowedHeaders,
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400 // 24 heures
};

// Middleware CORS
export const corsMiddleware = cors(corsOptions);

// Middleware pour logger les requêtes CORS
export const corsLogger = (req, res, next) => {
  const origin = req.get('Origin');
  
  if (origin) {
    logger.debug('Requête CORS', {
      origin,
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent')
    });
  }
  
  next();
};

// Middleware pour gérer les erreurs CORS
export const corsErrorHandler = (err, req, res, next) => {
  if (err.message === 'Non autorisé par la politique CORS') {
    return res.status(403).json({
      error: 'Accès non autorisé',
      code: 'CORS_ERROR',
      message: 'Cette origine n\'est pas autorisée à accéder à cette API'
    });
  }
  
  next(err);
};

export default corsMiddleware;
