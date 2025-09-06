// finance/finance-init.js

// Import necessary modules
import { afficherRecettes, ajouterRecette, editerRecette, supprimerRecette } from './finance-recettes.js';
import { afficherDepenses, ajouterDepense, editerDepense, supprimerDepense } from './finance-depenses.js';
import { mettreAJourTotaux } from './finance-totals.js';

// Global reference to flatpickr from CDN
const fp = window.flatpickr || null;

// Global variables
let currentEditIndex = -1;

// Configure flatpickr with French locale if available
if (fp && fp.l10ns && fp.l10ns.fr) {
  fp.localize(fp.l10ns.fr);
}

// Define functions that will be exported
function filterByMonth(monthYear) {
  console.log('Filtering by month:', monthYear);
  // Implementation will be added later
}

function showNotification(message, type = 'info') {
  // Try to use the notifications module if available
  if (window.showNotification) {
    window.showNotification(message, type);
  } else {
    console.log(`[${type.toUpperCase()}] ${message}`);
  }
}

// Utility function to safely call async functions
async function safeCall(fn, fnName) {
  try {
    if (typeof fn === 'function') {
      return await fn();
    } else {
      console.warn(`La fonction ${fnName} n'est pas définie`);
      return null;
    }
  } catch (error) {
    console.error(`Erreur lors de l'exécution de ${fnName}:`, error);
    showNotification(`Erreur lors de l'exécution de ${fnName}`, 'danger');
    return null;
  }
}

// Initialize the application
async function initializeApp() {
  try {
    console.log('Initialisation de l\'application...');
    // Initialisation code here
    console.log('Application initialisée avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de l\'application:', error);
    showNotification('Erreur lors de l\'initialisation de l\'application', 'danger');
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

// Export other functions to global scope if needed
window.applyHistoryFilters = applyHistoryFilters || function() {};
window.refreshHistory = refreshHistory || function() {};
