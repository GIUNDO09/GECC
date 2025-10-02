/**
 * ========================================
 * ROUTES INVITATIONS GECC
 * ========================================
 * Routes pour la gestion des invitations de projet
 * ========================================
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/connection.js';
import { logger, logAudit } from '../config/logger.js';
import { authenticateToken, requireProjectAccess, optionalAuth } from '../middleware/auth.js';
import { validate, validationSchemas } from '../middleware/validation.js';
import { asyncHandler, createError, createNotFoundError, createPermissionError } from '../middleware/errorHandler.js';

const router = express.Router();

// ========================================
// ROUTES INVITATIONS
// ========================================

// POST /api/projects/:id/invites - Créer une invitation (owner/admin)
router.post('/projects/:projectId/invites',
  authenticateToken,
  requireProjectAccess('write'),
  validate(validationSchemas.inviteUser),
  asyncHandler(async (req, res) => {
    const projectId = req.params.projectId;
    const { email, role } = req.body;

    // Vérifier que l'utilisateur n'est pas déjà membre du projet
    const existingMember = await query(
      `SELECT pm.*, u.email 
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = $1 AND u.email = $2`,
      [projectId, email]
    );

    if (existingMember.rows.length > 0) {
      throw createError('Cet utilisateur est déjà membre du projet', 409, 'USER_ALREADY_MEMBER');
    }

    // Vérifier qu'il n'y a pas d'invitation en attente
    const existingInvite = await query(
      'SELECT id FROM invites WHERE project_id = $1 AND email = $2 AND status = $3',
      [projectId, email, 'pending']
    );

    if (existingInvite.rows.length > 0) {
      throw createError('Une invitation est déjà en attente pour cet email', 409, 'INVITE_ALREADY_PENDING');
    }

    // Générer un token unique
    const token = uuidv4();
    
    // Définir l'expiration (7 jours)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Créer l'invitation
    const result = await query(
      `INSERT INTO invites (project_id, email, role, token, status, invited_by, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [projectId, email, role, token, 'pending', req.user.id, expiresAt]
    );

    const invite = result.rows[0];

    // Récupérer les informations du projet
    const projectResult = await query(
      'SELECT name, code FROM projects WHERE id = $1',
      [projectId]
    );
    const project = projectResult.rows[0];

    // Logger la création d'invitation
    logAudit('INVITE_CREATED', req.user.id, {
      projectId,
      projectCode: project.code,
      projectName: project.name,
      invitedEmail: email,
      role,
      token,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info('Invitation créée', {
      projectId,
      projectCode: project.code,
      invitedEmail: email,
      role,
      token,
      userId: req.user.id
    });

    // Pour le MVP, retourner le lien d'invitation dans la réponse
    // Plus tard, ce lien sera envoyé par email
    const inviteLink = `${process.env.APP_URL || 'http://localhost:8000'}/project.html?invite=${token}`;

    res.status(201).json({
      message: 'Invitation créée avec succès',
      invite: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        token: invite.token,
        status: invite.status,
        expiresAt: invite.expires_at,
        inviteLink
      }
    });
  })
);

// GET /api/projects/:id/invites - Lister les invitations d'un projet (owner/admin)
router.get('/projects/:projectId/invites',
  authenticateToken,
  requireProjectAccess('write'),
  asyncHandler(async (req, res) => {
    const projectId = req.params.projectId;

    const result = await query(
      `SELECT 
        i.*,
        inviter.full_name as invited_by_name,
        inviter.email as invited_by_email,
        accepter.full_name as accepted_by_name
      FROM invites i
      LEFT JOIN users inviter ON i.invited_by = inviter.id
      LEFT JOIN users accepter ON i.accepted_by = accepter.id
      WHERE i.project_id = $1
      ORDER BY i.created_at DESC`,
      [projectId]
    );

    const invites = result.rows.map(invite => ({
      id: invite.id,
      email: invite.email,
      role: invite.role,
      token: invite.token,
      status: invite.status,
      invitedByName: invite.invited_by_name,
      invitedByEmail: invite.invited_by_email,
      acceptedByName: invite.accepted_by_name,
      expiresAt: invite.expires_at,
      createdAt: invite.created_at,
      updatedAt: invite.updated_at
    }));

    res.json({ invites });
  })
);

// POST /api/invites/:token/accept - Accepter une invitation
router.post('/invites/:token/accept',
  optionalAuth,
  validate(validationSchemas.acceptInvite),
  asyncHandler(async (req, res) => {
    const token = req.params.token;

    // Récupérer l'invitation
    const inviteResult = await query(
      `SELECT 
        i.*,
        p.name as project_name,
        p.code as project_code,
        inviter.full_name as invited_by_name
      FROM invites i
      JOIN projects p ON i.project_id = p.id
      LEFT JOIN users inviter ON i.invited_by = inviter.id
      WHERE i.token = $1`,
      [token]
    );

    if (inviteResult.rows.length === 0) {
      throw createNotFoundError('Invitation');
    }

    const invite = inviteResult.rows[0];

    // Vérifier le statut
    if (invite.status !== 'pending') {
      throw createError('Cette invitation n\'est plus valide', 400, 'INVITE_NOT_PENDING');
    }

    // Vérifier l'expiration
    if (new Date() > new Date(invite.expires_at)) {
      // Marquer comme expirée
      await query(
        'UPDATE invites SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['expired', invite.id]
      );
      throw createError('Cette invitation a expiré', 400, 'INVITE_EXPIRED');
    }

    // Si l'utilisateur n'est pas connecté, rediriger vers la connexion
    if (!req.user) {
      return res.json({
        message: 'Connexion requise pour accepter l\'invitation',
        requiresAuth: true,
        invite: {
          projectName: invite.project_name,
          projectCode: invite.project_code,
          role: invite.role,
          invitedByName: invite.invited_by_name
        }
      });
    }

    // Vérifier que l'utilisateur connecté correspond à l'email de l'invitation
    if (req.user.email !== invite.email) {
      throw createError('Cette invitation ne vous est pas destinée', 403, 'INVITE_NOT_FOR_USER');
    }

    // Vérifier que l'utilisateur n'est pas déjà membre
    const existingMember = await query(
      'SELECT id FROM project_members WHERE project_id = $1 AND user_id = $2',
      [invite.project_id, req.user.id]
    );

    if (existingMember.rows.length > 0) {
      throw createError('Vous êtes déjà membre de ce projet', 409, 'ALREADY_MEMBER');
    }

    // Ajouter l'utilisateur au projet
    await query(
      `INSERT INTO project_members (project_id, user_id, role_in_project, invited_by)
       VALUES ($1, $2, $3, $4)`,
      [invite.project_id, req.user.id, invite.role, invite.invited_by]
    );

    // Marquer l'invitation comme acceptée
    await query(
      'UPDATE invites SET status = $1, accepted_by = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      ['accepted', req.user.id, invite.id]
    );

    // Logger l'acceptation
    logAudit('INVITE_ACCEPTED', req.user.id, {
      projectId: invite.project_id,
      projectCode: invite.project_code,
      projectName: invite.project_name,
      role: invite.role,
      token,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info('Invitation acceptée', {
      projectId: invite.project_id,
      projectCode: invite.project_code,
      userId: req.user.id,
      role: invite.role
    });

    res.json({
      message: 'Invitation acceptée avec succès',
      project: {
        id: invite.project_id,
        name: invite.project_name,
        code: invite.project_code,
        role: invite.role
      }
    });
  })
);

// POST /api/invites/:id/cancel - Annuler une invitation (owner/admin)
router.post('/invites/:inviteId/cancel',
  authenticateToken,
  validate(validationSchemas.cancelInvite),
  asyncHandler(async (req, res) => {
    const inviteId = req.params.inviteId;

    // Récupérer l'invitation avec les informations du projet
    const inviteResult = await query(
      `SELECT 
        i.*,
        p.name as project_name,
        p.code as project_code,
        p.created_by as project_owner
      FROM invites i
      JOIN projects p ON i.project_id = p.id
      WHERE i.id = $1`,
      [inviteId]
    );

    if (inviteResult.rows.length === 0) {
      throw createNotFoundError('Invitation');
    }

    const invite = inviteResult.rows[0];

    // Vérifier les permissions (owner du projet ou créateur de l'invitation)
    if (invite.project_owner !== req.user.id && invite.invited_by !== req.user.id) {
      throw createPermissionError('Vous ne pouvez pas annuler cette invitation');
    }

    // Vérifier le statut
    if (invite.status !== 'pending') {
      throw createError('Cette invitation ne peut pas être annulée', 400, 'INVITE_NOT_PENDING');
    }

    // Marquer l'invitation comme annulée
    await query(
      'UPDATE invites SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['cancelled', inviteId]
    );

    // Logger l'annulation
    logAudit('INVITE_CANCELLED', req.user.id, {
      projectId: invite.project_id,
      projectCode: invite.project_code,
      projectName: invite.project_name,
      invitedEmail: invite.email,
      role: invite.role,
      token: invite.token,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info('Invitation annulée', {
      projectId: invite.project_id,
      projectCode: invite.project_code,
      invitedEmail: invite.email,
      userId: req.user.id
    });

    res.json({
      message: 'Invitation annulée avec succès'
    });
  })
);

// GET /api/invites/:token - Récupérer les détails d'une invitation (public)
router.get('/invites/:token',
  asyncHandler(async (req, res) => {
    const token = req.params.token;

    const result = await query(
      `SELECT 
        i.*,
        p.name as project_name,
        p.code as project_code,
        p.description as project_description,
        inviter.full_name as invited_by_name,
        inviter.email as invited_by_email
      FROM invites i
      JOIN projects p ON i.project_id = p.id
      LEFT JOIN users inviter ON i.invited_by = inviter.id
      WHERE i.token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      throw createNotFoundError('Invitation');
    }

    const invite = result.rows[0];

    // Vérifier l'expiration
    const isExpired = new Date() > new Date(invite.expires_at);
    if (isExpired && invite.status === 'pending') {
      // Marquer comme expirée
      await query(
        'UPDATE invites SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['expired', invite.id]
      );
      invite.status = 'expired';
    }

    res.json({
      invite: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        status: invite.status,
        expiresAt: invite.expires_at,
        createdAt: invite.created_at,
        project: {
          id: invite.project_id,
          name: invite.project_name,
          code: invite.project_code,
          description: invite.project_description
        },
        invitedBy: {
          name: invite.invited_by_name,
          email: invite.invited_by_email
        }
      }
    });
  })
);

export default router;
