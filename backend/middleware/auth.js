/**
 * ========================================
 * MIDDLEWARE D'AUTHENTIFICATION
 * ========================================
 * Middleware pour la vérification JWT
 * et la gestion des permissions
 * ========================================
 */

const jwt = require('jsonwebtoken');
const { getUserById } = require('../models/User');

/**
 * Middleware d'authentification JWT
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Token d\'accès requis',
        code: 'NO_TOKEN'
      });
    }

    // Vérification du token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Récupération de l'utilisateur
    const user = await getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND'
      });
    }

    // Ajout de l'utilisateur à la requête
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expiré',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token invalide',
        code: 'INVALID_TOKEN'
      });
    } else {
      console.error('Erreur d\'authentification:', error);
      return res.status(500).json({
        error: 'Erreur interne du serveur',
        code: 'INTERNAL_ERROR'
      });
    }
  }
};

/**
 * Middleware de vérification des rôles
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentification requise',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Permissions insuffisantes',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
};

/**
 * Middleware de vérification de propriété de projet
 */
const requireProjectAccess = (accessLevel = 'read') => {
  return async (req, res, next) => {
    try {
      const projectId = req.params.projectId || req.body.projectId;
      if (!projectId) {
        return res.status(400).json({
          error: 'ID de projet requis',
          code: 'PROJECT_ID_REQUIRED'
        });
      }

      const { getProjectById, getUserProjectRole } = require('../models/Project');
      const project = await getProjectById(projectId);
      
      if (!project) {
        return res.status(404).json({
          error: 'Projet non trouvé',
          code: 'PROJECT_NOT_FOUND'
        });
      }

      // Vérification de l'accès
      const userRole = await getUserProjectRole(req.user.id, projectId);
      
      if (!userRole) {
        return res.status(403).json({
          error: 'Accès au projet refusé',
          code: 'PROJECT_ACCESS_DENIED'
        });
      }

      // Vérification du niveau d'accès
      const accessLevels = {
        'read': ['viewer', 'member', 'admin', 'owner'],
        'write': ['member', 'admin', 'owner'],
        'admin': ['admin', 'owner']
      };

      if (!accessLevels[accessLevel].includes(userRole)) {
        return res.status(403).json({
          error: `Niveau d'accès insuffisant (${accessLevel})`,
          code: 'INSUFFICIENT_ACCESS_LEVEL',
          required: accessLevel,
          current: userRole
        });
      }

      req.project = project;
      req.userProjectRole = userRole;
      next();
    } catch (error) {
      console.error('Erreur de vérification d\'accès au projet:', error);
      return res.status(500).json({
        error: 'Erreur interne du serveur',
        code: 'INTERNAL_ERROR'
      });
    }
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  requireProjectAccess
};