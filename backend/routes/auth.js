/**
 * ========================================
 * ROUTES D'AUTHENTIFICATION
 * ========================================
 * Routes pour l'inscription, connexion,
 * et gestion des tokens JWT
 * ========================================
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { createUser, getUserByEmail, getUserById } = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur
 */
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères'),
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('role').isIn(['architect', 'bct', 'bet', 'contractor', 'admin']).withMessage('Rôle invalide')
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

    const { name, email, password, role } = req.body;

    // Vérification si l'utilisateur existe déjà
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: 'Un utilisateur avec cet email existe déjà',
        code: 'USER_EXISTS'
      });
    }

    // Hachage du mot de passe
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Création de l'utilisateur
    const user = await createUser({
      name,
      email,
      password: hashedPassword,
      role,
      companyId: null
    });

    // Génération des tokens
    const tokens = generateTokens(user.id);

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      ...tokens
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * POST /api/auth/login
 * Connexion d'un utilisateur
 */
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis')
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

    const { email, password } = req.body;

    // Récupération de l'utilisateur
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Email ou mot de passe incorrect',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Vérification du mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Email ou mot de passe incorrect',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Génération des tokens
    const tokens = generateTokens(user.id);

    res.json({
      message: 'Connexion réussie',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      ...tokens
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * POST /api/auth/refresh
 * Renouvellement du token d'accès
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        error: 'Refresh token requis',
        code: 'REFRESH_TOKEN_REQUIRED'
      });
    }

    // Vérification du refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    
    // Récupération de l'utilisateur
    const user = await getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND'
      });
    }

    // Génération d'un nouveau token d'accès
    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    res.json({
      accessToken,
      tokenType: 'Bearer'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Refresh token expiré',
        code: 'REFRESH_TOKEN_EXPIRED'
      });
    } else {
      console.error('Erreur lors du renouvellement:', error);
      res.status(500).json({
        error: 'Erreur interne du serveur',
        code: 'INTERNAL_ERROR'
      });
    }
  }
});

/**
 * POST /api/auth/logout
 * Déconnexion (invalidation côté client)
 */
router.post('/logout', authenticateToken, (req, res) => {
  // Dans une vraie application, on pourrait invalider le token côté serveur
  // Pour l'instant, on laisse le client gérer la suppression
  res.json({
    message: 'Déconnexion réussie'
  });
});

/**
 * GET /api/auth/me
 * Récupération des informations de l'utilisateur connecté
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * Fonction utilitaire pour générer les tokens
 */
function generateTokens(userId) {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_EXPIRES_IN || '7d' }
  );

  return {
    accessToken,
    refreshToken,
    tokenType: 'Bearer',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m'
  };
}

module.exports = router;