/**
 * Test d'intégration du module Véhicules avec l'historique
 */

// Importer le gestionnaire d'historique
const { historiqueManager } = require('../js/historique');

// Simuler des actions sur les véhicules
function simulerActionsVehicules() {
    console.log('=== Début du test du module Véhicules ===');
    
    // 1. Ajout d'un nouveau véhicule
    const nouveauVehicule = {
        id: 'v' + Date.now(),
        matricule: 'AB123CD',
        marque: 'Renault',
        modele: 'Master',
        annee: 2022,
        kilometrage: 15000,
        statut: 'disponible'
    };
    
    console.log('\n1. Ajout d\'un nouveau véhicule:');
    historiqueManager.enregistrerAction({
        type: 'creation',
        module: 'vehicules',
        entite: 'vehicule',
        donnees: nouveauVehicule,
        utilisateur: 'admin',
        commentaire: 'Ajout d\'un nouveau véhicule à la flotte'
    });
    
    // 2. Mise à jour du kilométrage
    const miseAJourKilometrage = {
        ...nouveauVehicule,
        kilometrage: 15250
    };
    
    console.log('\n2. Mise à jour du kilométrage:');
    historiqueManager.enregistrerAction({
        type: 'modification',
        module: 'vehicules',
        entite: 'vehicule',
        donnees: miseAJourKilometrage,
        anciennesDonnees: { kilometrage: nouveauVehicule.kilometrage },
        utilisateur: 'mecanicien1',
        commentaire: 'Mise à jour du kilométrage après trajet'
    });
    
    // 3. Mise en maintenance
    const miseEnMaintenance = {
        ...miseAJourKilometrage,
        statut: 'en_maintenance',
        raison_maintenance: 'Vidange et révision périodique'
    };
    
    console.log('\n3. Mise en maintenance du véhicule:');
    historiqueManager.enregistrerAction({
        type: 'maintenance',
        module: 'vehicules',
        entite: 'vehicule',
        donnees: miseEnMaintenance,
        anciennesDonnees: { statut: nouveauVehicule.statut },
        utilisateur: 'mecanicien1',
        commentaire: 'Mise en maintenance pour vidange et révision'
    });
    
    // Afficher l'historique des actions
    console.log('\n=== Historique des actions ===');
    const historique = historiqueManager.filtrer({ module: 'vehicules' });
    console.log(JSON.stringify(historique, null, 2));
    
    console.log('\n=== Test du module Véhicules terminé ===');
}

// Exécuter le test
simulerActionsVehicules();
