const { sequelize } = require('../config/database');
const User = require('./User');
const Vehicle = require('./Vehicle');
const Driver = require('./Driver');
const Maintenance = require('./Maintenance');

// Définir les relations entre les modèles

// Un utilisateur peut être un chauffeur (relation un-à-un)
User.hasOne(Driver, {
  foreignKey: 'userId',
  as: 'driverProfile'
});

Driver.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Un véhicule peut avoir plusieurs maintenances
Vehicle.hasMany(Maintenance, {
  foreignKey: 'vehicleId',
  as: 'maintenances'
});

Maintenance.belongsTo(Vehicle, {
  foreignKey: 'vehicleId',
  as: 'vehicle'
});

// Un chauffeur peut être assigné à un véhicule
Driver.belongsTo(Vehicle, {
  foreignKey: 'vehicleId',
  as: 'assignedVehicle'
});

Vehicle.hasMany(Driver, {
  foreignKey: 'vehicleId',
  as: 'drivers'
});

// Synchroniser les modèles avec la base de données
const syncModels = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('✅ Modèles synchronisés avec la base de données');
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation des modèles:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Vehicle,
  Driver,
  Maintenance,
  syncModels
};
