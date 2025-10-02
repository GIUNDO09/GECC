/**
 * ========================================
 * ROUTES TÂCHES
 * ========================================
 * Routes pour la gestion des tâches Kanban
 * ========================================
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { requireProjectAccess } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/tasks/project/:projectId
 * Récupérer toutes les tâches d'un projet
 */
router.get('/project/:projectId', requireProjectAccess('read'), async (req, res) => {
  try {
    // TODO: Implémenter la récupération des tâches
    res.json({
      tasks: [],
      count: 0,
      message: 'Route en cours d\'implémentation'
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * POST /api/tasks
 * Créer une nouvelle tâche
 */
router.post('/', requireProjectAccess('write'), [
  body('projectId').notEmpty().withMessage('ID de projet requis'),
  body('title').trim().isLength({ min: 3 }).withMessage('Le titre doit contenir au moins 3 caractères'),
  body('description').optional().trim(),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Priorité invalide'),
  body('assignedTo').optional().isUUID().withMessage('ID utilisateur invalide')
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

    const { projectId, title, description, priority = 'medium', assignedTo } = req.body;

    // TODO: Implémenter la création de la tâche
    const task = {
      id: 'temp-id',
      projectId,
      title,
      description,
      status: 'todo',
      priority,
      assignedTo,
      createdBy: req.user.id,
      createdAt: new Date().toISOString()
    };

    res.status(201).json({
      message: 'Tâche créée avec succès',
      task
    });
  } catch (error) {
    console.error('Erreur lors de la création de la tâche:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * PUT /api/tasks/:taskId
 * Mettre à jour une tâche
 */
router.put('/:taskId', requireProjectAccess('write'), [
  body('title').optional().trim().isLength({ min: 3 }).withMessage('Le titre doit contenir au moins 3 caractères'),
  body('description').optional().trim(),
  body('status').optional().isIn(['todo', 'in_progress', 'in_review', 'completed']).withMessage('Statut invalide'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Priorité invalide'),
  body('assignedTo').optional().isUUID().withMessage('ID utilisateur invalide')
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

    const { taskId } = req.params;
    const updateData = req.body;

    // TODO: Implémenter la mise à jour de la tâche
    res.json({
      message: 'Tâche mise à jour avec succès',
      taskId,
      updatedData: updateData,
      updatedBy: req.user.id,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la tâche:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * DELETE /api/tasks/:taskId
 * Supprimer une tâche
 */
router.delete('/:taskId', requireProjectAccess('write'), async (req, res) => {
  try {
    const { taskId } = req.params;

    // TODO: Implémenter la suppression de la tâche
    res.json({
      message: 'Tâche supprimée avec succès',
      taskId
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la tâche:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;