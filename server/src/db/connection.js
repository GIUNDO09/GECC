/**
 * ========================================
 * CONNEXION BASE DE DONNÉES GECC
 * ========================================
 * Configuration et gestion de la connexion PostgreSQL
 * ========================================
 */

import pkg from 'pg';
import { dbConfig } from '../config/index.js';
import { logger } from '../config/logger.js';

const { Pool } = pkg;

// Pool de connexions PostgreSQL
export const pool = new Pool(dbConfig);

// Gestion des événements du pool
pool.on('connect', (client) => {
  logger.info('Nouvelle connexion à la base de données établie');
});

pool.on('error', (err) => {
  logger.error('Erreur inattendue sur le client inactif du pool', err);
});

pool.on('remove', (client) => {
  logger.info('Client retiré du pool de connexions');
});

// Fonction pour tester la connexion
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    
    logger.info('Connexion à la base de données réussie', {
      timestamp: result.rows[0].now
    });
    
    return true;
  } catch (error) {
    logger.error('Erreur de connexion à la base de données', error);
    return false;
  }
};

// Fonction pour exécuter une requête avec gestion d'erreur
export const query = async (text, params = []) => {
  const start = Date.now();
  
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    logger.debug('Requête exécutée', {
      query: text,
      duration: `${duration}ms`,
      rows: result.rowCount
    });
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    
    logger.error('Erreur lors de l\'exécution de la requête', {
      query: text,
      params,
      duration: `${duration}ms`,
      error: error.message
    });
    
    throw error;
  }
};

// Fonction pour obtenir un client du pool
export const getClient = async () => {
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    logger.error('Erreur lors de l\'obtention d\'un client du pool', error);
    throw error;
  }
};

// Fonction pour fermer le pool de connexions
export const closePool = async () => {
  try {
    await pool.end();
    logger.info('Pool de connexions fermé');
  } catch (error) {
    logger.error('Erreur lors de la fermeture du pool', error);
    throw error;
  }
};

// Fonction pour initialiser la base de données
export const initializeDatabase = async () => {
  try {
    // Tester la connexion
    const connected = await testConnection();
    if (!connected) {
      logger.warn('Base de données non disponible - mode développement sans DB');
      return false;
    }

    // Vérifier si la base de données existe
    const result = await query('SELECT 1');
    
    logger.info('Base de données initialisée avec succès');
    return true;
  } catch (error) {
    logger.warn('Base de données non disponible - mode développement sans DB', error.message);
    return false;
  }
};

// Gestion propre de la fermeture
process.on('SIGINT', async () => {
  logger.info('Fermeture propre du serveur...');
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Fermeture propre du serveur...');
  await closePool();
  process.exit(0);
});

export default pool;
