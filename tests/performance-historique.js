/**
 * Script de test de performance pour le gestionnaire d'historique
 * Ce script permet de :
 * 1. Générer un grand nombre d'entrées d'historique
 * 2. Mesurer les temps de réponse pour différentes opérations
 * 3. Tester les performances de filtrage et de recherche
 */

// Importer le gestionnaire d'historique
const { HistoriqueManager } = require('../js/historique');

// Créer une nouvelle instance pour les tests
const testManager = new HistoriqueManager();

// Désactiver la sauvegarde automatique pour les tests de performance
testManager._sauvegarder = () => {};

// Configuration des tests
const CONFIG = {
    NOMBRE_ENTREES: 10000,
    TAILLE_PAGE: 50,
    NOMBRE_REPETITIONS: 10
};

// Données de test
const MODULES = ['finance', 'utilisateurs', 'vehicules', 'maintenance', 'planning'];
const ACTIONS = ['creation', 'modification', 'suppression', 'connexion', 'deconnexion'];
const UTILISATEURS = ['admin', 'manager', 'employe1', 'employe2', 'employe3'];
const ENTITES = ['recette', 'depense', 'utilisateur', 'vehicule', 'intervention', 'trajet'];

/**
 * Génère une entrée d'historique aléatoire
 */
function genererEntreeAleatoire() {
    const module = MODULES[Math.floor(Math.random() * MODULES.length)];
    const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
    const utilisateur = UTILISATEURS[Math.floor(Math.random() * UTILISATEURS.length)];
    const entite = ENTITES[Math.floor(Math.random() * ENTITES.length)];
    
    return {
        type: action,
        module: module,
        entite: entite,
        utilisateur: utilisateur,
        commentaire: `${action} de ${entite} dans le module ${module} par ${utilisateur}`,
        donnees: {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            details: `Détails supplémentaires pour le test de performance`
        }
    };
}

/**
 * Mesure le temps d'exécution d'une fonction
 */
async function mesurerTempsExecution(fn, iterations = 1) {
    const tempsDebut = process.hrtime();
    
    for (let i = 0; i < iterations; i++) {
        await fn();
    }
    
    const tempsEcoule = process.hrtime(tempsDebut);
    return (tempsEcoule[0] * 1000 + tempsEcoule[1] / 1e6) / iterations; // en ms
}

/**
 * Test de performance : Ajout d'entrées
 */
async function testerAjoutEntrees() {
    console.log(`\n=== Test d'ajout de ${CONFIG.NOMBRE_ENTREES} entrées ===`);
    
    const tempsMoyen = await mesurerTempsExecution(async () => {
        for (let i = 0; i < CONFIG.NOMBRE_ENTREES; i++) {
            const entree = genererEntreeAleatoire();
            testManager.enregistrerAction(entree);
        }
    }, 1);
    
    console.log(`Temps total: ${tempsMoyen.toFixed(2)}ms`);
    console.log(`Temps moyen par entrée: ${(tempsMoyen / CONFIG.NOMBRE_ENTREES).toFixed(4)}ms`);
    console.log(`Taux: ${Math.floor((CONFIG.NOMBRE_ENTREES / tempsMoyen) * 1000)} opérations/seconde`);
}

/**
 * Test de performance : Filtrage
 */
async function testFiltrage() {
    console.log('\n=== Test de filtrage ===');
    
    // Test avec différents filtres
    const filtres = [
        { module: 'finance' },
        { type: 'creation' },
        { utilisateur: 'admin' },
        { module: 'vehicules', type: 'modification' },
        { recherche: 'test' }
    ];
    
    for (const filtre of filtres) {
        const temps = await mesurerTempsExecution(
            () => testManager.filtrer(filtre),
            CONFIG.NOMBRE_REPETITIONS
        );
        
        console.log(`Filtre ${JSON.stringify(filtre)}: ${temps.toFixed(4)}ms`);
    }
}

/**
 * Test de performance : Pagination
 */
async function testPagination() {
    console.log('\n=== Test de pagination ===');
    
    const pagesATester = [1, 10, 50, 100];
    
    for (const page of pagesATester) {
        const temps = await mesurerTempsExecution(
            () => testManager.getPage(page, CONFIG.TAILLE_PAGE),
            CONFIG.NOMBRE_REPETITIONS
        );
        
        console.log(`Page ${page}: ${temps.toFixed(4)}ms`);
    }
}

/**
 * Test de performance : Export
 */
async function testExport() {
    console.log('\n=== Test d\'export ===');
    
    // Test d'export CSV
    let temps = await mesurerTempsExecution(
        () => testManager.exporter('csv')
    );
    console.log(`Export CSV: ${temps.toFixed(2)}ms`);
    
    // Test d'export JSON
    temps = await mesurerTempsExecution(
        () => testManager.exporter('json')
    );
    console.log(`Export JSON: ${temps.toFixed(2)}ms`);
}

/**
 * Exécution des tests
 */
async function executerTests() {
    console.log('=== Début des tests de performance ===');
    console.log(`Configuration: ${JSON.stringify(CONFIG, null, 2)}`);
    
    // 1. Test d'ajout d'entrées
    await testerAjoutEntrees();
    
    // 2. Test de filtrage
    await testFiltrage();
    
    // 3. Test de pagination
    await testPagination();
    
    // 4. Test d'export
    await testExport();
    
    console.log('\n=== Tests terminés ===');
}

// Démarrer les tests
executerTests().catch(console.error);
