/**
 * Initialisation du module de maintenance
 * Configure et initialise les composants nécessaires
 */

import { MaintenanceManager } from './maintenance.js';
import { initDatePickers, initDateTimePickers, showNotification } from './maintenance-utils.js';
import { maintenanceAPI } from './maintenance-api.js';

class MaintenanceApp {
  constructor() {
    this.manager = new MaintenanceManager();
    this.datePickers = [];
    this.dateTimePickers = [];
    this.initialized = false;
  }

  /**
   * Initialise l'application de maintenance
   */
  async init() {
    if (this.initialized) return;

    try {
      // Initialiser les sélecteurs de date
      this._initDatePickers();
      
      // Initialiser les gestionnaires d'événements
      this._initEventListeners();
      
      // Charger les données initiales
      await this._loadInitialData();
      
      // Mettre à jour l'interface utilisateur
      this._updateUI();
      
      this.initialized = true;
      console.log('Maintenance App initialized');
      
    } catch (error) {
      console.error('Error initializing Maintenance App:', error);
      showNotification('Erreur lors de l\'initialisation de l\'application', 'error');
    }
  }

  /**
   * Initialise les sélecteurs de date
   * @private
   */
  _initDatePickers() {
    // Détruire les instances existantes
    this._destroyDatePickers();
    
    // Initialiser les sélecteurs de date simple
    this.datePickers.push(
      initDatePickers('[data-datepicker]', {
        dateFormat: 'Y-m-d',
        altInput: true,
        altFormat: 'j F Y',
        locale: 'fr',
        allowInput: true
      })
    );
    
    // Initialiser les sélecteurs de date et heure
    this.dateTimePickers.push(
      initDateTimePickers('[data-datetimepicker]', {
        enableTime: true,
        dateFormat: 'Y-m-d H:i',
        altInput: true,
        altFormat: 'j F Y à H:i',
        time_24hr: true,
        locale: 'fr',
        allowInput: true
      })
    );
  }

  /**
   * Détruit les instances de sélecteurs de date
   * @private
   */
  _destroyDatePickers() {
    this.datePickers.forEach(picker => {
      if (picker && typeof picker.destroy === 'function') {
        picker.destroy();
      }
    });
    
    this.dateTimePickers.forEach(picker => {
      if (picker && typeof picker.destroy === 'function') {
        picker.destroy();
      }
    });
    
    this.datePickers = [];
    this.dateTimePickers = [];
  }

  /**
   * Initialise les gestionnaires d'événements
   * @private
   */
  _initEventListeners() {
    // Gestion du formulaire
    const form = document.getElementById('maintenanceForm');
    if (form) {
      form.addEventListener('submit', (e) => this._handleFormSubmit(e));
    }

    // Gestion des onglets
    const tabEls = document.querySelectorAll('button[data-bs-toggle="tab"]');
    tabEls.forEach(tabEl => {
      tabEl.addEventListener('shown.bs.tab', (event) => {
        const target = event.target;
        const tabId = target.getAttribute('data-bs-target').substring(1); // Enlever le # au début
        this._handleTabChange(tabId);
      });

      // Déclencher manuellement l'événement pour l'onglet actif au chargement
      if (tabEl.classList.contains('active')) {
        const tabId = tabEl.getAttribute('data-bs-target').substring(1);
        this._handleTabChange(tabId);
      }
    });

    // Gestion des filtres
    const filterForm = document.getElementById('filterForm');
    if (filterForm) {
      filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this._applyFilters();
      });
      
      filterForm.addEventListener('reset', () => {
        setTimeout(() => this._applyFilters(), 0);
      });
    }

    // Gestion des boutons d'action
    document.addEventListener('click', (e) => {
      // Bouton d'édition
      if (e.target.closest('[data-action="edit"]')) {
        const id = e.target.closest('[data-action="edit"]').dataset.id;
        this._editMaintenance(id);
      }
      
      // Bouton de suppression
      if (e.target.closest('[data-action="delete"]')) {
        const id = e.target.closest('[data-action="delete"]').dataset.id;
        this._confirmDeleteMaintenance(id);
      }
      
      // Bouton d'export
      if (e.target.closest('[data-action="export"]')) {
        const format = e.target.closest('[data-action="export"]').dataset.format || 'pdf';
        this._exportMaintenances(format);
      }
    });
    
    // Gestion du changement de vue
    const viewToggle = document.getElementById('viewToggle');
    if (viewToggle) {
      viewToggle.addEventListener('change', (e) => {
        this._toggleView(e.target.value);
      });
    }
    
    // Écoute des événements personnalisés
    window.addEventListener('maintenance:refresh', () => this._refreshData());
    
    // Gestion du mode sombre/clair
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
      darkModeToggle.addEventListener('change', (e) => {
        document.body.classList.toggle('dark-mode', e.target.checked);
        localStorage.setItem('darkMode', e.target.checked);
      });
    }
  }

  /**
   * Charge les données initiales
   * @private
   */
  async _loadInitialData() {
    try {
      // Afficher un indicateur de chargement
      this._showLoading(true);
      
      // Charger les maintenances
      await this.manager.loadMaintenances();
      
      // Charger les véhicules (si nécessaire)
      await this._loadVehicles();
      
      // Charger les statistiques
      await this._loadStats();
      
    } catch (error) {
      console.error('Error loading initial data:', error);
      showNotification('Erreur lors du chargement des données', 'error');
    } finally {
      this._showLoading(false);
    }
  }

  /**
   * Charge la liste des véhicules
   * @private
   */
  async _loadVehicles() {
    try {
      // Ici, vous pourriez charger la liste des véhicules depuis une API
      // Par exemple: const vehicles = await vehicleAPI.getAll();
      // Pour l'instant, utilisons un tableau vide
      const vehicles = [];
      
      // Mettre à jour la liste déroulante des véhicules
      const select = document.getElementById('vehicleSelect');
      if (select) {
        select.innerHTML = `
          <option value="">Sélectionnez un véhicule</option>
          ${vehicles.map(v => `<option value="${v.id}">${v.name} (${v.plate})</option>`).join('')}
        `;
      }
      
      return vehicles;
    } catch (error) {
      console.error('Error loading vehicles:', error);
      showNotification('Erreur lors du chargement des véhicules', 'error');
      return [];
    }
  }

  /**
   * Charge les statistiques
   * @private
   */
  async _loadStats() {
    try {
      // Ici, vous pourriez charger les statistiques depuis une API
      // Par exemple: const stats = await maintenanceAPI.getStats();
      // Pour l'instant, utilisons un objet vide
      const stats = {};
      
      // Mettre à jour les graphiques avec les données
      this._updateCharts(stats);
      
      return stats;
    } catch (error) {
      console.error('Error loading stats:', error);
      showNotification('Erreur lors du chargement des statistiques', 'error');
      return null;
    }
  }

  /**
   * Met à jour les graphiques avec les données fournies
   * @param {Object} stats - Données statistiques
   * @private
   */
  _updateCharts(stats) {
    // Implémentez la mise à jour des graphiques ici
    // Par exemple, en utilisant Chart.js
    console.log('Updating charts with data:', stats);
  }

  /**
   * Gère la soumission du formulaire
   * @param {Event} e - Événement de soumission
   * @private
   */
  async _handleFormSubmit(e) {
    e.preventDefault();
    
    try {
      // Récupérer les données du formulaire
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());
      
      // Valider les données
      const isValid = this._validateFormData(data);
      if (!isValid) return;
      
      // Afficher un indicateur de chargement
      this._showLoading(true);
      
      // Enregistrer la maintenance
      const maintenance = await this.manager.saveMaintenance(data);
      
      // Afficher un message de succès
      showNotification('Maintenance enregistrée avec succès', 'success');
      
      // Réinitialiser le formulaire
      e.target.reset();
      
      // Recharger les données
      await this._refreshData();
      
    } catch (error) {
      console.error('Error saving maintenance:', error);
      showNotification(`Erreur lors de l'enregistrement: ${error.message}`, 'error');
    } finally {
      this._showLoading(false);
    }
  }

  /**
   * Valide les données du formulaire
   * @param {Object} data - Données à valider
   * @returns {boolean} True si les données sont valides
   * @private
   */
  _validateFormData(data) {
    // Implémentez la validation des données ici
    // Retournez true si valide, false sinon
    return true;
  }

  /**
   * Gère le changement d'onglet
   * @param {string} tabId - ID de l'onglet actif
   * @private
   */
  _handleTabChange(tabId) {
    console.log('Tab changed to:', tabId);
    
    switch (tabId) {
      case 'historique':
        this._loadMaintenanceHistory();
        break;
        
      case 'planification':
        this._loadMaintenancePlanning();
        break;
        
      case 'rapports':
        this._loadReports();
        break;
        
      default:
        break;
    }
  }

  /**
   * Charge l'historique des maintenances
   * @private
   */
  async _loadMaintenanceHistory() {
    try {
      this._showLoading(true, 'Chargement de l\'historique...');
      
      // Ici, vous pourriez charger l'historique depuis une API
      // Par exemple: const history = await maintenanceAPI.getHistory();
      // Pour l'instant, utilisons les données du gestionnaire
      const history = this.manager.getMaintenances();
      
      // Mettre à jour l'interface utilisateur
      this._renderMaintenanceList(history);
      
    } catch (error) {
      console.error('Error loading maintenance history:', error);
      showNotification('Erreur lors du chargement de l\'historique', 'error');
    } finally {
      this._showLoading(false);
    }
  }

  /**
   * Charge le planning des maintenances
   * @private
   */
  async _loadMaintenancePlanning() {
    try {
      this._showLoading(true, 'Chargement du planning...');
      
      // Ici, vous pourriez charger le planning depuis une API
      // Pour l'instant, utilisons un tableau vide
      const planning = [];
      
      // Mettre à jour l'interface utilisateur
      this._renderPlanning(planning);
      
    } catch (error) {
      console.error('Error loading maintenance planning:', error);
      showNotification('Erreur lors du chargement du planning', 'error');
    } finally {
      this._showLoading(false);
    }
  }

  /**
   * Charge les rapports
   * @private
   */
  async _loadReports() {
    try {
      this._showLoading(true, 'Génération des rapports...');
      
      // Ici, vous pourriez générer ou charger les rapports
      // Pour l'instant, utilisons un objet vide
      const reports = {};
      
      // Mettre à jour l'interface utilisateur
      this._renderReports(reports);
      
    } catch (error) {
      console.error('Error loading reports:', error);
      showNotification('Erreur lors du chargement des rapports', 'error');
    } finally {
      this._showLoading(false);
    }
  }

  /**
   * Applique les filtres
   * @private
   */
  async _applyFilters() {
    try {
      const form = document.getElementById('filterForm');
      if (!form) return;
      
      const formData = new FormData(form);
      const filters = Object.fromEntries(formData.entries());
      
      // Supprimer les champs vides
      Object.keys(filters).forEach(key => {
        if (filters[key] === '') delete filters[key];
      });
      
      // Appliquer les filtres
      const filteredData = this.manager.filterMaintenances(filters);
      
      // Mettre à jour l'affichage
      this._renderMaintenanceList(filteredData);
      
    } catch (error) {
      console.error('Error applying filters:', error);
      showNotification('Erreur lors de l\'application des filtres', 'error');
    }
  }

  /**
   * Affiche/masque l'indicateur de chargement
   * @param {boolean} show - Afficher ou masquer
   * @param {string} [message] - Message optionnel
   * @private
   */
  _showLoading(show, message = 'Chargement...') {
    try {
      const loadingIndicator = document.getElementById('loadingIndicator');
      if (!loadingIndicator) {
        console.warn('Élément loadingIndicator non trouvé dans le DOM');
        return;
      }
      
      if (show) {
        loadingIndicator.textContent = message;
        loadingIndicator.style.display = 'flex';
        loadingIndicator.classList.remove('d-none');
        // Forcer le reflow pour s'assurer que l'animation se déclenche
        void loadingIndicator.offsetWidth;
        loadingIndicator.classList.add('show');
      } else {
        // Ajouter une animation de fondu avant de masquer
        loadingIndicator.classList.remove('show');
        setTimeout(() => {
          loadingIndicator.classList.add('d-none');
          loadingIndicator.style.display = 'none';
        }, 300); // Temps de l'animation de fondu
      }
    } catch (error) {
      console.error('Erreur dans _showLoading:', error);
    }
  }

  /**
   * Met à jour l'interface utilisateur
   * @private
   */
  _updateUI() {
    // Mettre à jour les compteurs
    this._updateCounters();
    
    // Mettre à jour la liste des maintenances
    this._loadMaintenanceHistory();
    
    // Mettre à jour les graphiques
    this._loadStats();
  }

  /**
   * Met à jour les compteurs
   * @private
   */
  _updateCounters() {
    const maintenances = this.manager.getMaintenances();
    const planned = maintenances.filter(m => m.status === 'planned').length;
    const inProgress = maintenances.filter(m => m.status === 'in_progress').length;
    const completed = maintenances.filter(m => m.status === 'completed').length;
    
    // Mettre à jour les éléments du DOM
    this._updateCounter('plannedCounter', planned);
    this._updateCounter('inProgressCounter', inProgress);
    this._updateCounter('completedCounter', completed);
    this._updateCounter('totalCounter', maintenances.length);
  }

  /**
   * Met à jour un compteur dans le DOM
   * @param {string} id - ID de l'élément
   * @param {number} value - Valeur à afficher
   * @private
   */
  _updateCounter(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  /**
   * Affiche la liste des maintenances
   * @param {Array} maintenances - Liste des maintenances à afficher
   * @private
   */
  _renderMaintenanceList(maintenances) {
    const container = document.getElementById('maintenanceList');
    if (!container) return;
    
    if (maintenances.length === 0) {
      container.innerHTML = `
        <div class="alert alert-info">
          Aucune maintenance trouvée.
        </div>
      `;
      return;
    }
    
    const html = `
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Date</th>
              <th>Véhicule</th>
              <th>Type</th>
              <th>Description</th>
              <th>Statut</th>
              <th>Coût</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${maintenances.map(maintenance => `
              <tr>
                <td>${new Date(maintenance.date).toLocaleDateString('fr-FR')}</td>
                <td>${maintenance.vehicleId || '-'}</td>
                <td>${maintenance.type || '-'}</td>
                <td>${maintenance.description ? 
                  (maintenance.description.length > 50 ? 
                    `${maintenance.description.substring(0, 50)}...` : 
                    maintenance.description) : 
                  '-'}
                </td>
                <td>
                  <span class="badge ${this._getStatusBadgeClass(maintenance.status)}">
                    ${this._formatStatus(maintenance.status)}
                  </span>
                </td>
                <td>${maintenance.cost ? `${maintenance.cost} €` : '-'}</td>
                <td>
                  <button class="btn btn-sm btn-outline-primary" data-action="edit" data-id="${maintenance.id}">
                    <i class="ph ph-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger ms-1" data-action="delete" data-id="${maintenance.id}">
                    <i class="ph ph-trash"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    
    container.innerHTML = html;
  }

  /**
   * Formate un statut pour l'affichage
   * @param {string} status - Statut à formater
   * @returns {string} Statut formaté
   * @private
   */
  _formatStatus(status) {
    const statusMap = {
      'planned': 'Planifiée',
      'in_progress': 'En cours',
      'completed': 'Terminée',
      'cancelled': 'Annulée'
    };
    
    return statusMap[status] || status;
  }

  /**
   * Obtient la classe CSS pour un statut
   * @param {string} status - Statut
   * @returns {string} Classe CSS
   * @private
   */
  _getStatusBadgeClass(status) {
    const classMap = {
      'planned': 'bg-info',
      'in_progress': 'bg-primary',
      'completed': 'bg-success',
      'cancelled': 'bg-secondary'
    };
    
    return classMap[status] || 'bg-secondary';
  }

  /**
   * Rafraîchit les données
   * @private
   */
  async _refreshData() {
    await this._loadInitialData();
    this._updateUI();
  }

  /**
   * Bascule entre les vues (liste/grille)
   * @param {string} view - Vue à afficher (list/grid)
   * @private
   */
  _toggleView(view) {
    const container = document.getElementById('maintenanceList');
    if (!container) return;
    
    container.dataset.view = view;
    
    // Mettre à jour les boutons de bascule
    document.querySelectorAll('[data-view-toggle]').forEach(btn => {
      if (btn.dataset.viewToggle === view) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    // Recharger les données avec la nouvelle vue
    this._loadMaintenanceHistory();
  }

  /**
   * Affiche le formulaire d'édition
   * @param {string} id - ID de la maintenance à éditer
   * @private
   */
  async _editMaintenance(id) {
    try {
      // Récupérer la maintenance
      const maintenance = await this.manager.getMaintenance(id);
      if (!maintenance) {
        throw new Error('Maintenance non trouvée');
      }
      
      // Remplir le formulaire
      this._fillForm(maintenance);
      
      // Afficher le formulaire
      const modal = new bootstrap.Modal(document.getElementById('maintenanceModal'));
      modal.show();
      
    } catch (error) {
      console.error('Error editing maintenance:', error);
      showNotification(`Erreur lors de l'édition: ${error.message}`, 'error');
    }
  }

  /**
   * Remplit le formulaire avec les données d'une maintenance
   * @param {Object} maintenance - Données de la maintenance
   * @private
   */
  _fillForm(maintenance) {
    const form = document.getElementById('maintenanceForm');
    if (!form) return;
    
    // Réinitialiser le formulaire
    form.reset();
    
    // Remplir les champs
    Object.keys(maintenance).forEach(key => {
      const input = form.querySelector(`[name="${key}"]`);
      if (input) {
        if (input.type === 'checkbox') {
          input.checked = maintenance[key];
        } else {
          input.value = maintenance[key] || '';
        }
      }
    });
    
    // Mettre à jour le titre du formulaire
    const modalTitle = document.querySelector('#maintenanceModal .modal-title');
    if (modalTitle) {
      modalTitle.textContent = `Éditer la maintenance #${maintenance.id}`;
    }
    
    // Stocker l'ID de la maintenance en cours d'édition
    form.dataset.editId = maintenance.id;
  }

  /**
   * Demande une confirmation avant suppression
   * @param {string} id - ID de la maintenance à supprimer
   * @private
   */
  async _confirmDeleteMaintenance(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette maintenance ?')) {
      return;
    }
    
    try {
      this._showLoading(true, 'Suppression en cours...');
      
      // Supprimer la maintenance
      await this.manager.deleteMaintenance(id);
      
      // Afficher un message de succès
      showNotification('Maintenance supprimée avec succès', 'success');
      
      // Recharger les données
      await this._refreshData();
      
    } catch (error) {
      console.error('Error deleting maintenance:', error);
      showNotification(`Erreur lors de la suppression: ${error.message}`, 'error');
    } finally {
      this._showLoading(false);
    }
  }

  /**
   * Exporte les données
   * @param {string} format - Format d'export (pdf, excel, csv)
   * @private
   */
  async _exportMaintenances(format = 'pdf') {
    try {
      this._showLoading(true, 'Génération du fichier...');
      
      // Récupérer les données à exporter
      const data = this.manager.getMaintenances();
      
      // Ici, vous pourriez utiliser une API pour générer le fichier
      // Par exemple: const file = await maintenanceAPI.export(data, format);
      // Pour l'instant, simulons l'export
      console.log(`Exporting ${data.length} maintenances to ${format}`);
      
      // Simuler un téléchargement
      this._downloadFile(`maintenances.${format}`, 'application/octet-stream');
      
      // Afficher un message de succès
      showNotification(`Export ${format.toUpperCase()} généré avec succès`, 'success');
      
    } catch (error) {
      console.error('Error exporting maintenances:', error);
      showNotification(`Erreur lors de l'export: ${error.message}`, 'error');
    } finally {
      this._showLoading(false);
    }
  }

  /**
   * Simule le téléchargement d'un fichier
   * @param {string} filename - Nom du fichier
   * @param {string} type - Type MIME
   * @param {string} [content] - Contenu du fichier (optionnel)
   * @private
   */
  _downloadFile(filename, type, content = '') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
}

// Initialisation de l'application lors du chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  const app = new MaintenanceApp();
  app.init();
  
  // Exposer l'instance globale (pour le débogage)
  window.maintenanceApp = app;
});
