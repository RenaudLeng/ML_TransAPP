const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const logger = require('../utils/logger');

// Cache pour les jetons révoqués
const tokenBlacklist = new Set();

/**
 * Ajoute un jeton à la liste noire
 * @param {string} token - Le jeton à révoquer
 * @param {number} expiresIn - Temps d'expiration en secondes
 */
const revokeToken = (token, expiresIn = 3600) => {
  tokenBlacklist.add(token);
  // Supprimer le jeton du cache après expiration
  setTimeout(() => {
    tokenBlacklist.delete(token);
  }, expiresIn * 1000);
};

/**
 * Vérifie si un jeton est révoqué
 * @param {string} token - Le jeton à vérifier
 * @returns {boolean} - Vrai si le jeton est révoqué
 */
const isTokenRevoked = (token) => {
  return tokenBlacklist.has(token);
};

// Protéger les routes
const protect = async (req, res, next) => {
  let token;

  // Récupérer le token depuis le header Authorization ou les cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Vérifier si le token existe
  if (!token) {
    logger.warn('Tentative d\'accès non autorisé - Aucun token fourni', {
      ip: req.ip,
      method: req.method,
      path: req.path
    });
    return next(new ErrorResponse('Non autorisé à accéder à cette ressource', 401));
  }

  // Vérifier si le token est dans la liste noire
  if (isTokenRevoked(token)) {
    logger.warn('Tentative d\'accès avec un token révoqué', {
      ip: req.ip,
      method: req.method,
      path: req.path
    });
    return next(new ErrorResponse('Session expirée. Veuillez vous reconnecter.', 401));
  }

  try {
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Vérifier si l'utilisateur existe toujours
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      logger.warn('Tentative d\'accès avec un token utilisateur invalide', {
        userId: decoded.id,
        ip: req.ip
      });
      return next(new ErrorResponse('Utilisateur non trouvé', 404));
    }

    // Vérifier si le compte est actif
    if (!user.actif) {
      logger.warn('Tentative d\'accès avec un compte désactivé', {
        userId: user._id,
        email: user.email,
        ip: req.ip
      });
      return next(new ErrorResponse('Ce compte a été désactivé', 403));
    }

    // Ajouter l'utilisateur à la requête
    req.user = user;
    req.token = token; // Ajouter le token à la requête pour une utilisation ultérieure

    // Ajouter des en-têtes de sécurité
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');

    next();
  } catch (err) {
    logger.error('Erreur d\'authentification', {
      error: err.message,
      ip: req.ip,
      path: req.path
    });

    if (err.name === 'JsonWebTokenError') {
      return next(new ErrorResponse('Token invalide', 401));
    }
    
    if (err.name === 'TokenExpiredError') {
      return next(new ErrorResponse('Session expirée. Veuillez vous reconnecter.', 401));
    }
    
    return next(new ErrorResponse('Erreur d\'authentification', 401));
  }
};

/**
 * Middleware pour accorder l'accès à des rôles spécifiques
 * @param {...string} roles - Les rôles autorisés
 * @returns {Function} Middleware Express
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorResponse('Non autorisé - Utilisateur non authentifié', 401));
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Tentative d\'accès non autorisé - Rôle insuffisant', {
        userId: req.user._id,
        role: req.user.role,
        requiredRoles: roles,
        path: req.path,
        method: req.method
      });
      
      return next(
        new ErrorResponse(
          `Le rôle ${req.user.role} n'est pas autorisé à accéder à cette ressource`,
          403
        )
      );
    }
    
    next();
  };
};

/**
 * Middleware pour vérifier la propriété ou les droits d'administration
 * @param {string} resourceUserId - L'ID de l'utilisateur propriétaire de la ressource
 * @returns {Function} Middleware Express
 */
const checkOwnership = (resourceUserId) => {
  return (req, res, next) => {
    // L'administrateur peut tout faire
    if (req.user.role === 'admin') {
      return next();
    }

    // Vérifier si l'utilisateur est le propriétaire
    if (req.user.id !== resourceUserId) {
      logger.warn('Tentative d\'accès non autorisé - Propriété invalide', {
        userId: req.user._id,
        resourceOwnerId: resourceUserId,
        path: req.path,
        method: req.method
      });
      
      return next(
        new ErrorResponse('Non autorisé à accéder à cette ressource', 403)
      );
    }
    
    next();
  };
};

module.exports = {
  protect,
  authorize,
  checkOwnership,
  revokeToken,
  isTokenRevoked
};

module.exports = {
  protect,
  authorize
};
