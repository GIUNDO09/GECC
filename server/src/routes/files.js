/**
 * ========================================
 * ROUTES GESTION FICHIERS GECC
 * ========================================
 * Routes pour la gestion des fichiers avec stockage S3-compatible
 * ========================================
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { query } from '../db/connection.js';
import { logger, logAudit } from '../config/logger.js';
import { authenticateToken, requireProjectAccess } from '../middleware/auth.js';
import { validate, validationSchemas } from '../middleware/validation.js';
import { asyncHandler, createError, createNotFoundError, createPermissionError } from '../middleware/errorHandler.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// ========================================
// CONFIGURATION S3
// ========================================

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-west-1',
  endpoint: process.env.AWS_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: process.env.AWS_ENDPOINT ? true : false, // Pour MinIO et services compatibles
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'gecc-files';

// ========================================
// CONFIGURATION MULTER
// ========================================

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
  fileFilter: (req, file, cb) => {
    // Types de fichiers autorisés
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/zip',
      'application/x-rar-compressed',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'), false);
    }
  },
});

// ========================================
// ROUTES FICHIERS
// ========================================

// POST /api/projects/:id/files - Uploader un fichier
router.post('/projects/:projectId/files',
  authenticateToken,
  requireProjectAccess('write'),
  upload.single('file'),
  asyncHandler(async (req, res) => {
    const projectId = req.params.projectId;
    const file = req.file;

    if (!file) {
      throw createError('Aucun fichier fourni', 400, 'NO_FILE');
    }

    // Générer un nom de fichier unique
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = `projects/${projectId}/${fileName}`;

    try {
      // Upload vers S3
      const uploadCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filePath,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
          uploadedBy: req.user.id,
          projectId: projectId,
        },
      });

      await s3Client.send(uploadCommand);

      // Enregistrer en base de données
      const result = await query(
        `INSERT INTO documents (project_id, name, file_path, file_size, mime_type, uploaded_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [projectId, file.originalname, filePath, file.size, file.mimetype, req.user.id]
      );

      const document = result.rows[0];

      // Logger l'upload
      logAudit('FILE_UPLOADED', req.user.id, {
        projectId,
        documentId: document.id,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      logger.info('Fichier uploadé', {
        projectId,
        documentId: document.id,
        fileName: file.originalname,
        fileSize: file.size,
        userId: req.user.id
      });

      res.status(201).json({
        message: 'Fichier uploadé avec succès',
        document: {
          id: document.id,
          name: document.name,
          fileSize: document.file_size,
          mimeType: document.mime_type,
          uploadedAt: document.created_at,
          uploadedBy: req.user.id
        }
      });

    } catch (error) {
      logger.error('Erreur lors de l\'upload du fichier', {
        projectId,
        fileName: file.originalname,
        error: error.message,
        userId: req.user.id
      });
      throw createError('Erreur lors de l\'upload du fichier', 500, 'UPLOAD_ERROR');
    }
  })
);

// GET /api/projects/:id/files - Lister les fichiers d'un projet
router.get('/projects/:projectId/files',
  authenticateToken,
  requireProjectAccess('read'),
  asyncHandler(async (req, res) => {
    const projectId = req.params.projectId;

    const result = await query(
      `SELECT 
        d.*,
        u.full_name as uploaded_by_name,
        u.email as uploaded_by_email
      FROM documents d
      LEFT JOIN users u ON d.uploaded_by = u.id
      WHERE d.project_id = $1
      ORDER BY d.created_at DESC`,
      [projectId]
    );

    const documents = result.rows.map(doc => ({
      id: doc.id,
      name: doc.name,
      fileSize: doc.file_size,
      mimeType: doc.mime_type,
      uploadedAt: doc.created_at,
      uploadedBy: {
        id: doc.uploaded_by,
        name: doc.uploaded_by_name,
        email: doc.uploaded_by_email
      }
    }));

    res.json({ documents });
  })
);

// GET /api/files/:id/download - Télécharger un fichier
router.get('/files/:id/download',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const fileId = req.params.id;

    // Récupérer les informations du fichier
    const result = await query(
      `SELECT 
        d.*,
        p.id as project_id,
        p.name as project_name
      FROM documents d
      JOIN projects p ON d.project_id = p.id
      WHERE d.id = $1`,
      [fileId]
    );

    if (result.rows.length === 0) {
      throw createNotFoundError('Fichier');
    }

    const document = result.rows[0];

    // Vérifier les permissions sur le projet
    const hasAccess = await query(
      `SELECT 1 FROM project_members pm 
       WHERE pm.project_id = $1 AND pm.user_id = $2 AND pm.is_active = true`,
      [document.project_id, req.user.id]
    );

    if (hasAccess.rows.length === 0) {
      throw createPermissionError('Vous n\'avez pas accès à ce fichier');
    }

    try {
      // Générer une URL signée pour le téléchargement
      const getCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: document.file_path,
      });

      const downloadUrl = await getSignedUrl(s3Client, getCommand, {
        expiresIn: 3600, // 1 heure
      });

      // Logger le téléchargement
      logAudit('FILE_DOWNLOADED', req.user.id, {
        projectId: document.project_id,
        documentId: document.id,
        fileName: document.name,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        downloadUrl,
        document: {
          id: document.id,
          name: document.name,
          fileSize: document.file_size,
          mimeType: document.mime_type
        }
      });

    } catch (error) {
      logger.error('Erreur lors de la génération de l\'URL de téléchargement', {
        documentId: document.id,
        error: error.message,
        userId: req.user.id
      });
      throw createError('Erreur lors de la génération de l\'URL de téléchargement', 500, 'DOWNLOAD_ERROR');
    }
  })
);

// DELETE /api/files/:id - Supprimer un fichier
router.delete('/files/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const fileId = req.params.id;

    // Récupérer les informations du fichier
    const result = await query(
      `SELECT 
        d.*,
        p.id as project_id,
        p.name as project_name
      FROM documents d
      JOIN projects p ON d.project_id = p.id
      WHERE d.id = $1`,
      [fileId]
    );

    if (result.rows.length === 0) {
      throw createNotFoundError('Fichier');
    }

    const document = result.rows[0];

    // Vérifier les permissions (owner du projet ou admin)
    const hasWriteAccess = await query(
      `SELECT 
        CASE 
          WHEN p.created_by = $2 THEN 'owner'
          WHEN pm.role_in_project = 'admin' THEN 'admin'
          ELSE 'member'
        END as access_level
      FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = $2 AND pm.is_active = true
      WHERE p.id = $1`,
      [document.project_id, req.user.id]
    );

    if (hasWriteAccess.rows.length === 0 || 
        !['owner', 'admin'].includes(hasWriteAccess.rows[0].access_level)) {
      throw createPermissionError('Vous n\'avez pas les droits pour supprimer ce fichier');
    }

    try {
      // Supprimer de S3
      const deleteCommand = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: document.file_path,
      });

      await s3Client.send(deleteCommand);

      // Supprimer de la base de données
      await query(
        'DELETE FROM documents WHERE id = $1',
        [fileId]
      );

      // Logger la suppression
      logAudit('FILE_DELETED', req.user.id, {
        projectId: document.project_id,
        documentId: document.id,
        fileName: document.name,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      logger.info('Fichier supprimé', {
        projectId: document.project_id,
        documentId: document.id,
        fileName: document.name,
        userId: req.user.id
      });

      res.json({
        message: 'Fichier supprimé avec succès'
      });

    } catch (error) {
      logger.error('Erreur lors de la suppression du fichier', {
        documentId: document.id,
        error: error.message,
        userId: req.user.id
      });
      throw createError('Erreur lors de la suppression du fichier', 500, 'DELETE_ERROR');
    }
  })
);

// POST /api/files/upload-url - Générer une URL d'upload presignée
router.post('/files/upload-url',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { projectId, fileName, mimeType } = req.body;

    if (!projectId || !fileName || !mimeType) {
      throw createError('projectId, fileName et mimeType sont requis', 400, 'MISSING_PARAMETERS');
    }

    // Vérifier les permissions sur le projet
    const hasWriteAccess = await query(
      `SELECT 
        CASE 
          WHEN p.created_by = $2 THEN 'owner'
          WHEN pm.role_in_project = 'admin' THEN 'admin'
          ELSE 'member'
        END as access_level
      FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = $2 AND pm.is_active = true
      WHERE p.id = $1`,
      [projectId, req.user.id]
    );

    if (hasWriteAccess.rows.length === 0 || 
        !['owner', 'admin'].includes(hasWriteAccess.rows[0].access_level)) {
      throw createPermissionError('Vous n\'avez pas les droits pour uploader des fichiers sur ce projet');
    }

    // Générer un nom de fichier unique
    const fileExtension = path.extname(fileName);
    const uniqueFileName = `${uuidv4()}${fileExtension}`;
    const filePath = `projects/${projectId}/${uniqueFileName}`;

    try {
      // Générer une URL presignée pour l'upload
      const putCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filePath,
        ContentType: mimeType,
        Metadata: {
          originalName: fileName,
          uploadedBy: req.user.id,
          projectId: projectId,
        },
      });

      const uploadUrl = await getSignedUrl(s3Client, putCommand, {
        expiresIn: 3600, // 1 heure
      });

      res.json({
        uploadUrl,
        filePath,
        uniqueFileName,
        expiresIn: 3600
      });

    } catch (error) {
      logger.error('Erreur lors de la génération de l\'URL d\'upload', {
        projectId,
        fileName,
        error: error.message,
        userId: req.user.id
      });
      throw createError('Erreur lors de la génération de l\'URL d\'upload', 500, 'UPLOAD_URL_ERROR');
    }
  })
);

// GET /api/files/:id/info - Informations sur un fichier
router.get('/files/:id/info',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const fileId = req.params.id;

    // Récupérer les informations du fichier
    const result = await query(
      `SELECT 
        d.*,
        p.id as project_id,
        p.name as project_name,
        u.full_name as uploaded_by_name,
        u.email as uploaded_by_email
      FROM documents d
      JOIN projects p ON d.project_id = p.id
      LEFT JOIN users u ON d.uploaded_by = u.id
      WHERE d.id = $1`,
      [fileId]
    );

    if (result.rows.length === 0) {
      throw createNotFoundError('Fichier');
    }

    const document = result.rows[0];

    // Vérifier les permissions sur le projet
    const hasAccess = await query(
      `SELECT 1 FROM project_members pm 
       WHERE pm.project_id = $1 AND pm.user_id = $2 AND pm.is_active = true`,
      [document.project_id, req.user.id]
    );

    if (hasAccess.rows.length === 0) {
      throw createPermissionError('Vous n\'avez pas accès à ce fichier');
    }

    // Vérifier si le fichier existe dans S3
    let fileExists = false;
    let s3Metadata = null;

    try {
      const headCommand = new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: document.file_path,
      });

      const headResult = await s3Client.send(headCommand);
      fileExists = true;
      s3Metadata = headResult.Metadata;
    } catch (error) {
      if (error.name !== 'NotFound') {
        logger.warn('Erreur lors de la vérification du fichier S3', {
          documentId: document.id,
          error: error.message
        });
      }
    }

    res.json({
      document: {
        id: document.id,
        name: document.name,
        fileSize: document.file_size,
        mimeType: document.mime_type,
        uploadedAt: document.created_at,
        uploadedBy: {
          id: document.uploaded_by,
          name: document.uploaded_by_name,
          email: document.uploaded_by_email
        },
        project: {
          id: document.project_id,
          name: document.project_name
        },
        fileExists,
        s3Metadata
      }
    });
  })
);

export default router;
