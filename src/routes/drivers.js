const express = require('express');
const {
  getDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver,
  affecterVehicule,
  libererVehicule,
  getDriverStats
} = require('../controllers/driverController');

const Driver = require('../models/Driver');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Middleware d'authentification pour toutes les routes
router.use(protect);

// Routes pour /api/v1/drivers
router
  .route('/')
  .get(
    authorize('admin', 'gestionnaire', 'chauffeur'),
    advancedResults(Driver, 'vehiculeAttribue'),
    getDrivers
  )
  .post(authorize('admin', 'gestionnaire'), createDriver);

// Routes pour /api/v1/drivers/stats
router
  .route('/stats')
  .get(authorize('admin', 'gestionnaire'), getDriverStats);

// Routes pour /api/v1/drivers/:id
router
  .route('/:id')
  .get(authorize('admin', 'gestionnaire', 'chauffeur'), getDriver)
  .put(authorize('admin', 'gestionnaire'), updateDriver)
  .delete(authorize('admin'), deleteDriver);

// Routes pour la gestion des véhicules
// /api/v1/drivers/:id/vehicule
router
  .route('/:id/vehicule')
  .put(authorize('admin', 'gestionnaire'), affecterVehicule)
  .delete(authorize('admin', 'gestionnaire'), libererVehicule);

module.exports = router;
