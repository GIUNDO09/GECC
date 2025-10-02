/**
 * ========================================
 * ROUTES UTILISATEURS GECC
 * ========================================
 * Routes pour la gestion des utilisateurs
 * ========================================
 */

import express from 'express';
import { query } from '../db/connection.js';
import { logger, logAudit } from '../config/logger.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validate, validationSchemas } from '../middleware/validation.js';
import { asyncHandler, createError, createNotFoundError } from '../middleware/errorHandler.js';

const router = express.Router();

// GET /api/users - Liste des utilisateurs (admin uniquement)
router.get('/',
  authenticateToken,
  requireRole(['admin', 'super_admin']),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, role, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    // Filtrer par rôle
    if (role) {
      paramCount++;
      whereClause += ` AND role = $${paramCount}`;
      params.push(role);
    }

    // Recherche par nom ou email
    if (search) {
      paramCount++;
      whereClause += ` AND (full_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Compter le total
    const countResult = await query(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    // Récupérer les utilisateurs
    paramCount++;
    params.push(limit);
    paramCount++;
    params.push(offset);

    const result = await query(
      `SELECT id, email, full_name, role, company_name, job_title, 
              is_active, is_verified, last_login_at, created_at
       FROM users ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramCount - 1} OFFSET $${paramCount}`,
      params
    );

    res.json({
      users: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  })
);

// GET /api/users/:id - Profil d'un utilisateur
router.get('/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Vérifier que l'utilisateur peut voir ce profil
    if (req.user.id !== id && !['admin', 'super_admin'].includes(req.user.role)) {
      throw createError('Accès non autorisé', 403, 'FORBIDDEN');
    }

    const result = await query(
      `SELECT id, email, full_name, role, company_name, job_title, description,
              avatar_url, is_verified, last_login_at, created_at, updated_at
       FROM users WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw createNotFoundError('Utilisateur');
    }

    const user = result.rows[0];

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        companyName: user.company_name,
        jobTitle: user.job_title,
        description: user.description,
        avatarUrl: user.avatar_url,
        isVerified: user.is_verified,
        lastLoginAt: user.last_login_at,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    });
  })
);

// PUT /api/users/:id - Mettre à jour un utilisateur
router.put('/:id',
  authenticateToken,
  validate(validationSchemas.updateProfile),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { fullName, companyName, jobTitle, description } = req.body;

    // Vérifier que l'utilisateur peut modifier ce profil
    if (req.user.id !== id && !['admin', 'super_admin'].includes(req.user.role)) {
      throw createError('Accès non autorisé', 403, 'FORBIDDEN');
    }

    // Construire la requête de mise à jour dynamiquement
    const updates = [];
    const params = [];
    let paramCount = 0;

    if (fullName !== undefined) {
      paramCount++;
      updates.push(`full_name = $${paramCount}`);
      params.push(fullName);
    }

    if (companyName !== undefined) {
      paramCount++;
      updates.push(`company_name = $${paramCount}`);
      params.push(companyName);
    }

    if (jobTitle !== undefined) {
      paramCount++;
      updates.push(`job_title = $${paramCount}`);
      params.push(jobTitle);
    }

    if (description !== undefined) {
      paramCount++;
      updates.push(`description = $${paramCount}`);
      params.push(description);
    }

    if (updates.length === 0) {
      throw createError('Aucune donnée à mettre à jour', 400, 'NO_UPDATES');
    }

    // Ajouter updated_at
    paramCount++;
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    paramCount++;
    params.push(id);

    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount}
       RETURNING id, email, full_name, role, company_name, job_title, description, updated_at`,
      params
    );

    if (result.rows.length === 0) {
      throw createNotFoundError('Utilisateur');
    }

    const user = result.rows[0];

    // Logger la mise à jour
    logAudit('USER_UPDATED', req.user.id, {
      targetUserId: id,
      updates: req.body,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info('Profil utilisateur mis à jour', {
      userId: id,
      updatedBy: req.user.id,
      updates: Object.keys(req.body)
    });

    res.json({
      message: 'Profil mis à jour avec succès',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        companyName: user.company_name,
        jobTitle: user.job_title,
        description: user.description,
        updatedAt: user.updated_at
      }
    });
  })
);

// DELETE /api/users/:id - Supprimer un utilisateur (admin uniquement)
router.delete('/:id',
  authenticateToken,
  requireRole(['admin', 'super_admin']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Empêcher l'auto-suppression
    if (req.user.id === id) {
      throw createError('Vous ne pouvez pas supprimer votre propre compte', 400, 'CANNOT_DELETE_SELF');
    }

    // Vérifier que l'utilisateur existe
    const userResult = await query(
      'SELECT email, role FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      throw createNotFoundError('Utilisateur');
    }

    const user = userResult.rows[0];

    // Empêcher la suppression d'un super admin par un admin normal
    if (user.role === 'super_admin' && req.user.role !== 'super_admin') {
      throw createError('Impossible de supprimer un super administrateur', 403, 'CANNOT_DELETE_SUPER_ADMIN');
    }

    // Supprimer l'utilisateur
    await query('DELETE FROM users WHERE id = $1', [id]);

    // Logger la suppression
    logAudit('USER_DELETED', req.user.id, {
      deletedUserId: id,
      deletedUserEmail: user.email,
      deletedUserRole: user.role,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info('Utilisateur supprimé', {
      deletedUserId: id,
      deletedBy: req.user.id,
      deletedUserEmail: user.email
    });

    res.json({
      message: 'Utilisateur supprimé avec succès'
    });
  })
);

// PUT /api/users/:id/status - Activer/Désactiver un utilisateur (admin uniquement)
router.put('/:id/status',
  authenticateToken,
  requireRole(['admin', 'super_admin']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      throw createError('Le statut doit être un booléen', 400, 'INVALID_STATUS');
    }

    // Empêcher l'auto-désactivation
    if (req.user.id === id && !isActive) {
      throw createError('Vous ne pouvez pas désactiver votre propre compte', 400, 'CANNOT_DEACTIVATE_SELF');
    }

    const result = await query(
      'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING email, role',
      [isActive, id]
    );

    if (result.rows.length === 0) {
      throw createNotFoundError('Utilisateur');
    }

    const user = result.rows[0];

    // Logger le changement de statut
    logAudit('USER_STATUS_CHANGED', req.user.id, {
      targetUserId: id,
      newStatus: isActive,
      targetUserEmail: user.email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info('Statut utilisateur modifié', {
      userId: id,
      newStatus: isActive,
      modifiedBy: req.user.id
    });

    res.json({
      message: `Utilisateur ${isActive ? 'activé' : 'désactivé'} avec succès`
    });
  })
);

export default router;
