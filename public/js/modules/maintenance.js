/**
 * Module de gestion de la maintenance
 * Gère l'enregistrement, le suivi et le rapport des opérations de maintenance
 */

// Utiliser les utilitaires globaux
const CONFIG = window.MaintenanceConfig?.CONFIG || {};
const MaintenanceUtils = window.MaintenanceUtils || {};
const { 
  generateId, 
  validateMaintenanceData
} = MaintenanceUtils;

class MaintenanceManager {
  constructor() {
    this.maintenances = [];
    this.filteredMaintenances = [];
    this.currentPage = 1;
    this.itemsPerPage = CONFIG.PAGINATION.ITEMS_PER_PAGE;
    this.currentFilters = {};
    this.sortField = 'date';
    this.sortDirection = 'desc';
  }

  /**
   * Initialise le gestionnaire de maintenance
   * @returns {Promise<void>}
   */
  async init() {
    try {
      // Charger les données initiales
      await this.loadMaintenances();
      
      // Initialiser les écouteurs d'événements
      this._initEventListeners();
      
      // Afficher les données initiales
      this._updateUI();
    } catch (error) {
      this.showNotification('Erreur lors de l\'initialisation du gestionnaire de maintenance', 'error');
    }
  }

  /**
   * Charge les maintenances depuis l'API
   * @returns {Promise<void>}
   */
  async loadMaintenances() {
    try {
      // En production, on chargerait depuis l'API
      // this.maintenances = await maintenanceAPI.getAllMaintenances();
      
      // En attendant, on utilise le stockage local
      const savedMaintenances = localStorage.getItem('maintenances');
      this.maintenances = savedMaintenances ? JSON.parse(savedMaintenances) : [];
      
      // Initialiser les données filtrées
      this.filteredMaintenances = [...this.maintenances];
      
      // Trier les données
      this.sortMaintenances();
      
      return this.maintenances;
    } catch (error) {
      this.showNotification('Erreur lors du chargement des maintenances', 'error');
      throw error;
    }
  }

  /**
   * Récupère une maintenance par son ID
   * @param {string} id - ID de la maintenance
   * @returns {Object|null} La maintenance ou null si non trouvée
   */
  getMaintenance(id) {
    return this.maintenances.find(m => m.id === id) || null;
  }

  /**
   * Enregistre une maintenance
   * @param {Object} data - Données de la maintenance à enregistrer
   * @returns {Promise<Object>} La maintenance enregistrée
   */
  async saveMaintenance(data) {
    // Activer l'état de chargement du bouton
    const submitButton = document.querySelector('#maintenanceForm button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.classList.add('is-loading');
    }

    try {
      // Valider les données
      const validation = validateMaintenanceData(data);
      if (!validation.isValid) {
        throw new Error(validation.errors.join('\n'));
      }

      // Simuler un délai pour l'enregistrement
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // En production, on enverrait les données à l'API
      // const savedMaintenance = await maintenanceAPI.saveMaintenance(data);
      
      // Pour l'instant, on simule un enregistrement local
      const now = new Date().toISOString();
      let maintenance;
      
      if (data.id) {
        // Mise à jour d'une maintenance existante
        const index = this.maintenances.findIndex(m => m.id === data.id);
        if (index === -1) {
          throw new Error('Maintenance non trouvée');
        }
        
        maintenance = {
          ...this.maintenances[index],
          ...data,
          updatedAt: now
        };
        
        this.maintenances[index] = maintenance;
      } else {
        // Création d'une nouvelle maintenance
        maintenance = {
          ...data,
          id: generateId(),
          createdAt: now,
          updatedAt: now
        };
        
        this.maintenances.unshift(maintenance);
      }
      
      // Mettre à jour le stockage local
      localStorage.setItem('maintenances', JSON.stringify(this.maintenances));
      
      // Mettre à jour les données filtrées
      this.filteredMaintenances = [...this.maintenances];
      this.sortMaintenances();
      
      // Afficher une notification de succès
      this.showNotification(
        `Maintenance ${data.id ? 'mise à jour' : 'enregistrée'} avec succès`,
        'success'
      );
      
      return maintenance;
    } catch (error) {
      this.showNotification(`Erreur lors de l'enregistrement: ${error.message}`, 'error');
      throw error;
    } finally {
      // Désactiver l'état de chargement du bouton
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.classList.remove('is-loading');
      }
    }
  }

  /**
   * Supprime une maintenance
   * @param {string} id - ID de la maintenance à supprimer
   * @returns {Promise<boolean>} True si la suppression a réussi
   */
  async deleteMaintenance(id) {
    const index = this.maintenances.findIndex(m => m.id === id);
    if (index === -1) {
      throw new Error('Maintenance non trouvée');
    }
    
    this.maintenances.splice(index, 1);
    
    // Mise à jour du stockage local
    this._saveToLocalStorage();
    
    // Mise à jour des données filtrées
    this.filteredMaintenances = this._applyFilters(this.maintenances, this.currentFilters);
    
    return true;
  }

  /**
   * Affiche une notification
   * @param {string} message - Message à afficher
   * @param {string} type - Type de notification (success, danger, warning, info)
   */
  showNotification(message, type = 'info') {
    // Implémentation simplifiée - utilisez une bibliothèque de notifications en production
    // Par exemple: toastr[type](message);
    const container = document.querySelector('.notifications-container');
    if (container) {
      const notification = document.createElement('div');
      notification.className = `notification ${type}`;
      notification.textContent = message;
      container.appendChild(notification);
      
      // Supprimer la notification après 5 secondes
      setTimeout(() => {
        notification.remove();
      }, 5000);
    }
  }

  /**
   * Retourne la classe CSS du badge en fonction du statut
   * @param {string} status - Statut de la maintenance
   * @returns {string} Classe CSS du badge
   */
  getStatusBadgeClass(status) {
    switch (status.toLowerCase()) {
      case 'terminée':
        return 'success';
      case 'en cours':
        return 'primary';
      case 'planifiée':
        return 'info';
      case 'annulée':
        return 'secondary';
      case 'en attente':
        return 'warning';
      default:
        return 'secondary';
    }
  }

  /**
   * Initialise les écouteurs d'événements
   * @private
   */
  _initEventListeners() {
    // Gestion du formulaire de soumission
    const form = document.getElementById('maintenanceForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        try {
          await this.saveMaintenance(data);
          form.reset();
          // Recharger la liste des maintenances après la sauvegarde
          await this.loadMaintenances();
          this._updateUI();
        } catch (error) {
          this.showNotification('Erreur lors de la sauvegarde de la maintenance', 'error');
        }
      });
    }
    
    // Délégué d'événement pour les boutons d'action dans la liste
    document.addEventListener('click', async (e) => {
      const target = e.target.closest('button');
      if (!target) return;
      
      const maintenanceId = target.getAttribute('data-id');
      if (!maintenanceId) return;
      
      if (target.classList.contains('btn-outline-danger')) {
        // Bouton de suppression
        if (confirm('Êtes-vous sûr de vouloir supprimer cette maintenance ?')) {
          try {
            await this.deleteMaintenance(maintenanceId);
            this.showNotification('Maintenance supprimée avec succès', 'success');
            await this.loadMaintenances();
            this._updateUI();
          } catch (error) {
            this.showNotification('Erreur lors de la suppression de la maintenance', 'error');
          }
        }
      } else if (target.classList.contains('btn-outline-primary')) {
        // Bouton d'édition
        try {
          const maintenance = this.getMaintenance(maintenanceId);
          if (maintenance) {
            this._fillForm(maintenance);
            // Faire défiler jusqu'au formulaire
            document.getElementById('maintenanceForm')?.scrollIntoView({ behavior: 'smooth' });
          }
        } catch (error) {
          this.showNotification('Erreur lors du chargement de la maintenance', 'error');
        }
      }
    });
  }

  /**
   * Met à jour l'interface utilisateur
   * @private
   */
  _updateUI() {
    // Mettez à jour l'interface utilisateur ici
    // Par exemple, affichez la liste des maintenances
    this._renderMaintenanceList(this.maintenances);
  }

  /**
   * Remplit le formulaire avec les données d'une maintenance existante
   * @param {Object} maintenance - Données de la maintenance
   * @private
   */
  _fillForm(maintenance) {
    if (!maintenance) return;
    
    const form = document.getElementById('maintenanceForm');
    if (!form) return;
    
    // Mettre à jour l'ID de la maintenance dans le formulaire
    form.dataset.editId = maintenance.id || '';
    
    // Remplir les champs du formulaire
    Object.keys(maintenance).forEach(key => {
      const input = form.querySelector(`[name="${key}"]`);
      if (input) {
        const value = maintenance[key];
        
        if (input.type === 'checkbox') {
          input.checked = value;
        } else if (input.type === 'radio') {
          const radio = form.querySelector(`input[name="${key}"][value="${value}"]`);
          if (radio) radio.checked = true;
        } else if (input.tagName === 'SELECT' && input.multiple) {
          // Pour les sélections multiples
          Array.from(input.options).forEach(option => {
            option.selected = value.includes(option.value);
          });
        } else {
          input.value = value || '';
        }
      }
    });
    
    // Mettre à jour le texte du bouton de soumission
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.textContent = 'Mettre à jour la maintenance';
      submitButton.classList.remove('btn-primary');
      submitButton.classList.add('btn-warning');
    }
    
    // Faire défiler jusqu'au formulaire
    form.scrollIntoView({ behavior: 'smooth' });
  }

  /**
   * Affiche la liste des maintenances
   * @param {Array} maintenances - Liste des maintenances à afficher
   * @private
   */
  _renderMaintenanceList(maintenances) {
    const container = document.querySelector('#maintenanceList');
    if (!container) return;

    if (maintenances.length === 0) {
      container.innerHTML = '<div class="alert alert-info">Aucune maintenance enregistrée</div>';
      return;
    }

    let html = '<div class="table-responsive"><table class="table table-hover">';
    html += `
      <thead>
        <tr>
          <th>Véhicule</th>
          <th>Type</th>
          <th>Date</th>
          <th>Statut</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
    `;

    maintenances.forEach(maintenance => {
      const statusClass = this.getStatusBadgeClass(maintenance.status || '');
      html += `
        <tr>
          <td>${maintenance.vehicleId || 'N/A'}</td>
          <td>${maintenance.type || 'N/A'}</td>
          <td>${new Date(maintenance.date || '').toLocaleDateString()}</td>
          <td><span class="badge bg-${statusClass}">${maintenance.status || 'N/A'}</span></td>
          <td>
            <button class="btn btn-sm btn-outline-primary me-1" data-id="${maintenance.id}">
              <i class="ph ph-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" data-id="${maintenance.id}">
              <i class="ph ph-trash"></i>
            </button>
          </td>
        </tr>
      `;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
  }
}

// Création et initialisation du gestionnaire de maintenance
const maintenanceManager = new MaintenanceManager();

// Initialisation automatique lors du chargement du module
maintenanceManager.init().catch(() => {
  maintenanceManager.showNotification('Erreur lors de l\'initialisation du gestionnaire de maintenance', 'error');
});

// Exposer l'instance globalement
window.maintenanceManager = maintenanceManager;
