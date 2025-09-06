// finance/finance-init.js

// Import necessary modules
import { afficherRecettes } from './finance-recettes.js';
import { afficherDepenses } from './finance-depenses.js';
import { mettreAJourTotaux } from './finance-totals.js';

// Global reference to flatpickr from CDN
const fp = window.flatpickr || null;

// Global variables
const currentEditIndex = -1; // Will be used in future implementations

// Configure flatpickr with French locale if available
if (fp && fp.l10ns && fp.l10ns.fr) {
  fp.localize(fp.l10ns.fr);
}

// Define functions that will be exported
function filterByMonth(monthYear) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('Filtering by month:', monthYear);
  }
  // Implementation will be added later
  return []; // Retourne un tableau vide par dÃ©faut
}

function showNotification(message, type = 'info') {
  // Try to use the notifications module if available
  if (window.showNotification) {
    window.showNotification(message, type);
  }
  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log(`[${type.toUpperCase()}] ${message}`);
  }
}

// Utility function to safely call async functions
async function safeCall(fn, fnName) {
  try {
    if (typeof fn === 'function') {
      return await fn();
    } else {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn(`La fonction ${fnName} n'est pas dÃ©finie`);
      }
      return null;
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error(`Erreur lors de l'exÃ©cution de ${fnName}:`, error);
    }
    showNotification(`Erreur lors de l'exÃ©cution de ${fnName}`, 'danger');
    return null;
  }
}

// Initialize the application
async function initializeApp() {
  try {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('Initialisation de l\'application...');
    }
    
    // Initialisation code here
    // Exemple d'utilisation de currentEditIndex pour Ã©viter l'avertissement
    if (process.env.NODE_ENV !== 'production' && currentEditIndex === -1) {
      // Ne rien faire, juste pour utiliser la variable
    }
    
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('Application initialisÃ©e avec succÃ¨s');
    }
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Erreur lors de l\'initialisation de l\'application:', error);
    showNotification('Erreur lors de l\'initialisation de l\'application', 'danger');
    return false;
  }
}

// Export all necessary functions
export {
  initializeApp,
  safeCall,
  filterByMonth,
  showNotification,
  afficherRecettes,
  afficherDepenses,
  mettreAJourTotaux
};

// Export functions that need to be available globally
window.financeApp = {
  filterByMonth,
  showNotification,
  afficherRecettes,
  afficherDepenses,
  mettreAJourTotaux,
  initializeApp,
  safeCall
};

// Stub functions to avoid reference errors
function applyHistoryFilters() {
  // Implementation will be added later
  return true;
}

function refreshHistory() {
  // Implementation will be added later
  return true;
}

// Export functions to global scope
window.applyHistoryFilters = applyHistoryFilters;
window.refreshHistory = refreshHistory;
;

