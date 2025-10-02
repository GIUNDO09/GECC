/**
 * ========================================
 * ROUTES DOCUMENTS
 * ========================================
 * Routes pour la gestion des documents
 * et du workflow de visa
 * ========================================
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const { requireProjectAccess } = require('../middleware/auth');

const router = express.Router();

// Configuration de multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB par défaut
  },
  fileFilter: (req, file, cb) => {
    // Types de fichiers autorisés
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'), false);
    }
  }
});

/**
 * GET /api/documents/project/:projectId
 * Récupérer tous les documents d'un projet
 */
router.get('/project/:projectId', requireProjectAccess('read'), async (req, res) => {
  try {
    // TODO: Implémenter la récupération des documents
    res.json({
      documents: [],
      count: 0,
      message: 'Route en cours d\'implémentation'
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * GET /api/documents/:documentId
 * Récupérer un document spécifique
 */
router.get('/:documentId', async (req, res) => {
  try {
    // TODO: Implémenter la récupération d'un document
    res.json({
      document: null,
      message: 'Route en cours d\'implémentation'
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du document:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * POST /api/documents
 * Créer un nouveau document
 */
router.post('/', requireProjectAccess('write'), upload.single('file'), [
  body('projectId').notEmpty().withMessage('ID de projet requis'),
  body('title').trim().isLength({ min: 3 }).withMessage('Le titre doit contenir au moins 3 caractères'),
  body('type').isIn(['plan', 'rapport', 'cahier', 'etude', 'autre']).withMessage('Type de document invalide'),
  body('recipients').isArray({ min: 1 }).withMessage('Au moins un destinataire requis')
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

    const { projectId, title, type, recipients, externalUrl } = req.body;
    const file = req.file;

    // Vérification qu'un fichier ou une URL externe est fournie
    if (!file && !externalUrl) {
      return res.status(400).json({
        error: 'Un fichier ou une URL externe est requis',
        code: 'FILE_OR_URL_REQUIRED'
      });
    }

    // TODO: Implémenter la création du document
    const document = {
      id: 'temp-id',
      projectId,
      title,
      type,
      status: 'submitted',
      filePath: file ? file.path : null,
      externalUrl: externalUrl || null,
      submittedBy: req.user.id,
      recipients: JSON.parse(recipients),
      createdAt: new Date().toISOString()
    };

    res.status(201).json({
      message: 'Document créé avec succès',
      document
    });
  } catch (error) {
    console.error('Erreur lors de la création du document:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * PUT /api/documents/:documentId/status
 * Changer le statut d'un document (workflow de visa)
 */
router.put('/:documentId/status', requireProjectAccess('write'), [
  body('status').isIn(['submitted', 'under_review', 'observations', 'revised', 'approved', 'rejected']).withMessage('Statut invalide'),
  body('comment').optional().trim()
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

    const { documentId } = req.params;
    const { status, comment } = req.body;

    // TODO: Implémenter la mise à jour du statut
    // Vérifier les permissions selon le rôle et le statut actuel
    // Créer une entrée dans l'historique
    // Envoyer des notifications

    res.json({
      message: 'Statut mis à jour avec succès',
      documentId,
      status,
      comment,
      updatedBy: req.user.id,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * GET /api/documents/:documentId/history
 * Récupérer l'historique d'un document
 */
router.get('/:documentId/history', async (req, res) => {
  try {
    // TODO: Implémenter la récupération de l'historique
    res.json({
      history: [],
      count: 0,
      message: 'Route en cours d\'implémentation'
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * GET /api/documents/:documentId/download
 * Télécharger un document
 */
router.get('/:documentId/download', async (req, res) => {
  try {
    // TODO: Implémenter le téléchargement
    res.status(404).json({
      error: 'Document non trouvé',
      code: 'DOCUMENT_NOT_FOUND'
    });
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * DELETE /api/documents/:documentId
 * Supprimer un document
 */
router.delete('/:documentId', requireProjectAccess('admin'), async (req, res) => {
  try {
    const { documentId } = req.params;

    // TODO: Implémenter la suppression
    // Supprimer le fichier physique
    // Supprimer les enregistrements en base

    res.json({
      message: 'Document supprimé avec succès',
      documentId
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du document:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;