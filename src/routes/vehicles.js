const express = require('express');
const {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  updateKilometrage,
  getVehicleStats
} = require('../controllers/vehicleController');

const Vehicle = require('../models/Vehicle');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Middleware d'authentification pour toutes les routes
router.use(protect);

// Routes pour /api/v1/vehicles
router
  .route('/')
  .get(
    advancedResults(Vehicle, 'chauffeur'),
    getVehicles
  )
  .post(
    authorize('admin', 'gestionnaire'),
    createVehicle
  );

// Routes pour /api/v1/vehicles/stats
router
  .route('/stats')
  .get(
    authorize('admin'),
    getVehicleStats
  );

// Routes pour /api/v1/vehicles/:id
router
  .route('/:id')
  .get(getVehicle)
  .put(
    authorize('admin', 'gestionnaire'),
    updateVehicle
  )
  .delete(
    authorize('admin'),
    deleteVehicle
  );

// Route pour mettre à jour le kilométrage /api/v1/vehicles/:id/kilometrage
router
  .route('/:id/kilometrage')
  .put(updateKilometrage);

module.exports = router;
