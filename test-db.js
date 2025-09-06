require('dotenv').config();
const { sequelize } = require('./src/config/database');

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie avec succès.');
    
    // Vérifier si la table des utilisateurs existe
    const [results] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Users'"
    );
    
    if (results.length > 0) {
      console.log('✅ La table des utilisateurs existe déjà.');
    } else {
      console.log('ℹ️ La table des utilisateurs n\'existe pas encore. Elle sera créée au démarrage de l\'application.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Impossible de se connecter à la base de données :', error);
    process.exit(1);
  }
}

testConnection();
