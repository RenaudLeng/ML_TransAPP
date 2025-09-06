// finance/finance-recettes.js

import { formatMontant, formatDate, showNotification } from './finance-utils.js';

/**
 * Affiche les recettes dans le tableau
 * @param {string} filter - Filtre optionnel pour les recettes
 */
function afficherRecettes(filter = '') {
  try {
    const recettes = JSON.parse(localStorage.getItem('recettes')) || [];
    const tbody = document.getElementById('recettesList');
    
    if (!tbody) {
      console.error('Élément recettesList introuvable');
      return;
    }
    
    tbody.innerHTML = '';
    
    const filteredRecettes = recettes.filter(recette => {
      if (!filter) return true;
      return recette.bus === filter;
    });
    
    if (filteredRecettes.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td colspan="7" class="text-center py-4">
          <div class="alert alert-info mb-0">
            Aucune recette enregistrée pour le moment.
          </div>
        </td>
      `;
      tbody.appendChild(tr);
      return;
    }
    
    filteredRecettes.forEach((recette, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${recette.date || 'N/A'}</td>
        <td>${recette.bus || 'N/A'}</td>
        <td>${recette.type || 'N/A'}</td>
        <td class="text-end">${formatMontant(recette.montant || 0)}</td>
        <td>${recette.moyenPaiement || 'N/A'}</td>
        <td>${recette.commentaire || ''}</td>
        <td class="text-nowrap">
          <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditRecetteModal(${index})">
            <i class="ph ph-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="supprimerRecette(${index})">
            <i class="ph ph-trash"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'affichage des recettes:', error);
    showNotification('Erreur lors du chargement des recettes', 'danger');
  }
}

/**
 * Ouvre la modale d'édition d'une recette
 * @param {number} index - L'index de la recette à éditer
 */
function openEditRecetteModal(index) {
  try {
    const recettes = JSON.parse(localStorage.getItem('recettes')) || [];
    if (index < 0 || index >= recettes.length) {
      showNotification('Recette non trouvée', 'warning');
      return;
    }
    
    const recette = recettes[index];
    currentEditIndex = index;
    
    // Remplir le formulaire
    document.getElementById('editRecetteDate').value = recette.date || '';
    document.getElementById('editBus').value = recette.bus || '';
    document.getElementById('editTypeRecette').value = recette.type || '';
    document.getElementById('editMontantRecette').value = recette.montant || '';
    document.getElementById('editMoyenPaiement').value = recette.moyenPaiement || '';
    document.getElementById('editCommentaireRecette').value = recette.commentaire || '';
    
    // Afficher la modale
    const modal = new bootstrap.Modal(document.getElementById('editRecetteModal'));
    modal.show();
    
  } catch (error) {
    console.error('Erreur lors de l\'ouverture de la modale d\'édition:', error);
    showNotification('Erreur lors de l\'ouverture de l\'édition', 'danger');
  }
}

/**
 * Sauvegarde une recette modifiée
 */
function saveEditedRecette() {
  try {
    const recettes = JSON.parse(localStorage.getItem('recettes')) || [];
    
    if (currentEditIndex < 0 || currentEditIndex >= recettes.length) {
      showNotification('Erreur: Index de recette invalide', 'danger');
      return;
    }
    
    // Récupérer les valeurs du formulaire
    const editedRecette = {
      date: document.getElementById('editRecetteDate').value,
      bus: document.getElementById('editBus').value,
      type: document.getElementById('editTypeRecette').value,
      montant: parseFloat(document.getElementById('editMontantRecette').value) || 0,
      moyenPaiement: document.getElementById('editMoyenPaiement').value,
      commentaire: document.getElementById('editCommentaireRecette').value,
      updatedAt: new Date().toISOString()
    };
    
    // Mettre à jour la recette
    recettes[currentEditIndex] = { ...recettes[currentEditIndex], ...editedRecette };
    
    // Sauvegarder dans le localStorage
    localStorage.setItem('recettes', JSON.stringify(recettes));
    
    // Mettre à jour l'affichage
    afficherRecettes();
    mettreAJourTotaux();
    
    // Fermer la modale
    const modal = bootstrap.Modal.getInstance(document.getElementById('editRecetteModal'));
    if (modal) modal.hide();
    
    showNotification('Recette mise à jour avec succès', 'success');
    
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la recette:', error);
    showNotification('Erreur lors de la sauvegarde', 'danger');
  } finally {
    currentEditIndex = -1;
  }
}

/**
 * Supprime une recette
 * @param {number} index - L'index de la recette à supprimer
 */
function supprimerRecette(index) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette recette ?')) {
    return;
  }
  
  try {
    const recettes = JSON.parse(localStorage.getItem('recettes')) || [];
    
    if (index < 0 || index >= recettes.length) {
      showNotification('Recette non trouvée', 'warning');
      return;
    }
    
    // Supprimer la recette
    recettes.splice(index, 1);
    
    // Mettre à jour le stockage
    localStorage.setItem('recettes', JSON.stringify(recettes));
    
    // Mettre à jour l'affichage
    afficherRecettes();
    mettreAJourTotaux();
    
    showNotification('Recette supprimée avec succès', 'success');
    
  } catch (error) {
    console.error('Erreur lors de la suppression de la recette:', error);
    showNotification('Erreur lors de la suppression', 'danger');
  }
}

// Exporter les fonctions
window.afficherRecettes = afficherRecettes;
window.openEditRecetteModal = openEditRecetteModal;
window.saveEditedRecette = saveEditedRecette;
window.supprimerRecette = supprimerRecette;
