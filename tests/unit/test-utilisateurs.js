/**
 * Test d'intégration du module Utilisateurs avec l'historique
 */

// Importer le gestionnaire d'historique
const { historiqueManager } = require('../js/historique');

// Simuler des actions utilisateur
function simulerActionsUtilisateurs() {
    console.log('=== Début du test du module Utilisateurs ===');
    
    // 1. Création d'un utilisateur
    const nouvelUtilisateur = {
        id: 'user' + Date.now(),
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com',
        role: 'admin'
    };
    
    console.log('\n1. Création d\'un utilisateur:');
    historiqueManager.enregistrerAction({
        type: 'creation',
        module: 'utilisateurs',
        entite: 'utilisateur',
        donnees: nouvelUtilisateur,
        utilisateur: 'system',
        commentaire: 'Création d\'un nouvel utilisateur administrateur'
    });
    
    // 2. Modification de l'utilisateur
    const modifications = {
        ...nouvelUtilisateur,
        prenom: 'Jean-Pierre',
        email: 'jean-pierre.dupont@example.com'
    };
    
    console.log('\n2. Modification de l\'utilisateur:');
    historiqueManager.enregistrerAction({
        type: 'modification',
        module: 'utilisateurs',
        entite: 'utilisateur',
        donnees: modifications,
        anciennesDonnees: nouvelUtilisateur,
        utilisateur: 'admin',
        commentaire: 'Mise à jour du prénom et de l\'email'
    });
    
    // 3. Suppression de l'utilisateur
    console.log('\n3. Suppression de l\'utilisateur:');
    historiqueManager.enregistrerAction({
        type: 'suppression',
        module: 'utilisateurs',
        entite: 'utilisateur',
        donnees: { id: nouvelUtilisateur.id },
        utilisateur: 'admin',
        commentaire: 'Suppression de l\'utilisateur du système'
    });
    
    // Afficher l'historique des actions
    console.log('\n=== Historique des actions ===');
    const historique = historiqueManager.filtrer({ module: 'utilisateurs' });
    console.log(JSON.stringify(historique, null, 2));
    
    console.log('\n=== Test du module Utilisateurs terminé ===');
}

// Exécuter le test
simulerActionsUtilisateurs();
