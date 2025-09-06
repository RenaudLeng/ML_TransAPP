const nodemailer = require('nodemailer');
const logger = require('./logger');

// Créer un transporteur SMTP réutilisable
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true', // true pour le port 465, false pour les autres ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Vérifier la configuration du transporteur
transporter.verify((error, success) => {
  if (error) {
    logger.error('Erreur de configuration du transporteur email:', error);
  } else {
    logger.info('Serveur SMTP prêt à envoyer des emails');
  }
});

/**
 * Envoyer un email
 * @param {Object} options - Les options de l'email
 * @param {string} options.to - L'adresse email du destinataire
 * @param {string} options.subject - Le sujet de l'email
 * @param {string} options.text - Le contenu texte de l'email
 * @param {string} [options.html] - Le contenu HTML de l'email (optionnel)
 * @returns {Promise} - Une promesse qui se résout lorsque l'email est envoyé
 */
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to,
      subject,
      text,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email envoyé à ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Erreur lors de l\'envoi de l\'email:', error);
    throw new Error(`Échec de l'envoi de l'email: ${error.message}`);
  }
};

module.exports = sendEmail;
