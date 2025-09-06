const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

// Configuration CORS
const configureCors = () => {
  return cors({
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.ALLOWED_ORIGINS.split(',')
      : 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  });
};

// Configuration du rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par fenêtre
  message: 'Trop de requêtes depuis cette adresse IP, veuillez réessayer après 15 minutes'
});

// Configuration de la sécurité
const securityMiddleware = (app) => {
  // Helmet pour sécuriser les en-têtes HTTP
  app.use(helmet());

  // Protection contre les attaques XSS
  app.use(xss());

  // Protection contre les injections NoSQL
  app.use(mongoSanitize());

  // Protection contre la pollution des paramètres HTTP
  app.use(hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  }));

  // Désactiver le header X-Powered-By
  app.disable('x-powered-by');

  // Configuration CORS
  app.use(configureCors());

  // Ajouter des en-têtes de sécurité supplémentaires
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader('Feature-Policy', "geolocation 'none'; microphone 'none'; camera 'none'");
    next();
  });
};

module.exports = {
  securityMiddleware,
  limiter
};
