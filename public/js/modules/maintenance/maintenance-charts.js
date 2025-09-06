/**
 * Gestion des graphiques de la page de maintenance
 * Utilise l'objet global Chart de chart.js (chargé via CDN)
 */

/* global Chart */

class MaintenanceCharts {
  constructor() {
    this.categoryChart = null;
    this.monthlyCostChart = null;
    this.busCostChart = null;
    this.priorityChart = null;
  }

  /**
   * Initialise tous les graphiques
   */
  init() {
    this.initCategoryChart();
    this.initMonthlyCostChart();
    this.initBusCostChart();
    this.initPriorityChart();
  }

  /**
   * Initialise le graphique par catégorie
   */
  initCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    const categories = ['Moteur', 'Transmission', 'Freinage', 'Pneumatique', 'Electricité', 'Carrosserie', 'Autre'];
    const categoryCounts = [15, 8, 12, 20, 9, 5, 3];
    
    this.categoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: categories,
        datasets: [{
          data: categoryCounts,
          backgroundColor: [
            '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e',
            '#e74a3b', '#5a5c69', '#858796'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: 'Répartition par catégorie'
          }
        }
      }
    });
  }

  /**
   * Initialise le graphique des coûts mensuels
   */
  initMonthlyCostChart() {
    const ctx = document.getElementById('monthlyCostChart');
    if (!ctx) return;

    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const monthlyCosts = [450000, 620000, 380000, 550000, 490000, 710000];
    
    this.monthlyCostChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: months.slice(0, monthlyCosts.length),
        datasets: [{
          label: 'Coût (FCFA)',
          data: monthlyCosts,
          backgroundColor: '#4e73df',
          borderColor: '#4e73df',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Coûts mensuels de maintenance'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return (value / 1000) + 'k';
              }
            }
          }
        }
      }
    });
  }

  /**
   * Initialise le graphique des coûts par bus
   */
  initBusCostChart() {
    const ctx = document.getElementById('busCostChart');
    if (!ctx) return;

    // Exemple de données - à remplacer par les données réelles
    const busLabels = ['BUS-001', 'BUS-002', 'BUS-003'];
    const busCosts = [1250000, 980000, 1560000];
    
    this.busCostChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: busLabels,
        datasets: [{
          label: 'Coût total (FCFA)',
          data: busCosts,
          backgroundColor: '#1cc88a',
          borderColor: '#1cc88a',
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Coûts totaux par bus'
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return (value / 1000) + 'k';
              }
            }
          }
        }
      }
    });
  }

  /**
   * Initialise le graphique des priorités
   */
  initPriorityChart() {
    const ctx = document.getElementById('priorityChart');
    if (!ctx) return;

    const priorities = ['Basse', 'Moyenne', 'Haute', 'Urgente'];
    const priorityCounts = [5, 8, 12, 10];
    
    this.priorityChart = new Chart(ctx, {
      type: 'polarArea',
      data: {
        labels: priorities,
        datasets: [{
          data: priorityCounts,
          backgroundColor: [
            'rgba(78, 115, 223, 0.8)',
            'rgba(28, 200, 138, 0.8)',
            'rgba(246, 194, 62, 0.8)',
            'rgba(231, 74, 59, 0.8)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right'
          },
          title: {
            display: true,
            text: 'Répartition par priorité'
          }
        },
        scales: {
          r: {
            pointLabels: {
              display: true,
              centerPointLabels: true,
              font: {
                size: 12
              }
            }
          }
        }
      }
    });
  }
}

// Initialisation des graphiques quand le DOM est prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCharts);
} else {
  initCharts();
}

function initCharts() {
  // Vérifier que Chart.js est chargé
  if (typeof Chart === 'undefined') {
    // Ne rien faire si Chart.js n'est pas chargé
    return;
  }

  const charts = new MaintenanceCharts();
  charts.init();
  
  // Exposer l'instance globale
  window.maintenanceCharts = charts;
}
