const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sequelize = require('../config/database').sequelize;

class User extends Model {
  // Vérifier le mot de passe
  async matchPassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  }

  // Générer un token JWT
  getSignedJwtToken() {
    return jwt.sign(
      { id: this.id, role: this.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
  }

  // Générer et hacher le token de réinitialisation
  getResetPasswordToken() {
    // Générer le token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hacher le token et le stocker dans la base de données
    this.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Définir la date d'expiration à 10 minutes
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nom: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Veuillez ajouter un nom' },
        len: {
          args: [1, 50],
          msg: 'Le nom ne peut pas dépasser 50 caractères'
        }
      }
    },
    prenom: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Veuillez ajouter un prénom' },
        len: {
          args: [1, 50],
          msg: 'Le prénom ne peut pas dépasser 50 caractères'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: 'Cet email est déjà utilisé'
      },
      validate: {
        isEmail: { msg: 'Veuillez ajouter un email valide' },
        notEmpty: { msg: 'Veuillez ajouter un email' }
      }
    },
    role: {
      type: DataTypes.ENUM('user', 'chauffeur', 'admin'),
      defaultValue: 'user'
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Veuillez ajouter un mot de passe' },
        len: {
          args: [6],
          msg: 'Le mot de passe doit contenir au moins 6 caractères'
        }
      }
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetPasswordExpire: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'User',
    timestamps: true,
    underscored: true
  }
);

// Hacher le mot de passe avant de sauvegarder
User.beforeCreate(async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Hacher le mot de passe avant de le mettre à jour
User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Exporter le modèle
module.exports = User;
