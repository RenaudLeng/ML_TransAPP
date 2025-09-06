const express = require('express');
const {
  getMaintenances,
  getMaintenance,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
  getMaintenancesByVehicle,
  getMaintenanceStats,
  planifierMaintenance,
  terminerMaintenance
} = require('../controllers/maintenanceController');

const Maintenance = require('../models/Maintenance');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Middleware d'authentification pour toutes les routes
router.use(protect);

// Routes pour /api/v1/maintenances
router
  .route('/')
  .get(
    authorize('admin', 'gestionnaire', 'chauffeur'),
    advancedResults(Maintenance, 'vehicule'),
    getMaintenances
  )
  .post(authorize('admin', 'gestionnaire'), createMaintenance);

// Routes pour /api/v1/maintenances/stats
router
  .route('/stats')
  .get(authorize('admin', 'gestionnaire'), getMaintenanceStats);

// Routes pour /api/v1/maintenances/planifier
router
  .route('/planifier')
  .post(authorize('admin', 'gestionnaire'), planifierMaintenance);

// Routes pour /api/v1/maintenances/:id
router
  .route('/:id')
  .get(authorize('admin', 'gestionnaire', 'chauffeur'), getMaintenance)
  .put(authorize('admin', 'gestionnaire'), updateMaintenance)
  .delete(authorize('admin'), deleteMaintenance);

// Route pour terminer une maintenance
// /api/v1/maintenances/:id/terminer
router
  .route('/:id/terminer')
  .put(authorize('admin', 'gestionnaire'), terminerMaintenance);

// Routes pour les maintenances d'un véhicule spécifique
// /api/v1/vehicles/:vehicleId/maintenances
router
  .route('/vehicles/:vehicleId/maintenances')
  .get(authorize('admin', 'gestionnaire', 'chauffeur'), getMaintenancesByVehicle);

module.exports = router;
