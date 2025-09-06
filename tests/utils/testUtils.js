const jwt = require('jsonwebtoken');
const User = require('../../src/models/User');

/**
 * Crée un utilisateur de test avec un mot de passe haché
 * @param {Object} overrides - Valeurs à écraser pour l'utilisateur
 * @returns {Promise<Object>} L'utilisateur créé
 */
const createTestUser = async (overrides = {}) => {
  const defaultUser = {
    nom: 'Test',
    prenom: 'User',
    email: 'test@example.com',
    password: 'Password123!',
    role: 'user',
    ...overrides
  };

  return await User.create(defaultUser);
};

/**
 * Génère un token JWT pour un utilisateur
 * @param {Object} user - L'utilisateur pour lequel générer le token
 * @returns {String} Le token JWT
 */
const generateAuthToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

/**
 * Crée un en-tête d'authentification pour les tests
 * @param {Object} user - L'utilisateur pour lequel créer l'en-tête
 * @returns {Object} L'en-tête d'autorisation
 */
const getAuthHeader = (user) => {
  const token = generateAuthToken(user);
  return { Authorization: `Bearer ${token}` };
};

module.exports = {
  createTestUser,
  generateAuthToken,
  getAuthHeader
};
