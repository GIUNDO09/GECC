/**
 * ========================================
 * ROUTES HEALTH CHECK GECC
 * ========================================
 * Routes pour vérifier l'état du serveur
 * ========================================
 */

import express from 'express';
import { testConnection } from '../db/connection.js';
import { logger } from '../config/logger.js';

const router = express.Router();

// Route de base pour vérifier que le serveur fonctionne
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'GECC Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Route pour vérifier la santé complète du système
router.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: '1.0.0',
      services: {}
    };

    // Vérifier la base de données
    try {
      const dbConnected = await testConnection();
      health.services.database = {
        status: dbConnected ? 'OK' : 'WARNING',
        message: dbConnected ? 'Connected' : 'Database not available (dev mode)'
      };
    } catch (error) {
      health.services.database = {
        status: 'WARNING',
        message: 'Database not available (dev mode)'
      };
    }

    // Vérifier la mémoire
    const memUsage = process.memoryUsage();
    health.services.memory = {
      status: 'OK',
      used: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB'
    };

    // Déterminer le statut global
    const hasErrors = Object.values(health.services).some(service => service.status === 'ERROR');
    const hasWarnings = Object.values(health.services).some(service => service.status === 'WARNING');
    health.status = hasErrors ? 'ERROR' : (hasWarnings ? 'DEGRADED' : 'OK');

    const statusCode = hasErrors ? 503 : 200;
    res.status(statusCode).json(health);

  } catch (error) {
    logger.error('Erreur lors du health check', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Route pour obtenir des informations sur l'API
router.get('/info', (req, res) => {
  res.json({
    name: 'GECC API',
    description: 'API Backend pour GECC - Gestion Électronique des Contrats de Construction',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      projects: '/api/projects',
      documents: '/api/documents',
      tasks: '/api/tasks',
      comments: '/api/comments',
      notifications: '/api/notifications'
    },
    documentation: '/api/docs',
    support: 'support@gecc.com'
  });
});

export default router;
