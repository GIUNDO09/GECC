/**
 * ========================================
 * ROUTES PROJETS
 * ========================================
 * Routes pour la gestion des projets
 * ========================================
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const {
  createProject,
  getProjectById,
  getProjectsByUser,
  getAllProjects,
  updateProject,
  deleteProject,
  getProjectMembers,
  addProjectMember,
  updateProjectMemberRole,
  removeProjectMember,
  isProjectCodeExists
} = require('../models/Project');
const { requireRole, requireProjectAccess } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/projects
 * Récupérer tous les projets de l'utilisateur
 */
router.get('/', async (req, res) => {
  try {
    const projects = await getProjectsByUser(req.user.id);
    res.json({
      projects,
      count: projects.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des projets:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * GET /api/projects/all
 * Récupérer tous les projets (admin uniquement)
 */
router.get('/all', requireRole(['admin']), async (req, res) => {
  try {
    const projects = await getAllProjects();
    res.json({
      projects,
      count: projects.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de tous les projets:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * GET /api/projects/:projectId
 * Récupérer un projet spécifique
 */
router.get('/:projectId', requireProjectAccess('read'), async (req, res) => {
  try {
    const project = await getProjectById(req.params.projectId);
    if (!project) {
      return res.status(404).json({
        error: 'Projet non trouvé',
        code: 'PROJECT_NOT_FOUND'
      });
    }

    res.json({ project });
  } catch (error) {
    console.error('Erreur lors de la récupération du projet:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * POST /api/projects
 * Créer un nouveau projet
 */
router.post('/', [
  body('code').trim().isLength({ min: 3 }).withMessage('Le code doit contenir au moins 3 caractères'),
  body('name').trim().isLength({ min: 3 }).withMessage('Le nom doit contenir au moins 3 caractères'),
  body('address').trim().isLength({ min: 5 }).withMessage('L\'adresse doit contenir au moins 5 caractères'),
  body('type').isIn(['residentiel', 'commercial', 'industriel', 'tertiaire', 'equipement', 'renovation', 'autre']).withMessage('Type de projet invalide'),
  body('surface').isInt({ min: 1 }).withMessage('La surface doit être un nombre positif'),
  body('owner').trim().isLength({ min: 2 }).withMessage('Le maître d\'ouvrage doit contenir au moins 2 caractères')
], async (req, res) => {
  try {
    // Validation des données
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const { code, name, description, address, type, surface, owner } = req.body;

    // Vérification de l'unicité du code
    const codeExists = await isProjectCodeExists(code);
    if (codeExists) {
      return res.status(409).json({
        error: 'Un projet avec ce code existe déjà',
        code: 'PROJECT_CODE_EXISTS'
      });
    }

    // Création du projet
    const project = await createProject({
      code,
      name,
      description,
      address,
      type,
      surface,
      owner,
      ownerId: req.user.id
    });

    res.status(201).json({
      message: 'Projet créé avec succès',
      project
    });
  } catch (error) {
    console.error('Erreur lors de la création du projet:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * PUT /api/projects/:projectId
 * Mettre à jour un projet
 */
router.put('/:projectId', requireProjectAccess('write'), [
  body('name').optional().trim().isLength({ min: 3 }).withMessage('Le nom doit contenir au moins 3 caractères'),
  body('address').optional().trim().isLength({ min: 5 }).withMessage('L\'adresse doit contenir au moins 5 caractères'),
  body('type').optional().isIn(['residentiel', 'commercial', 'industriel', 'tertiaire', 'equipement', 'renovation', 'autre']).withMessage('Type de projet invalide'),
  body('surface').optional().isInt({ min: 1 }).withMessage('La surface doit être un nombre positif'),
  body('owner').optional().trim().isLength({ min: 2 }).withMessage('Le maître d\'ouvrage doit contenir au moins 2 caractères'),
  body('progress').optional().isInt({ min: 0, max: 100 }).withMessage('Le progrès doit être entre 0 et 100')
], async (req, res) => {
  try {
    // Validation des données
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const projectId = req.params.projectId;
    const updateData = req.body;

    // Mise à jour du projet
    const project = await updateProject(projectId, updateData);

    res.json({
      message: 'Projet mis à jour avec succès',
      project
    });
  } catch (error) {
    if (error.message === 'Projet non trouvé') {
      return res.status(404).json({
        error: 'Projet non trouvé',
        code: 'PROJECT_NOT_FOUND'
      });
    }
    console.error('Erreur lors de la mise à jour du projet:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * DELETE /api/projects/:projectId
 * Supprimer un projet
 */
router.delete('/:projectId', requireProjectAccess('admin'), async (req, res) => {
  try {
    const projectId = req.params.projectId;
    await deleteProject(projectId);

    res.json({
      message: 'Projet supprimé avec succès',
      projectId
    });
  } catch (error) {
    if (error.message === 'Projet non trouvé') {
      return res.status(404).json({
        error: 'Projet non trouvé',
        code: 'PROJECT_NOT_FOUND'
      });
    }
    console.error('Erreur lors de la suppression du projet:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * GET /api/projects/:projectId/members
 * Récupérer les membres d'un projet
 */
router.get('/:projectId/members', requireProjectAccess('read'), async (req, res) => {
  try {
    const members = await getProjectMembers(req.params.projectId);
    res.json({
      members,
      count: members.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des membres:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * POST /api/projects/:projectId/members
 * Ajouter un membre à un projet
 */
router.post('/:projectId/members', requireProjectAccess('admin'), [
  body('userId').notEmpty().withMessage('ID utilisateur requis'),
  body('role').isIn(['viewer', 'member', 'admin']).withMessage('Rôle invalide')
], async (req, res) => {
  try {
    // Validation des données
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const { projectId } = req.params;
    const { userId, role } = req.body;

    // Ajout du membre
    const member = await addProjectMember(projectId, userId, role);

    res.status(201).json({
      message: 'Membre ajouté avec succès',
      member
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du membre:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * PUT /api/projects/:projectId/members/:userId
 * Mettre à jour le rôle d'un membre
 */
router.put('/:projectId/members/:userId', requireProjectAccess('admin'), [
  body('role').isIn(['viewer', 'member', 'admin']).withMessage('Rôle invalide')
], async (req, res) => {
  try {
    // Validation des données
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const { projectId, userId } = req.params;
    const { role } = req.body;

    // Mise à jour du rôle
    const result = await updateProjectMemberRole(projectId, userId, role);

    res.json({
      message: 'Rôle mis à jour avec succès',
      result
    });
  } catch (error) {
    if (error.message === 'Membre non trouvé') {
      return res.status(404).json({
        error: 'Membre non trouvé',
        code: 'MEMBER_NOT_FOUND'
      });
    }
    console.error('Erreur lors de la mise à jour du rôle:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * DELETE /api/projects/:projectId/members/:userId
 * Supprimer un membre d'un projet
 */
router.delete('/:projectId/members/:userId', requireProjectAccess('admin'), async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    await removeProjectMember(projectId, userId);

    res.json({
      message: 'Membre supprimé avec succès',
      projectId,
      userId
    });
  } catch (error) {
    if (error.message === 'Membre non trouvé') {
      return res.status(404).json({
        error: 'Membre non trouvé',
        code: 'MEMBER_NOT_FOUND'
      });
    }
    console.error('Erreur lors de la suppression du membre:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;