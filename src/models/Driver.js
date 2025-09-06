const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
  },
  prenom: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true,
    maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères']
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    match: [
      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
      'Veuillez fournir un email valide'
    ]
  },
  telephone: {
    type: String,
    required: [true, 'Le numéro de téléphone est requis'],
    match: [/^[0-9]{10}$/, 'Veuillez fournir un numéro de téléphone valide']
  },
  adresse: {
    rue: { type: String, required: [true, 'La rue est requise'] },
    codePostal: { 
      type: String, 
      required: [true, 'Le code postal est requis'],
      match: [/^[0-9]{5}$/, 'Le code postal doit contenir 5 chiffres']
    },
    ville: { type: String, required: [true, 'La ville est requise'] }
  },
  dateNaissance: {
    type: Date,
    required: [true, 'La date de naissance est requise'],
    validate: {
      validator: function(v) {
        const today = new Date();
        const birthDate = new Date(v);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age >= 18;
      },
      message: 'Le chauffeur doit être majeur'
    }
  },
  numeroPermis: {
    type: String,
    required: [true, 'Le numéro de permis est requis'],
    unique: true,
    uppercase: true
  },
  typePermis: {
    type: [String],
    required: [true, 'Le type de permis est requis'],
    enum: {
      values: ['B', 'C', 'CE', 'D', 'DE'],
      message: 'Type de permis non valide'
    }
  },
  dateObtentionPermis: {
    type: Date,
    required: [true, 'La date d\'obtention du permis est requise']
  },
  dateExpirationPermis: {
    type: Date,
    required: [true, 'La date d\'expiration du permis est requise']
  },
  statut: {
    type: String,
    enum: {
      values: ['disponible', 'en-mission', 'en-conge', 'malade', 'inactif'],
      message: 'Statut non valide'
    },
    default: 'disponible'
  },
  vehiculeAttribue: {
    type: mongoose.Schema.ObjectId,
    ref: 'Vehicle',
    default: null
  },
  documents: [{
    nom: String,
    fichier: String,
    type: {
      type: String,
      enum: ['permis', 'medical', 'formation', 'autre']
    },
    dateExpiration: Date
  }],
  notes: {
    type: String,
    maxlength: [1000, 'Les notes ne peuvent pas dépasser 1000 caractères'],
    trim: true
  },
  actif: {
    type: Boolean,
    default: true,
    select: false
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour les recherches fréquentes
driverSchema.index({ nom: 1, prenom: 1 });
driverSchema.index({ email: 1 }, { unique: true });
driverSchema.index({ numeroPermis: 1 }, { unique: true });

// Vérifier la validité du permis avant de sauvegarder
driverSchema.pre('save', function(next) {
  if (this.dateExpirationPermis < new Date()) {
    this.statut = 'inactif';
  }
  next();
});

// Populate le véhicule attribué lors des requêtes find
driverSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'vehiculeAttribue',
    select: 'marque modele immatriculation'
  });
  next();
});

// Ne pas retourner les chauffeurs inactifs dans les requêtes normales
driverSchema.pre(/^find/, function(next) {
  this.find({ actif: { $ne: false } });
  next();
});

// Méthode pour vérifier si un document est expiré
driverSchema.methods.estDocumentExpire = function() {
  const now = new Date();
  return this.documents.some(doc => doc.dateExpiration && doc.dateExpiration < now);
};

// Méthode pour obtenir l'âge du chauffeur
driverSchema.virtual('age').get(function() {
  const today = new Date();
  const birthDate = new Date(this.dateNaissance);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Méthode pour vérifier si le permis est expiré
driverSchema.virtual('permisExpire').get(function() {
  return this.dateExpirationPermis < new Date();
});

module.exports = mongoose.model('Driver', driverSchema);
