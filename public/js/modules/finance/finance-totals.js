// finance/finance-totals.js

import { formatMontant } from './finance-utils.js';

/**
 * Met à jour les totaux des recettes, dépenses et le solde
 */
function mettreAJourTotaux() {
  try {
    // Récupérer les données
    const recettes = JSON.parse(localStorage.getItem('recettes')) || [];
    const depenses = JSON.parse(localStorage.getItem('depenses')) || [];
    
    // Calculer les totaux
    const totalRecettes = recettes.reduce((sum, recette) => sum + (parseFloat(recette.montant) || 0), 0);
    const totalDepenses = depenses.reduce((sum, depense) => sum + (parseFloat(depense.montant) || 0), 0);
    const solde = totalRecettes - totalDepenses;
    
    // Mettre à jour l'interface utilisateur
    const updateElement = (id, value, isCurrency = true) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = isCurrency ? formatMontant(value) : value;
      }
    };
    
    updateElement('totalRecettes', totalRecettes);
    updateElement('totalDepenses', totalDepenses);
    updateElement('solde', solde);
    
    // Mettre à jour la couleur du solde
    const soldeElement = document.getElementById('solde');
    if (soldeElement) {
      soldeElement.className = solde >= 0 ? 'text-success fw-bold' : 'text-danger fw-bold';
    }
    
    // Mettre à jour le graphique des dépenses par catégorie
    updateDepensesParCategorie(depenses);
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour des totaux:', error);
  }
}

/**
 * Met à jour le graphique des dépenses par catégorie
 * @param {Array} depenses - La liste des dépenses
 */
function updateDepensesParCategorie(depenses) {
  try {
    const ctx = document.getElementById('depensesParCategorieChart');
    if (!ctx) return;
    
    // Grouper les dépenses par catégorie
    const depensesParCategorie = {};
    
    depenses.forEach(depense => {
      const categorie = depense.categorie || 'Autres';
      const montant = parseFloat(depense.montant) || 0;
      
      if (depensesParCategorie[categorie]) {
        depensesParCategorie[categorie] += montant;
      } else {
        depensesParCategorie[categorie] = montant;
      }
    });
    
    // Trier par montant décroissant
    const categoriesTriees = Object.entries(depensesParCategorie)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10); // Limiter aux 10 premières catégories
    
    const labels = categoriesTriees.map(([categorie]) => categorie);
    const data = categoriesTriees.map(([_, montant]) => montant);
    
    // Couleurs pour le graphique
    const backgroundColors = [
      'rgba(255, 99, 132, 0.7)',
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 206, 86, 0.7)',
      'rgba(75, 192, 192, 0.7)',
      'rgba(153, 102, 255, 0.7)',
      'rgba(255, 159, 64, 0.7)',
      'rgba(199, 199, 199, 0.7)',
      'rgba(83, 102, 255, 0.7)',
      'rgba(40, 159, 64, 0.7)',
      'rgba(210, 99, 132, 0.7)'
    ];
    
    // Créer ou mettre à jour le graphique
    if (window.depensesParCategorieChart) {
      window.depensesParCategorieChart.data.labels = labels;
      window.depensesParCategorieChart.data.datasets[0].data = data;
      window.depensesParCategorieChart.update();
    } else {
      window.depensesParCategorieChart = new Chart(ctx, {
        type: 'doughnut',
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
            title: {
              display: true,
              text: 'Dépenses par catégorie',
              font: {
                size: 16
              }
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
          },
          cutout: '60%',
          animation: {
            animateScale: true,
            animateRotate: true
          }
        }
      });
    }
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour du graphique des dépenses par catégorie:', error);
  }
}

// Exporter les fonctions
window.mettreAJourTotaux = mettreAJourTotaux;
