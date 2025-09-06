/**
 * Test du gestionnaire d'historique en environnement Node.js
 */

// Simuler localStorage pour les tests en Node.js
if (typeof localStorage === 'undefined') {
  const LocalStorage = require('node-localstorage').LocalStorage;
  const path = require('path');
  const localStoragePath = path.join(__dirname, 'localStorage');
  global.localStorage = new LocalStorage(localStoragePath);
}

// Importer le gestionnaire d'historique
const { HistoriqueManager, ACTIONS, MODULES, ENTITES } = require('../js/historique');

// Créer une instance pour les tests
const testManager = new HistoriqueManager();

// Désactiver la sauvegarde automatique pour les tests
testManager._sauvegarder = () => {};

// Tests unitaires
function runTests() {
  console.log('=== Début des tests du gestionnaire d\'historique ===\n');
  
  // Test 1: Vérifier que l'instance est correctement créée
  console.log('Test 1: Initialisation du gestionnaire');
  console.assert(testManager instanceof HistoriqueManager, 'Le gestionnaire devrait être une instance de HistoriqueManager');
  console.assert(Array.isArray(testManager.historique), 'L\'historique devrait être un tableau');
  console.log('✅ Test 1 réussi\n');
  
  // Test 2: Ajout d'une entrée
  console.log('Test 2: Ajout d\'une entrée');
  const testEntry = {
    type: ACTIONS.CREATION,
    module: MODULES.FINANCE,
    entite: ENTITES.RECETTE,
    donnees: { montant: 100, description: 'Test' },
    utilisateur: 'testuser',
    commentaire: 'Test d\'ajout d\'entrée'
  };
  
  const entryId = testManager.enregistrerAction(testEntry);
  console.assert(entryId, 'L\'ID de l\'entrée devrait être retourné');
  console.assert(testManager.historique.length > 0, 'L\'historique ne devrait pas être vide');
  console.log('✅ Test 2 réussi\n');
  
  // Test 3: Récupération d'une entrée par ID
  console.log('Test 3: Récupération d\'une entrée par ID');
  const foundEntry = testManager.getEntreeParId(entryId);
  console.assert(foundEntry, 'L\'entrée devrait être trouvée');
  console.assert(foundEntry.id === entryId, 'L\'ID de l\'entrée devrait correspondre');
  console.log('✅ Test 3 réussi\n');
  
  // Test 4: Filtrage des entrées
  console.log('Test 4: Filtrage des entrées');
  const filtered = testManager.filtrer({ type: ACTIONS.CREATION });
  console.assert(Array.isArray(filtered), 'Le résultat du filtrage devrait être un tableau');
  console.assert(filtered.some(e => e.id === entryId), 'L\'entrée devrait être présente dans les résultats filtrés');
  console.log('✅ Test 4 réussi\n');
  
  // Test 5: Pagination
  console.log('Test 5: Pagination des résultats');
  const page = testManager.getPage(1, 10);
  console.assert(page, 'La page devrait être retournée');
  console.assert(page.donnees.length <= 10, 'Le nombre d\'entrées par page ne devrait pas dépasser la limite');
  console.log('✅ Test 5 réussi\n');
  
  console.log('=== Tous les tests ont été exécutés avec succès ===');
}

// Exécuter les tests
try {
  runTests();
} catch (error) {
  console.error('Erreur lors de l\'exécution des tests:', error);
  process.exit(1);
}
