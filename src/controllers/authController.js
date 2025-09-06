const { User } = require('../models');
const ErrorResponse = require('../utils/errorResponse');

// Helper pour envoyer la réponse avec token
const sendTokenResponse = (user, statusCode, res) => {
  // Générer le token JWT
  const token = user.getSignedJwtToken();
  
  // Options pour le cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    domain: process.env.COOKIE_DOMAIN || 'localhost'
  };

  // Si en production, définir secure à true
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  // Envoyer le token dans un cookie et dans la réponse
  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user: {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      actif: user.actif
    }
  });
};

// @desc    Enregistrer un nouvel utilisateur
exports.register = async (req, res, next) => {
  try {
    const { nom, prenom, email, password, role } = req.body;
    const user = await User.create({ 
      nom, 
      prenom, 
      email, 
      password, 
      role,
      actif: true // Par défaut, un nouvel utilisateur est actif
    });
    
    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Connecter un utilisateur
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ErrorResponse('Veuillez fournir un email et un mot de passe', 400));
    }

    // Vérifier l'utilisateur
    const user = await User.findOne({ 
      where: { email },
      attributes: { include: ['password'] } // Inclure le mot de passe qui est normalement exclu
    });

    if (!user) {
      return next(new ErrorResponse('Identifiants invalides', 401));
    }

    // Vérifier si le mot de passe correspond
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Identifiants invalides', 401));
    }

    // Vérifier si le compte est actif
    if (!user.actif) {
      return next(new ErrorResponse('Ce compte a été désactivé', 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Obtenir l'utilisateur connecté
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return next(new ErrorResponse('Utilisateur non trouvé', 404));
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// @desc    Mettre à jour les détails de l'utilisateur
exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {};
    if (req.body.nom) fieldsToUpdate.nom = req.body.nom;
    if (req.body.prenom) fieldsToUpdate.prenom = req.body.prenom;
    if (req.body.email) fieldsToUpdate.email = req.body.email;

    const [updated] = await User.update(fieldsToUpdate, {
      where: { id: req.user.id },
      returning: true
    });

    if (!updated) {
      return next(new ErrorResponse('Échec de la mise à jour', 400));
    }

    const user = await User.findByPk(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// @desc    Mettre à jour le mot de passe
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return next(new ErrorResponse('Utilisateur non trouvé', 404));
    }

    // Vérifier le mot de passe actuel
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return next(new ErrorResponse('Le mot de passe actuel est incorrect', 401));
    }

    // Mettre à jour le mot de passe
    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Déconnexion / Effacer le cookie
exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    domain: process.env.COOKIE_DOMAIN || 'localhost'
  });

  res.status(200).json({ success: true, data: {} });
};
