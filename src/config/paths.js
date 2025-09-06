// Configuration des chemins
const paths = {
  // Chemins des rÃ©pertoires
  public: '/public',
  assets: '/public/assets',
  css: '/public/css',
  js: '/public/js',
  lib: '/public/lib',
  
  // Chemins des fichiers CSS
  cssComponents: '/public/css/components',
  cssPages: '/public/css/pages',
  
  // Chemins des fichiers JS
  jsComponents: '/public/js/components',
  jsModules: '/public/js/modules',
  jsServices: '/public/js/services',
  jsUtils: '/public/js/utils',
  
  // Chemins des librairies tierces
  libJs: './public/lib/js',
  libCss: './public/lib/css',
  libFonts: './public/lib/fonts',
  
  // URL de base de l'API
  apiBaseUrl: '/api',
  
  // Chemins des pages
  pages: {
    maintenance: '/maintenance.html',
    auth: '/auth.html',
    dashboard: '/index.html'
  }
};

// Exporter la configuration
if (typeof module !== 'undefined' && module.exports) {
  // Node.js
  module.exports = paths;
} else {
  // Navigateur
  window.AppConfig = window.AppConfig || {};
  window.AppConfig.paths = paths;
}
