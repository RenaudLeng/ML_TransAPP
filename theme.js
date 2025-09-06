// Fonction pour initialiser le thème
function initTheme() {
  console.log('Initialisation du thème...');
  const toggleButton = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  
  if (toggleButton && themeIcon) {
    // Charger la préférence depuis localStorage
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // Appliquer le thème
    if (currentTheme === 'dark') {
      document.body.classList.add('dark-mode');
      themeIcon.className = 'ph ph-sun';
    } else {
      document.body.classList.remove('dark-mode');
      themeIcon.className = 'ph ph-moon';
    }

    // Gérer le changement de thème
    toggleButton.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark-mode');
      themeIcon.className = isDark ? 'ph ph-sun' : 'ph ph-moon';
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }
}

// Fonction pour initialiser le menu utilisateur
function initUserMenu() {
  // Mettre à jour le nom d'utilisateur affiché
  const usernameElement = document.getElementById('username');
  if (usernameElement) {
    const savedUsername = localStorage.getItem('username') || 'Admin';
    usernameElement.textContent = savedUsername;
  }

  // Gestion de la déconnexion
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Ici, vous pouvez ajouter la logique de déconnexion
      localStorage.removeItem('isLoggedIn');
      // Redirection vers la page de connexion
      window.location.href = 'login.html';
    });
  }
}

// Fonction pour initialiser les onglets
function initTabs() {
  try {
    // Activer le premier onglet par défaut
    const firstTabEl = document.querySelector('#financeTabs .nav-link');
    
    if (firstTabEl && bootstrap && bootstrap.Tab) {
      // Désactiver la gestion automatique des onglets par Bootstrap
      firstTabEl.addEventListener('click', function(event) {
        try {
          event.preventDefault();
          const tab = new bootstrap.Tab(firstTabEl);
          if (tab && typeof tab.show === 'function') {
            tab.show();
          }
        } catch (error) {
          console.error('Erreur lors du clic sur l\'onglet:', error);
        }
      });
      
      // Activer le premier onglet
      try {
        const firstTab = new bootstrap.Tab(firstTabEl);
        if (firstTab && typeof firstTab.show === 'function') {
          firstTab.show();
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation du premier onglet:', error);
      }
    } else if (firstTabEl) {
      console.warn('Bootstrap Tab n\'est pas disponible');
    }
    
    // Gérer le clic sur les onglets
    const tabEls = document.querySelectorAll('#financeTabs .nav-link');
    if (tabEls && tabEls.length > 0) {
      tabEls.forEach(function(tabEl) {
        if (tabEl) {
          tabEl.addEventListener('click', function(event) {
            try {
              event.preventDefault();
              const tab = new bootstrap.Tab(tabEl);
              if (tab && typeof tab.show === 'function') {
                tab.show();
              }
            } catch (error) {
              console.error('Erreur lors du clic sur l\'onglet:', error);
            }
          });
        }
      });
    }
    
    // Forcer l'affichage du contenu actif
    const activeTabPane = document.querySelector('.tab-pane.active');
    if (activeTabPane) {
      try {
        activeTabPane.classList.add('show');
        activeTabPane.style.display = 'block';
      } catch (error) {
        console.error('Erreur lors de l\'affichage de l\'onglet actif:', error);
      }
    }
  } catch (error) {
    console.error('Erreur critique dans initTabs:', error);
  }
}

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initUserMenu();
  
  // Initialiser les tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
  
  // Initialiser les dropdowns
  const dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'));
  const dropdownList = dropdownElementList.map(function (dropdownToggleEl) {
    return new bootstrap.Dropdown(dropdownToggleEl);
  });
});