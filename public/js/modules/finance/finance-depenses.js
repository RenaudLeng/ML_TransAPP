// finance/finance-depenses.js

import { formatMontant, showNotification } from './finance-utils.js';

/**
 * Index de la dépense en cours d'édition
 * Utilisé par openEditDepenseModal et saveEditedDepense
 * @type {number}
 */
// eslint-disable-next-line no-unused-vars
let currentEditIndex = -1;

/**
 * Affiche les dépenses dans le tableau
 */
function afficherDepenses() {
  try {
    const depenses = JSON.parse(localStorage.getItem('depenses')) || [];
    const tbody = document.getElementById('depensesList');
    
    if (!tbody) {
      // Silently fail in production
      return;
    }
    
    tbody.innerHTML = ''; // Clear existing rows
    
    if (depenses.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">Aucune dépense enregistrée</td></tr>';
      return;
    }
    
    // Add each expense to the table
    depenses.forEach((depense, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${depense.date || 'N/A'}</td>
        <td>${depense.categorie || 'Non catégorisé'}</td>
        <td>${depense.description || 'Sans description'}</td>
        <td class="text-end">${formatMontant(depense.montant || 0)}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-primary" onclick="openEditDepenseModal(${index})">
            <i class="ph ph-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger ms-1" onclick="supprimerDepense(${index})">
            <i class="ph ph-trash"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
    
    // Update totals
    mettreAJourTotaux();
    
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      // Log en mode développement uniquement
      showNotification(`Erreur lors du chargement des dépenses: ${error.message}`, 'danger');
    } else {
      showNotification('Erreur lors du chargement des dépenses', 'danger');
    }
  }
}

/**
 * Ouvre la modale d'édition d'une dépense
 * @param {number} index - L'index de la dépense à éditer
 */
function openEditDepenseModal(index) {
  try {
    const depenses = JSON.parse(localStorage.getItem('depenses')) || [];
    const depense = depenses[index];
    
    if (!depense) {
      showNotification('Dépense introuvable', 'warning');
      return;
    }
    
    currentEditIndex = index;
    
    // Remplir le formulaire d'édition
    document.getElementById('editDepenseDate').value = depense.date || '';
    document.getElementById('editDepenseCategorie').value = depense.categorie || '';
    document.getElementById('editDepenseDescription').value = depense.description || '';
    document.getElementById('editDepenseMontant').value = depense.montant || '';
    
    // Ouvrir la modale
    const modal = new bootstrap.Modal(document.getElementById('editDepenseModal'));
    modal.show();
    
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      // Log en mode développement uniquement
      showNotification(`Erreur lors de l'ouverture de l'édition: ${error.message}`, 'danger');
    } else {
      showNotification('Erreur lors de l\'ouverture de l\'édition', 'danger');
    }
  }
}

/**
 * Sauvegarde une dépense modifiée
 */
// Fonction de sauvegarde d'une dépense modifiée (non utilisée pour le moment)
// function saveEditedDepense() {
//   try {
//     const depenses = JSON.parse(localStorage.getItem('depenses')) || [];
    
//     if (currentEditIndex === -1 || currentEditIndex >= depenses.length) {
//       showNotification('Index de dépense invalide', 'danger');
//       return;
//     }
    
//     // Récupérer les valeurs du formulaire
//     const editedDepense = {
//       date: document.getElementById('editDepenseDate').value,
//       categorie: document.getElementById('editDepenseCategorie').value,
//       description: document.getElementById('editDepenseDescription').value,
//       montant: parseFloat(document.getElementById('editDepenseMontant').value) || 0
//     };
    
//     // Valider les entrées
//     if (!editedDepense.date || !editedDepense.categorie || editedDepense.montant <= 0) {
//       showNotification('Veuillez remplir tous les champs obligatoires avec des valeurs valides', 'warning');
//       return;
//     }
    
//     // Mettre à jour la dépense
//     depenses[currentEditIndex] = editedDepense;
//     localStorage.setItem('depenses', JSON.stringify(depenses));
    
//     // Fermer la modale
//     const modal = bootstrap.Modal.getInstance(document.getElementById('editDepenseModal'));
//     if (modal) modal.hide();
    
//     // Mettre à jour l'affichage
//     afficherDepenses();
//     showNotification('Dépense mise à jour avec succès', 'success');
    
//   } catch (error) {
//     if (process.env.NODE_ENV !== 'production') {
//       console.error('Erreur lors de la sauvegarde de la dépense:', error);
//     }
//     showNotification('Erreur lors de la mise à jour de la dépense', 'danger');
//   } finally {
//     currentEditIndex = -1;
//   }
// }

/**
 * Supprime une dépense
 * @param {number} index - L'index de la dépense à supprimer
 */
function supprimerDepense(index) {
  try {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
      return;
    }
    
    const depenses = JSON.parse(localStorage.getItem('depenses')) || [];
    
    if (index < 0 || index >= depenses.length) {
      showNotification('Index de dépense invalide', 'danger');
      return;
    }
    
    // Supprimer la dépense
    depenses.splice(index, 1);
    localStorage.setItem('depenses', JSON.stringify(depenses));
    
    // Mettre à jour l'affichage
    afficherDepenses();
    showNotification('Dépense supprimée avec succès', 'success');
    
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      // Log en mode développement uniquement
      showNotification(`Erreur lors de la suppression: ${error.message}`, 'danger');
    } else {
      showNotification('Erreur lors de la suppression de la dépense', 'danger');
    }
  }
}

/**
 * Met à jour les totaux des dépenses
 */
function mettreAJourTotaux() {
  const depenses = JSON.parse(localStorage.getItem('depenses')) || [];
  const total = depenses.reduce((sum, depense) => sum + parseFloat(depense.montant || 0), 0);
  
  // Mettre à jour l'interface utilisateur
  const totalElement = document.getElementById('totalDepenses');
  if (totalElement) {
    totalElement.textContent = formatMontant(total);
  }
}

// Exposer les fonctions globalement pour la compatibilité
window.afficherDepenses = afficherDepenses;
window.openEditDepenseModal = openEditDepenseModal;
window.supprimerDepense = supprimerDepense;
window.mettreAJourTotaux = mettreAJourTotaux;

// Exporter les fonctions nécessaires
export { 
  afficherDepenses,
  openEditDepenseModal,
  supprimerDepense,
  mettreAJourTotaux
};
