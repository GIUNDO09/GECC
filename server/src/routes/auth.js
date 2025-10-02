/**
 * ========================================
 * ROUTES AUTHENTIFICATION GECC
 * ========================================
 * Routes pour l'authentification des utilisateurs
 * ========================================
 */

import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/connection.js';
import { jwtConfig } from '../config/index.js';
import { logger, logAudit } from '../config/logger.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validate, validationSchemas } from '../middleware/validation.js';
import { asyncHandler, createError, createAuthError } from '../middleware/errorHandler.js';

const router = express.Router();

// Fonction pour générer les tokens JWT
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    jwtConfig.refreshSecret,
    { expiresIn: jwtConfig.refreshExpiresIn }
  );

  return { accessToken, refreshToken };
};

// POST /api/auth/signup - Inscription
router.post('/signup', 
  validate(validationSchemas.register),
  asyncHandler(async (req, res) => {
    const { email, password, fullName, role, companyName, jobTitle } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw createError('Un utilisateur avec cet email existe déjà', 409, 'USER_EXISTS');
    }

    // Hacher le mot de passe
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Créer l'utilisateur
    const result = await query(
      `INSERT INTO users (email, password_hash, full_name, role, company_name, job_title)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, full_name, role, company_name, job_title, created_at`,
      [email, passwordHash, fullName, role, companyName, jobTitle]
    );

    const user = result.rows[0];

    // Générer les tokens
    const tokens = generateTokens(user.id);

    // Logger l'inscription
    logAudit('USER_REGISTERED', user.id, {
      email: user.email,
      role: user.role,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info('Nouvel utilisateur inscrit', {
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // Définir le cookie refresh token
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
    });

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        companyName: user.company_name,
        jobTitle: user.job_title,
        createdAt: user.created_at
      },
      accessToken: tokens.accessToken
    });
  })
);

// POST /api/auth/login - Connexion
router.post('/login',
  validate(validationSchemas.login),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Récupérer l'utilisateur
    const result = await query(
      'SELECT id, email, password_hash, full_name, role, is_active, is_verified FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw createAuthError('Email ou mot de passe incorrect');
    }

    const user = result.rows[0];

    // Vérifier si le compte est actif
    if (!user.is_active) {
      throw createError('Compte désactivé', 403, 'ACCOUNT_DISABLED');
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw createAuthError('Email ou mot de passe incorrect');
    }

    // Mettre à jour la dernière connexion
    await query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Générer les tokens
    const tokens = generateTokens(user.id);

    // Logger la connexion
    logAudit('USER_LOGIN', user.id, {
      email: user.email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info('Utilisateur connecté', {
      userId: user.id,
      email: user.email
    });

    // Définir le cookie refresh token
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
    });

    res.json({
      message: 'Connexion réussie',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        isVerified: user.is_verified
      },
      accessToken: tokens.accessToken
    });
  })
);

// POST /api/auth/refresh - Renouveler le token
router.post('/refresh', asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    throw createAuthError('Refresh token requis');
  }

  try {
    const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret);
    
    if (decoded.type !== 'refresh') {
      throw createAuthError('Token invalide');
    }

    // Vérifier que l'utilisateur existe toujours
    const result = await query(
      'SELECT id, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      throw createAuthError('Utilisateur non trouvé ou inactif');
    }

    // Générer un nouveau token d'accès
    const newAccessToken = jwt.sign(
      { userId: decoded.userId, type: 'access' },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    res.json({
      message: 'Token renouvelé avec succès',
      accessToken: newAccessToken
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw createAuthError('Refresh token invalide ou expiré');
    }
    throw error;
  }
}));

// POST /api/auth/logout - Déconnexion
router.post('/logout', authenticateToken, asyncHandler(async (req, res) => {
  // Logger la déconnexion
  logAudit('USER_LOGOUT', req.user.id, {
    email: req.user.email,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  logger.info('Utilisateur déconnecté', {
    userId: req.user.id,
    email: req.user.email
  });

  // Supprimer le cookie refresh token
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  res.json({
    message: 'Déconnexion réussie'
  });
}));

// GET /api/auth/me - Profil utilisateur actuel
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT id, email, full_name, role, company_name, job_title, description, 
            avatar_url, is_verified, last_login_at, created_at, updated_at
     FROM users WHERE id = $1`,
    [req.user.id]
  );

  if (result.rows.length === 0) {
    throw createError('Utilisateur non trouvé', 404, 'USER_NOT_FOUND');
  }

  const user = result.rows[0];

  res.json({
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      companyName: user.company_name,
      jobTitle: user.job_title,
      description: user.description,
      avatarUrl: user.avatar_url,
      isVerified: user.is_verified,
      lastLoginAt: user.last_login_at,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }
  });
}));

// PATCH /api/auth/me - Mettre à jour le profil utilisateur
router.patch('/me', 
  authenticateToken,
  validate(validationSchemas.updateProfile),
  asyncHandler(async (req, res) => {
    const { fullName, companyName, jobTitle, description, avatarUrl } = req.body;

    // Construire la requête de mise à jour dynamiquement
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (fullName !== undefined) {
      updates.push(`full_name = $${paramCount++}`);
      values.push(fullName);
    }
    if (companyName !== undefined) {
      updates.push(`company_name = $${paramCount++}`);
      values.push(companyName);
    }
    if (jobTitle !== undefined) {
      updates.push(`job_title = $${paramCount++}`);
      values.push(jobTitle);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (avatarUrl !== undefined) {
      updates.push(`avatar_url = $${paramCount++}`);
      values.push(avatarUrl);
    }

    if (updates.length === 0) {
      throw createError('Aucune donnée à mettre à jour', 400, 'NO_UPDATES');
    }

    // Ajouter updated_at et l'ID utilisateur
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(req.user.id);

    const queryText = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, full_name, role, company_name, job_title, description, 
                avatar_url, is_verified, last_login_at, created_at, updated_at
    `;

    const result = await query(queryText, values);

    if (result.rows.length === 0) {
      throw createError('Utilisateur non trouvé', 404, 'USER_NOT_FOUND');
    }

    const user = result.rows[0];

    // Logger la mise à jour
    logAudit('PROFILE_UPDATED', req.user.id, {
      email: req.user.email,
      updatedFields: Object.keys(req.body),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info('Profil utilisateur mis à jour', {
      userId: req.user.id,
      email: req.user.email,
      updatedFields: Object.keys(req.body)
    });

    res.json({
      message: 'Profil mis à jour avec succès',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        companyName: user.company_name,
        jobTitle: user.job_title,
        description: user.description,
        avatarUrl: user.avatar_url,
        isVerified: user.is_verified,
        lastLoginAt: user.last_login_at,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    });
  })
);

// POST /api/auth/change-password - Changer le mot de passe
router.post('/change-password',
  authenticateToken,
  validate(validationSchemas.changePassword),
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // Récupérer le hash du mot de passe actuel
    const result = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      throw createError('Utilisateur non trouvé', 404, 'USER_NOT_FOUND');
    }

    // Vérifier le mot de passe actuel
    const isValidPassword = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!isValidPassword) {
      throw createAuthError('Mot de passe actuel incorrect');
    }

    // Hacher le nouveau mot de passe
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Mettre à jour le mot de passe
    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, req.user.id]
    );

    // Logger le changement de mot de passe
    logAudit('PASSWORD_CHANGED', req.user.id, {
      email: req.user.email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info('Mot de passe changé', {
      userId: req.user.id,
      email: req.user.email
    });

    res.json({
      message: 'Mot de passe modifié avec succès'
    });
  })
);

export default router;
