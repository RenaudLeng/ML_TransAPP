const Driver = require('../models/Driver');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Récupérer tous les chauffeurs
// @route   GET /api/v1/drivers
// @access  Privé
exports.getDrivers = asyncHandler(async (req, res) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Récupérer un chauffeur
// @route   GET /api/v1/drivers/:id
// @access  Privé
exports.getDriver = asyncHandler(async (req, res, next) => {
  const driver = await Driver.findById(req.params.id);
  if (!driver) {
    return next(new ErrorResponse(`Chauffeur non trouvé avec l'ID ${req.params.id}`, 404));
  }
  res.status(200).json({ success: true, data: driver });
});

// @desc    Créer un chauffeur
// @route   POST /api/v1/drivers
// @access  Privé (Admin/Gestionnaire)
exports.createDriver = asyncHandler(async (req, res) => {
  req.body.createdBy = req.user.id;
  const driver = await Driver.create(req.body);
  res.status(201).json({ success: true, data: driver });
});

// @desc    Mettre à jour un chauffeur
// @route   PUT /api/v1/drivers/:id
// @access  Privé (Admin/Gestionnaire)
exports.updateDriver = asyncHandler(async (req, res, next) => {
  let driver = await Driver.findById(req.params.id);
  if (!driver) {
    return next(new ErrorResponse(`Chauffeur non trouvé avec l'ID ${req.params.id}`, 404));
  }
  if (driver.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Non autorisé à mettre à jour ce chauffeur', 403));
  }
  driver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.status(200).json({ success: true, data: driver });
});

// @desc    Supprimer un chauffeur
// @route   DELETE /api/v1/drivers/:id
// @access  Privé (Admin)
exports.deleteDriver = asyncHandler(async (req, res, next) => {
  const driver = await Driver.findById(req.params.id);
  if (!driver) {
    return next(new ErrorResponse(`Chauffeur non trouvé avec l'ID ${req.params.id}`, 404));
  }
  if (driver.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Non autorisé à supprimer ce chauffeur', 403));
  }
  await driver.remove();
  res.status(200).json({ success: true, data: {} });
});

// @desc    Affecter un véhicule à un chauffeur
// @route   PUT /api/v1/drivers/:id/vehicule
// @access  Privé (Admin/Gestionnaire)
exports.affecterVehicule = asyncHandler(async (req, res, next) => {
  const { vehiculeId } = req.body;
  if (!vehiculeId) {
    return next(new ErrorResponse('Veuillez fournir un ID de véhicule', 400));
  }
  const driver = await Driver.findById(req.params.id);
  if (!driver) {
    return next(new ErrorResponse(`Chauffeur non trouvé avec l'ID ${req.params.id}`, 404));
  }
  if (driver.statut !== 'disponible') {
    return next(new ErrorResponse('Le chauffeur doit être disponible pour affecter un véhicule', 400));
  }
  const Vehicle = require('./Vehicle');
  const vehicle = await Vehicle.findById(vehiculeId);
  if (!vehicle) {
    return next(new ErrorResponse(`Véhicule non trouvé avec l'ID ${vehiculeId}`, 404));
  }
  if (vehicle.statut !== 'disponible') {
    return next(new ErrorResponse('Le véhicule doit être disponible pour être affecté', 400));
  }
  vehicle.statut = 'en-mission';
  vehicle.chauffeur = driver._id;
  await vehicle.save();
  driver.vehiculeAttribue = vehiculeId;
  driver.statut = 'en-mission';
  await driver.save();
  res.status(200).json({ success: true, data: driver });
});

// @desc    Libérer un véhicule d'un chauffeur
// @route   DELETE /api/v1/drivers/:id/vehicule
// @access  Privé (Admin/Gestionnaire)
exports.libererVehicule = asyncHandler(async (req, res, next) => {
  const driver = await Driver.findById(req.params.id);
  if (!driver) {
    return next(new ErrorResponse(`Chauffeur non trouvé avec l'ID ${req.params.id}`, 404));
  }
  if (!driver.vehiculeAttribue) {
    return next(new ErrorResponse('Aucun véhicule affecté à ce chauffeur', 400));
  }
  const Vehicle = require('./Vehicle');
  const vehicle = await Vehicle.findById(driver.vehiculeAttribue);
  if (vehicle) {
    vehicle.statut = 'disponible';
    vehicle.chauffeur = undefined;
    await vehicle.save();
  }
  driver.vehiculeAttribue = undefined;
  driver.statut = 'disponible';
  await driver.save();
  res.status(200).json({ success: true, data: driver });
});

// @desc    Obtenir les statistiques des chauffeurs
// @route   GET /api/v1/drivers/stats
// @access  Privé (Admin)
exports.getDriverStats = asyncHandler(async (req, res) => {
  const stats = await Driver.aggregate([
    {
      $group: {
        _id: '$statut',
        count: { $sum: 1 },
        total: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);
  res.status(200).json({ success: true, count: stats.length, data: stats });
});
