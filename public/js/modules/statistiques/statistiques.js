// Statistiques Module

document.addEventListener('DOMContentLoaded', function() {
  console.log('Statistiques module loaded');
  
  // Initialize the page
  initPage();
  
  // Load data and update charts
  loadData();
  
  // Setup event listeners
  setupEventListeners();
});

function initPage() {
  // Initialize any page-specific elements here
  console.log('Initializing statistics page');
}

async function loadData() {
  try {
    // Load your data here
    console.log('Loading data...');
    
    // Example: Load data from localStorage or API
    const recettes = JSON.parse(localStorage.getItem('recettes') || '[]');
    const depenses = JSON.parse(localStorage.getItem('depenses') || '[]');
    
    // Update the UI with the loaded data
    updateUI(recettes, depenses);
    
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

function setupEventListeners() {
  // Add event listeners for filters, buttons, etc.
  console.log('Setting up event listeners');
  
  // Example: Date range selector
  const dateRangeSelect = document.getElementById('dateRange');
  if (dateRangeSelect) {
    dateRangeSelect.addEventListener('change', function() {
      // Handle date range change
      console.log('Date range changed to:', this.value);
      // Reload data with new date range
      loadData();
    });
  }
  
  // Add more event listeners as needed
}

function updateUI(recettes, depenses) {
  // Update the UI with the provided data
  console.log('Updating UI with data');
  
  // Update summary cards
  updateSummaryCards(recettes, depenses);
  
  // Update charts
  updateCharts(recettes, depenses);
  
  // Update last modified time
  updateLastModified();
}

function updateSummaryCards(recettes, depenses) {
  // Calculate totals
  const totalRecettes = recettes.reduce((sum, item) => sum + (parseFloat(item.montant) || 0), 0);
  const totalDepenses = depenses.reduce((sum, item) => sum + (parseFloat(item.montant) || 0), 0);
  const benefice = totalRecettes - totalDepenses;
  
  // Update the DOM elements
  updateCard('totalRecettes', totalRecettes);
  updateCard('totalDepenses', totalDepenses);
  updateCard('benefice', benefice, true);
}

function updateCard(elementId, value, isCurrency = true) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = isCurrency ? formatCurrency(value) : value;
  }
}

function updateCharts(recettes, depenses) {
  // Initialize or update charts here
  console.log('Updating charts');
  
  // Example: Update a chart
  // updateExpensePieChart(depenses);
  // updateTrendChart(recettes, depenses);
  // updateBusPerformanceChart(recettes, depenses);
}

function updateLastModified() {
  const now = new Date();
  const options = { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  };
  const lastUpdateElement = document.getElementById('lastUpdate');
  if (lastUpdateElement) {
    lastUpdateElement.textContent = now.toLocaleDateString('fr-FR', options);
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(value);
}

// Export functions that might be used elsewhere
export {
  loadData,
  updateUI,
  updateSummaryCards,
  updateCharts,
  formatCurrency
};
