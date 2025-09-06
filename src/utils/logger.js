const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs = require('fs');

// Créer le répertoire de logs s'il n'existe pas
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'ml-transport-app' },
  transports: [
    // Écrire tous les logs avec le niveau 'error' et inférieur dans 'error.log'
    new transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error' 
    }),
    // Écrire tous les logs avec le niveau 'info' et inférieur dans 'combined.log'
    new transports.File({ 
      filename: path.join(logDir, 'combined.log') 
    })
  ]
});

// Si on n'est pas en production, on affiche aussi les logs dans la console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    )
  }));
}

module.exports = logger;
