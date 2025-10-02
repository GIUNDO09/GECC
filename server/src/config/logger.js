/**
 * ========================================
 * CONFIGURATION LOGGER GECC
 * ========================================
 * Configuration du système de logging avec Pino
 * ========================================
 */

import pino from 'pino';
import { logConfig } from './index.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Créer le dossier logs s'il n'existe pas
const logsDir = join(__dirname, '../../logs');
try {
  mkdirSync(logsDir, { recursive: true });
} catch (error) {
  // Le dossier existe déjà ou erreur de permissions
}

// Configuration du logger
const loggerConfig = {
  level: logConfig.level,
  transport: logConfig.pretty ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
      messageFormat: '[{time}] {level}: {msg}',
      errorLikeObjectKeys: ['err', 'error']
    }
  } : undefined,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
    log: (object) => {
      return {
        ...object,
        timestamp: new Date().toISOString(),
        service: 'gecc-server'
      };
    }
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      headers: {
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type']
      },
      remoteAddress: req.remoteAddress,
      remotePort: req.remotePort
    }),
    res: (res) => ({
      statusCode: res.statusCode,
      headers: res.headers
    }),
    err: (err) => ({
      type: err.constructor.name,
      message: err.message,
      stack: err.stack,
      code: err.code
    })
  }
};

// Créer le logger principal
export const logger = pino(loggerConfig);

// Logger pour les requêtes HTTP
export const httpLogger = pino({
  level: 'info',
  transport: logConfig.pretty ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
      messageFormat: '[{time}] HTTP: {msg}'
    }
  } : undefined
});

// Logger pour les erreurs
export const errorLogger = pino({
  level: 'error',
  transport: logConfig.pretty ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
      messageFormat: '[{time}] ERROR: {msg}'
    }
  } : undefined
});

// Logger pour les audits
export const auditLogger = pino({
  level: 'info',
  transport: logConfig.pretty ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
      messageFormat: '[{time}] AUDIT: {msg}'
    }
  } : undefined
});

// Middleware pour logger les requêtes
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    };

    if (res.statusCode >= 400) {
      errorLogger.error(logData, `${req.method} ${req.url} - ${res.statusCode}`);
    } else {
      httpLogger.info(logData, `${req.method} ${req.url} - ${res.statusCode}`);
    }
  });

  next();
};

// Fonction utilitaire pour logger les erreurs
export const logError = (error, context = {}) => {
  errorLogger.error({
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code
    },
    context,
    timestamp: new Date().toISOString()
  });
};

// Fonction utilitaire pour logger les audits
export const logAudit = (action, userId, details = {}) => {
  auditLogger.info({
    action,
    userId,
    details,
    timestamp: new Date().toISOString(),
    ip: details.ip,
    userAgent: details.userAgent
  });
};

export default logger;
