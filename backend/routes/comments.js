/**
 * ========================================
 * ROUTES COMMENTAIRES
 * ========================================
 * Routes pour la gestion des commentaires
 * ========================================
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { requireProjectAccess } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/comments/project/:projectId
 * Récupérer tous les commentaires d'un projet
 */
router.get('/project/:projectId', requireProjectAccess('read'), async (req, res) => {
  try {
    // TODO: Implémenter la récupération des commentaires
    res.json({
      comments: [],
      count: 0,
      message: 'Route en cours d\'implémentation'
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * POST /api/comments
 * Créer un nouveau commentaire
 */
router.post('/', requireProjectAccess('write'), [
  body('projectId').notEmpty().withMessage('ID de projet requis'),
  body('content').trim().isLength({ min: 1 }).withMessage('Le contenu ne peut pas être vide')
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

    const { projectId, content } = req.body;

    // TODO: Implémenter la création du commentaire
    const comment = {
      id: 'temp-id',
      projectId,
      authorId: req.user.id,
      content,
      createdAt: new Date().toISOString()
    };

    res.status(201).json({
      message: 'Commentaire créé avec succès',
      comment
    });
  } catch (error) {
    console.error('Erreur lors de la création du commentaire:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * PUT /api/comments/:commentId
 * Mettre à jour un commentaire
 */
router.put('/:commentId', requireProjectAccess('write'), [
  body('content').trim().isLength({ min: 1 }).withMessage('Le contenu ne peut pas être vide')
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

    const { commentId } = req.params;
    const { content } = req.body;

    // TODO: Implémenter la mise à jour du commentaire
    // Vérifier que l'utilisateur est l'auteur du commentaire
    res.json({
      message: 'Commentaire mis à jour avec succès',
      commentId,
      content,
      updatedBy: req.user.id,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du commentaire:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * DELETE /api/comments/:commentId
 * Supprimer un commentaire
 */
router.delete('/:commentId', requireProjectAccess('write'), async (req, res) => {
  try {
    const { commentId } = req.params;

    // TODO: Implémenter la suppression du commentaire
    // Vérifier que l'utilisateur est l'auteur du commentaire ou admin
    res.json({
      message: 'Commentaire supprimé avec succès',
      commentId
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;