require('dotenv').config({ path: './.env' });
const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { sequelize, testConnection } = require('./src/config/database');
const { errorHandler, notFound } = require('./src/middleware/error');
const logger = require('./src/utils/logger');

// Importer les routes
const authRoutes = require('./src/routes/auth');
const vehicleRoutes = require('./src/routes/vehicles');
const driverRoutes = require('./src/routes/drivers');
const maintenanceRoutes = require('./src/routes/maintenances');

const app = express();
const PORT = process.env.PORT || 3001;

// Tester la connexion à la base de données
const initializeDatabase = async () => {
  try {
    await testConnection();
    
    // Synchronisation des modèles avec la base de données
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('Modèles synchronisés avec la base de données');
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    process.exit(1); // Arrêter l'application en cas d'échec de connexion
  }
};

// Initialiser la base de données
initializeDatabase();

// Middleware pour parser le body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Sécurité
// Protéger contre les attaques XSS
app.use(xss());

// Protéger contre l'injection NoSQL
app.use(mongoSanitize());

// Protéger contre la pollution des paramètres HTTP
app.use(
  hpp({
    whitelist: ['duration']
  })
);

// Configurer les en-têtes de sécurité avec Helmet
app.use(helmet());

// Activer CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : 'http://localhost:3000',
  credentials: true
}));

// Limiter le taux de requêtes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par fenêtre
  message: 'Trop de requêtes depuis cette adresse IP, veuillez réessayer plus tard'
});
app.use('/api', limiter);

// Logger les requêtes
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`);
  next();
});

// Configuration des types MIME personnalisés
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.woff2': 'font/woff2',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

// Middleware pour servir les fichiers statiques avec les bons en-têtes
app.use(express.static(path.join(__dirname), {
  setHeaders: (res, path) => {
    // Désactive le MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Définit les en-têtes de sécurité
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Définit le type MIME approprié en fonction de l'extension du fichier
    const ext = path.match(/\.(\w+)$/)?.[1]?.toLowerCase();
    if (ext && mimeTypes[`.${ext}`]) {
      res.setHeader('Content-Type', mimeTypes[`.${ext}`]);
    }
    
    // Active la mise en cache pour les fichiers statiques
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
}));

// Servir les fichiers statiques du répertoire public
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath);
    if (mimeTypes[ext]) {
      res.setHeader('Content-Type', mimeTypes[ext]);
    }
    // Ajouter des en-têtes de sécurité
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
}));

// Routes API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/vehicles', vehicleRoutes);
app.use('/api/v1/drivers', driverRoutes);
app.use('/api/v1/maintenances', maintenanceRoutes);

// Servir les fichiers statiques en production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
  });
} else {
  // Route pour la racine en développement
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });
}

// Routes pour les fichiers CSS (compatibilité)
app.get('/style.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'css', 'pages', 'style.css'), {
    headers: {
      'Content-Type': 'text/css',
      'Cache-Control': 'public, max-age=86400' // 24 heures de cache
    }
  });
});

// Route pour les fichiers JavaScript
app.get('/js/modules/:filename', (req, res) => {
  const filename = req.params.filename;
  res.sendFile(path.join(__dirname, 'public', 'js', 'modules', filename), {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=31536000'
    }
  });
});

// Route pour les fichiers partiels
app.get('/partials/:filename', (req, res) => {
  const filename = req.params.filename;
  res.sendFile(path.join(__dirname, 'public', 'partials', filename), {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=3600'
    }
  });
});

// Route pour les fichiers CSS des composants
app.get('/css/components/:filename', (req, res) => {
  const filename = req.params.filename;
  res.sendFile(path.join(__dirname, 'public', 'css', 'components', filename), {
    headers: {
      'Content-Type': 'text/css',
      'Cache-Control': 'public, max-age=31536000'
    }
  });
});

// Désactive l'en-tête X-Powered-By
app.disable('x-powered-by');

// Liste des routes principales
const mainRoutes = [
  '/',
  '/index.html',
  '/agenda.html',
  '/auth.html',
  '/auto_backup.html',
  '/auto_restore.html',
  '/bus.html',
  '/chauffeurs.html',
  '/finance.html',
  '/finance_fixed.html',
  '/historique.html',
  '/login.html',
  '/logo-upload.html',
  '/maintenance.html',
  '/offline.html',
  '/parametres.html',
  '/statistiques.html',
  '/vehicules.html'
];

// Cr�f©er des routes pour toutes les pages principales
mainRoutes.forEach(route => {
  const file = route === '/' ? 'index.html' : route.replace(/^\//, '');
  
  app.get(route, (req, res) => {
    const filePath = path.join(__dirname, file);
    
    // V�f©rifier si le fichier existe
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        // Si le fichier n'existe pas, renvoyer une erreur 404
        res.status(404).send('Page non trouv�f©e');
        return;
      }
      
      // Ajouter des en-t�fªtes de s�f©curit�f© pour les r�f©ponses HTML
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      
      // Envoyer le fichier
      res.sendFile(filePath);
    });
  });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).send('Page non trouv�f©e');
});

// Gestion des erreurs globales
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).send('Erreur serveur');
});

// Démarrer le serveur
app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  logger.info(`Serveur en cours d'exécution sur le port ${PORT} en mode ${process.env.NODE_ENV || 'développement'}`);
});

// Gestion des erreurs non gérées
process.on('unhandledRejection', (err, promise) => {
  logger.error(`Erreur non gérée: ${err.message}`);
  // Fermer le serveur et sortir du processus
  server.close(() => process.exit(1));
});

// Gestion de l'arrêt propre du serveur
process.on('SIGINT', () => {
  console.log('\nArrêt du serveur...');
  server.close(() => {
    console.log('Serveur arrêté');
    process.exit(0);
  });
});

// Exporter l'application pour les tests
module.exports = app;
