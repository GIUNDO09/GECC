/**
 * ========================================
 * MIDDLEWARE DE GESTION D'ERREURS
 * ========================================
 * Gestion centralisée des erreurs
 * ========================================
 */

const errorHandler = (err, req, res, next) => {
  console.error('Erreur:', err);

  // Erreur de validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Données invalides',
      code: 'VALIDATION_ERROR',
      details: err.message
    });
  }

  // Erreur de contrainte de base de données
  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(409).json({
      error: 'Conflit de données',
      code: 'CONSTRAINT_ERROR',
      details: 'Une ressource avec ces données existe déjà'
    });
  }

  // Erreur de fichier non trouvé
  if (err.code === 'ENOENT') {
    return res.status(404).json({
      error: 'Fichier non trouvé',
      code: 'FILE_NOT_FOUND'
    });
  }

  // Erreur de taille de fichier
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'Fichier trop volumineux',
      code: 'FILE_TOO_LARGE',
      maxSize: process.env.MAX_FILE_SIZE || '10MB'
    });
  }

  // Erreur par défaut
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Erreur interne du serveur' 
      : err.message,
    code: err.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

module.exports = {
  errorHandler
};

