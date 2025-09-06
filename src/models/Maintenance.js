const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  vehicule: {
    type: mongoose.Schema.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Le véhicule est requis'],
    index: true
  },
  type: {
    type: String,
    required: [true, 'Le type de maintenance est requis'],
    enum: {
      values: ['entretien', 'reparation', 'revision', 'controle-technique', 'autre'],
      message: 'Type de maintenance non valide'
    }
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true,
    maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères']
  },
  dateDebut: {
    type: Date,
    required: [true, 'La date de début est requise'],
    default: Date.now
  },
  dateFin: {
    type: Date,
    validate: {
      validator: function(v) {
        return !v || v >= this.dateDebut;
      },
      message: 'La date de fin doit être postérieure à la date de début'
    }
  },
  statut: {
    type: String,
    enum: {
      values: ['planifiee', 'en-cours', 'terminee', 'annulee'],
      message: 'Statut de maintenance non valide'
    },
    default: 'planifiee'
  },
  cout: {
    type: Number,
    min: [0, 'Le coût ne peut pas être négatif'],
    default: 0
  },
  kilometrage: {
    type: Number,
    required: [true, 'Le kilométrage est requis'],
    min: [0, 'Le kilométrage ne peut pas être négatif']
  },
  prestataire: {
    nom: {
      type: String,
      trim: true,
      maxlength: [100, 'Le nom du prestataire ne peut pas dépasser 100 caractères']
    },
    contact: {
      type: String,
      trim: true,
      maxlength: [100, 'Le contact ne peut pas dépasser 100 caractères']
    },
    adresse: {
      type: String,
      trim: true,
      maxlength: [200, 'L\'adresse ne peut pas dépasser 200 caractères']
    }
  },
  documents: [{
    nom: String,
    fichier: String,
    type: {
      type: String,
      enum: ['facture', 'bon-de-travail', 'photo', 'autre']
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  notes: {
    type: String,
    maxlength: [1000, 'Les notes ne peuvent pas dépasser 1000 caractères'],
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  notifications: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'in-app'],
      required: true
    },
    dateEnvoi: {
      type: Date,
      required: true
    },
    statut: {
      type: String,
      enum: ['envoyee', 'en-attente', 'erreur'],
      default: 'en-attente'
    },
    message: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour les recherches fréquentes
maintenanceSchema.index({ vehicule: 1, dateDebut: -1 });
maintenanceSchema.index({ statut: 1, dateDebut: 1 });

// Middleware pour mettre à jour le statut du véhicule
maintenanceSchema.pre('save', async function(next) {
  try {
    if (this.isNew) {
      // Mettre à jour le statut du véhicule si la maintenance commence maintenant
      if (this.dateDebut <= new Date() && this.statut === 'planifiee') {
        this.statut = 'en-cours';
      }
    } else if (this.isModified('statut') && this.statut === 'terminee' && !this.dateFin) {
      this.dateFin = new Date();
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware pour mettre à jour le véhicule après une maintenance
maintenanceSchema.post('save', async function(doc) {
  try {
    const Vehicle = require('./Vehicle');
    
    if (doc.statut === 'terminee') {
      // Mettre à jour la date de dernière maintenance du véhicule
      await Vehicle.findByIdAndUpdate(doc.vehicule, {
        dateDerniereMaintenance: doc.dateFin || new Date(),
        // Planifier la prochaine maintenance si nécessaire
        $set: {
          'prochaineMaintenance': new Date(new Date().setMonth(new Date().getMonth() + 6)) // 6 mois plus tard par défaut
        }
      });
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du véhicule après maintenance:', error);
  }
});

// Méthode pour calculer la durée de la maintenance
maintenanceSchema.virtual('duree').get(function() {
  if (!this.dateDebut) return 0;
  const fin = this.dateFin || new Date();
  return Math.ceil((fin - this.dateDebut) / (1000 * 60 * 60 * 24)); // Durée en jours
});

// Méthode pour vérifier si la maintenance est en retard
maintenanceSchema.virtual('enRetard').get(function() {
  return this.statut === 'en-cours' && this.dateFin && this.dateFin < new Date();
});

module.exports = mongoose.model('Maintenance', maintenanceSchema);
