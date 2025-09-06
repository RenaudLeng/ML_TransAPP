document.addEventListener('DOMContentLoaded', function() {
  // Ã‰lÃ©ments du DOM
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('toggleSidebar');
  const mobileToggleBtn = document.getElementById('mobileMenuToggle');
  const menuItems = document.querySelectorAll('.menu-item');
  // mainContent est utilisÃ© dans la fonction loadPageContent via getElementById
  
  // VÃ©rifier l'Ã©tat du menu dans le localStorage
  const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
  
  // Appliquer l'Ã©tat initial
  if (isCollapsed && sidebar && toggleBtn) {
    sidebar.classList.add('collapsed');
    const icon = toggleBtn.querySelector('i');
    if (icon) {
      icon.classList.replace('ph-caret-left', 'ph-caret-right');
    }
  }
  
  // GÃ©rer le clic sur le bouton de bascule
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', function() {
      sidebar.classList.toggle('collapsed');
      
      // Changer l'icÃ´ne
      const icon = this.querySelector('i');
      if (icon) {
        if (sidebar.classList.contains('collapsed')) {
          icon.classList.replace('ph-caret-left', 'ph-caret-right');
          localStorage.setItem('sidebarCollapsed', 'true');
        } else {
          icon.classList.replace('ph-caret-right', 'ph-caret-left');
          localStorage.setItem('sidebarCollapsed', 'false');
        }
      }
    });
  }
  
  // GÃ©rer le bouton de menu mobile
  if (mobileToggleBtn && sidebar) {
    mobileToggleBtn.addEventListener('click', function() {
      sidebar.classList.toggle('show');
    });
  }
  
  // GÃ©rer les clics sur les Ã©lÃ©ments du menu
  menuItems.forEach(item => {
    item.addEventListener('click', function(e) {
      // EmpÃªcher le comportement par dÃ©faut pour les liens avec #
      if (this.getAttribute('href') === '#') {
        e.preventDefault();
      }
      
      // Mettre Ã  jour la classe active
      menuItems.forEach(i => i.classList.remove('active'));
      this.classList.add('active');
      
      // Fermer le menu sur mobile aprÃ¨s un clic
      if (window.innerWidth <= 768 && sidebar) {
        sidebar.classList.remove('show');
      }
    });
  });
  
  // Mettre en surbrillance l'Ã©lÃ©ment de menu actif en fonction de l'URL
  function setActiveMenuItem() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    menuItems.forEach(item => {
      const href = item.getAttribute('href');
      if (href && (currentPage === href || currentPage === href.split('/').pop())) {
        menuItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      }
    });
  }
  
  // GÃ©rer la dÃ©connexion
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      // ImplÃ©menter la logique de dÃ©connexion ici
      // Rediriger vers la page de connexion
      window.location.href = '/login.html';
    });
  }
  
  // Initialiser
  setActiveMenuItem();
  
  // GÃ©rer le redimensionnement de la fenÃªtre
  function handleResize() {
    if (sidebar && window.innerWidth > 768) {
      sidebar.classList.remove('show');
    }
  }
  
  window.addEventListener('resize', handleResize);
  
  // Charger le contenu de la page dans le main-content
  function loadPageContent() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const mainContentElement = document.getElementById('mainContent');
    
    if (currentPage.endsWith('.html') && currentPage !== 'index.html' && mainContentElement) {
      fetch(currentPage)
        .then(response => response.text())
        .then(html => {
          // Extraire uniquement le contenu de la balise main
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const mainContent = doc.querySelector('main');
          
          if (mainContent) {
            mainContentElement.innerHTML = mainContent.innerHTML;
            // RÃ©initialiser les Ã©couteurs d'Ã©vÃ©nements si nÃ©cessaire
            initPageSpecificScripts();
          }
        })
        .catch(error => {
          console.error('Erreur lors du chargement de la page:', error);
        });
    }
  }
  
  // Initialiser les scripts spÃ©cifiques Ã  la page
  function initPageSpecificScripts() {
    // Cette fonction peut Ãªtre Ã©tendue pour initialiser des scripts spÃ©cifiques Ã  chaque page
    // console.log peut Ãªtre dÃ©commentÃ© pour le dÃ©bogage
    // console.log('Initialisation des scripts de la page...');
  }
  
  // Charger le contenu de la page si nÃƒÂ©cessaire
  if (window.location.pathname !== '/') {
    loadPageContent();
  }
  
  // GÃ©rer la navigation AJAX pour une expÃ©rience plus fluide
  document.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' && e.target.href && 
        !e.target.href.startsWith('http') && 
        !e.target.href.startsWith('mailto:') && 
        !e.target.href.startsWith('tel:') &&
        !e.target.classList.contains('no-ajax')) {
      e.preventDefault();
      
      const url = new URL(e.target.href);
      if (url.pathname !== window.location.pathname) {
        window.history.pushState({}, '', url);
        loadPageContent();
        setActiveMenuItem();
      }
    }
  });
  
  // GÃƒÂ©rer le bouton retour/avant du navigateur
  window.addEventListener('popstate', function() {
    loadPageContent();
    setActiveMenuItem();
  });
});
