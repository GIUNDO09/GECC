/**
 * ========================================
 * ROUTES PROJETS GECC
 * ========================================
 * Routes pour la gestion des projets et membres
 * ========================================
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/connection.js';
import { logger, logAudit } from '../config/logger.js';
import { authenticateToken, requireProjectAccess } from '../middleware/auth.js';
import { validate, validationSchemas } from '../middleware/validation.js';
import { asyncHandler, createError, createNotFoundError, createPermissionError } from '../middleware/errorHandler.js';

const router = express.Router();

// ========================================
// ROUTES PROJETS
// ========================================

// GET /api/projects - Lister mes projets (où je suis membre ou owner)
router.get('/', 
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status, type } = req.query;
    const offset = (page - 1) * limit;

    // Construire la requête avec filtres
    let whereClause = `
      WHERE EXISTS (
        SELECT 1 FROM project_members pm 
        WHERE pm.project_id = p.id AND pm.user_id = $1 AND pm.is_active = true
      )
    `;
    const queryParams = [req.user.id];
    let paramCount = 1;

    if (status) {
      paramCount++;
      whereClause += ` AND p.status = $${paramCount}`;
      queryParams.push(status);
    }

    if (type) {
      paramCount++;
      whereClause += ` AND p.type = $${paramCount}`;
      queryParams.push(type);
    }

    // Requête principale
    const projectsQuery = `
      SELECT 
        p.*,
        u.full_name as owner_name,
        u.email as owner_email,
        CASE 
          WHEN p.created_by = $1 THEN 'owner'
          WHEN EXISTS (
            SELECT 1 FROM project_members pm 
            WHERE pm.project_id = p.id AND pm.user_id = $1 AND pm.role_in_project = 'admin'
          ) THEN 'admin'
          ELSE 'member'
        END as my_role,
        (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id AND pm.is_active = true) as member_count
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      ${whereClause}
      ORDER BY p.updated_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(limit, offset);

    const result = await query(projectsQuery, queryParams);

    // Compter le total pour la pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM projects p
      ${whereClause}
    `;
    const countResult = await query(countQuery, queryParams.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    const projects = result.rows.map(project => ({
      id: project.id,
      code: project.code,
      name: project.name,
      description: project.description,
      address: project.address,
      type: project.type,
      surfaceArea: project.surface_area,
      ownerName: project.owner_name,
      status: project.status,
      visibility: project.visibility,
      startDate: project.start_date,
      endDate: project.end_date,
      budget: project.budget,
      ownerEmail: project.owner_email,
      myRole: project.my_role,
      memberCount: parseInt(project.member_count),
      createdAt: project.created_at,
      updatedAt: project.updated_at
    }));

    res.json({
      projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  })
);

// POST /api/projects - Créer un nouveau projet
router.post('/',
  authenticateToken,
  validate(validationSchemas.createProject),
  asyncHandler(async (req, res) => {
    const { code, name, description, address, type, surfaceArea, ownerName, startDate, endDate, budget } = req.body;

    // Vérifier si le code existe déjà
    const existingProject = await query(
      'SELECT id FROM projects WHERE code = $1',
      [code]
    );

    if (existingProject.rows.length > 0) {
      throw createError('Un projet avec ce code existe déjà', 409, 'PROJECT_CODE_EXISTS');
    }

    // Créer le projet
    const result = await query(
      `INSERT INTO projects (code, name, description, address, type, surface_area, owner_name, 
                            start_date, end_date, budget, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [code, name, description, address, type, surfaceArea, ownerName, startDate, endDate, budget, req.user.id]
    );

    const project = result.rows[0];

    // Ajouter le créateur comme owner dans project_members
    await query(
      `INSERT INTO project_members (project_id, user_id, role_in_project, invited_by)
       VALUES ($1, $2, 'owner', $2)`,
      [project.id, req.user.id]
    );

    // Logger la création
    logAudit('PROJECT_CREATED', req.user.id, {
      projectId: project.id,
      projectCode: project.code,
      projectName: project.name,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info('Nouveau projet créé', {
      projectId: project.id,
      projectCode: project.code,
      projectName: project.name,
      userId: req.user.id
    });

    res.status(201).json({
      message: 'Projet créé avec succès',
      project: {
        id: project.id,
        code: project.code,
        name: project.name,
        description: project.description,
        address: project.address,
        type: project.type,
        surfaceArea: project.surface_area,
        ownerName: project.owner_name,
        status: project.status,
        visibility: project.visibility,
        startDate: project.start_date,
        endDate: project.end_date,
        budget: project.budget,
        myRole: 'owner',
        memberCount: 1,
        createdAt: project.created_at,
        updatedAt: project.updated_at
      }
    });
  })
);

// GET /api/projects/:id - Détails d'un projet
router.get('/:id',
  authenticateToken,
  requireProjectAccess('read'),
  asyncHandler(async (req, res) => {
    const projectId = req.params.id;

    const result = await query(
      `SELECT 
        p.*,
        u.full_name as owner_name,
        u.email as owner_email,
        CASE 
          WHEN p.created_by = $2 THEN 'owner'
          WHEN EXISTS (
            SELECT 1 FROM project_members pm 
            WHERE pm.project_id = p.id AND pm.user_id = $2 AND pm.role_in_project = 'admin'
          ) THEN 'admin'
          ELSE 'member'
        END as my_role
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.id = $1`,
      [projectId, req.user.id]
    );

    if (result.rows.length === 0) {
      throw createNotFoundError('Projet');
    }

    const project = result.rows[0];

    res.json({
      project: {
        id: project.id,
        code: project.code,
        name: project.name,
        description: project.description,
        address: project.address,
        type: project.type,
        surfaceArea: project.surface_area,
        ownerName: project.owner_name,
        status: project.status,
        visibility: project.visibility,
        startDate: project.start_date,
        endDate: project.end_date,
        budget: project.budget,
        ownerEmail: project.owner_email,
        myRole: project.my_role,
        createdAt: project.created_at,
        updatedAt: project.updated_at
      }
    });
  })
);

// PATCH /api/projects/:id - Mettre à jour un projet (owner ou admin)
router.patch('/:id',
  authenticateToken,
  requireProjectAccess('write'),
  validate(validationSchemas.updateProject),
  asyncHandler(async (req, res) => {
    const projectId = req.params.id;
    const updates = req.body;

    // Construire la requête de mise à jour dynamiquement
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        const dbField = key === 'surfaceArea' ? 'surface_area' : 
                       key === 'ownerName' ? 'owner_name' :
                       key === 'startDate' ? 'start_date' :
                       key === 'endDate' ? 'end_date' : key;
        
        updateFields.push(`${dbField} = $${paramCount++}`);
        values.push(updates[key]);
      }
    });

    if (updateFields.length === 0) {
      throw createError('Aucune donnée à mettre à jour', 400, 'NO_UPDATES');
    }

    // Ajouter updated_at et l'ID du projet
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(projectId);

    const queryText = `
      UPDATE projects 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(queryText, values);

    if (result.rows.length === 0) {
      throw createNotFoundError('Projet');
    }

    const project = result.rows[0];

    // Logger la mise à jour
    logAudit('PROJECT_UPDATED', req.user.id, {
      projectId: project.id,
      projectCode: project.code,
      updatedFields: Object.keys(updates),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info('Projet mis à jour', {
      projectId: project.id,
      projectCode: project.code,
      updatedFields: Object.keys(updates),
      userId: req.user.id
    });

    res.json({
      message: 'Projet mis à jour avec succès',
      project: {
        id: project.id,
        code: project.code,
        name: project.name,
        description: project.description,
        address: project.address,
        type: project.type,
        surfaceArea: project.surface_area,
        ownerName: project.owner_name,
        status: project.status,
        visibility: project.visibility,
        startDate: project.start_date,
        endDate: project.end_date,
        budget: project.budget,
        updatedAt: project.updated_at
      }
    });
  })
);

// ========================================
// ROUTES MEMBRES DE PROJET
// ========================================

// GET /api/projects/:id/members - Lister les membres d'un projet
router.get('/:id/members',
  authenticateToken,
  requireProjectAccess('read'),
  asyncHandler(async (req, res) => {
    const projectId = req.params.id;

    const result = await query(
      `SELECT 
        pm.*,
        u.full_name,
        u.email,
        u.role as global_role,
        u.avatar_url,
        u.job_title,
        u.company_name,
        inviter.full_name as invited_by_name
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      LEFT JOIN users inviter ON pm.invited_by = inviter.id
      WHERE pm.project_id = $1 AND pm.is_active = true
      ORDER BY 
        CASE pm.role_in_project 
          WHEN 'owner' THEN 1
          WHEN 'admin' THEN 2
          ELSE 3
        END,
        pm.joined_at ASC`,
      [projectId]
    );

    const members = result.rows.map(member => ({
      userId: member.user_id,
      fullName: member.full_name,
      email: member.email,
      globalRole: member.global_role,
      roleInProject: member.role_in_project,
      avatarUrl: member.avatar_url,
      jobTitle: member.job_title,
      companyName: member.company_name,
      invitedByName: member.invited_by_name,
      joinedAt: member.joined_at,
      isActive: member.is_active
    }));

    res.json({ members });
  })
);

// POST /api/projects/:id/members - Ajouter un membre au projet (owner/admin)
router.post('/:id/members',
  authenticateToken,
  requireProjectAccess('write'),
  validate(validationSchemas.inviteUser),
  asyncHandler(async (req, res) => {
    const projectId = req.params.id;
    const { email, role } = req.body;

    // Vérifier que l'utilisateur existe
    const userResult = await query(
      'SELECT id, full_name, email FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      throw createError('Utilisateur non trouvé', 404, 'USER_NOT_FOUND');
    }

    const user = userResult.rows[0];

    // Vérifier que l'utilisateur n'est pas déjà membre
    const existingMember = await query(
      'SELECT id FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, user.id]
    );

    if (existingMember.rows.length > 0) {
      throw createError('Cet utilisateur est déjà membre du projet', 409, 'USER_ALREADY_MEMBER');
    }

    // Ajouter le membre
    await query(
      `INSERT INTO project_members (project_id, user_id, role_in_project, invited_by)
       VALUES ($1, $2, $3, $4)`,
      [projectId, user.id, role, req.user.id]
    );

    // Logger l'ajout
    logAudit('PROJECT_MEMBER_ADDED', req.user.id, {
      projectId,
      addedUserId: user.id,
      addedUserEmail: user.email,
      role,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info('Membre ajouté au projet', {
      projectId,
      addedUserId: user.id,
      addedUserEmail: user.email,
      role,
      userId: req.user.id
    });

    res.status(201).json({
      message: 'Membre ajouté avec succès',
      member: {
        userId: user.id,
        fullName: user.full_name,
        email: user.email,
        roleInProject: role,
        joinedAt: new Date().toISOString()
      }
    });
  })
);

// DELETE /api/projects/:id/members/:userId - Supprimer un membre du projet (owner/admin)
router.delete('/:id/members/:userId',
  authenticateToken,
  requireProjectAccess('write'),
  asyncHandler(async (req, res) => {
    const projectId = req.params.id;
    const userId = req.params.userId;

    // Vérifier que l'utilisateur est membre du projet
    const memberResult = await query(
      `SELECT pm.*, u.full_name, u.email
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = $1 AND pm.user_id = $2`,
      [projectId, userId]
    );

    if (memberResult.rows.length === 0) {
      throw createError('Membre non trouvé dans ce projet', 404, 'MEMBER_NOT_FOUND');
    }

    const member = memberResult.rows[0];

    // Empêcher la suppression du propriétaire
    if (member.role_in_project === 'owner') {
      throw createPermissionError('Impossible de supprimer le propriétaire du projet');
    }

    // Supprimer le membre
    await query(
      'DELETE FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );

    // Logger la suppression
    logAudit('PROJECT_MEMBER_REMOVED', req.user.id, {
      projectId,
      removedUserId: userId,
      removedUserEmail: member.email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info('Membre supprimé du projet', {
      projectId,
      removedUserId: userId,
      removedUserEmail: member.email,
      userId: req.user.id
    });

    res.json({
      message: 'Membre supprimé avec succès'
    });
  })
);

export default router;
