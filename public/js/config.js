// Configuration des chemins de l'application
const AppConfig = {
  // Chemins des ressources
  assets: {
    logo: '/assets/img/logo.png',
    icons: {
      dashboard: 'ph-gauge',
      vehicles: 'ph-truck',
      drivers: 'ph-users',
      bus: 'ph-bus',
      planning: 'ph-calendar-blank',
      agenda: 'ph-calendar-check',
      finance: 'ph-currency-dollar',
      history: 'ph-clock-countdown',
      stats: 'ph-chart-bar',
      maintenance: 'ph-wrench',
      settings: 'ph-gear',
      logout: 'ph-sign-out',
      user: 'ph-user-circle'
    }
  },
  
  // Configuration de l'API
  api: {
    baseUrl: '/api',
    endpoints: {
      auth: '/auth',
      vehicles: '/vehicles',
      drivers: '/drivers',
      trips: '/trips',
      maintenance: '/maintenance',
      finance: '/finance'
    }
  },
  
  // Configuration de l'interface
  ui: {
    theme: 'light', // 'light' ou 'dark'
    language: 'fr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    itemsPerPage: 10
  },
  
  // Configuration des notifications
  notifications: {
    position: 'top-right',
    duration: 5000,
    max: 5
  },
  
  // Configuration du mode hors ligne
  offline: {
    enabled: true,
    cacheName: 'ml-transport-cache',
    urlsToCache: [
      '/',
      '/index.html',
      '/css/styles.css',
      '/js/app.js',
      '/assets/img/logo.png'
    ]
  }
};

// Exporter la configuration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AppConfig;
}
