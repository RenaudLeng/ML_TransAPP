require('dotenv').config();
const { syncModels } = require('./src/models');
const app = require('./src/app');

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Synchroniser les modèles avec la base de données
    console.log('🔄 Synchronisation des modèles avec la base de données...');
    await syncModels(process.env.NODE_ENV === 'development');
    
    // Démarrer le serveur
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Base de données: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

// Gérer les erreurs non capturées
process.on('unhandledRejection', (err) => {
  console.error('❌ Erreur non gérée:', err);
  process.exit(1);
});

// Démarrer le serveur
startServer();
