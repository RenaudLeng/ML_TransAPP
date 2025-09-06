// utils/finance-utils.js

/**
 * Formate un montant avec le séparateur de milliers et le symbole FCFA
 * @param {number} montant - Le montant à formater
 * @returns {string} Le montant formaté
 */
function formatMontant(montant) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(montant) + ' FCFA';
}

/**
 * Formate une date au format français
 * @param {string} dateString - La date à formater
 * @returns {string} La date formatée
 */
function formatDate(dateString) {
  if (!dateString) return '';
  
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Date(dateString).toLocaleDateString('fr-FR', options);
}

/**
 * Affiche une notification à l'utilisateur
 * @param {string} message - Le message à afficher
 * @param {string} type - Le type de notification (success, danger, warning, info)
 * @param {number} duration - Durée d'affichage en ms (optionnel)
 */
function showNotification(message, type = 'info', duration = 5000) {
  const notification = document.createElement('div');
  notification.className = `alert alert-${type} alert-dismissible fade show`;
  notification.role = 'alert';
  notification.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  
  const container = document.getElementById('notifications') || document.body;
  container.prepend(notification);
  
  if (duration > 0) {
    setTimeout(() => {
      notification.remove();
    }, duration);
  }
}

/**
 * Vérifie si une date est un jour férié
 * @param {Date} date - La date à vérifier
 * @returns {boolean}
 */
function isHoliday(date) {
  // Implémentation basique - à compléter avec les jours fériés
  const holidays = [
    '01-01', // Nouvel An
    '05-01', // Fête du Travail
    '08-15', // Assomption
    '11-01', // Toussaint
    '12-25'  // Noël
  ];
  
  const monthDay = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return holidays.includes(monthDay);
}

export {
  formatMontant,
  formatDate,
  showNotification,
  isHoliday
};
