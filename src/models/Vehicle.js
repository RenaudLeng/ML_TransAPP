const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  marque: {
    type: String,
    required: [true, 'La marque est requise'],
    trim: true
  },
  modele: {
    type: String,
    required: [true, 'Le modèle est requis'],
    trim: true
  },
  immatriculation: {
    type: String,
    required: [true, 'L\'immatriculation est requise'],
    unique: true,
    uppercase: true
  },
  annee: {
    type: Number,
    required: [true, 'L\'année est requise']
  },
  type: {
    type: String,
    enum: ['utilitaire', 'camion', 'camionnette', 'autre'],
    default: 'autre'
  },
  statut: {
    type: String,
    enum: ['disponible', 'en-maintenance', 'hors-service'],
    default: 'disponible'
  },
  kilometrage: {
    type: Number,
    default: 0
  },
  dateDerniereMaintenance: Date,
  prochaineMaintenance: Date,
  chauffeur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
