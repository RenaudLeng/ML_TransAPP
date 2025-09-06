// Les utilitaires sont maintenant définis comme des propriétés de window.MaintenanceUtils
// pour éviter les problèmes d'import/export entre modules

// S'assurer que l'objet global existe
if (!window.MaintenanceUtils) {
  window.MaintenanceUtils = {};
}

// Configuration par défaut si non définie
if (!window.MaintenanceConfig) {
  window.MaintenanceConfig = {
    CONFIG: {
      PAGINATION: {
        ITEMS_PER_PAGE: 10
      },
      VALIDATION: {
        REQUIRED_FIELDS: ['busId', 'type', 'description', 'date'],
        MAX_DESCRIPTION_LENGTH: 1000,
        MAX_NOTES_LENGTH: 2000
      }
    },
    STATUS_BADGE_CLASSES: {},
    PRIORITY_BADGE_CLASSES: {}
  };
}

// Importer la configuration depuis l'objet global
const CONFIG = window.MaintenanceConfig.CONFIG;
const STATUS_BADGE_CLASSES = window.MaintenanceConfig.STATUS_BADGE_CLASSES || {};
const PRIORITY_BADGE_CLASSES = window.MaintenanceConfig.PRIORITY_BADGE_CLASSES || {};

/**
 * Formate une date au format local
 * @param {string|Date} date - Date à formater
 * @param {boolean} includeTime - Inclure l'heure dans le formatage
 * @returns {string} Date formatée
 */
window.MaintenanceUtils.formatDate = function(date, includeTime = false) {
  if (!date) return 'N/A';
  
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return new Date(date).toLocaleDateString('fr-FR', options);
};

/**
 * Formate un montant monétaire
 * @param {number} amount - Montant à formater
 * @returns {string} Montant formaté
 */
window.MaintenanceUtils.formatCurrency = function(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(amount || 0);
};

/**
 * Génère un ID unique
 * @returns {string} ID unique
 */
window.MaintenanceUtils.generateId = function() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Vérifie si un objet est vide
 * @param {Object} obj - Objet à vérifier
 * @returns {boolean} True si l'objet est vide
 */
window.MaintenanceUtils.isEmpty = function(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
};

/**
 * Obtient la classe CSS pour un badge de statut
 * @param {string} status - Statut de la maintenance
 * @returns {string} Classe CSS
 */
window.MaintenanceUtils.getStatusBadgeClass = function(status) {
  return STATUS_BADGE_CLASSES[status.toLowerCase()] || 'bg-secondary';
};

/**
 * Obtient la classe CSS pour un badge de priorité
 * @param {string} priority - Niveau de priorité
 * @returns {string} Classe CSS
 */
window.MaintenanceUtils.getPriorityBadgeClass = function(priority) {
  return PRIORITY_BADGE_CLASSES[priority] || 'bg-secondary';
};

/**
 * Valide les données d'une maintenance
 * @param {Object} data - Données à valider
 * @returns {Object} { isValid: boolean, errors: Object }
 */
window.MaintenanceUtils.validateMaintenanceData = function(data) {
  const errors = {};
  const requiredFields = CONFIG.VALIDATION.REQUIRED_FIELDS;
  
  // Vérification des champs obligatoires
  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors[field] = 'Ce champ est obligatoire';
    }
  });
  
  // Validation de la longueur de la description
  if (data.description && data.description.length > CONFIG.VALIDATION.MAX_DESCRIPTION_LENGTH) {
    errors.description = `La description ne doit pas dépasser ${CONFIG.VALIDATION.MAX_DESCRIPTION_LENGTH} caractères`;
  }
  
  // Validation du format de date
  if (data.date && isNaN(new Date(data.date).getTime())) {
    errors.date = 'Format de date invalide';
  }
  
  // Validation du coût
  if (data.cost && (isNaN(parseFloat(data.cost)) || parseFloat(data.cost) < 0)) {
    errors.cost = 'Le coût doit être un nombre positif';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Filtre un tableau de maintenances selon différents critères
 * @param {Array} maintenances - Tableau de maintenances à filtrer
 * @param {Object} filters - Critères de filtrage
 * @returns {Array} Tableau filtré
 */
window.MaintenanceUtils.filterMaintenances = function(maintenances, filters = {}) {
  return maintenances.filter(maintenance => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      
      const maintenanceValue = maintenance[key];
      if (maintenanceValue === undefined) return true;
      
      if (typeof value === 'function') {
        return value(maintenanceValue);
      }
      
      if (Array.isArray(value)) {
        return value.includes(maintenanceValue);
      }
      
      if (key === 'date') {
        const filterDate = new Date(value).setHours(0, 0, 0, 0);
        const maintenanceDate = new Date(maintenanceValue).setHours(0, 0, 0, 0);
        return filterDate === maintenanceDate;
      }
      
      return String(maintenanceValue).toLowerCase().includes(String(value).toLowerCase());
    });
  });
};

/**
 * Trie un tableau de maintenances
 * @param {Array} maintenances - Tableau à trier
 * @param {string} sortBy - Champ de tri
 * @param {string} sortOrder - Ordre de tri (asc/desc)
 * @returns {Array} Tableau trié
 */
window.MaintenanceUtils.sortMaintenances = function(maintenances, sortBy = 'date', sortOrder = 'desc') {
  return [...maintenances].sort((a, b) => {
    let valueA = a[sortBy];
    let valueB = b[sortBy];
    
    // Gestion des dates
    if (sortBy.includes('date')) {
      valueA = new Date(valueA).getTime();
      valueB = new Date(valueB).getTime();
    }
    
    // Gestion des chaînes de caractères
    if (typeof valueA === 'string') valueA = valueA.toLowerCase();
    if (typeof valueB === 'string') valueB = valueB.toLowerCase();
    
    // Tri
    if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Pagine un tableau de données
 * @param {Array} data - Tableau à paginer
 * @param {number} page - Numéro de page (commence à 1)
 * @param {number} perPage - Nombre d'éléments par page
 * @returns {Object} { data: Array, total: number, pages: number }
 */
window.MaintenanceUtils.paginate = function(data, page = 1, perPage = CONFIG.PAGINATION.ITEMS_PER_PAGE) {
  const start = (page - 1) * perPage;
  const end = start + perPage;
  
  return {
    data: data.slice(start, end),
    total: data.length,
    pages: Math.ceil(data.length / perPage),
    currentPage: page,
    perPage
  };
};

/**
 * Affiche une notification à l'utilisateur
 * @param {string} message - Message à afficher
 * @param {string} type - Type de notification (success, error, warning, info)
 * @param {number} duration - Durée d'affichage en ms (0 = pas de disparition automatique)
 */
window.MaintenanceUtils.showNotification = function(message, type = 'info', duration = 5000) {
  const container = document.querySelector('.notifications-container');
  if (!container) return;
  
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} alert-dismissible fade show`;
  alert.role = 'alert';
  alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  
  container.appendChild(alert);
  
  // Fermeture automatique après la durée spécifiée
  if (duration > 0) {
    setTimeout(() => {
      alert.remove();
    }, duration);
  }
};

/**
 * Initialise les sélecteurs de date flatpickr
 * @param {string} selector - Sélecteur CSS
 * @param {Object} options - Options de configuration
 */
window.MaintenanceUtils.initDatePickers = function(selector = '[data-datepicker]', options = {}) {
  const defaultOptions = {
    dateFormat: 'd/m/Y',
    altInput: true,
    altFormat: 'j F Y',
    locale: 'fr',
    allowInput: true,
    disableMobile: true,
    ...options
  };
  
  return flatpickr(selector, defaultOptions);
};

/**
 * Initialise les sélecteurs de date et heure flatpickr
 * @param {string} selector - Sélecteur CSS
 * @param {Object} options - Options de configuration
 */
window.MaintenanceUtils.initDateTimePickers = function(selector = '[data-datetimepicker]', options = {}) {
  const defaultOptions = {
    enableTime: true,
    dateFormat: 'd/m/Y H:i',
    altInput: true,
    altFormat: 'j F Y à H:i',
    time_24hr: true,
    locale: 'fr',
    allowInput: true,
    disableMobile: true,
    ...options
  };
  
  return flatpickr(selector, defaultOptions);
};
