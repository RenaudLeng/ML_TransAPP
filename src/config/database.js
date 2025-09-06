const { Sequelize } = require('sequelize');
require('dotenv').config();
const logger = require('../utils/logger');

// Afficher les informations de connexion (sans le mot de passe pour des raisons de sécurité)
console.log('Tentative de connexion à la base de données avec les paramètres :');
console.log(`- Hôte: ${process.env.DB_HOST}`);
console.log(`- Port: ${process.env.DB_PORT}`);
console.log(`- Base de données: ${process.env.DB_NAME}`);
console.log(`- Utilisateur: ${process.env.DB_USER}`);
console.log(`- Dialecte: postgres`);

// Configuration de la connexion à la base de données
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: (msg) => {
      console.log(msg); // Afficher toutes les requêtes SQL
      if (process.env.NODE_ENV === 'development') {
        logger.info(msg);
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

// Fonction pour tester la connexion à la base de données
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Connexion à la base de données établie avec succès.');
    return true;
  } catch (error) {
    logger.error('Impossible de se connecter à la base de données:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection,
  Sequelize
};
