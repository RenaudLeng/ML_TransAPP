/**
 * Configuration de sécurité pour l'application
 * Utilise helmet.js pour sécuriser les en-têtes HTTP
 */

const helmet = require('helmet');

// Configuration CSP (Content Security Policy)
const cspConfig = {
  directives: {
    defaultSrc: ['\'self\''],
    scriptSrc: [
      '\'self\'',
      'https://cdn.jsdelivr.net',
      'https://unpkg.com',
      '\'unsafe-inline\'',
      '\'unsafe-eval\''
    ],
    styleSrc: [
      '\'self\'',
      'https:',
      'http:',
      '\'unsafe-inline\'',
      'http://localhost:3001',
      'https://unpkg.com',
      'https://cdn.jsdelivr.net'
    ],
    styleSrcElem: [
      '\'self\'',
      'https:',
      'http:',
      '\'unsafe-inline\'',
      'http://localhost:3001',
      'https://unpkg.com',
      'https://cdn.jsdelivr.net'
    ],
    scriptSrcElem: [
      '\'self\'',
      'https://cdn.jsdelivr.net',
      'https://unpkg.com',
      'http://localhost:3001',
      '\'unsafe-inline\''
    ],
    imgSrc: [
      '\'self\'',
      'data:',
      'https:',
      'http:',
      'http://localhost:3001',
      'blob:'
    ],
    fontSrc: [
      '\'self\'',
      'https:',
      'http:',
      'data:',
      'https://cdn.jsdelivr.net',
      'https://unpkg.com'
    ],
    connectSrc: [
      '\'self\'',
      'http://localhost:3001',
      'https:',
      'wss:'
    ],
    frameAncestors: ['\'none\''],
    formAction: ['\'self\''],
    objectSrc: ['\'none\''],
    baseUri: ['\'self\''],
    upgradeInsecureRequests: []
  }
};

// Configuration HSTS (HTTP Strict Transport Security)
const hstsConfig = {
  maxAge: 31536000, // 1 an en secondes
  includeSubDomains: true,
  preload: true
};

// Middleware de sécurité
const securityMiddleware = [
  // Protège contre les attaques XSS (Cross-Site Scripting)
  helmet.xssFilter(),
  
  // Désactive le header X-Powered-By
  helmet.hidePoweredBy(),
  
  // Empêche le MIME-sniffing
  helmet.noSniff(),
  
  // Active la protection contre le clickjacking
  helmet.frameguard({ action: 'deny' }),
  
  // Ajoute des en-têtes de sécurité HSTS
  helmet.hsts(hstsConfig),
  
  // Désactive le préchargement DNS
  helmet.dnsPrefetchControl({ allow: false }),
  
  // Désactive la mise en cache côté client
  (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
  },
  
  // Désactive le contenu de type MIME non déclaré
  helmet.ieNoOpen(),
  
  // Configure la politique de sécurité du contenu (CSP)
  helmet.contentSecurityPolicy(cspConfig)
];

module.exports = securityMiddleware;
