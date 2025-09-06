require('dotenv').config();
const { syncModels } = require('./src/models');

async function testSync() {
  try {
    console.log('Début de la synchronisation des modèles...');
    await syncModels(true); // true pour forcer la récréation des tables
    console.log('✅ Synchronisation terminée avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation :', error);
    process.exit(1);
  }
}

testSync();
