// Configuration de la barre de navigation
const config = {
  navbarContainer: '#navbar-container',
  navbarUrl: '/partials/navbar.html',
  activeClass: 'active',
  debug: true
};

// Fonction de log en mode debug
function log(...args) {
  if (config.debug) {
    console.log('[Navbar]', ...args);
  }
}

console.log('Script include-navbar.js chargé avec succès');

// Fonction pour initialiser la barre de navigation
function initNavbar() {
  log('Initialisation de la barre de navigation...');
  
  // Ne pas afficher la barre de navigation sur la page d'authentification
  const currentPath = window.location.pathname.toLowerCase();
  if (currentPath.endsWith('auth.html') || currentPath.endsWith('login.html')) {
    return;
  }
  
  // Mettre en surbrillance l'onglet actif
  highlightActiveNavItem();
  
  // Initialiser les menus déroulants
  initDropdowns();
  
  // Ajouter des écouteurs d'événements
  addEventListeners();
  
  log('Barre de navigation initialisée avec succès');
}

// Fonction pour initialiser les menus déroulants
function initDropdowns() {
  const dropdowns = document.querySelectorAll('.dropdown-toggle');
  log(`Initialisation de ${dropdowns.length} menus déroulants`);
  
  dropdowns.forEach(dropdown => {
    // Vérifier si le menu déroulant est déjà initialisé
    if (dropdown.getAttribute('data-bs-toggle') === 'dropdown') {
      return;
    }
    
    // Initialiser les attributs nécessaires
    dropdown.setAttribute('data-bs-toggle', 'dropdown');
    dropdown.setAttribute('aria-expanded', 'false');
    
    // Vérifier si le menu déroulant existe
    const dropdownMenu = dropdown.nextElementSibling;
    if (!dropdownMenu || !dropdownMenu.classList.contains('dropdown-menu')) {
      console.warn('Menu déroulant non trouvé pour:', dropdown);
      return;
    }
    
    // Initialiser avec l'API Bootstrap si disponible
    if (typeof bootstrap !== 'undefined' && bootstrap.Dropdown) {
      try {
        new bootstrap.Dropdown(dropdown, {
          autoClose: true,
          boundary: 'clippingParents'
        });
      } catch (error) {
        console.error('Erreur lors de l\'initialisation du menu déroulant:', error);
      }
    }
  });
}

// Fonction pour ajouter les écouteurs d'événements
function addEventListeners() {
  // Ajouter un écouteur pour la fermeture des menus déroulants lors du clic en dehors
  document.addEventListener('click', (e) => {
    const dropdowns = document.querySelectorAll('.dropdown-menu.show');
    dropdowns.forEach(dropdown => {
      if (!dropdown.contains(e.target) && !dropdown.previousElementSibling.contains(e.target)) {
        const dropdownInstance = bootstrap.Dropdown.getInstance(dropdown.previousElementSibling);
        if (dropdownInstance) {
          dropdownInstance.hide();
        }
      }
    });
  });
}

// Fonction pour mettre en surbrillance l'onglet actif
function highlightActiveNavItem() {
  const currentPath = window.location.pathname.toLowerCase();
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (linkPath && currentPath.endsWith(linkPath)) {
      link.classList.add(config.activeClass);
      
      // Si c'est un sous-menu, ouvrir le menu parent
      const parentDropdown = link.closest('.dropdown-menu');
      if (parentDropdown) {
        const parentToggle = parentDropdown.previousElementSibling;
        if (parentToggle && parentToggle.classList.contains('dropdown-toggle')) {
          parentToggle.classList.add(config.activeClass);
          parentToggle.setAttribute('aria-expanded', 'true');
          parentDropdown.classList.add('show');
        }
      }
    } else {
      link.classList.remove(config.activeClass);
    }
  });
}

// Fonction pour charger la barre de navigation
function loadNavbar() {
  const navbarContainer = document.querySelector(config.navbarContainer);
  
  if (!navbarContainer) {
    console.error('Conteneur de la barre de navigation non trouvé');
    return;
  }
  
  fetch(config.navbarUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Erreur HTTP ! statut : ${response.status}`);
      }
      return response.text();
    })
    .then(html => {
      navbarContainer.innerHTML = html;
      initNavbar();
    })
    .catch(error => {
      console.error('Erreur lors du chargement de la barre de navigation:', error);
    });
}

// Démarrer le chargement de la barre de navigation quand le DOM est prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadNavbar);
} else {
  loadNavbar();
}

console.log('Script include-navbar.js exécuté avec succès - ' + new Date().toISOString());
console.log('Éléments .navbar trouvés:', document.querySelectorAll('.navbar').length);
