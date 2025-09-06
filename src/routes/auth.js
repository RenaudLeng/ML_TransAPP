const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  logout,
  forgotPassword,
  resetPassword,
  confirmEmail,
  refreshToken,
  revokeAllTokens
} = require('../controllers/authController');

const { protect, authorize } = require('../middleware/auth');

// Routes publiques
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.get('/confirmemail/:confirmtoken', confirmEmail);
router.post('/refreshtoken', refreshToken);

// Routes protégées
router.use(protect);
router.get('/me', getMe);
router.put('/updatedetails', updateDetails);
router.put('/updatepassword', updatePassword);
router.post('/revokealltokens', revokeAllTokens);

// Routes d'administration (admin uniquement)
router.use(authorize('admin'));
// Ajoutez ici les routes d'administration si nécessaire

module.exports = router;
