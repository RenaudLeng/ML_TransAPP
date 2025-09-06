const Maintenance = require('../models/Maintenance');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Récupérer toutes les maintenances
// @route   GET /api/v1/maintenances
// @access  Privé
exports.getMaintenances = asyncHandler(async (req, res) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Récupérer une maintenance
// @route   GET /api/v1/maintenances/:id
// @access  Privé
exports.getMaintenance = asyncHandler(async (req, res, next) => {
  const maintenance = await Maintenance.findById(req.params.id).populate('vehicule', 'marque modele immatriculation');
  if (!maintenance) {
    return next(new ErrorResponse(`Maintenance non trouvée avec l'ID ${req.params.id}`, 404));
  }
  res.status(200).json({ success: true, data: maintenance });
});

// @desc    Créer une maintenance
// @route   POST /api/v1/maintenances
// @access  Privé (Admin/Gestionnaire)
exports.createMaintenance = asyncHandler(async (req, res, next) => {
  req.body.createdBy = req.user.id;
  
  // Vérifier si le véhicule existe
  const Vehicle = require('./Vehicle');
  const vehicle = await Vehicle.findById(req.body.vehicule);
  if (!vehicle) {
    return next(new ErrorResponse(`Véhicule non trouvé avec l'ID ${req.body.vehicule}`, 404));
  }

  // Si la maintenance commence maintenant, la marquer comme en cours
  if (!req.body.dateDebut || new Date(req.body.dateDebut) <= new Date()) {
    req.body.statut = 'en-cours';
  }

  const maintenance = await Maintenance.create(req.body);
  
  // Mettre à jour le statut du véhicule si nécessaire
  if (maintenance.statut === 'en-cours') {
    vehicle.statut = 'en-maintenance';
    await vehicle.save();
  }

  res.status(201).json({ success: true, data: maintenance });
});

// @desc    Mettre à jour une maintenance
// @route   PUT /api/v1/maintenances/:id
// @access  Privé (Admin/Gestionnaire)
exports.updateMaintenance = asyncHandler(async (req, res, next) => {
  let maintenance = await Maintenance.findById(req.params.id);
  if (!maintenance) {
    return next(new ErrorResponse(`Maintenance non trouvée avec l'ID ${req.params.id}`, 404));
  }

  // Vérifier les droits de l'utilisateur
  if (maintenance.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Non autorisé à mettre à jour cette maintenance', 403));
  }

  // Si la maintenance est marquée comme terminée, mettre à jour la date de fin
  if (req.body.statut === 'terminee' && !req.body.dateFin) {
    req.body.dateFin = new Date();
  }

  maintenance = await Maintenance.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Mettre à jour le statut du véhicule si nécessaire
  if (maintenance.statut === 'terminee' || maintenance.statut === 'annulee') {
    const Vehicle = require('./Vehicle');
    await Vehicle.findByIdAndUpdate(maintenance.vehicule, { statut: 'disponible' });
  }

  res.status(200).json({ success: true, data: maintenance });
});

// @desc    Supprimer une maintenance
// @route   DELETE /api/v1/maintenances/:id
// @access  Privé (Admin)
exports.deleteMaintenance = asyncHandler(async (req, res, next) => {
  const maintenance = await Maintenance.findById(req.params.id);
  if (!maintenance) {
    return next(new ErrorResponse(`Maintenance non trouvée avec l'ID ${req.params.id}`, 404));
  }

  // Vérifier les droits de l'utilisateur
  if (maintenance.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Non autorisé à supprimer cette maintenance', 403));
  }

  await maintenance.remove();

  // Si la maintenance était en cours, mettre à jour le statut du véhicule
  if (maintenance.statut === 'en-cours') {
    const Vehicle = require('./Vehicle');
    await Vehicle.findByIdAndUpdate(maintenance.vehicule, { statut: 'disponible' });
  }

  res.status(200).json({ success: true, data: {} });
});

// @desc    Obtenir les maintenances d'un véhicule
// @route   GET /api/v1/vehicles/:vehicleId/maintenances
// @access  Privé
exports.getMaintenancesByVehicle = asyncHandler(async (req, res, _next) => {
  const maintenances = await Maintenance.find({ vehicule: req.params.vehicleId })
    .sort('-dateDebut')
    .populate('vehicule', 'marque modele immatriculation');

  res.status(200).json({
    success: true,
    count: maintenances.length,
    data: maintenances
  });
});

// @desc    Obtenir les statistiques des maintenances
// @route   GET /api/v1/maintenances/stats
// @access  Privé (Admin/Gestionnaire)
exports.getMaintenanceStats = asyncHandler(async (req, res) => {
  const stats = await Maintenance.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalCout: { $sum: '$cout' },
        avgCout: { $avg: '$cout' },
        avgDuree: {
          $avg: {
            $divide: [
              { $subtract: [
                { $ifNull: ['$dateFin', new Date()] },
                '$dateDebut'
              ] },
              1000 * 60 * 60 * 24 // Convertir en jours
            ]
          }
        }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Calculer le coût total des maintenances
  const totalCout = stats.reduce((acc, curr) => acc + curr.totalCout, 0);

  res.status(200).json({
    success: true,
    count: stats.length,
    totalCout,
    data: stats
  });
});

// @desc    Planifier la prochaine maintenance
// @route   POST /api/v1/maintenances/planifier
// @access  Privé (Admin/Gestionnaire)
exports.planifierMaintenance = asyncHandler(async (req, res, next) => {
  const { vehiculeId, type, description, datePrevue, notes } = req.body;

  if (!vehiculeId || !type || !description) {
    return next(new ErrorResponse('Veuillez fournir un véhicule, un type et une description', 400));
  }

  // Vérifier si le véhicule existe
  const Vehicle = require('./Vehicle');
  const vehicle = await Vehicle.findById(vehiculeId);
  if (!vehicle) {
    return next(new ErrorResponse(`Véhicule non trouvé avec l'ID ${vehiculeId}`, 404));
  }

  // Créer la maintenance planifiée
  const maintenance = await Maintenance.create({
    vehicule: vehiculeId,
    type,
    description,
    dateDebut: datePrevue || new Date(),
    statut: datePrevue && new Date(datePrevue) > new Date() ? 'planifiee' : 'en-cours',
    kilometrage: vehicle.kilometrage,
    notes,
    createdBy: req.user.id
  });

  // Si la maintenance commence maintenant, mettre à jour le statut du véhicule
  if (maintenance.statut === 'en-cours') {
    vehicle.statut = 'en-maintenance';
    await vehicle.save();
  }

  res.status(201).json({
    success: true,
    data: maintenance
  });
});

// @desc    Terminer une maintenance
// @route   PUT /api/v1/maintenances/:id/terminer
// @access  Privé (Admin/Gestionnaire)
exports.terminerMaintenance = asyncHandler(async (req, res, next) => {
  const maintenance = await Maintenance.findById(req.params.id);
  if (!maintenance) {
    return next(new ErrorResponse(`Maintenance non trouvée avec l'ID ${req.params.id}`, 404));
  }

  // Vérifier que la maintenance est en cours
  if (maintenance.statut !== 'en-cours') {
    return next(new ErrorResponse('Seules les maintenances en cours peuvent être terminées', 400));
  }

  // Mettre à jour la maintenance
  maintenance.statut = 'terminee';
  maintenance.dateFin = new Date();
  
  if (req.body.cout) maintenance.cout = req.body.cout;
  if (req.body.notes) maintenance.notes = req.body.notes;
  
  await maintenance.save();

  // Mettre à jour le statut du véhicule
  const Vehicle = require('./Vehicle');
  await Vehicle.findByIdAndUpdate(maintenance.vehicule, { 
    statut: 'disponible',
    dateDerniereMaintenance: maintenance.dateFin,
    $set: {
      'prochaineMaintenance': new Date(new Date().setMonth(new Date().getMonth() + 6)) // 6 mois plus tard
    }
  });

  res.status(200).json({
    success: true,
    data: maintenance
  });
});
