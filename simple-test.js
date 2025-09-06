require('dotenv').config();
const { Sequelize } = require('sequelize');

console.log('Tentative de connexion à la base de données...');
console.log(`Hôte: ${process.env.DB_HOST}`);
console.log(`Port: ${process.env.DB_PORT}`);
console.log(`Base de données: ${process.env.DB_NAME}`);
console.log(`Utilisateur: ${process.env.DB_USER}`);

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: console.log
  }
);

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie avec succès !');
    
    // Vérifier si la base de données existe
    const [results] = await sequelize.query("SELECT current_database()");
    console.log('Base de données connectée :', results[0].current_database);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Impossible de se connecter à la base de données :', error);
    process.exit(1);
  }
}

testConnection();
