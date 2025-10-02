/**
 * ========================================
 * MODÈLE PROJET
 * ========================================
 * Gestion des projets en base de données
 * ========================================
 */

const { db } = require('../database/init');
const { v4: uuidv4 } = require('uuid');

/**
 * Créer un nouveau projet
 */
const createProject = (projectData) => {
  return new Promise((resolve, reject) => {
    const id = uuidv4();
    const {
      code,
      name,
      description,
      address,
      type,
      surface,
      owner,
      status = 'active',
      progress = 0,
      ownerId
    } = projectData;

    const sql = `
      INSERT INTO projects (id, code, name, description, address, type, surface, owner, status, progress, ownerId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [id, code, name, description, address, type, surface, owner, status, progress, ownerId], function(err) {
      if (err) {
        reject(err);
      } else {
        // Ajouter le propriétaire comme membre du projet
        addProjectMember(id, ownerId, 'owner')
          .then(() => {
            resolve({
              id,
              code,
              name,
              description,
              address,
              type,
              surface,
              owner,
              status,
              progress,
              ownerId,
              createdAt: new Date().toISOString()
            });
          })
          .catch(reject);
      }
    });
  });
};

/**
 * Récupérer un projet par ID
 */
const getProjectById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM projects WHERE id = ?';
    
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
 * Récupérer tous les projets d'un utilisateur
 */
const getProjectsByUser = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT DISTINCT p.*, pm.role as userRole
      FROM projects p
      JOIN project_members pm ON p.id = pm.projectId
      WHERE pm.userId = ?
      ORDER BY p.updatedAt DESC
    `;
    
    db.all(sql, [userId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

/**
 * Récupérer tous les projets
 */
const getAllProjects = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM projects ORDER BY updatedAt DESC';
    
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
 * Mettre à jour un projet
 */
const updateProject = (id, projectData) => {
  return new Promise((resolve, reject) => {
    const {
      name,
      description,
      address,
      type,
      surface,
      owner,
      status,
      progress
    } = projectData;
    const updatedAt = new Date().toISOString();

    const sql = `
      UPDATE projects 
      SET name = ?, description = ?, address = ?, type = ?, surface = ?, 
          owner = ?, status = ?, progress = ?, updatedAt = ?
      WHERE id = ?
    `;

    db.run(sql, [name, description, address, type, surface, owner, status, progress, updatedAt, id], function(err) {
      if (err) {
        reject(err);
      } else if (this.changes === 0) {
        reject(new Error('Projet non trouvé'));
      } else {
        resolve({
          id,
          name,
          description,
          address,
          type,
          surface,
          owner,
          status,
          progress,
          updatedAt
        });
      }
    });
  });
};

/**
 * Supprimer un projet
 */
const deleteProject = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM projects WHERE id = ?';

    db.run(sql, [id], function(err) {
      if (err) {
        reject(err);
      } else if (this.changes === 0) {
        reject(new Error('Projet non trouvé'));
      } else {
        resolve({ id, deleted: true });
      }
    });
  });
};

/**
 * Ajouter un membre à un projet
 */
const addProjectMember = (projectId, userId, role) => {
  return new Promise((resolve, reject) => {
    const id = uuidv4();

    const sql = `
      INSERT INTO project_members (id, projectId, userId, role)
      VALUES (?, ?, ?, ?)
    `;

    db.run(sql, [id, projectId, userId, role], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({
          id,
          projectId,
          userId,
          role,
          joinedAt: new Date().toISOString()
        });
      }
    });
  });
};

/**
 * Récupérer les membres d'un projet
 */
const getProjectMembers = (projectId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT pm.*, u.name, u.email, u.role as userRole, u.avatar
      FROM project_members pm
      JOIN users u ON pm.userId = u.id
      WHERE pm.projectId = ?
      ORDER BY pm.joinedAt ASC
    `;
    
    db.all(sql, [projectId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

/**
 * Récupérer le rôle d'un utilisateur dans un projet
 */
const getUserProjectRole = (userId, projectId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT role FROM project_members WHERE userId = ? AND projectId = ?';
    
    db.get(sql, [userId, projectId], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row ? row.role : null);
      }
    });
  });
};

/**
 * Mettre à jour le rôle d'un membre
 */
const updateProjectMemberRole = (projectId, userId, newRole) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE project_members SET role = ? WHERE projectId = ? AND userId = ?';

    db.run(sql, [newRole, projectId, userId], function(err) {
      if (err) {
        reject(err);
      } else if (this.changes === 0) {
        reject(new Error('Membre non trouvé'));
      } else {
        resolve({
          projectId,
          userId,
          role: newRole,
          updated: true
        });
      }
    });
  });
};

/**
 * Supprimer un membre d'un projet
 */
const removeProjectMember = (projectId, userId) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM project_members WHERE projectId = ? AND userId = ?';

    db.run(sql, [projectId, userId], function(err) {
      if (err) {
        reject(err);
      } else if (this.changes === 0) {
        reject(new Error('Membre non trouvé'));
      } else {
        resolve({
          projectId,
          userId,
          removed: true
        });
      }
    });
  });
};

/**
 * Vérifier si un code de projet existe
 */
const isProjectCodeExists = (code, excludeId = null) => {
  return new Promise((resolve, reject) => {
    let sql = 'SELECT COUNT(*) as count FROM projects WHERE code = ?';
    let params = [code];

    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }

    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row.count > 0);
      }
    });
  });
};

module.exports = {
  createProject,
  getProjectById,
  getProjectsByUser,
  getAllProjects,
  updateProject,
  deleteProject,
  addProjectMember,
  getProjectMembers,
  getUserProjectRole,
  updateProjectMemberRole,
  removeProjectMember,
  isProjectCodeExists
};

