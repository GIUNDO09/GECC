/**
 * ========================================
 * MODÈLE UTILISATEUR
 * ========================================
 * Gestion des utilisateurs en base de données
 * ========================================
 */

const { db } = require('../database/init');
const { v4: uuidv4 } = require('uuid');

/**
 * Créer un nouvel utilisateur
 */
const createUser = (userData) => {
  return new Promise((resolve, reject) => {
    const id = uuidv4();
    const { name, email, password, role, companyId, avatar } = userData;

    const sql = `
      INSERT INTO users (id, name, email, password, role, companyId, avatar)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [id, name, email, password, role, companyId, avatar], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({
          id,
          name,
          email,
          role,
          companyId,
          avatar,
          createdAt: new Date().toISOString()
        });
      }
    });
  });
};

/**
 * Récupérer un utilisateur par email
 */
const getUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE email = ?';
    
    db.get(sql, [email], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

/**
 * Récupérer un utilisateur par ID
 */
const getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE id = ?';
    
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

/**
 * Récupérer tous les utilisateurs
 */
const getAllUsers = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id, name, email, role, companyId, avatar, createdAt FROM users ORDER BY createdAt DESC';
    
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

/**
 * Mettre à jour un utilisateur
 */
const updateUser = (id, userData) => {
  return new Promise((resolve, reject) => {
    const { name, email, role, companyId, avatar } = userData;
    const updatedAt = new Date().toISOString();

    const sql = `
      UPDATE users 
      SET name = ?, email = ?, role = ?, companyId = ?, avatar = ?, updatedAt = ?
      WHERE id = ?
    `;

    db.run(sql, [name, email, role, companyId, avatar, updatedAt, id], function(err) {
      if (err) {
        reject(err);
      } else if (this.changes === 0) {
        reject(new Error('Utilisateur non trouvé'));
      } else {
        resolve({
          id,
          name,
          email,
          role,
          companyId,
          avatar,
          updatedAt
        });
      }
    });
  });
};

/**
 * Changer le mot de passe d'un utilisateur
 */
const updateUserPassword = (id, hashedPassword) => {
  return new Promise((resolve, reject) => {
    const updatedAt = new Date().toISOString();

    const sql = 'UPDATE users SET password = ?, updatedAt = ? WHERE id = ?';

    db.run(sql, [hashedPassword, updatedAt, id], function(err) {
      if (err) {
        reject(err);
      } else if (this.changes === 0) {
        reject(new Error('Utilisateur non trouvé'));
      } else {
        resolve({ id, updatedAt });
      }
    });
  });
};

/**
 * Supprimer un utilisateur
 */
const deleteUser = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM users WHERE id = ?';

    db.run(sql, [id], function(err) {
      if (err) {
        reject(err);
      } else if (this.changes === 0) {
        reject(new Error('Utilisateur non trouvé'));
      } else {
        resolve({ id, deleted: true });
      }
    });
  });
};

/**
 * Récupérer les utilisateurs d'une entreprise
 */
const getUsersByCompany = (companyId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT id, name, email, role, avatar, createdAt 
      FROM users 
      WHERE companyId = ? 
      ORDER BY createdAt DESC
    `;
    
    db.all(sql, [companyId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

/**
 * Rechercher des utilisateurs par nom ou email
 */
const searchUsers = (query) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT id, name, email, role, avatar, createdAt 
      FROM users 
      WHERE name LIKE ? OR email LIKE ?
      ORDER BY name ASC
      LIMIT 20
    `;
    
    const searchTerm = `%${query}%`;
    
    db.all(sql, [searchTerm, searchTerm], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  getAllUsers,
  updateUser,
  updateUserPassword,
  deleteUser,
  getUsersByCompany,
  searchUsers
};

