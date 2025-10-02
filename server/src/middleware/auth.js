/**
 * ========================================
 * MIDDLEWARE AUTHENTIFICATION GECC
 * ========================================
 * Gestion de l'authentification JWT
 * ========================================
 */

import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/index.js';
import { logger, logAudit } from '../config/logger.js';
import { query } from '../db/connection.js';

// Middleware pour vérifier le token JWT
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Token d\'accès requis',
        code: 'MISSING_TOKEN'
      });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, jwtConfig.secret);
    
    // Récupérer l'utilisateur depuis la base de données
    const result = await query(
      'SELECT id, email, full_name, role, is_active, is_verified FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND'
      });
    }

    const user = result.rows[0];

    // Vérifier que l'utilisateur est actif
    if (!user.is_active) {
      return res.status(401).json({
        error: 'Compte désactivé',
        code: 'ACCOUNT_DISABLED'
      });
    }

    // Ajouter l'utilisateur à la requête
    req.user = user;
    req.token = token;

    // Logger l'accès
    logAudit('API_ACCESS', user.id, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.originalUrl,
      method: req.method
    });

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token invalide',
        code: 'INVALID_TOKEN'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expiré',
        code: 'TOKEN_EXPIRED'
      });
    }

    logger.error('Erreur d\'authentification', error);
    return res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Middleware pour vérifier les rôles
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentification requise',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    if (!roles.includes(req.user.role)) {
      logAudit('UNAUTHORIZED_ACCESS', req.user.id, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl,
        method: req.method,
        userRole: req.user.role,
        requiredRoles: roles
      });

      return res.status(403).json({
        error: 'Accès non autorisé',
        code: 'INSUFFICIENT_PERMISSIONS',
        message: `Rôle requis: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Middleware pour vérifier l'accès aux projets
export const requireProjectAccess = (permission = 'read') => {
  return async (req, res, next) => {
    try {
      const projectId = req.params.projectId || req.body.projectId;
      
      if (!projectId) {
        return res.status(400).json({
          error: 'ID du projet requis',
          code: 'PROJECT_ID_REQUIRED'
        });
      }

      // Vérifier l'accès au projet
      const result = await query(
        `SELECT p.*, 
                CASE 
                  WHEN p.created_by = $2 THEN 'owner'
                  WHEN EXISTS (
                    SELECT 1 FROM project_members pm 
                    WHERE pm.project_id = p.id AND pm.user_id = $2
                  ) THEN 'member'
                  ELSE 'none'
                END as access_level
         FROM projects p 
         WHERE p.id = $1`,
        [projectId, req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'Projet non trouvé',
          code: 'PROJECT_NOT_FOUND'
        });
      }

      const project = result.rows[0];
      const accessLevel = project.access_level;

      // Vérifier les permissions
      if (accessLevel === 'none') {
        return res.status(403).json({
          error: 'Accès au projet non autorisé',
          code: 'PROJECT_ACCESS_DENIED'
        });
      }

      if (permission === 'write' && accessLevel !== 'owner') {
        return res.status(403).json({
          error: 'Permissions d\'écriture requises',
          code: 'WRITE_PERMISSION_REQUIRED'
        });
      }

      // Ajouter le projet à la requête
      req.project = project;
      req.projectAccess = accessLevel;

      next();
    } catch (error) {
      logger.error('Erreur de vérification d\'accès au projet', error);
      return res.status(500).json({
        error: 'Erreur interne du serveur',
        code: 'INTERNAL_ERROR'
      });
    }
  };
};

// Middleware optionnel pour l'authentification
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, jwtConfig.secret);
      const result = await query(
        'SELECT id, email, full_name, role, is_active FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (result.rows.length > 0 && result.rows[0].is_active) {
        req.user = result.rows[0];
      }
    }

    next();
  } catch (error) {
    // Ignorer les erreurs d'authentification pour ce middleware
    next();
  }
};

export default {
  authenticateToken,
  requireRole,
  requireProjectAccess,
  optionalAuth
};
