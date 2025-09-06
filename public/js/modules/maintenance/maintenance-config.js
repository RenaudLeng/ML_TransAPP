/**
 * Configuration du module de maintenance
 * Contient les constantes et paramètres de configuration
 */

// Exposer la configuration globalement
window.MaintenanceConfig = window.MaintenanceConfig || {};

// Configuration principale
window.MaintenanceConfig.CONFIG = {
  // Paramètres de pagination
  PAGINATION: {
    ITEMS_PER_PAGE: 10,
    VISIBLE_PAGES: 5
  },
  
  // Statuts possibles pour les maintenances
  STATUS: {
    PLANNED: 'planifiée',
    IN_PROGRESS: 'en cours',
    COMPLETED: 'terminée',
    CANCELLED: 'annulée',
    PENDING: 'en attente'
  },
  
  // Types de maintenance
  TYPES: [
    'Révision périodique',
    'Réparation mécanique',
    'Réparation carrosserie',
    'Vidange',
    'Pneumatiques',
    'Freinage',
    'Électricité',
    'Climatisation',
    'Autre'
  ],
  
  // Priorités
  PRIORITIES: [
    'Basse',
    'Moyenne',
    'Haute',
    'Urgente'
  ],
  
  // Périodicité pour les maintenances préventives (en kilomètres)
  PREVENTIVE_MAINTENANCE_INTERVALS: {
    OIL_CHANGE: 10000,
    FILTER_CHANGE: 20000,
    BRAKE_CHECK: 15000,
    TIRE_ROTATION: 10000
  },
  
  // Paramètres de notification
  NOTIFICATIONS: {
    ENABLED: true,
    REMINDER_DAYS_BEFORE: 7,
    EXPIRATION_DAYS: 30
  },
  
  // Paramètres de stockage
  STORAGE: {
    PREFIX: 'maintenance_',
    VERSION: '1.0'
  },
  
  // API Endpoints (à configurer selon votre backend)
  API: {
    BASE_URL: '/api/maintenance',
    ENDPOINTS: {
      MAINTENANCES: '/maintenances',
      VEHICLES: '/vehicles',
      REPORTS: '/reports'
    }
  },
  
  // Paramètres pour les graphiques
  CHARTS: {
    COLORS: {
      PLANNED: '#3498db',
      IN_PROGRESS: '#f39c12',
      COMPLETED: '#2ecc71',
      CANCELLED: '#e74c3c',
      PENDING: '#95a5a6'
    },
    DURATIONS: {
      ANIMATION: 1000,
      RESPONSIVE: true,
      MAINTAIN_ASPECT_RATIO: false
    }
  },
  
  // Paramètres d'export
  EXPORT: {
    FORMATS: ['PDF', 'Excel', 'CSV'],
    DEFAULT_FORMAT: 'PDF',
    DATE_FORMAT: 'DD/MM/YYYY',
    DATE_TIME_FORMAT: 'DD/MM/YYYY HH:mm'
  },
  
  // Paramètres de validation
  VALIDATION: {
    REQUIRED_FIELDS: ['busId', 'type', 'description', 'date'],
    MAX_DESCRIPTION_LENGTH: 1000,
    MAX_NOTES_LENGTH: 2000
  },
  
  // Paramètres de débogage
  DEBUG: {
    // En production, définir sur 'error' pour réduire les logs
    LOG_LEVEL: 'debug',
    // Activer les logs en développement, désactiver en production
    ENABLE_LOGGING: true
  }
};

// Configuration pour flatpickr
window.MaintenanceConfig.DATEPICKER_CONFIG = {
  dateFormat: 'd/m/Y',
  altInput: true,
  altFormat: 'j F Y',
  locale: 'fr',
  allowInput: true,
  disableMobile: true
};

window.MaintenanceConfig.DATETIME_PICKER_CONFIG = {
  enableTime: true,
  dateFormat: 'd/m/Y H:i',
  altInput: true,
  altFormat: 'j F Y à H:i',
  time_24hr: true,
  locale: 'fr',
  allowInput: true,
  disableMobile: true
};

// Classes CSS pour les badges de statut
export const STATUS_BADGE_CLASSES = {
  'planifiée': 'bg-info',
  'en cours': 'bg-primary',
  'terminée': 'bg-success',
  'annulée': 'bg-secondary',
  'en attente': 'bg-warning'
};

// Classes CSS pour les priorités
export const PRIORITY_BADGE_CLASSES = {
  'Basse': 'bg-secondary',
  'Moyenne': 'bg-info',
  'Haute': 'bg-warning',
  'Urgente': 'bg-danger'
};

// Configuration pour les graphiques
export const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
};
