// finance/finance-history.js

import { formatDate } from './finance-utils.js';

/**
 * Enregistre une action dans l'historique
 * @param {string} action - Type d'action (create, update, delete)
 * @param {string} entityType - Type d'entité (recette, depense, etc.)
 * @param {object} data - Données de l'entité
 * @param {string} userId - ID de l'utilisateur effectuant l'action
 * @param {string} comment - Commentaire optionnel
 */
function logAction(action, entityType, data, userId = 'system', comment = '') {
  try {
    const history = JSON.parse(localStorage.getItem('financeHistory')) || [];
    const timestamp = new Date().toISOString();
    
    const logEntry = {
      id: `log_${Date.now()}`,
      action,
      entityType,
      entityId: data.id || null,
      timestamp,
      userId,
      data: JSON.parse(JSON.stringify(data)), // Deep clone
      comment
    };
    
    // Ajouter à l'historique (limité aux 1000 dernières entrées)
    history.unshift(logEntry);
    localStorage.setItem('financeHistory', JSON.stringify(history.slice(0, 1000)));
    
    return logEntry;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'action dans l\'historique:', error);
    return null;
  }
}

/**
 * Récupère l'historique des actions avec filtrage
 * @param {object} filters - Filtres de recherche
 * @param {string} filters.entityType - Type d'entité à filtrer
 * @param {string} filters.action - Type d'action à filtrer
 * @param {string} filters.userId - ID de l'utilisateur à filtrer
 * @param {Date} filters.startDate - Date de début
 * @param {Date} filters.endDate - Date de fin
 * @param {number} limit - Nombre maximum de résultats à retourner
 * @returns {Array} Liste des entrées d'historique filtrées
 */
function getHistory(filters = {}, limit = 100) {
  try {
    const history = JSON.parse(localStorage.getItem('financeHistory')) || [];
    
    return history.filter(entry => {
      // Filtre par type d'entité
      if (filters.entityType && entry.entityType !== filters.entityType) {
        return false;
      }
      
      // Filtre par type d'action
      if (filters.action && entry.action !== filters.action) {
        return false;
      }
      
      // Filtre par utilisateur
      if (filters.userId && entry.userId !== filters.userId) {
        return false;
      }
      
      // Filtre par date
      const entryDate = new Date(entry.timestamp);
      if (filters.startDate && entryDate < new Date(filters.startDate)) {
        return false;
      }
      
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999); // Fin de la journée
        if (entryDate > endDate) {
          return false;
        }
      }
      
      return true;
    }).slice(0, limit);
    
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    return [];
  }
}

/**
 * Affiche l'historique dans un élément DOM
 * @param {HTMLElement} container - Élément conteneur
 * @param {object} filters - Filtres à appliquer
 */
function displayHistory(container, filters = {}) {
  try {
    if (!container) return;
    
    const history = getHistory(filters);
    
    if (history.length === 0) {
      container.innerHTML = `
        <div class="alert alert-info mb-0">
          Aucune activité récente à afficher.
        </div>
      `;
      return;
    }
    
    let html = `
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>Date/Heure</th>
              <th>Action</th>
              <th>Type</th>
              <th>Détails</th>
              <th>Utilisateur</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    history.forEach(entry => {
      const actionLabel = getActionLabel(entry.action);
      const entityLabel = getEntityLabel(entry.entityType);
      const details = getActionDetails(entry);
      
      html += `
        <tr>
          <td class="text-nowrap">${formatDate(entry.timestamp, 'dd/MM/yyyy HH:mm')}</td>
          <td><span class="badge ${getActionBadgeClass(entry.action)}">${actionLabel}</span></td>
          <td>${entityLabel}</td>
          <td>${details}</td>
          <td>${entry.userId}</td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </div>
    `;
    
    container.innerHTML = html;
    
  } catch (error) {
    console.error('Erreur lors de l\'affichage de l\'historique:', error);
    container.innerHTML = `
      <div class="alert alert-danger">
        Une erreur est survenue lors du chargement de l'historique.
      </div>
    `;
  }
}

/**
 * Retourne le libellé d'une action
 * @private
 */
function getActionLabel(action) {
  const labels = {
    'create': 'Création',
    'update': 'Modification',
    'delete': 'Suppression',
    'export': 'Export',
    'import': 'Import'
  };
  
  return labels[action] || action;
}

/**
 * Retourne le libellé d'un type d'entité
 * @private
 */
function getEntityLabel(entityType) {
  const labels = {
    'recette': 'Recette',
    'depense': 'Dépense',
    'coche': 'Coche',
    'user': 'Utilisateur',
    'settings': 'Paramètres'
  };
  
  return labels[entityType] || entityType;
}

/**
 * Retourne la classe CSS pour le badge d'action
 * @private
 */
function getActionBadgeClass(action) {
  const classes = {
    'create': 'bg-success',
    'update': 'bg-primary',
    'delete': 'bg-danger',
    'export': 'bg-info text-dark',
    'import': 'bg-warning text-dark'
  };
  
  return classes[action] || 'bg-secondary';
}

/**
 * Génère les détails d'une action pour l'affichage
 * @private
 */
function getActionDetails(entry) {
  if (!entry.data) return '';
  
  switch (entry.entityType) {
    case 'recette':
      return `Recette de ${entry.data.montant || '0'} FCFA (${entry.data.type || 'N/A'})`;
      
    case 'depense':
      return `Dépense de ${entry.data.montant || '0'} FCFA (${entry.data.categorie || 'N/A'})`;
      
    case 'coche':
      return `Coche du ${formatDate(entry.data.date, 'dd/MM/yyyy')} - Bus: ${entry.data.bus || 'N/A'}`;
      
    default:
      return entry.comment || 'Aucun détail';
  }
}

// Exporter les fonctions
window.logAction = logAction;
window.getHistory = getHistory;
window.displayHistory = displayHistory;
