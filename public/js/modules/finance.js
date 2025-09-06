// finance.js - Gestion des finances ML Transport

// Vérifier si le module finance est déjà chargé
if (!window.ML_FINANCE_INITIALIZED) {
    window.ML_FINANCE_INITIALIZED = true;

// ========================================
// GESTION D'ÉTAT CENTRALISÉE
// ========================================

/**
 * État global de l'application
 */
const appState = {
  // Données de l'application
  data: {
    recettes: [],
    depenses: [],
    vehicules: [],
    currentUser: null,
    selectedVehicule: null,
    selectedRecetteId: null,
    selectedDepenseId: null,
    selectedFile: null
  },
  
  // État de l'interface
  ui: {
    currentTab: 'recettes',
    currentFilter: 'all',
    isLoading: false,
    searchQuery: ''
  },
  
  // Écouteurs d'événements
  listeners: {
    dataChanged: [],
    tabChanged: [],
    filterChanged: [],
    searchChanged: []
  },
  
  // Méthodes pour gérer l'état
  setCurrentTab(tab) {
    this.ui.currentTab = tab;
    this.notify('tabChanged', tab);
  },
  
  setCurrentFilter(filter) {
    this.ui.currentFilter = filter;
    this.notify('filterChanged', filter);
  },
  
  setSearchQuery(query) {
    this.ui.searchQuery = query;
    this.notify('searchChanged', query);
  },
  
  setLoading(isLoading) {
    this.ui.isLoading = isLoading;
  },
  
  // Méthodes pour gérer les données
  updateData(type, data) {
    if (Array.isArray(data)) {
      this.data[type] = [...data];
    } else {
      this.data[type] = { ...data };
    }
    this.notify('dataChanged', { type, data: this.data[type] });
    return this.data[type];
  },
  
  // Gestion des écouteurs
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  },
  
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  },
  
  notify(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
};

// ========================================
// DONNÉES DE L'APPLICATION (rétrocompatibilité)
// ========================================
// Les données sont maintenant gérées par appState
let selectedVehicule = null;
let selectedRecetteId = null;
let selectedDepenseId = null;
let selectedFile = null;

// Éléments du DOM - Déclaration des variables sans initialisation
let recetteForm;
let depenseForm;
let recetteTable;
let depenseTable;
const searchInput = document.getElementById('searchInput');
const filterType = document.getElementById('filterType');
const resetFiltersBtn = document.getElementById('resetFilters');
const searchRecette = document.getElementById('searchRecette');
const filterBus = document.getElementById('filterBus');
const typeDepense = document.getElementById('typeDepense');

// Éléments des statistiques
const totalRecettesEl = document.getElementById('totalRecettes');
const totalDepensesEl = document.getElementById('totalDepenses');
const soldeEl = document.getElementById('solde');

// Modales
let deleteModal = null;
let recetteModal = null;
let depenseModal = null;
let editRecetteModal = null;

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
    updateDashboard();
    initializeModals();
});

// ========================================
// FONCTIONS DE GESTION DES DONNÉES
// ========================================

/**
 * Charge les données depuis le stockage local
 */
function loadData() {
    appState.setLoading(true);
    
    try {
        // Charger les données depuis le stockage local
        const savedRecettes = localStorage.getItem('recettes');
        const savedDepenses = localStorage.getItem('depenses');
        const savedVehicules = localStorage.getItem('vehicules');
        const savedUser = localStorage.getItem('currentUser');
        
        // Mettre à jour l'état global
        if (savedRecettes) {
            const parsedRecettes = JSON.parse(savedRecettes);
            appState.updateData('recettes', parsedRecettes);
        }
        
        if (savedDepenses) {
            const parsedDepenses = JSON.parse(savedDepenses);
            appState.updateData('depenses', parsedDepenses);
        }
        
        if (savedVehicules) {
            const parsedVehicules = JSON.parse(savedVehicules);
            appState.updateData('vehicules', parsedVehicules);
        }
        
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            appState.updateData('currentUser', parsedUser);
        }
        
        console.log('Données chargées avec succès');
        showNotification('Données chargées avec succès', 'success');
        
        // Notifier que les données ont été chargées
        appState.notify('dataLoaded', {
            recettes: appState.data.recettes,
            depenses: appState.data.depenses,
            vehicules: appState.data.vehicules
        });
        
        // Initialiser les graphiques après le chargement des données
        if (typeof initializeCharts === 'function') {
            initializeCharts();
        }
        
        return true;
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        showNotification('Erreur lors du chargement des données: ' + error.message, 'danger');
        return false;
    } finally {
        appState.setLoading(false);
    }
}

/**
 * Sauvegarde les données dans le stockage local
 * @param {string} type - Type de données à sauvegarder (optionnel)
 */
function saveData(type = null) {
    try {
        // Si un type spécifique est fourni, ne sauvegarder que ce type
        if (type) {
            if (type === 'recettes' || type === 'depenses' || type === 'vehicules') {
                localStorage.setItem(type, JSON.stringify(appState.data[type]));
            } else if (type === 'user' && appState.data.currentUser) {
                localStorage.setItem('currentUser', JSON.stringify(appState.data.currentUser));
            }
            console.log(`Données de type "${type}" sauvegardées avec succès`);
        } else {
            // Sauvegarder toutes les données
            localStorage.setItem('recettes', JSON.stringify(appState.data.recettes));
            localStorage.setItem('depenses', JSON.stringify(appState.data.depenses));
            localStorage.setItem('vehicules', JSON.stringify(appState.data.vehicules));
            
            if (appState.data.currentUser) {
                localStorage.setItem('currentUser', JSON.stringify(appState.data.currentUser));
            }
            
            console.log('Toutes les données ont été sauvegardées avec succès');
        }
        
        // Mettre à jour les variables de rétrocompatibilité
        updateLegacyVariables();
        
        return true;
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des données:', error);
        showNotification('Erreur lors de la sauvegarde des données: ' + error.message, 'danger');
        return false;
    }
}

/**
 * Met à jour les variables de rétrocompatibilité à partir de l'état global
 */
function updateLegacyVariables() {
    selectedVehicule = appState.data.selectedVehicule || null;
    selectedRecetteId = appState.data.selectedRecetteId || null;
    selectedDepenseId = appState.data.selectedDepenseId || null;
    selectedFile = appState.data.selectedFile || null;
}

// ========================================
// FONCTIONS D'AFFICHAGE
// ========================================

// Références aux graphiques
let recettesChart = null;
let depensesChart = null;
let soldeChart = null;

/**
 * Initialise les graphiques du tableau de bord
 */
function initializeCharts() {
    // Vérifier si Chart.js est chargé
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js n\'est pas chargé. Les graphiques ne seront pas affichés.');
        return;
    }
    
    // Initialiser le graphique des recettes par mois
    initializeRecettesChart();
    
    // Initialiser le graphique des dépenses par catégorie
    initializeDepensesChart();
    
    // Initialiser le graphique d'évolution du solde
    initializeSoldeChart();
}

/**
 * Initialise le graphique des recettes par mois
 */
function initializeRecettesChart() {
    const ctx = document.getElementById('recettesChart');
    if (!ctx) return;
    
    // Détruire le graphique existant s'il y en a un
    if (recettesChart) {
        recettesChart.destroy();
    }
    
    // Récupérer les données depuis l'état centralisé
    const recettesData = appState.data.recettes || [];
    
    // Grouper les recettes par mois
    const monthlyData = {};
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Initialiser les 12 derniers mois
    for (let i = 0; i < 12; i++) {
        const month = (now.getMonth() - i + 12) % 12 + 1; // 1-12
        const year = currentYear - Math.floor((now.getMonth() - i) / 12);
        const monthYear = `${year}-${month.toString().padStart(2, '0')}`;
        monthlyData[monthYear] = 0;
    }
    
    // Compter les recettes par mois
    recettesData.forEach(recette => {
        if (!recette.date) return;
        
        const date = new Date(recette.date);
        const month = date.getMonth() + 1; // 1-12
        const year = date.getFullYear();
        const monthYear = `${year}-${month.toString().padStart(2, '0')}`;
        
        if (monthlyData.hasOwnProperty(monthYear)) {
            monthlyData[monthYear] += parseFloat(recette.montant || 0);
        }
    });
    
    // Trier les données par date
    const sortedMonths = Object.keys(monthlyData).sort();
    const labels = sortedMonths.map(monthKey => {
        const [year, monthNum] = monthKey.split('-');
        return new Date(year, monthNum - 1).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
    });
    
    const data = sortedMonths.map(monthKey => monthlyData[monthKey]);
    
    // Créer le graphique
    recettesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Recettes par mois',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatMontant(value);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatMontant(context.raw);
                        }
                    }
                }
            }
        }
    });
}

/**
 * Initialise le graphique des dépenses par catégorie
 */
function initializeDepensesChart() {
    const ctx = document.getElementById('depensesChart');
    if (!ctx) return;
    
    // Détruire le graphique existant s'il y en a un
    if (depensesChart) {
        depensesChart.destroy();
    }
    
    // Récupérer les données depuis l'état centralisé
    const depensesData = appState.data.depenses || [];
    
    // Grouper les dépenses par catégorie
    const categories = {};
    depensesData.forEach(depense => {
        const category = depense.type || 'Autre';
        categories[category] = (categories[category] || 0) + parseFloat(depense.montant || 0);
    });
    
    // Trier les catégories par montant décroissant
    const sortedCategories = Object.entries(categories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10); // Limiter aux 10 premières catégories
    
    const labels = sortedCategories.map(([category]) => category);
    const data = sortedCategories.map(([_, amount]) => amount);
    
    // Couleurs pour les segments du graphique
    const backgroundColors = [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)',
        'rgba(199, 199, 199, 0.6)',
        'rgba(83, 102, 255, 0.6)',
        'rgba(40, 159, 64, 0.6)',
        'rgba(210, 199, 199, 0.6)'
    ];
    
    // Créer le graphique
    depensesChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${formatMontant(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Initialise le graphique d'évolution du solde
 */
function initializeSoldeChart() {
    const ctx = document.getElementById('soldeChart');
    if (!ctx) return;
    
    // Détruire le graphique existant s'il y en a un
    if (soldeChart) {
        soldeChart.destroy();
    }
    
    // Récupérer les données depuis l'état centralisé
    const recettesData = appState.data.recettes || [];
    const depensesData = appState.data.depenses || [];
    
    // Grouper les transactions par mois
    const monthlyData = {};
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Initialiser les 6 derniers mois
    for (let i = 0; i < 6; i++) {
        const month = (now.getMonth() - i + 12) % 12 + 1; // 1-12
        const year = currentYear - Math.floor((now.getMonth() - i) / 12);
        const monthYear = `${year}-${month.toString().padStart(2, '0')}`;
        monthlyData[monthYear] = { recettes: 0, depenses: 0 };
    }
    
    // Compter les recettes par mois
    recettesData.forEach(recette => {
        if (!recette.date) return;
        
        const date = new Date(recette.date);
        const month = date.getMonth() + 1; // 1-12
        const year = date.getFullYear();
        const monthYear = `${year}-${month.toString().padStart(2, '0')}`;
        
        if (monthlyData.hasOwnProperty(monthYear)) {
            monthlyData[monthYear].recettes += parseFloat(recette.montant || 0);
        }
    });
    
    // Compter les dépenses par mois
    depensesData.forEach(depense => {
        if (!depense.date) return;
        
        const date = new Date(depense.date);
        const month = date.getMonth() + 1; // 1-12
        const year = date.getFullYear();
        const monthYear = `${year}-${month.toString().padStart(2, '0')}`;
        
        if (monthlyData.hasOwnProperty(monthYear)) {
            monthlyData[monthYear].depenses += parseFloat(depense.montant || 0);
        }
    });
    
    // Trier les données par date
    const sortedMonths = Object.keys(monthlyData).sort();
    const labels = sortedMonths.map(monthKey => {
        const [year, monthNum] = monthKey.split('-');
        return new Date(year, monthNum - 1).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
    });
    
    // Calculer le solde mensuel
    const soldeData = sortedMonths.map(monthKey => {
        const { recettes = 0, depenses = 0 } = monthlyData[monthKey] || {};
        return recettes - depenses;
    });
    
    // Créer le graphique
    soldeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Solde mensuel',
                data: soldeData,
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return formatMontant(value);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Solde: ${formatMontant(context.raw)}`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Met à jour les graphiques s'ils existent dans la page
 */
function updateChartsIfExists() {
    // Réinitialiser les graphiques avec les nouvelles données
    if (document.getElementById('recettesChart')) {
        initializeRecettesChart();
    }
    
    if (document.getElementById('depensesChart')) {
        initializeDepensesChart();
    }
    
    if (document.getElementById('soldeChart')) {
        initializeSoldeChart();
    }
}

/**
 * Met à jour le tableau de bord avec les totaux
 */
function updateDashboard() {
    if (!totalRecettesEl || !totalDepensesEl || !soldeEl) return;
    
    // Récupérer les données depuis l'état centralisé
    const recettesData = appState.data.recettes || [];
    const depensesData = appState.data.depenses || [];
    
    // Calculer les totaux
    const totalRecettes = recettesData.reduce((sum, recette) => sum + parseFloat(recette.montant || 0), 0);
    const totalDepenses = depensesData.reduce((sum, depense) => sum + parseFloat(depense.montant || 0), 0);
    const solde = totalRecettes - totalDepenses;
    
    // Mettre à jour l'interface utilisateur
    totalRecettesEl.textContent = formatMontant(totalRecettes);
    totalDepensesEl.textContent = formatMontant(totalDepenses);
    soldeEl.textContent = formatMontant(solde);
    
    // Mettre à jour la classe en fonction du solde
    soldeEl.className = solde >= 0 ? 'text-success' : 'text-danger';
    
    // Mettre à jour l'état avec les totaux calculés
    appState.updateUI({
        totals: {
            recettes: totalRecettes,
            depenses: totalDepenses,
            solde: solde
        }
    });
    
    // Mettre à jour les graphiques si nécessaire
    updateChartsIfExists();
}

/**
 * Affiche une notification à l'utilisateur
 * @param {string} message - Le message à afficher
 * @param {string} type - Le type de notification (success, danger, warning, info)
 */
function showNotification(message, type = 'info') {
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Afficher la notification
    notification.style.display = 'block';
    notification.style.opacity = '1';
    
    // Masquer la notification après 3 secondes
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 500);
    }, 3000);
}

// ========================================
// FONCTIONS DE GESTION DES ÉVÉNEMENTS
// ========================================

/**
 * Initialise les écouteurs d'événements
 */
function setupEventListeners() {
    // Gestion des formulaires
    if (recetteForm) {
        recetteForm.addEventListener('submit', handleRecetteSubmit);
    }
    
    if (depenseForm) {
        depenseForm.addEventListener('submit', handleDepenseSubmit);
    }
    
    // Gestion de la recherche et des filtres
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            appState.setSearchQuery(e.target.value);
            handleSearch(e);
        });
    }
    
    if (filterType) {
        filterType.addEventListener('change', (e) => {
            appState.setCurrentFilter(e.target.value);
            handleFilterChange(e);
        });
    }
    
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            appState.setCurrentFilter('all');
            appState.setSearchQuery('');
            resetFilters();
        });
    }
    
    // Écouteurs d'événements personnalisés
    document.addEventListener('tabChanged', (e) => {
        const tabName = e.detail;
        console.log(`Onglet changé: ${tabName}`);
        // Mettre à jour l'interface utilisateur en fonction de l'onglet sélectionné
        updateUIForTab(tabName);
    });
    
    // Écouter les changements de données
    appState.on('dataChanged', (data) => {
        console.log(`Données mises à jour: ${data.type}`, data.data);
        
        // Mettre à jour l'interface utilisateur en fonction du type de données modifié
        switch(data.type) {
            case 'recettes':
                renderRecettesTable(data.data);
                break;
            case 'depenses':
                renderDepensesTable(data.data);
                break;
            case 'vehicules':
                // Mettre à jour les sélecteurs de véhicules si nécessaire
                updateVehiculeSelectors();
                break;
        }
        
        // Mettre à jour le tableau de bord
        updateDashboard();
        
        // Sauvegarder les données mises à jour
        saveData(data.type);
        
        // Initialiser les graphiques
        initializeCharts();
    });
    
    // Initialiser l'interface utilisateur pour l'onglet actif
    updateUIForTab(appState.ui.currentTab);
}

/**
 * Met à jour l'interface utilisateur en fonction de l'onglet sélectionné
 * @param {string} tabName - Le nom de l'onglet à afficher
 */
function updateUIForTab(tabName) {
    // Masquer tous les contenus d'onglets
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('show', 'active');
    });
    
    // Désactiver tous les onglets
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Activer l'onglet sélectionné
    const activeTab = document.querySelector(`[data-bs-target="#${tabName}"]`);
    const activePane = document.getElementById(tabName);
    
    if (activeTab && activePane) {
        activeTab.classList.add('active');
        activePane.classList.add('show', 'active');
        
        // Charger les données spécifiques à l'onglet si nécessaire
        switch(tabName) {
            case 'recettes':
                renderRecettesTable(appState.data.recettes);
                break;
            case 'depenses':
                renderDepensesTable(appState.data.depenses);
                break;
            case 'coches':
                generateCalendar();
                break;
        }
    }
}

/**
 * Met à jour les sélecteurs de véhicules dans les formulaires
 */
function updateVehiculeSelectors() {
    const vehiculeSelectors = [
        matriculeBus,
        busDepense,
        editRecetteMatricule,
        filterBus
    ];

    vehiculeSelectors.forEach(selector => {
        if (!selector) return;
        
        // Sauvegarder la valeur actuelle
        const currentValue = selector.value;
        
        // Vider le sélecteur
        selector.innerHTML = '';
        
        // Ajouter l'option par défaut si nécessaire
        if (selector.id === 'filterBus' || selector.id === 'busDepense') {
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = selector.id === 'filterBus' ? 'Tous les bus' : 'Choisir un bus';
            selector.appendChild(defaultOption);
        }
        
        // Ajouter les véhicules
        appState.data.vehicules.forEach(vehicule => {
            const option = document.createElement('option');
            option.value = vehicule.matricule;
            option.textContent = `${vehicule.matricule} - ${vehicule.marque || ''} ${vehicule.modele || ''}`.trim();
            selector.appendChild(option);
        });
        
        // Restaurer la valeur précédente si elle existe toujours
        if (currentValue && Array.from(selector.options).some(opt => opt.value === currentValue)) {
            selector.value = currentValue;
        }
    });
}

// FONCTIONS UTILITAIRES
// ========================================

/**
 * Échappe les guillemets simples dans une chaîne de caractères
 * @param {string} str - La chaîne à échapper
 * @returns {string} La chaîne échappée
 */
function escapeSingleQuotes(str) {
    if (!str) return '';
    return String(str).replace(/'/g, "\\'");
}

/**
 * Retourne la classe CSS appropriée pour le badge de statut
 * @param {string} status - Le statut à évaluer
 * @returns {string} La classe CSS correspondante
 */
function getStatusBadgeClass(status) {
    if (!status) return 'secondary';
    
    const statusMap = {
        'payé': 'success',
        'payée': 'success',
        'en attente': 'warning',
        'en cours': 'info',
        'validé': 'primary',
        'validée': 'primary',
        'annulé': 'danger',
        'annulée': 'danger',
        'refusé': 'danger',
        'refusée': 'danger'
    };
    
    return statusMap[status.toLowerCase()] || 'secondary';
}

// ========================================
// VARIABLES GLOBALES
// ========================================

// Initialisation des modales
window.editRecetteModal = new bootstrap.Modal(document.getElementById('editRecetteModal'));
window.editDepenseModal = new bootstrap.Modal(document.getElementById('editDepenseModal'));
window.imageModal = new bootstrap.Modal(document.getElementById('imageModal'));

/**
 * Formate un montant avec le séparateur de milliers et le symbole XAF
 * @param {number} montant - Le montant à formater
 * @returns {string} Le montant formaté
 */
function formatMontant(montant) {
    if (isNaN(montant)) return '0 FCFA';
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XAF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(montant).replace('XAF', 'FCFA');
}

/**
 * Formate une date au format français
 * @param {string} dateString - La date à formater
 * @returns {string} La date formatée
 */
function formatDate(dateString) {
    if (!dateString) return '';
    
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return new Date(dateString).toLocaleDateString('fr-FR', options);
}

// ========================================
// FONCTIONS À IMPLÉMENTER
// ========================================

/**
 * Affiche les recettes dans le tableau
 * @param {Array} [recettesToRender] - Tableau de recettes à afficher (optionnel)
 */
function renderRecettesTable(recettesToRender) {
    if (!recetteTable) return;
    
    const tbody = recetteTable.querySelector('tbody');
    if (!tbody) return;
    
    // Utiliser les recettes fournies en paramètre ou celles de l'état global
    const recettesData = recettesToRender || appState.data.recettes || [];
    
    // Trier les recettes par date (du plus récent au plus ancien)
    const sortedRecettes = [...recettesData].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
    
    // Vider le tableau
    tbody.innerHTML = '';
    
    if (sortedRecettes.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="7" class="text-center">
                Aucune recette enregistrée
            </td>
        `;
        tbody.appendChild(row);
        
        // Mettre à jour le compteur
        updateRecettesCounter(0);
        return;
    }
    
    // Ajouter chaque recette au tableau
    sortedRecettes.forEach(recette => {
        const row = document.createElement('tr');
        
        // Formater la date
        const date = new Date(recette.date);
        const dateFormatted = date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Utiliser la fonction utilitaire pour échapper les guillemets
        const id = escapeSingleQuotes(recette.id);
        const vehicule = recette.vehicule ? escapeSingleQuotes(recette.vehicule) : 'Non spécifié';
        const type = recette.type ? escapeSingleQuotes(recette.type) : 'Autre';
        const commentaire = recette.commentaire ? escapeSingleQuotes(recette.commentaire) : '';
        
        row.innerHTML = `
            <td>${recette.id || ''}</td>
            <td>${dateFormatted}</td>
            <td>${vehicule}</td>
            <td>${recette.montant ? formatMontant(recette.montant) : '0 FCFA'}</td>
            <td>${type}</td>
            <td>${commentaire}</td>
            <td class="text-nowrap">
                <button class="btn btn-sm btn-primary me-1" onclick="editRecette('${id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="showDeleteModal('${id}', 'recette')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Mettre à jour le compteur
    updateRecettesCounter(sortedRecettes.length);
    
    // Mettre à jour l'état avec les recettes affichées
    appState.updateUI({
        currentRecettes: sortedRecettes
    });
}

/**
 * Met à jour le compteur de recettes
 * @param {number} count - Nombre de recettes à afficher
 */
function updateRecettesCounter(count) {
    const countElement = document.getElementById('recetteCount');
    if (countElement) {
        countElement.textContent = count;
    }
    
    // Mettre à jour le compteur dans la navbar si nécessaire
    const navCountElement = document.querySelector('[data-recette-count]');
    if (navCountElement) {
        navCountElement.textContent = count;
        navCountElement.classList.toggle('d-none', count === 0);
    }
}

/**
 * Affiche les dépenses dans le tableau
 * @param {Array} [depensesToRender] - Tableau de dépenses à afficher (optionnel)
 */
function renderDepensesTable(depensesToRender) {
    if (!depenseTable) return;
    
    const tbody = depenseTable.querySelector('tbody');
    if (!tbody) return;
    
    // Utiliser les dépenses fournies en paramètre ou celles de l'état global
    const depensesData = depensesToRender || appState.data.depenses || [];
    
    // Trier les dépenses par date (du plus récent au plus ancien)
    const sortedDepenses = [...depensesData].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
    
    // Vider le tableau
    tbody.innerHTML = '';
    
    if (sortedDepenses.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="8" class="text-center">
                Aucune dépense enregistrée
            </td>
        `;
        tbody.appendChild(row);
        
        // Mettre à jour le compteur
        updateDepensesCounter(0);
        return;
    }
    
    // Ajouter chaque dépense au tableau
    sortedDepenses.forEach(depense => {
        const row = document.createElement('tr');
        
        // Formater la date
        const date = new Date(depense.date);
        const dateFormatted = date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Créer la ligne du tableau avec des données sécurisées
        const id = escapeSingleQuotes(depense.id);
        const fournisseur = depense.fournisseur ? escapeSingleQuotes(depense.fournisseur) : 'Non spécifié';
        const type = depense.type ? escapeSingleQuotes(depense.type) : 'Autre';
        const commentaire = depense.commentaire ? escapeSingleQuotes(depense.commentaire) : '';
        const statut = depense.statut || 'En attente';
        const statutClass = getStatusBadgeClass(statut);
        
        row.innerHTML = `
            <td>${depense.id || ''}</td>
            <td>${dateFormatted}</td>
            <td>${fournisseur}</td>
            <td>${type}</td>
            <td>${depense.montant ? formatMontant(depense.montant) : '0 FCFA'}</td>
            <td><span class="badge bg-${statutClass}">${statut}</span></td>
            <td>${commentaire}</td>
            <td class="text-nowrap">
                <button class="btn btn-sm btn-primary me-1" onclick="editDepense('${id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="showDeleteModal('${id}', 'depense')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Mettre à jour le compteur
    updateDepensesCounter(sortedDepenses.length);
    
    // Mettre à jour l'état avec les dépenses affichées
    appState.updateUI({
        currentDepenses: sortedDepenses
    });
}

/**
 * Met à jour le compteur de dépenses
 * @param {number} count - Nombre de dépenses à afficher
 */
function updateDepensesCounter(count) {
    const countElement = document.getElementById('depenseCount');
    if (countElement) {
        countElement.textContent = count;
    }
    
    // Mettre à jour le compteur dans la navbar si nécessaire
    const navCountElement = document.querySelector('[data-depense-count]');
    if (navCountElement) {
        navCountElement.textContent = count;
        navCountElement.classList.toggle('d-none', count === 0);
    }
}

/**
 * Gère la soumission du formulaire de recette
 * @param {Event} e - L'événement de soumission du formulaire
 */
function handleRecetteSubmit(e) {
    e.preventDefault();
    
    if (!recetteForm) return;
    
    // Récupérer les valeurs du formulaire
    const formData = new FormData(recetteForm);
    const recetteData = {
        id: appState.data.selectedRecetteId || generateId(),
        date: formData.get('date') || new Date().toISOString(),
        vehicule: formData.get('vehicule') || '',
        type: formData.get('type') || 'Autre',
        montant: parseFloat(formData.get('montant') || 0),
        commentaire: formData.get('commentaire') || '',
        createdBy: appState.data.currentUser || 'système',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Validation des champs obligatoires
    if (!recetteData.vehicule || !recetteData.montant || isNaN(recetteData.montant) || recetteData.montant <= 0) {
        showNotification('Veuillez remplir tous les champs obligatoires', 'danger');
        return;
    }
    
    try {
        // Mettre à jour l'état de chargement
        appState.setLoading(true);
        
        // Vérifier si c'est une mise à jour ou une nouvelle entrée
        const isUpdate = !!appState.data.selectedRecetteId;
        let updatedRecettes = [...appState.data.recettes];
        
        if (isUpdate) {
            // Mettre à jour la recette existante
            const index = updatedRecettes.findIndex(r => r.id === appState.data.selectedRecetteId);
            if (index !== -1) {
                // Conserver les métadonnées existantes
                recetteData.createdBy = updatedRecettes[index].createdBy;
                recetteData.createdAt = updatedRecettes[index].createdAt;
                
                // Mettre à jour la recette
                updatedRecettes[index] = { ...updatedRecettes[index], ...recetteData };
                
                // Journaliser l'action
                logAction('update', 'recette', recetteData);
                
                showNotification('Recette mise à jour avec succès', 'success');
            }
        } else {
            // Ajouter une nouvelle recette
            updatedRecettes.push(recetteData);
            
            // Journaliser l'action
            logAction('create', 'recette', recetteData);
            
            showNotification('Recette ajoutée avec succès', 'success');
        }
        
        // Mettre à jour l'état global avec les nouvelles données
        appState.updateData('recettes', updatedRecettes);
        
        // Réinitialiser le formulaire et fermer la modale
        recetteForm.reset();
        if (recetteModal) {
            const modal = bootstrap.Modal.getInstance(recetteModal);
            if (modal) modal.hide();
        }
        
        // Réinitialiser l'ID de la recette sélectionnée
        appState.updateData('selectedRecetteId', null);
        
    } catch (error) {
        console.error('Erreur lors de la sauvegarde de la recette:', error);
        showNotification('Une erreur est survenue lors de la sauvegarde: ' + error.message, 'danger');
    } finally {
        appState.setLoading(false);
    }
}

/**
 * Génère un ID unique
 * @returns {string} Un identifiant unique
 */
function generateId() {
    return 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Journalise les actions effectuées sur les données
 * @param {string} action - L'action effectuée (create, update, delete)
 * @param {string} entityType - Le type d'entité concernée (recette, depense, etc.)
 * @param {object} data - Les données concernées
 */
function logAction(action, entityType, data) {
    const logEntry = {
        id: 'log_' + Date.now(),
        action,
        entityType,
        entityId: data.id,
        userId: currentUser || 'système',
        timestamp: new Date().toISOString(),
        data: JSON.parse(JSON.stringify(data)) // Copie profonde des données
    };
    
    // Récupérer les logs existants ou initialiser un nouveau tableau
    const logs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
    
    // Ajouter le nouveau log
    logs.push(logEntry);
    
    // Limiter la taille des logs aux 1000 entrées les plus récentes
    const maxLogs = 1000;
    const trimmedLogs = logs.slice(-maxLogs);
    
    // Sauvegarder les logs
    localStorage.setItem('activityLogs', JSON.stringify(trimmedLogs));
}

/**
 * Gère la soumission du formulaire de dépense
 * @param {Event} e - L'événement de soumission du formulaire
 */
function handleDepenseSubmit(e) {
    e.preventDefault();
    
    if (!depenseForm) return;
    
    // Récupérer les valeurs du formulaire
    const formData = new FormData(depenseForm);
    const depenseData = {
        id: appState.data.selectedDepenseId || generateId('dep_'),
        date: formData.get('date') || new Date().toISOString(),
        fournisseur: formData.get('fournisseur') || 'Non spécifié',
        type: formData.get('type') || 'Autre',
        montant: parseFloat(formData.get('montant') || 0),
        statut: formData.get('statut') || 'en attente',
        commentaire: formData.get('commentaire') || '',
        createdBy: appState.data.currentUser || 'système',
        vehicule: formData.get('vehicule') || null, // Ajout du champ véhicule
        justificatif: formData.get('justificatif') || null, // Ajout du champ justificatif
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Validation des champs obligatoires
    if (!depenseData.type || !depenseData.montant || isNaN(depenseData.montant) || depenseData.montant <= 0) {
        showNotification('Veuillez remplir tous les champs obligatoires', 'danger');
        return;
    }
    
    try {
        // Mettre à jour l'état de chargement
        appState.setLoading(true);
        
        // Vérifier si c'est une mise à jour ou une nouvelle entrée
        const isUpdate = !!appState.data.selectedDepenseId;
        let updatedDepenses = [...appState.data.depenses];
        
        if (isUpdate) {
            // Mettre à jour la dépense existante
            const index = updatedDepenses.findIndex(d => d.id === appState.data.selectedDepenseId);
            if (index !== -1) {
                // Conserver les métadonnées existantes
                depenseData.createdBy = updatedDepenses[index].createdBy;
                depenseData.createdAt = updatedDepenses[index].createdAt;
                
                // Conserver le justificatif existant si non modifié
                if (!depenseData.justificatif && updatedDepenses[index].justificatif) {
                    depenseData.justificatif = updatedDepenses[index].justificatif;
                }
                
                // Mettre à jour la dépense
                updatedDepenses[index] = { ...updatedDepenses[index], ...depenseData };
                
                // Journaliser l'action
                logAction('update', 'depense', depenseData);
                
                showNotification('Dépense mise à jour avec succès', 'success');
            }
        } else {
            // Ajouter une nouvelle dépense
            updatedDepenses.push(depenseData);
            
            // Journaliser l'action
            logAction('create', 'depense', depenseData);
            
            showNotification('Dépense ajoutée avec succès', 'success');
        }
        
        // Mettre à jour l'état global avec les nouvelles données
        appState.updateData('depenses', updatedDepenses);
        
        // Réinitialiser le formulaire et fermer la modale
        depenseForm.reset();
        if (depenseModal) {
            const modal = bootstrap.Modal.getInstance(depenseModal);
            if (modal) modal.hide();
        }
        
        // Réinitialiser l'ID de la dépense sélectionnée
        appState.updateData('selectedDepenseId', null);
        
    } catch (error) {
        console.error('Erreur lors de la sauvegarde de la dépense:', error);
        showNotification('Une erreur est survenue lors de la sauvegarde: ' + error.message, 'danger');
    } finally {
        appState.setLoading(false);
    }
}

/**
 * Gère la recherche dans les tableaux de recettes et dépenses
 * @param {Event} e - L'événement de saisie
 */
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    // Mettre à jour le terme de recherche dans l'état
    appState.setSearchQuery(searchTerm);
    
    // Si le terme de recherche est vide, afficher toutes les données
    if (!searchTerm) {
        renderRecettesTable(appState.data.recettes);
        renderDepensesTable(appState.data.depenses);
        return;
    }
    
    // Filtrer les recettes
    const filteredRecettes = appState.data.recettes.filter(recette => {
        return (
            (recette.vehicule && recette.vehicule.toLowerCase().includes(searchTerm)) ||
            (recette.type && recette.type.toLowerCase().includes(searchTerm)) ||
            (recette.commentaire && recette.commentaire.toLowerCase().includes(searchTerm)) ||
            (recette.montant && recette.montant.toString().includes(searchTerm)) ||
            (recette.id && recette.id.toLowerCase().includes(searchTerm))
        );
    });
    
    // Filtrer les dépenses
    const filteredDepenses = appState.data.depenses.filter(depense => {
        return (
            (depense.fournisseur && depense.fournisseur.toLowerCase().includes(searchTerm)) ||
            (depense.type && depense.type.toLowerCase().includes(searchTerm)) ||
            (depense.commentaire && depense.commentaire.toLowerCase().includes(searchTerm)) ||
            (depense.montant && depense.montant.toString().includes(searchTerm)) ||
            (depense.vehicule && depense.vehicule.toLowerCase().includes(searchTerm)) ||
            (depense.id && depense.id.toLowerCase().includes(searchTerm)) ||
            (depense.statut && depense.statut.toLowerCase().includes(searchTerm))
        );
    });
    
    // Afficher les résultats filtrés
    renderRecettesTable(filteredRecettes);
    renderDepensesTable(filteredDepenses);
    
    // Mettre à jour l'état avec les résultats de la recherche
    appState.updateUI({
        filteredRecettes,
        filteredDepenses,
        hasActiveSearch: searchTerm.length > 0
    });
}

/**
 * Gère le changement de filtre pour les tableaux
 * @param {Event} e - L'événement de changement
 */
function handleFilterChange(e) {
    const filterType = e.target.dataset.filterType;
    const filterValue = e.target.value;
    
    if (!filterType) return;
    
    // Mettre à jour les filtres actifs dans l'état
    const activeFilters = { ...appState.ui.activeFilters, [filterType]: filterValue };
    appState.updateUI({ activeFilters });
    
    // Appliquer les filtres
    applyFilters(activeFilters);
}

/**
 * Applique les filtres aux données
 * @param {Object} filters - Les filtres à appliquer
 */
function applyFilters(filters) {
    // Récupérer les données complètes
    let filteredRecettes = [...appState.data.recettes];
    let filteredDepenses = [...appState.data.depenses];
    
    // Appliquer les filtres de période
    if (filters.periode && filters.periode !== 'tous') {
        const now = new Date();
        const startDate = new Date();
        
        switch (filters.periode) {
            case 'aujourdhui':
                startDate.setHours(0, 0, 0, 0);
                break;
                
            case 'semaine':
                startDate.setDate(now.getDate() - 7);
                break;
                
            case 'mois':
                startDate.setMonth(now.getMonth() - 1);
                break;
                
            case 'annee':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
        }
        
        filteredRecettes = filteredRecettes.filter(r => new Date(r.date) >= startDate);
        filteredDepenses = filteredDepenses.filter(d => new Date(d.date) >= startDate);
    }
    
    // Appliquer les filtres spécifiques aux recettes
    if (filters['type-recette'] && filters['type-recette'] !== 'tous') {
        filteredRecettes = filteredRecettes.filter(r => r.type === filters['type-recette']);
    }
    
    if (filters.vehicule && filters.vehicule !== 'tous') {
        filteredRecettes = filteredRecettes.filter(r => r.vehicule === filters.vehicule);
    }
    
    // Appliquer les filtres spécifiques aux dépenses
    if (filters['type-depense'] && filters['type-depense'] !== 'tous') {
        filteredDepenses = filteredDepenses.filter(d => d.type === filters['type-depense']);
    }
    
    if (filters.statut && filters.statut !== 'tous') {
        filteredDepenses = filteredDepenses.filter(d => d.statut === filters.statut);
    }
    
    // Mettre à jour l'état avec les données filtrées
    appState.updateUI({
        filteredRecettes,
        filteredDepenses,
        hasActiveFilters: Object.values(filters).some(f => f && f !== 'tous')
    });
    
    // Mettre à jour l'affichage avec les résultats filtrés
    renderRecettesTable(filteredRecettes);
    renderDepensesTable(filteredDepenses);
}

/**
 * Réinitialise tous les filtres
 */
function resetAllFilters() {
    // Réinitialiser le champ de recherche
    if (searchInput) {
        searchInput.value = '';
        appState.setSearchQuery('');
    }
    
    // Réinitialiser les sélecteurs de filtre
    const filterSelects = document.querySelectorAll('select[data-filter-type]');
    const resetFilters = {};
    
    filterSelects.forEach(select => {
        select.value = 'tous';
        resetFilters[select.dataset.filterType] = 'tous';
    });
    
    // Mettre à jour l'état avec les filtres réinitialisés
    appState.updateUI({
        activeFilters: resetFilters,
        filteredRecettes: [...appState.data.recettes],
        filteredDepenses: [...appState.data.depenses],
        hasActiveFilters: false,
        hasActiveSearch: false
    });
    
    // Réafficher toutes les données
    renderRecettesTable(appState.data.recettes);
    renderDepensesTable(appState.data.depenses);
}

/**
 * Réinitialise les filtres de recherche et de filtrage
 */
function resetFilters() {
    // Réinitialiser le champ de recherche
    if (searchInput) {
        searchInput.value = '';
        appState.setSearchQuery('');
    }
    
    // Réinitialiser tous les sélecteurs de filtre
    const filterSelects = document.querySelectorAll('select[data-filter-type]');
    const resetFilters = {};
    
    filterSelects.forEach(select => {
        select.value = 'tous';
        resetFilters[select.dataset.filterType] = 'tous';
    });
    
    // Mettre à jour l'état avec les filtres réinitialisés
    appState.updateUI({
        activeFilters: resetFilters,
        filteredRecettes: [...appState.data.recettes],
        filteredDepenses: [...appState.data.depenses],
        hasActiveFilters: false,
        hasActiveSearch: false
    });
    
    // Réafficher toutes les données
    renderRecettesTable(appState.data.recettes);
    renderDepensesTable(appState.data.depenses);
    
    showNotification('Filtres réinitialisés', 'info');
}

/**
 * Initialise les modales et les écouteurs d'événements
 */
function initializeModals() {
    try {
        // Initialiser les modales Bootstrap
        if (recetteModal) {
            recetteModal = new bootstrap.Modal(document.getElementById('recetteModal'));
        }
        
        if (depenseModal) {
            depenseModal = new bootstrap.Modal(document.getElementById('depenseModal'));
        }
        
        if (deleteModal) {
            deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
        }
        
        // Initialiser les écouteurs d'événements pour les formulaires
        if (recetteForm) {
            recetteForm.addEventListener('submit', handleRecetteSubmit);
        }
        
        if (depenseForm) {
            depenseForm.addEventListener('submit', handleDepenseSubmit);
        }
        
        // Initialiser la recherche
        if (searchInput) {
            searchInput.addEventListener('input', handleSearch);
        }
        
        // Initialiser les filtres
        const filterSelects = document.querySelectorAll('select[data-filter-type]');
        filterSelects.forEach(select => {
            select.addEventListener('change', handleFilterChange);
        });
        
        // Initialiser le bouton de réinitialisation des filtres
        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', resetFilters);
        }
        
        // Initialiser le sélecteur de véhicule
        if (filterBus) {
            filterBus.addEventListener('change', handleFilterChange);
        }
        
        // Initialiser le sélecteur de type de dépense
        if (typeDepense) {
            typeDepense.addEventListener('change', handleFilterChange);
        }
        
        // Initialiser la recherche de recettes
        if (searchRecette) {
            searchRecette.addEventListener('input', handleSearch);
        }
        
        console.log('Modales et gestionnaires d\'événements initialisés');
    } catch (error) {
        console.error('Erreur lors de l\'initialisation des modales:', error);
    }
}

/**
 * Nettoie les écouteurs d'événements lors de la destruction du composant
 */
function cleanupEventListeners() {
    if (recetteForm) {
        recetteForm.removeEventListener('submit', handleRecetteSubmit);
    }
    
    if (depenseForm) {
        depenseForm.removeEventListener('submit', handleDepenseSubmit);
    }
    
    if (searchInput) {
        searchInput.removeEventListener('input', handleSearch);
    }
    
    const filterSelects = document.querySelectorAll('select[data-filter-type]');
    filterSelects.forEach(select => {
        select.removeEventListener('change', handleFilterChange);
    });
    
    if (resetFiltersBtn) {
        resetFiltersBtn.removeEventListener('click', resetFilters);
    }
    
    if (filterBus) {
        filterBus.removeEventListener('change', handleFilterChange);
    }
    
    if (typeDepense) {
        typeDepense.removeEventListener('change', handleFilterChange);
    }
    
    if (searchRecette) {
        searchRecette.removeEventListener('input', handleSearch);
    }
}

/**
 * Affiche la modale de confirmation de suppression
 * @param {string} type - Le type d'élément à supprimer ('recette' ou 'depense')
 * @param {string} id - L'ID de l'élément à supprimer
 */
function showDeleteModal(type, id) {
    if (!deleteModal) return;
    
    // Stocker le type et l'ID pour la suppression
    deleteModal.dataset.type = type;
    deleteModal.dataset.id = id;
    
    // Afficher la modale
    const modal = new bootstrap.Modal(deleteModal);
    modal.show();
}

/**
 * Supprime une recette
 * @param {string} id - L'ID de la recette à supprimer
 */
function deleteRecette(id) {
    try {
        const index = recettes.findIndex(r => r.id === id);
        if (index === -1) {
            throw new Error('Recette non trouvée');
        }
        
        const deletedRecette = recettes.splice(index, 1)[0];
        saveData();
        renderRecettesTable();
        updateDashboard();
        
        // Journaliser l'action
        logAction('delete', 'recette', deletedRecette);
        
        // Fermer la modale
        const modal = bootstrap.Modal.getInstance(deleteModal);
        if (modal) modal.hide();
        
        showNotification('Recette supprimée avec succès', 'success');
        return true;
    } catch (error) {
        console.error('Erreur lors de la suppression de la recette:', error);
        showNotification('Erreur lors de la suppression de la recette', 'danger');
        return false;
    }
}

/**
 * Supprime une dépense
 * @param {string} id - L'ID de la dépense à supprimer
 */
function deleteDepense(id) {
    try {
        const index = depenses.findIndex(d => d.id === id);
        if (index === -1) {
            throw new Error('Dépense non trouvée');
        }
        
        const deletedDepense = depenses.splice(index, 1)[0];
        saveData();
        renderDepensesTable();
        updateDashboard();
        
        // Journaliser l'action
        logAction('delete', 'depense', deletedDepense);
        
        // Fermer la modale
        const modal = bootstrap.Modal.getInstance(deleteModal);
        if (modal) modal.hide();
        
        showNotification('Dépense supprimée avec succès', 'success');
        return true;
    } catch (error) {
        console.error('Erreur lors de la suppression de la dépense:', error);
        showNotification('Erreur lors de la suppression de la dépense', 'danger');
        return false;
    }
}

// Gestionnaire de la confirmation de suppression
document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'confirmDeleteBtn' && deleteModal) {
        const type = deleteModal.dataset.type;
        const id = deleteModal.dataset.id;
        
        if (type === 'recette') {
            deleteRecette(id);
        } else if (type === 'depense') {
            deleteDepense(id);
        }
    }
});

// Exporter les fonctions nécessaires globalement
window.showDeleteModal = showDeleteModal;
window.deleteRecette = deleteRecette;
window.deleteDepense = deleteDepense;

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Charger les données
        loadData();
        
        // Initialiser les écouteurs d'événements
        setupEventListeners();
        
        // Initialiser les modales
        initializeModals();
        
        // Mettre à jour le tableau de bord
        updateDashboard();
        
        // Mettre à jour les graphiques s'ils existent
        updateChartsIfExists();
        
        console.log('Application initialisée avec succès');
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'application:', error);
        showNotification('Une erreur est survenue lors du chargement de l\'application', 'danger');
    }
});

// Fin de la condition de vérification de chargement
}
