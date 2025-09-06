document.addEventListener('DOMContentLoaded', function() {
  // Mettre à jour l'heure actuelle
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

    const dateTimeString = now.toLocaleDateString('fr-FR', options);
    const dateElement = document.getElementById('current-date');
    const dateDisplayElement = document.getElementById('current-date-display');

    if (dateElement) dateElement.textContent = dateTimeString;
    if (dateDisplayElement) dateDisplayElement.textContent = dateTimeString;
  }

  // Défilement fluide vers le haut de la page
  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // Initialiser les tooltips Bootstrap
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Gérer le clic sur le bouton de retour en haut
  const backToTopBtn = document.querySelector('.app-footer [data-bs-toggle="tooltip"]');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function(e) {
      e.preventDefault();
      scrollToTop();
    });
  }

  // Mettre à jour l'heure toutes les secondes
  setInterval(updateDateTime, 1000);
  updateDateTime(); // Appel initial

  // Animation au chargement des cartes
  document.querySelectorAll('.dashboard-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = `all 0.3s ease ${index * 0.1}s`;
    
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 100);
  });

  // Gestion du thème clair/sombre
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      document.body.classList.toggle('dark-theme');
      localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    });
  }

  // Vérifier le thème sauvegardé
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme');
  }

  // Initialiser le graphique de statut des véhicules
  initializeVehicleChart();
});

// Initialiser les graphiques de statut des véhicules
function initializeVehicleChart() {
  // Graphique principal dans la section des activités
  initChart('vehicleStatusChart', [18, 4, 2]);
  // Graphique détaillé dans la section des statistiques
  initChart('vehicleStatusChartDetail', [18, 4, 2]);
}

// Initialiser un graphique de type doughnut
function initChart(chartId, dataValues) {
  const ctx = document.getElementById(chartId);
  if (!ctx) return;
  
  // Détruire l'instance de graphique existante si elle existe
  if (ctx.chart) {
    ctx.chart.destroy();
  }
  
  const data = {
    labels: ['En service', 'En maintenance', 'Hors service'],
    datasets: [{
      data: dataValues,
      backgroundColor: ['#2ecc71', '#f39c12', '#e74c3c'],
      borderWidth: 0,
      hoverBorderColor: 'rgba(234, 236, 244, 1)'
    }]
  };
  
  const config = {
    type: 'doughnut',
    data: data,
    options: {
      maintainAspectRatio: false,
      responsive: true,
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
      },
      cutout: '70%'
    }
  };
  
  // Stocker la référence au graphique
  ctx.chart = new Chart(ctx, config);
}

// Fonction pour charger le contenu dynamiquement
window.loadContent = function(url, targetId) {
  const target = document.getElementById(targetId || 'mainContent');
  if (!target) {
    return;
  }
  
  target.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Chargement...</span></div></div>';
  
  fetch(url)
    .then(response => response.text())
    .then(html => {
      target.innerHTML = html;
      initDynamicContent();
      return null;
    })
    .catch(error => {
      console.error('Erreur lors du chargement du contenu:', error);
      target.innerHTML = '<div class="alert alert-danger">Erreur lors du chargement du contenu</div>';
    });
};

// Initialiser le contenu dynamique
function initDynamicContent() {
  // Initialiser les composants dynamiques
  initializeVehicleChart();
  
  // Initialiser les tooltips
  initTooltips();
  
  // Initialiser les animations des cartes
  initCardAnimations();
}

// Initialiser les tooltips
function initTooltips() {
  const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.forEach(tooltipTriggerEl => {
    // Vérifier si le tooltip est déjà initialisé
    if (!tooltipTriggerEl._tooltip) {
      // eslint-disable-next-line no-new
      new bootstrap.Tooltip(tooltipTriggerEl);
    }
  });
}

// Initialiser les animations des cartes
function initCardAnimations() {
  document.querySelectorAll('.card.hover-shadow-sm').forEach(card => {
    card.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
    
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-5px)';
      card.style.boxShadow = '0 .5rem 1rem rgba(0, 0, 0, 0.15)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)';
    });
  });
}
