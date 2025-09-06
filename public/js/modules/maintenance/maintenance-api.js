/**
 * Gestion des appels API pour le module de maintenance
 * Fournit une couche d'abstraction pour les appels réseau
 */

// Utiliser la configuration globale
class MaintenanceAPI {
  constructor() {
    this.baseUrl = window.MaintenanceConfig?.CONFIG?.API?.BASE_URL || '';
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * Effectue une requête HTTP
   * @private
   * @param {string} endpoint - Point de terminaison de l'API
   * @param {string} method - Méthode HTTP (GET, POST, PUT, DELETE)
   * @param {Object} [data] - Données à envoyer (pour POST/PUT)
   * @returns {Promise<Object>} Réponse de l'API
   */
  async _request(endpoint, method = 'GET', data = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const options = {
      method,
      headers: this.headers,
      credentials: 'include'
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Une erreur est survenue');
      }

      return responseData;
    } catch (error) {
      if (window.MaintenanceUtils?.showNotification) {
        window.MaintenanceUtils.showNotification(
          `Erreur API: ${error.message || 'Erreur inconnue'}`,
          'error'
        );
      }
      throw error;
    }
  }

  // ===== OPÉRATIONS CRUD =====

  /**
   * Récupère toutes les maintenances
   * @param {Object} [filters] - Filtres optionnels
   * @returns {Promise<Array>} Liste des maintenances
   */
  async getAllMaintenances(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    const endpoint = query ? 
      `${CONFIG.API.ENDPOINTS.MAINTENANCES}?${query}` : 
      CONFIG.API.ENDPOINTS.MAINTENANCES;
      
    return this._request(endpoint);
  }

  /**
   * Récupère une maintenance par son ID
   * @param {string} id - ID de la maintenance
   * @returns {Promise<Object>} Données de la maintenance
   */
  async getMaintenance(id) {
    return this._request(`${CONFIG.API.ENDPOINTS.MAINTENANCES}/${id}`);
  }

  /**
   * Crée une nouvelle maintenance
   * @param {Object} maintenanceData - Données de la maintenance
   * @returns {Promise<Object>} Maintenance créée
   */
  async createMaintenance(maintenanceData) {
    return this._request(
      CONFIG.API.ENDPOINTS.MAINTENANCES, 
      'POST', 
      maintenanceData
    );
  }

  /**
   * Met à jour une maintenance existante
   * @param {string} id - ID de la maintenance
   * @param {Object} updates - Mises à jour à appliquer
   * @returns {Promise<Object>} Maintenance mise à jour
   */
  async updateMaintenance(id, updates) {
    return this._request(
      `${CONFIG.API.ENDPOINTS.MAINTENANCES}/${id}`, 
      'PUT', 
      updates
    );
  }

  /**
   * Supprime une maintenance
   * @param {string} id - ID de la maintenance à supprimer
   * @returns {Promise<Object>} Résultat de la suppression
   */
  async deleteMaintenance(id) {
    return this._request(
      `${CONFIG.API.ENDPOINTS.MAINTENANCES}/${id}`, 
      'DELETE'
    );
  }

  // ===== OPÉRATIONS SPÉCIFIQUES =====

  /**
   * Récupère les maintenances par véhicule
   * @param {string} vehicleId - ID du véhicule
   * @returns {Promise<Array>} Liste des maintenances du véhicule
   */
  async getMaintenancesByVehicle(vehicleId) {
    return this._request(
      `${CONFIG.API.ENDPOINTS.VEHICLES}/${vehicleId}/maintenances`
    );
  }

  /**
   * Récupère les statistiques de maintenance
   * @param {Object} [params] - Paramètres de requête
   * @returns {Promise<Object>} Statistiques
   */
  async getMaintenanceStats(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? 
      `${CONFIG.API.ENDPOINTS.MAINTENANCES}/stats?${query}` : 
      `${CONFIG.API.ENDPOINTS.MAINTENANCES}/stats`;
      
    return this._request(endpoint);
  }

  /**
   * Exporte les données de maintenance
   * @param {Object} [filters] - Filtres optionnels
   * @param {string} [format='csv'] - Format d'export (csv, excel, pdf)
   * @returns {Promise<Blob>} Fichier exporté
   */
  async exportMaintenances(filters = {}, format = 'csv') {
    const query = new URLSearchParams({
      ...filters,
      format
    }).toString();
    
    const endpoint = `${CONFIG.API.ENDPOINTS.MAINTENANCES}/export?${query}`;
    
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: this.headers,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erreur lors de l\'export');
      }

      return await response.blob();
    } catch (error) {
      if (window.MaintenanceUtils?.showNotification) {
        window.MaintenanceUtils.showNotification(
          `Erreur d'export: ${error.message || 'Erreur inconnue'}`,
          'error'
        );
      }
      throw error;
    }
  }

  // ===== GESTION DES PIÈCES JOINTES =====

  /**
   * Télécharge une pièce jointe
   * @param {string} maintenanceId - ID de la maintenance
   * @param {string} attachmentId - ID de la pièce jointe
   * @returns {Promise<Blob>} Fichier téléchargé
   */
  async downloadAttachment(maintenanceId, attachmentId) {
    const endpoint = `${CONFIG.API.ENDPOINTS.MAINTENANCES}/${maintenanceId}/attachments/${attachmentId}`;
    
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: this.headers,
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors du téléchargement');
      }

      return await response.blob();
    } catch (error) {
      if (window.MaintenanceUtils?.showNotification) {
        window.MaintenanceUtils.showNotification(
          `Erreur de téléchargement: ${error.message}`,
          'error'
        );
      }
      throw error;
    }
  }

  /**
   * Téléverse une pièce jointe
   * @param {string} maintenanceId - ID de la maintenance
   * @ {FormData} formData - Données du formulaire contenant le fichier
   * @returns {Promise<Object>} Réponse du serveur
   */
  async uploadAttachment(maintenanceId, formData) {
    try {
      const response = await fetch(
        `${this.baseUrl}${CONFIG.API.ENDPOINTS.MAINTENANCES}/${maintenanceId}/attachments`, 
        {
          method: 'POST',
          headers: {
            // Ne pas définir 'Content-Type' pour permettre au navigateur de le faire
            'Accept': 'application/json'
          },
          body: formData,
          credentials: 'include'
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Erreur lors du téléversement');
      }

      if (window.MaintenanceUtils?.showNotification) {
        window.MaintenanceUtils.showNotification(
          'Fichier téléversé avec succès',
          'success'
        );
      }
      return responseData;
    } catch (error) {
      if (window.MaintenanceUtils?.showNotification) {
        window.MaintenanceUtils.showNotification(
          `Erreur de téléversement: ${error.message || 'Erreur inconnue'}`,
          'error'
        );
      }
      throw error;
    }
  }

  /**
   * Supprime une pièce jointe
   * @param {string} maintenanceId - ID de la maintenance
   * @param {string} attachmentId - ID de la pièce jointe
   * @returns {Promise<Object>} Réponse du serveur
   */
  async deleteAttachment(maintenanceId, attachmentId) {
    return this._request(
      `${CONFIG.API.ENDPOINTS.MAINTENANCES}/${maintenanceId}/attachments/${attachmentId}`, 
      'DELETE'
    );
  }
}

// Exposer l'instance de l'API globalement
window.maintenanceAPI = new MaintenanceAPI();
