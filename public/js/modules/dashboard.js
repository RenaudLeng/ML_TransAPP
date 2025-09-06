/**
 * Initialisation du tableau de bord
 */
function initDashboard() {
    // Mise à jour de la date et l'heure
    function updateDateTime() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        document.getElementById('current-date').textContent = now.toLocaleDateString('fr-FR', options);
    }
    
    // Mettre à jour l'heure toutes les minutes
    updateDateTime();
    setInterval(updateDateTime, 60000);
    
    // Initialiser les tooltips Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialiser les graphiques si Chart.js est disponible
    if (typeof Chart !== 'undefined') {
        initVehicleStatusChart();
        // Ajouter d'autres initialisations de graphiques ici
    }
}

/**
 * Initialisation du graphique de statut des véhicules
 */
function initVehicleStatusChart() {
    const ctx = document.getElementById('vehicleStatusChart');
    if (!ctx) return;
    
    const data = {
        labels: ['En service', 'En maintenance', 'Hors service'],
        datasets: [{
            data: [18, 4, 2],
            backgroundColor: ['#2ecc71', '#f39c12', '#e74c3c'],
            borderWidth: 0,
            cutout: '70%'
        }]
    };
    
    const config = {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: {
                            family: 'Nunito, sans-serif'
                        }
                    }
                }
            }
        }
    };
    
    new Chart(ctx, config);
}

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
});
