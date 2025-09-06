/**
 * Script de gestion de la barre de navigation
 * - Charge la barre de navigation de maniÃ¨re asynchrone
 * - Met en surbrillance l'onglet actif
 * - GÃ¨re les menus dÃ©roulants
 */

(function() {
  'use strict';

  // Configuration
  const config = {
    navbarContainer: '#navbar-container',
    navbarUrl: 'partials/navbar.html', // Chemin relatif
    activeClass: 'active',
    debug: true // Activer le débogage pour le moment
  };

  // Fonction de log en mode debug
  function log(...args) {
    if (config.debug && window.console && typeof window.console.log === 'function') {
      window.console.log('[Navbar]', ...args);
    }
  }

  // Fonction pour initialiser la barre de navigation
  function initNavbar() {
    log('Initialisation de la barre de navigation...');
    
    // Ne pas afficher sur les pages d'authentification
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
      dropdown.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const dropdownMenu = this.nextElementSibling;
        if (dropdownMenu && dropdownMenu.classList.contains('dropdown-menu')) {
          // Fermer les autres menus ouverts
          document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
            if (menu !== dropdownMenu) menu.classList.remove('show');
          });
          
          // Basculer le menu actuel
          dropdownMenu.classList.toggle('show');
        }
      });
    });
  }

  // Fonction pour ajouter les écouteurs d'événements
  function addEventListeners() {
    // Fermer les menus déroulants en cliquant à l'extérieur
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
          menu.classList.remove('show');
        });
      }
    });
    
    // Gérer le redimensionnement de la fenêtre
    window.addEventListener('resize', function() {
      document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
        menu.classList.remove('show');
      });
    });
  }

  // Fonction pour mettre en surbrillance l'onglet actif
  function highlightActiveNavItem() {
    try {
      const currentPath = window.location.pathname.split('/').pop() || 'index.html';
      const navLinks = document.querySelectorAll('.nav-link');
      
      log(`Mise en surbrillance du menu actif pour: ${currentPath}`);
      
      navLinks.forEach(link => {
        if (!link || !link.getAttribute || !link.classList) return;
        
        const href = link.getAttribute('href');
        if (!href) return;
        
        // Nettoyer le chemin pour la comparaison
        const cleanHref = href.replace(/^[./]+/, '');
        const cleanCurrentPath = currentPath.replace(/^[./]+/, '');
        
        const isActive =
          cleanHref === cleanCurrentPath ||
          (cleanCurrentPath === '' && cleanHref === 'index.html') ||
          (cleanCurrentPath.includes(cleanHref.replace('.html', '')) && cleanHref !== '#');
        
        if (isActive) {
          link.classList.add(config.activeClass);
          link.setAttribute('aria-current', 'page');
          
          // Si c'est un Ã©lÃ©ment de menu dÃ©roulant, activer aussi le parent
          const parentItem = link.closest('.nav-item, .dropdown');
          if (parentItem) {
            parentItem.classList.add('active');
          }
          
          log(`Lien actif: ${href}`);
        } else {
          link.classList.remove(config.activeClass);
          link.removeAttribute('aria-current');
        }
      });
      
    } catch (error) {
      console.error('Erreur lors de la mise en surbrillance du menu actif:', error);
    }
  }

  // Fonction pour charger la barre de navigation
  async function loadNavbar() {
    log('Chargement de la barre de navigation...');
    
    try {
      const response = await fetch(config.navbarUrl);
      if (!response.ok) {
        throw new Error(`Erreur HTTP! Statut: ${response.status}`);
      }
      
      const navbarHtml = await response.text();
      let container = document.querySelector(config.navbarContainer);
      
      if (!container) {
        console.warn('Conteneur de navigation non trouvé, création...');
        const appContainer = document.getElementById('app');
        if (appContainer) {
          container = document.createElement('div');
          container.id = 'navbar-container';
          appContainer.prepend(container);
        } else {
          throw new Error('Impossible de trouver le conteneur principal de l\'application');
        }
      }
      
      container.innerHTML = navbarHtml;
      log('Barre de navigation chargée avec succès');
      
      // Initialiser les composants après le chargement
      initNavbar();
      
      return true;
      
    } catch (error) {
      console.error('Erreur lors du chargement de la barre de navigation:', error);
      return false;
    }
  }

  // Démarrer le chargement de la barre de navigation quand le DOM est prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNavbar);
  } else {
    loadNavbar();
  }
  
  // Exposer les fonctions au scope global
  window.initNavbar = initNavbar;
  window.loadNavbar = loadNavbar;
  
  // Initialiser automatiquement si le module est chargÃ© aprÃ¨s le DOM
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initNavbar();
  }
})();
