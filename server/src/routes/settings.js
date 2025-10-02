/**
 * ========================================
 * ROUTES PARAMÈTRES UTILISATEUR GECC
 * ========================================
 * Routes pour la gestion des paramètres utilisateur
 * ========================================
 */

import express from 'express';
import { query } from '../db/connection.js';
import { logger, logAudit } from '../config/logger.js';
import { authenticateToken } from '../middleware/auth.js';
import { validate, validationSchemas } from '../middleware/validation.js';
import { asyncHandler, createError, createNotFoundError } from '../middleware/errorHandler.js';

const router = express.Router();

// ========================================
// ROUTES PARAMÈTRES
// ========================================

// GET /api/settings - Récupérer les paramètres utilisateur
router.get('/',
  authenticateToken,
  validate(validationSchemas.getSettings),
  asyncHandler(async (req, res) => {
    const { keys, public: publicOnly } = req.query;
    
    let whereClause = 'WHERE user_id = $1';
    const queryParams = [req.user.id];
    let paramCount = 1;

    // Filtrer par clés spécifiques
    if (keys) {
      const keyList = keys.split(',').map(key => key.trim());
      const placeholders = keyList.map((_, index) => `$${paramCount + index + 1}`).join(',');
      whereClause += ` AND setting_key IN (${placeholders})`;
      queryParams.push(...keyList);
      paramCount += keyList.length;
    }

    // Filtrer par paramètres publics
    if (publicOnly === 'true') {
      whereClause += ` AND is_public = true`;
    }

    const result = await query(
      `SELECT setting_key, setting_value, setting_type, is_public, updated_at
       FROM user_settings
       ${whereClause}
       ORDER BY setting_key`,
      queryParams
    );

    // Transformer les résultats en objet
    const settings = {};
    result.rows.forEach(row => {
      let value = row.setting_value;
      
      // Parser selon le type
      if (row.setting_type === 'json') {
        try {
          value = JSON.parse(row.setting_value);
        } catch (e) {
          logger.warn('Erreur de parsing JSON pour le paramètre', {
            userId: req.user.id,
            settingKey: row.setting_key,
            settingValue: row.setting_value
          });
        }
      } else if (row.setting_type === 'number') {
        value = parseFloat(row.setting_value);
      } else if (row.setting_type === 'boolean') {
        value = row.setting_value === 'true';
      } else if (row.setting_type === 'array') {
        try {
          value = JSON.parse(row.setting_value);
        } catch (e) {
          value = row.setting_value.split(',');
        }
      }

      settings[row.setting_key] = {
        value,
        type: row.setting_type,
        isPublic: row.is_public,
        updatedAt: row.updated_at
      };
    });

    res.json({ settings });
  })
);

// PUT /api/settings - Mettre à jour les paramètres utilisateur
router.put('/',
  authenticateToken,
  validate(validationSchemas.updateSettings),
  asyncHandler(async (req, res) => {
    const { settings } = req.body;
    const updatedSettings = {};
    const errors = [];

    // Traiter chaque paramètre
    for (const [key, value] of Object.entries(settings)) {
      try {
        // Déterminer le type et la valeur
        let settingType = 'string';
        let settingValue = value;

        if (typeof value === 'object' && value !== null) {
          settingType = 'json';
          settingValue = JSON.stringify(value);
        } else if (typeof value === 'number') {
          settingType = 'number';
          settingValue = value.toString();
        } else if (typeof value === 'boolean') {
          settingType = 'boolean';
          settingValue = value.toString();
        } else if (Array.isArray(value)) {
          settingType = 'array';
          settingValue = JSON.stringify(value);
        } else {
          settingValue = value.toString();
        }

        // Vérifier si le paramètre existe déjà
        const existingResult = await query(
          'SELECT id FROM user_settings WHERE user_id = $1 AND setting_key = $2',
          [req.user.id, key]
        );

        if (existingResult.rows.length > 0) {
          // Mettre à jour le paramètre existant
          await query(
            `UPDATE user_settings 
             SET setting_value = $1, setting_type = $2, updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $3 AND setting_key = $4`,
            [settingValue, settingType, req.user.id, key]
          );
        } else {
          // Créer un nouveau paramètre
          await query(
            `INSERT INTO user_settings (user_id, setting_key, setting_value, setting_type)
             VALUES ($1, $2, $3, $4)`,
            [req.user.id, key, settingValue, settingType]
          );
        }

        // Stocker la valeur parsée pour la réponse
        updatedSettings[key] = {
          value: value,
          type: settingType,
          updatedAt: new Date().toISOString()
        };

      } catch (error) {
        logger.error('Erreur lors de la mise à jour du paramètre', {
          userId: req.user.id,
          settingKey: key,
          settingValue: value,
          error: error.message
        });
        errors.push(`Erreur pour le paramètre ${key}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      throw createError(`Erreurs lors de la mise à jour: ${errors.join(', ')}`, 400, 'SETTINGS_UPDATE_ERROR');
    }

    // Logger la mise à jour
    logAudit('SETTINGS_UPDATED', req.user.id, {
      email: req.user.email,
      updatedSettings: Object.keys(settings),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info('Paramètres utilisateur mis à jour', {
      userId: req.user.id,
      updatedSettings: Object.keys(settings)
    });

    res.json({
      message: 'Paramètres mis à jour avec succès',
      settings: updatedSettings
    });
  })
);

// DELETE /api/settings/:key - Supprimer un paramètre utilisateur
router.delete('/:key',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { key } = req.params;

    // Vérifier que le paramètre existe
    const existingResult = await query(
      'SELECT id FROM user_settings WHERE user_id = $1 AND setting_key = $2',
      [req.user.id, key]
    );

    if (existingResult.rows.length === 0) {
      throw createNotFoundError('Paramètre');
    }

    // Supprimer le paramètre
    await query(
      'DELETE FROM user_settings WHERE user_id = $1 AND setting_key = $2',
      [req.user.id, key]
    );

    // Logger la suppression
    logAudit('SETTING_DELETED', req.user.id, {
      email: req.user.email,
      settingKey: key,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info('Paramètre utilisateur supprimé', {
      userId: req.user.id,
      settingKey: key
    });

    res.json({
      message: 'Paramètre supprimé avec succès'
    });
  })
);

// GET /api/settings/public/:userId - Récupérer les paramètres publics d'un utilisateur
router.get('/public/:userId',
  asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // Vérifier que l'utilisateur existe
    const userResult = await query(
      'SELECT id, full_name FROM users WHERE id = $1 AND is_active = true',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw createNotFoundError('Utilisateur');
    }

    const user = userResult.rows[0];

    // Récupérer les paramètres publics
    const result = await query(
      `SELECT setting_key, setting_value, setting_type, updated_at
       FROM user_settings
       WHERE user_id = $1 AND is_public = true
       ORDER BY setting_key`,
      [userId]
    );

    // Transformer les résultats en objet
    const publicSettings = {};
    result.rows.forEach(row => {
      let value = row.setting_value;
      
      // Parser selon le type
      if (row.setting_type === 'json') {
        try {
          value = JSON.parse(row.setting_value);
        } catch (e) {
          value = row.setting_value;
        }
      } else if (row.setting_type === 'number') {
        value = parseFloat(row.setting_value);
      } else if (row.setting_type === 'boolean') {
        value = row.setting_value === 'true';
      } else if (row.setting_type === 'array') {
        try {
          value = JSON.parse(row.setting_value);
        } catch (e) {
          value = row.setting_value.split(',');
        }
      }

      publicSettings[row.setting_key] = {
        value,
        type: row.setting_type,
        updatedAt: row.updated_at
      };
    });

    res.json({
      user: {
        id: user.id,
        fullName: user.full_name
      },
      publicSettings
    });
  })
);

// POST /api/settings/reset - Réinitialiser les paramètres par défaut
router.post('/reset',
  authenticateToken,
  asyncHandler(async (req, res) => {
    // Supprimer tous les paramètres existants
    await query(
      'DELETE FROM user_settings WHERE user_id = $1',
      [req.user.id]
    );

    // Insérer les paramètres par défaut
    const defaultSettings = [
      { key: 'theme', value: 'light', type: 'string' },
      { key: 'language', value: 'fr', type: 'string' },
      { key: 'notifications', value: JSON.stringify({
        email: true,
        push: true,
        project_updates: true,
        invitations: true
      }), type: 'json' },
      { key: 'dashboard_layout', value: JSON.stringify({
        widgets: ['projects', 'tasks', 'notifications'],
        columns: 2
      }), type: 'json' }
    ];

    for (const setting of defaultSettings) {
      await query(
        `INSERT INTO user_settings (user_id, setting_key, setting_value, setting_type)
         VALUES ($1, $2, $3, $4)`,
        [req.user.id, setting.key, setting.value, setting.type]
      );
    }

    // Logger la réinitialisation
    logAudit('SETTINGS_RESET', req.user.id, {
      email: req.user.email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info('Paramètres utilisateur réinitialisés', {
      userId: req.user.id
    });

    res.json({
      message: 'Paramètres réinitialisés avec succès',
      defaultSettings: {
        theme: 'light',
        language: 'fr',
        notifications: {
          email: true,
          push: true,
          project_updates: true,
          invitations: true
        },
        dashboard_layout: {
          widgets: ['projects', 'tasks', 'notifications'],
          columns: 2
        }
      }
    });
  })
);

export default router;
