const Vehicle = require('../models/Vehicle');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Récupérer tous les véhicules
// @route   GET /api/v1/vehicles
// @access  Privé
exports.getVehicles = asyncHandler(async (req, res) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Récupérer un véhicule
// @route   GET /api/v1/vehicles/:id
// @access  Privé
exports.getVehicle = asyncHandler(async (req, res, next) => {
  const vehicle = await Vehicle.findById(req.params.id).populate('chauffeur', 'nom prenom');

  if (!vehicle) {
    return next(
      new ErrorResponse(`Véhicule non trouvé avec l'ID ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: vehicle
  });
});

// @desc    Créer un véhicule
// @route   POST /api/v1/vehicles
// @access  Privé (Admin)
exports.createVehicle = asyncHandler(async (req, res, _next) => {
  // Ajouter l'utilisateur à req.body
  req.body.createdBy = req.user.id;

  const vehicle = await Vehicle.create(req.body);

  res.status(201).json({
    success: true,
    data: vehicle
  });
});

// @desc    Mettre à jour un véhicule
// @route   PUT /api/v1/vehicles/:id
// @access  Privé (Admin)
exports.updateVehicle = asyncHandler(async (req, res, next) => {
  let vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    return next(
      new ErrorResponse(`Véhicule non trouvé avec l'ID ${req.params.id}`, 404)
    );
  }

  // Vérifier les droits de l'utilisateur
  if (vehicle.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse('Non autorisé à mettre à jour ce véhicule', 403)
    );
  }

  vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: vehicle
  });
});

// @desc    Supprimer un véhicule
// @route   DELETE /api/v1/vehicles/:id
// @access  Privé (Admin)
exports.deleteVehicle = asyncHandler(async (req, res, next) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    return next(
      new ErrorResponse(`Véhicule non trouvé avec l'ID ${req.params.id}`, 404)
    );
  }

  // Vérifier les droits de l'utilisateur
  if (vehicle.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse('Non autorisé à supprimer ce véhicule', 403)
    );
  }

  await vehicle.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Mettre à jour le kilométrage d'un véhicule
// @route   PUT /api/v1/vehicles/:id/kilometrage
// @access  Privé
exports.updateKilometrage = asyncHandler(async (req, res, next) => {
  const { kilometrage } = req.body;

  if (!kilometrage) {
    return next(
      new ErrorResponse('Veuillez fournir le nouveau kilométrage', 400)
    );
  }

  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    return next(
      new ErrorResponse(`Véhicule non trouvé avec l'ID ${req.params.id}`, 404)
    );
  }

  // Vérifier que le nouveau kilométrage est supérieur à l'ancien
  if (kilometrage <= vehicle.kilometrage) {
    return next(
      new ErrorResponse('Le nouveau kilométrage doit être supérieur à l\'ancien', 400)
    );
  }

  vehicle.kilometrage = kilometrage;
  await vehicle.save();

  res.status(200).json({
    success: true,
    data: vehicle
  });
});

// @desc    Obtenir les statistiques des véhicules
// @route   GET /api/v1/vehicles/stats
// @access  Privé (Admin)
exports.getVehicleStats = asyncHandler(async (req, res) => {
  const stats = await Vehicle.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalKilometrage: { $sum: '$kilometrage' },
        avgKilometrage: { $avg: '$kilometrage' },
        minKilometrage: { $min: '$kilometrage' },
        maxKilometrage: { $max: '$kilometrage' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  res.status(200).json({
    success: true,
    count: stats.length,
    data: stats
  });
});
