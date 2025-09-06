/**
 * Test d'intégration du module Maintenance avec l'historique
 */

// Importer le gestionnaire d'historique
const { historiqueManager } = require('../js/historique');

// Simuler des actions de maintenance
function simulerActionsMaintenance() {
    console.log('=== Début du test du module Maintenance ===');
    
    // 1. Création d'une intervention de maintenance
    const intervention = {
        id: 'maint' + Date.now(),
        vehiculeId: 'v' + (Date.now() - 1000), // ID différent du véhicule
        type: 'vidange',
        dateDebut: new Date().toISOString(),
        dateFinPrevue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 jours
        coutEstime: 250,
        statut: 'en_cours',
        description: 'Vidange complète et remplacement des filtres',
        technicien: 'tech1'
    };
    
    console.log('\n1. Création d\'une intervention de maintenance:');
    historiqueManager.enregistrerAction({
        type: 'creation',
        module: 'maintenance',
        entite: 'intervention',
        donnees: intervention,
        utilisateur: 'tech1',
        commentaire: 'Nouvelle intervention de maintenance planifiée'
    });
    
    // 2. Mise à jour du statut de l'intervention
    const majIntervention = {
        ...intervention,
        statut: 'en_attente_pieces',
        commentaire: 'En attente de pièces détachées',
        piecesManquantes: ['Filtre à huile', 'Joint de bouchon de vidange']
    };
    
    console.log('\n2. Mise à jour du statut de l\'intervention:');
    historiqueManager.enregistrerAction({
        type: 'modification',
        module: 'maintenance',
        entite: 'intervention',
        donnees: majIntervention,
        anciennesDonnees: { statut: intervention.statut },
        utilisateur: 'tech1',
        commentaire: 'Mise à jour du statut: en attente de pièces'
    });
    
    // 3. Finalisation de l'intervention
    const interventionFinalisee = {
        ...majIntervention,
        statut: 'terminee',
        dateFin: new Date().toISOString(),
        coutReel: 280,
        travauxEffectues: [
            'Vidange moteur',
            'Remplacement filtre à huile',
            'Remplacement joint de bouchon de vidange',
            'Contrôle des niveaux'
        ]
    };
    
    console.log('\n3. Finalisation de l\'intervention:');
    historiqueManager.enregistrerAction({
        type: 'modification',
        module: 'maintenance',
        entite: 'intervention',
        donnees: interventionFinalisee,
        anciennesDonnees: { 
            statut: majIntervention.statut,
            piecesManquantes: majIntervention.piecesManquantes
        },
        utilisateur: 'tech1',
        commentaire: 'Intervention terminée avec succès'
    });
    
    // Afficher l'historique des actions
    console.log('\n=== Historique des actions ===');
    const historique = historiqueManager.filtrer({ module: 'maintenance' });
    console.log(JSON.stringify(historique, null, 2));
    
    console.log('\n=== Test du module Maintenance terminé ===');
}

// Exécuter le test
simulerActionsMaintenance();
