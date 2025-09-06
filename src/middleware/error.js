const ErrorResponse = require('../utils/errorResponse');
const logger = require('../utils/logger');

// Gestionnaire d'erreurs personnalisé
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log l'erreur pour le développement
  logger.error(err.stack);

  // Erreur Mongoose pour un ObjectId invalide
  if (err.name === 'CastError') {
    const message = `Ressource non trouvée avec l'ID ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }

  // Erreur de doublon de clé unique
  if (err.code === 11000) {
    const message = 'Une ressource avec cette valeur existe déjà';
    error = new ErrorResponse(message, 400);
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Jeton non valide';
    error = new ErrorResponse(message, 401);
  }

  // Erreur d'expiration du JWT
  if (err.name === 'TokenExpiredError') {
    const message = 'La session a expiré, veuillez vous reconnecter';
    error = new ErrorResponse(message, 401);
  }

  // Réponse d'erreur
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Erreur serveur'
  });
};

// Gestion des routes non trouvées
const notFound = (req, res, next) => {
  const error = new ErrorResponse(`Route non trouvée - ${req.originalUrl}`, 404);
  next(error);
};

module.exports = {
  errorHandler,
  notFound
};
