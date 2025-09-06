/**
 * Test d'intégration du module Planning avec l'historique
 */

// Importer le gestionnaire d'historique
const { historiqueManager } = require('../js/historique');

// Simuler des actions de planning
function simulerActionsPlanning() {
    console.log('=== Début du test du module Planning ===');
    
    // 1. Création d'un nouveau planning
    const nouveauPlanning = {
        id: 'plan' + Date.now(),
        dateDebut: new Date().toISOString(),
        dateFin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 jours
        statut: 'brouillon',
        affectations: [
            {
                vehiculeId: 'v' + (Date.now() - 1000),
                chauffeurId: 'chauffeur1',
                trajets: [
                    {
                        date: new Date().toISOString(),
                        depart: 'Entrepôt principal',
                        arrivee: 'Client A',
                        heureDepart: '08:00',
                        heureArriveePrevue: '09:30'
                    }
                ]
            }
        ]
    };
    
    console.log('\n1. Création d\'un nouveau planning:');
    historiqueManager.enregistrerAction({
        type: 'creation',
        module: 'planning',
        entite: 'planning',
        donnees: nouveauPlanning,
        utilisateur: 'planificateur1',
        commentaire: 'Création du planning de la semaine prochaine'
    });
    
    // 2. Validation du planning
    const planningValide = {
        ...nouveauPlanning,
        statut: 'valide',
        validePar: 'responsable1',
        dateValidation: new Date().toISOString()
    };
    
    console.log('\n2. Validation du planning:');
    historiqueManager.enregistrerAction({
        type: 'validation',
        module: 'planning',
        entite: 'planning',
        donnees: planningValide,
        anciennesDonnees: { statut: nouveauPlanning.statut },
        utilisateur: 'responsable1',
        commentaire: 'Validation du planning par le responsable'
    });
    
    // 3. Modification d'une affectation
    const planningModifie = {
        ...planningValide,
        affectations: [
            {
                ...planningValide.affectations[0],
                trajets: [
                    ...planningValide.affectations[0].trajets,
                    {
                        date: new Date().toISOString(),
                        depart: 'Client A',
                        arrivee: 'Client B',
                        heureDepart: '10:00',
                        heureArriveePrevue: '11:30'
                    }
                ]
            }
        ]
    };
    
    console.log('\n3. Modification du planning:');
    historiqueManager.enregistrerAction({
        type: 'modification',
        module: 'planning',
        entite: 'planning',
        donnees: planningModifie,
        anciennesDonnees: { 
            affectations: planningValide.affectations 
        },
        utilisateur: 'planificateur1',
        commentaire: 'Ajout d\'un trajet supplémentaire pour le véhicule V123'
    });
    
    // Afficher l'historique des actions
    console.log('\n=== Historique des actions ===');
    const historique = historiqueManager.filtrer({ module: 'planning' });
    console.log(JSON.stringify(historique, null, 2));
    
    console.log('\n=== Test du module Planning terminé ===');
}

// Exécuter le test
simulerActionsPlanning();
