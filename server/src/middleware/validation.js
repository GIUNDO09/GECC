/**
 * ========================================
 * MIDDLEWARE VALIDATION GECC
 * ========================================
 * Validation des données avec Zod
 * ========================================
 */

import { z } from 'zod';
import { logger } from '../config/logger.js';

// Middleware de validation générique
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      // Valider les données selon le schéma
      const validatedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });

      // Remplacer les données par les données validées
      req.body = validatedData.body || req.body;
      req.query = validatedData.query || req.query;
      req.params = validatedData.params || req.params;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        logger.warn('Erreur de validation', {
          errors,
          body: req.body,
          query: req.query,
          params: req.params
        });

        return res.status(400).json({
          error: 'Données invalides',
          code: 'VALIDATION_ERROR',
          details: errors
        });
      }

      logger.error('Erreur de validation inattendue', error);
      return res.status(500).json({
        error: 'Erreur interne du serveur',
        code: 'INTERNAL_ERROR'
      });
    }
  };
};

// Schémas de validation communs
export const commonSchemas = {
  // UUID
  uuid: z.string().uuid('Format UUID invalide'),
  
  // Email
  email: z.string().email('Format email invalide'),
  
  // Mot de passe
  password: z.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .max(128, 'Le mot de passe ne peut pas dépasser 128 caractères'),
  
  // Nom complet
  fullName: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(255, 'Le nom ne peut pas dépasser 255 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes'),
  
  // Code de projet
  projectCode: z.string()
    .regex(/^[A-Z]{3,4}-[0-9]{4}-[0-9]{3}$/, 'Format de code projet invalide (ex: PROJ-2024-001)'),
  
  // Rôles utilisateur
  userRole: z.enum(['admin', 'super_admin', 'architect', 'engineer', 'contractor', 'bet', 'client']),
  
  // Statuts de projet
  projectStatus: z.enum(['draft', 'active', 'on_hold', 'completed', 'cancelled']),
  
  // Types de projet
  projectType: z.enum(['residentiel', 'commercial', 'industriel', 'tertiaire', 'equipement', 'renovation', 'autre']),
  
  // Pagination
  pagination: z.object({
    page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
    limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional()
  })
};

// Schémas de validation spécifiques
export const validationSchemas = {
  // Authentification
  login: z.object({
    body: z.object({
      email: commonSchemas.email,
      password: z.string().min(1, 'Le mot de passe est requis')
    })
  }),

  register: z.object({
    body: z.object({
      email: commonSchemas.email,
      password: commonSchemas.password,
      fullName: commonSchemas.fullName,
      role: commonSchemas.userRole,
      companyName: z.string().max(255).optional(),
      jobTitle: z.string().max(255).optional()
    })
  }),

  // Utilisateurs
  updateProfile: z.object({
    body: z.object({
      fullName: commonSchemas.fullName.optional(),
      companyName: z.string().max(255).optional(),
      jobTitle: z.string().max(255).optional(),
      description: z.string().max(1000).optional(),
      avatarUrl: z.string().url('URL d\'avatar invalide').optional()
    })
  }),

  changePassword: z.object({
    body: z.object({
      currentPassword: z.string().min(1, 'Le mot de passe actuel est requis'),
      newPassword: commonSchemas.password
    })
  }),

  // Projets
  createProject: z.object({
    body: z.object({
      code: commonSchemas.projectCode,
      name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères').max(255),
      description: z.string().max(1000).optional(),
      address: z.string().min(5, 'L\'adresse doit contenir au moins 5 caractères'),
      type: commonSchemas.projectType,
      surfaceArea: z.number().positive().optional(),
      ownerName: z.string().min(2, 'Le nom du maître d\'ouvrage est requis').max(255),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      budget: z.number().nonnegative().optional()
    })
  }),

  updateProject: z.object({
    params: z.object({
      projectId: commonSchemas.uuid
    }),
    body: z.object({
      name: z.string().min(3).max(255).optional(),
      description: z.string().max(1000).optional(),
      address: z.string().min(5).optional(),
      type: commonSchemas.projectType.optional(),
      surfaceArea: z.number().positive().optional(),
      ownerName: z.string().min(2).max(255).optional(),
      status: commonSchemas.projectStatus.optional(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      budget: z.number().nonnegative().optional()
    })
  }),

  // Documents
  uploadDocument: z.object({
    params: z.object({
      projectId: commonSchemas.uuid
    }),
    body: z.object({
      name: z.string().min(1, 'Le nom du document est requis').max(255),
      description: z.string().max(1000).optional(),
      type: z.string().min(1, 'Le type de document est requis').max(100)
    })
  }),

  // Tâches
  createTask: z.object({
    params: z.object({
      projectId: commonSchemas.uuid
    }),
    body: z.object({
      title: z.string().min(1, 'Le titre est requis').max(255),
      description: z.string().max(1000).optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      assignedTo: commonSchemas.uuid.optional(),
      dueDate: z.string().datetime().optional()
    })
  }),

  // Commentaires
  createComment: z.object({
    body: z.object({
      content: z.string().min(1, 'Le contenu est requis').max(2000),
      projectId: commonSchemas.uuid.optional(),
      documentId: commonSchemas.uuid.optional(),
      taskId: commonSchemas.uuid.optional()
    })
  }),

  // Invitations
  inviteUser: z.object({
    params: z.object({
      projectId: commonSchemas.uuid
    }),
    body: z.object({
      email: commonSchemas.email,
      role: commonSchemas.userRole
    })
  }),

  acceptInvite: z.object({
    params: z.object({
      token: z.string().min(1, 'Token requis')
    })
  }),

  cancelInvite: z.object({
    params: z.object({
      inviteId: commonSchemas.uuid
    })
  }),

  // Paramètres utilisateur
  updateSettings: z.object({
    body: z.object({
      settings: z.record(z.string(), z.any()).refine(
        (settings) => Object.keys(settings).length > 0,
        'Au moins un paramètre doit être fourni'
      )
    })
  }),

  getSettings: z.object({
    query: z.object({
      keys: z.string().optional(),
      public: z.string().optional()
    })
  })
};

// Middleware pour valider les paramètres d'URL
export const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        return res.status(400).json({
          error: 'Paramètres invalides',
          code: 'INVALID_PARAMS',
          details: errors
        });
      }

      next(error);
    }
  };
};

// Middleware pour valider les query parameters
export const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        return res.status(400).json({
          error: 'Paramètres de requête invalides',
          code: 'INVALID_QUERY',
          details: errors
        });
      }

      next(error);
    }
  };
};

export default {
  validate,
  validateParams,
  validateQuery,
  commonSchemas,
  validationSchemas
};
