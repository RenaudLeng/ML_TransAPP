/**
 * Gestion du suivi de la maintenance des véhicules
 * Gère l'affichage et la mise à jour des informations de suivi kilométrique
 */

export class MaintenanceTracking {
  constructor() {
    this.maintenanceTable = document.getElementById('maintenanceTable');
    this.mileageTable = document.getElementById('mileageTable');
    this.busList = [];
    this.preventiveMaintenances = [];
  }

  /**
   * Initialise le suivi de la maintenance
   * @param {Array} busList - Liste des bus
   * @param {Array} preventiveMaintenances - Liste des maintenances préventives
   */
  init(busList, preventiveMaintenances) {
    this.busList = busList || [];
    this.preventiveMaintenances = preventiveMaintenances || [];
    this.updateMileageTracking();
  }

  /**
   * Met à jour le tableau de suivi kilométrique
   */
  updateMileageTracking() {
    if (!this.mileageTable) return;

    // Effacer le contenu actuel du tableau
    this.mileageTable.innerHTML = '';

    this.busList.forEach(bus => {
      const vidange = this.preventiveMaintenances.find(p => 
        p.bus === bus.matricule && p.type === 'Vidange' && p.triggerType === 'km'
      );
      
      const nextOilChange = vidange ? parseInt(bus.mileage) + parseInt(vidange.interval) : 0;
      const progress = vidange ? Math.min(100, Math.round((bus.mileage / nextOilChange) * 100)) : 0;
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${bus.matricule} (${bus.nom})</td>
        <td>${bus.mileage.toLocaleString()} km</td>
        <td>${vidange?.lastDone || 'Non spécifiée'}</td>
        <td>${vidange ? nextOilChange.toLocaleString() + ' km' : 'Non planifiée'}</td>
        <td>
          ${vidange ? `
          <div class="progress">
            <div class="progress-bar ${this._getProgressBarClass(progress)}" 
                 role="progressbar" style="width: ${progress}%;" 
                 aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100">
              ${progress}%
            </div>
          </div>
          ` : '-'}
        </td>
      `;
      
      this.mileageTable.appendChild(tr);
    });
  }

  /**
   * Retourne la classe CSS pour la barre de progression en fonction du pourcentage
   * @param {number} progress - Pourcentage de progression
   * @returns {string} Classe CSS
   * @private
   */
  _getProgressBarClass(progress) {
    if (progress > 90) return 'bg-danger';
    if (progress > 70) return 'bg-warning';
    return 'bg-success';
  }
}

// Initialisation du suivi de maintenance
const maintenanceTracking = new MaintenanceTracking();

// Exposer l'instance globale si nécessaire
window.maintenanceTracking = maintenanceTracking;
