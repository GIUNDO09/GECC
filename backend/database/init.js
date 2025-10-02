/**
 * ========================================
 * INITIALISATION BASE DE DONNÉES SQLITE
 * ========================================
 * Configuration et création des tables
 * ========================================
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Chemin vers la base de données
const dbPath = process.env.DB_PATH || './database/gecc.db';
const dbDir = path.dirname(dbPath);

// Création du dossier database s'il n'existe pas
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Connexion à la base de données
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err);
    process.exit(1);
  }
  console.log('✅ Connexion à la base de données SQLite établie');
});

// Activation des clés étrangères
db.run('PRAGMA foreign_keys = ON');

/**
 * Initialisation des tables
 */
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Table des utilisateurs
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('architect', 'bct', 'bet', 'contractor', 'admin')),
          companyId TEXT,
          avatar TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Table des entreprises
      db.run(`
        CREATE TABLE IF NOT EXISTS companies (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          logo TEXT,
          address TEXT,
          website TEXT,
          phone TEXT,
          vatNumber TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Table des projets
      db.run(`
        CREATE TABLE IF NOT EXISTS projects (
          id TEXT PRIMARY KEY,
          code TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          address TEXT,
          type TEXT,
          surface INTEGER,
          owner TEXT,
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'on_hold')),
          progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
          ownerId TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (ownerId) REFERENCES users(id)
        )
      `);

      // Table des membres de projet
      db.run(`
        CREATE TABLE IF NOT EXISTS project_members (
          id TEXT PRIMARY KEY,
          projectId TEXT NOT NULL,
          userId TEXT NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('viewer', 'member', 'admin', 'owner')),
          joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE(projectId, userId)
        )
      `);

      // Table des documents
      db.run(`
        CREATE TABLE IF NOT EXISTS documents (
          id TEXT PRIMARY KEY,
          projectId TEXT NOT NULL,
          title TEXT NOT NULL,
          type TEXT NOT NULL,
          status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'observations', 'revised', 'approved', 'rejected')),
          filePath TEXT,
          fileSize INTEGER,
          mimeType TEXT,
          externalUrl TEXT,
          submittedBy TEXT NOT NULL,
          submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
          FOREIGN KEY (submittedBy) REFERENCES users(id)
        )
      `);

      // Table des destinataires de documents
      db.run(`
        CREATE TABLE IF NOT EXISTS document_recipients (
          id TEXT PRIMARY KEY,
          documentId TEXT NOT NULL,
          role TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE
        )
      `);

      // Table de l'historique des documents
      db.run(`
        CREATE TABLE IF NOT EXISTS document_history (
          id TEXT PRIMARY KEY,
          documentId TEXT NOT NULL,
          action TEXT NOT NULL,
          performedBy TEXT NOT NULL,
          performedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          comment TEXT,
          FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE,
          FOREIGN KEY (performedBy) REFERENCES users(id)
        )
      `);

      // Table des tâches
      db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          projectId TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'in_review', 'completed')),
          priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
          assignedTo TEXT,
          createdBy TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
          FOREIGN KEY (assignedTo) REFERENCES users(id),
          FOREIGN KEY (createdBy) REFERENCES users(id)
        )
      `);

      // Table des commentaires
      db.run(`
        CREATE TABLE IF NOT EXISTS comments (
          id TEXT PRIMARY KEY,
          projectId TEXT NOT NULL,
          authorId TEXT NOT NULL,
          content TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
          FOREIGN KEY (authorId) REFERENCES users(id)
        )
      `);

      // Table des notifications
      db.run(`
        CREATE TABLE IF NOT EXISTS notifications (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          type TEXT NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          isRead BOOLEAN DEFAULT FALSE,
          relatedId TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Table des invitations
      db.run(`
        CREATE TABLE IF NOT EXISTS invitations (
          id TEXT PRIMARY KEY,
          projectId TEXT NOT NULL,
          email TEXT NOT NULL,
          role TEXT NOT NULL,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'refused', 'cancelled')),
          invitedBy TEXT NOT NULL,
          invitedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          respondedAt DATETIME,
          FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
          FOREIGN KEY (invitedBy) REFERENCES users(id)
        )
      `);

      // Table des entrées de journal
      db.run(`
        CREATE TABLE IF NOT EXISTS journal_entries (
          id TEXT PRIMARY KEY,
          projectId TEXT NOT NULL,
          type TEXT NOT NULL,
          action TEXT NOT NULL,
          performedBy TEXT NOT NULL,
          performedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          details TEXT,
          relatedId TEXT,
          FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
          FOREIGN KEY (performedBy) REFERENCES users(id)
        )
      `);

      // Création des index pour améliorer les performances
      db.run('CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(ownerId)');
      db.run('CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(projectId)');
      db.run('CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(projectId)');
      db.run('CREATE INDEX IF NOT EXISTS idx_comments_project ON comments(projectId)');
      db.run('CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(userId)');
      db.run('CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(projectId)');
      db.run('CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(userId)');

      console.log('✅ Tables de base de données créées avec succès');
      resolve();
    });
  });
};

/**
 * Fermeture de la base de données
 */
const closeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        console.error('Erreur lors de la fermeture de la base de données:', err);
        reject(err);
      } else {
        console.log('✅ Connexion à la base de données fermée');
        resolve();
      }
    });
  });
};

module.exports = {
  db,
  initDatabase,
  closeDatabase
};