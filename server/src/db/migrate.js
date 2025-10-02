/**
 * ========================================
 * SYSTÈME DE MIGRATIONS GECC
 * ========================================
 * Script pour exécuter les migrations de base de données
 * ========================================
 */

import { query, testConnection } from './connection.js';
import { logger } from '../config/logger.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Créer la table des migrations si elle n'existe pas
const createMigrationsTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  await query(createTableQuery);
  logger.info('Table des migrations créée/vérifiée');
};

// Obtenir la liste des migrations déjà exécutées
const getExecutedMigrations = async () => {
  const result = await query('SELECT filename FROM migrations ORDER BY executed_at');
  return result.rows.map(row => row.filename);
};

// Marquer une migration comme exécutée
const markMigrationAsExecuted = async (filename) => {
  await query('INSERT INTO migrations (filename) VALUES ($1)', [filename]);
  logger.info(`Migration ${filename} marquée comme exécutée`);
};

// Exécuter une migration
const executeMigration = async (filename) => {
  try {
    const migrationPath = join(__dirname, '../migrations', filename);
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    logger.info(`Exécution de la migration: ${filename}`);
    
    // Exécuter la migration
    await query(migrationSQL);
    
    // Marquer comme exécutée
    await markMigrationAsExecuted(filename);
    
    logger.info(`Migration ${filename} exécutée avec succès`);
  } catch (error) {
    logger.error(`Erreur lors de l'exécution de la migration ${filename}`, error);
    throw error;
  }
};

// Fonction principale de migration
const runMigrations = async () => {
  try {
    logger.info('🚀 Début des migrations...');
    
    // Tester la connexion
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Impossible de se connecter à la base de données');
    }
    
    // Créer la table des migrations
    await createMigrationsTable();
    
    // Obtenir les migrations déjà exécutées
    const executedMigrations = await getExecutedMigrations();
    logger.info(`Migrations déjà exécutées: ${executedMigrations.length}`);
    
    // Liste des migrations à exécuter (dans l'ordre)
    const migrations = [
      '001_create_users_table.sql',
      '002_create_projects_table.sql',
      '003_create_documents_table.sql',
      '004_create_tasks_table.sql',
      '005_create_comments_table.sql',
      '006_create_notifications_table.sql',
      '007_create_invites_table.sql',
      '008_create_audit_logs_table.sql',
      '009_create_project_members_table.sql',
      '010_create_user_settings_table.sql'
    ];
    
    let executedCount = 0;
    
    for (const migration of migrations) {
      if (!executedMigrations.includes(migration)) {
        await executeMigration(migration);
        executedCount++;
      } else {
        logger.info(`Migration ${migration} déjà exécutée, ignorée`);
      }
    }
    
    if (executedCount === 0) {
      logger.info('✅ Toutes les migrations sont déjà à jour');
    } else {
      logger.info(`✅ ${executedCount} migration(s) exécutée(s) avec succès`);
    }
    
  } catch (error) {
    logger.error('❌ Erreur lors des migrations', error);
    process.exit(1);
  }
};

// Exécuter les migrations si ce script est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => {
      logger.info('🎉 Migrations terminées avec succès');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('💥 Échec des migrations', error);
      process.exit(1);
    });
}

export { runMigrations, executeMigration, createMigrationsTable };
