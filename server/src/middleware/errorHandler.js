/**
 * ========================================
 * MIDDLEWARE GESTION D'ERREURS GECC
 * ========================================
 * Gestion centralisée des erreurs
 * ========================================
 */

import { logger, logError } from '../config/logger.js';

// Classe d'erreur personnalisée
export class AppError extends Error {
  constructor(message, statusCode, code = 'APP_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Middleware de gestion d'erreurs
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Logger l'erreur
  logError(err, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });

  // Erreur de validation Zod
  if (err.name === 'ZodError') {
    const message = 'Données invalides';
    const details = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
      code: e.code
    }));
    
    return res.status(400).json({
      error: message,
      code: 'VALIDATION_ERROR',
      details
    });
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token invalide';
    error = new AppError(message, 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expiré';
    error = new AppError(message, 401, 'TOKEN_EXPIRED');
  }

  // Erreur de base de données PostgreSQL
  if (err.code) {
    switch (err.code) {
      case '23505': // Violation de contrainte unique
        const message = 'Cette ressource existe déjà';
        error = new AppError(message, 409, 'DUPLICATE_RESOURCE');
        break;
      
      case '23503': // Violation de contrainte de clé étrangère
        const fkMessage = 'Référence invalide';
        error = new AppError(fkMessage, 400, 'INVALID_REFERENCE');
        break;
      
      case '23502': // Violation de contrainte NOT NULL
        const nullMessage = 'Champ requis manquant';
        error = new AppError(nullMessage, 400, 'MISSING_REQUIRED_FIELD');
        break;
      
      case '42P01': // Table n'existe pas
        const tableMessage = 'Table non trouvée';
        error = new AppError(tableMessage, 500, 'TABLE_NOT_FOUND');
        break;
      
      case 'ECONNREFUSED': // Connexion à la base de données refusée
        const dbMessage = 'Service temporairement indisponible';
        error = new AppError(dbMessage, 503, 'SERVICE_UNAVAILABLE');
        break;
      
      default:
        const defaultMessage = 'Erreur de base de données';
        error = new AppError(defaultMessage, 500, 'DATABASE_ERROR');
    }
  }

  // Erreur de fichier
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'Fichier trop volumineux';
    error = new AppError(message, 413, 'FILE_TOO_LARGE');
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Type de fichier non autorisé';
    error = new AppError(message, 400, 'INVALID_FILE_TYPE');
  }

  // Erreur de rate limiting
  if (err.status === 429) {
    const message = 'Trop de requêtes, veuillez réessayer plus tard';
    error = new AppError(message, 429, 'RATE_LIMIT_EXCEEDED');
  }

  // Réponse d'erreur
  const response = {
    error: error.message || 'Erreur interne du serveur',
    code: error.code || 'INTERNAL_ERROR'
  };

  // Ajouter des détails en développement
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.details = {
      name: err.name,
      code: err.code,
      statusCode: error.statusCode
    };
  }

  // Ajouter des détails de validation si disponibles
  if (err.details) {
    response.details = err.details;
  }

  res.status(error.statusCode || 500).json(response);
};

// Middleware pour les routes non trouvées
export const notFound = (req, res, next) => {
  const error = new AppError(
    `Route non trouvée - ${req.originalUrl}`,
    404,
    'ROUTE_NOT_FOUND'
  );
  
  next(error);
};

// Middleware pour les méthodes non autorisées
export const methodNotAllowed = (req, res, next) => {
  const error = new AppError(
    `Méthode ${req.method} non autorisée pour ${req.originalUrl}`,
    405,
    'METHOD_NOT_ALLOWED'
  );
  
  next(error);
};

// Wrapper pour les fonctions async
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Fonction utilitaire pour créer des erreurs
export const createError = (message, statusCode = 500, code = 'APP_ERROR') => {
  return new AppError(message, statusCode, code);
};

// Fonction utilitaire pour les erreurs de validation
export const createValidationError = (message, details = []) => {
  const error = new AppError(message, 400, 'VALIDATION_ERROR');
  error.details = details;
  return error;
};

// Fonction utilitaire pour les erreurs d'autorisation
export const createAuthError = (message = 'Accès non autorisé') => {
  return new AppError(message, 401, 'UNAUTHORIZED');
};

// Fonction utilitaire pour les erreurs de permissions
export const createPermissionError = (message = 'Permissions insuffisantes') => {
  return new AppError(message, 403, 'FORBIDDEN');
};

// Fonction utilitaire pour les erreurs de ressource non trouvée
export const createNotFoundError = (resource = 'Ressource') => {
  return new AppError(`${resource} non trouvé(e)`, 404, 'NOT_FOUND');
};

export default {
  AppError,
  errorHandler,
  notFound,
  methodNotAllowed,
  asyncHandler,
  createError,
  createValidationError,
  createAuthError,
  createPermissionError,
  createNotFoundError
};
