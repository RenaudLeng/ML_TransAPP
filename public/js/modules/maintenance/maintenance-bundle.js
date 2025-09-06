/**
 * Bundle pour le module de maintenance
 * Charge et initialise tous les composants nécessaires
 */

// S'assurer que l'objet global existe
if (!window.MaintenanceApp) {
  window.MaintenanceApp = {};
}

// Charger les dépendances dans le bon ordre
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Erreur de chargement du script: ${src}`));
    document.head.appendChild(script);
  });};

// Initialiser l'application
const initApp = async () => {
  console.log('Début de l\'initialisation de l\'application de maintenance');
  try {
    // Charger les dépendances dans l'ordre
    console.log('Chargement des modules de maintenance...');
    
    // Charger la configuration
    await loadScript('maintenance-config.js');
    
    // Charger les utilitaires
    await loadScript('maintenance-utils.js');
    
    // Charger l'API
    await loadScript('maintenance-api.js');
    
    // Charger le gestionnaire principal
    await loadScript('maintenance.js');
    
    console.log('Tous les modules de maintenance ont été chargés avec succès');

    // Vérifier que MaintenanceManager est disponible
    if (typeof window.MaintenanceManager === 'function') {
      const maintenanceManager = new window.MaintenanceManager();
      
      // Initialiser le gestionnaire
      await maintenanceManager.init();
      
      // Exposer l'instance globalement
      window.maintenanceManager = maintenanceManager;
      
      // Déclencher l'événement de chargement
      const event = new CustomEvent('maintenance:ready', { 
        detail: { maintenanceManager }
      });
      window.dispatchEvent(event);
      
      return maintenanceManager;
    } else if (window.MaintenanceUtils?.showNotification) {
      window.MaintenanceUtils.showNotification('Erreur: MaintenanceManager non trouvé', 'error');
    }
  } catch (error) {
    // Essayer d'afficher une notification d'erreur si possible
    if (window.MaintenanceUtils?.showNotification) {
      window.MaintenanceUtils.showNotification(
        'Erreur lors du chargement du module de maintenance', 
        'error'
      );
    }
  }
};

// Démarrer l'initialisation
document.addEventListener('DOMContentLoaded', () => {
  initApp().catch(() => {
    if (window.MaintenanceUtils?.showNotification) {
      window.MaintenanceUtils.showNotification(
        'Erreur lors du chargement de l\'application de maintenance',
        'error'
      );
    }
  });
});
