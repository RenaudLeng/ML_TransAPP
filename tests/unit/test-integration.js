/**
 * Script de test d'intégration pour le gestionnaire d'historique
 * Ce script teste l'intégration avec les différents modules de l'application
 */

const { HistoriqueManager } = require('../js/historique');
const historiqueManager = new HistoriqueManager();

// Désactiver la sauvegarde pour les tests
historiqueManager._sauvegarder = () => {};

// Données de test
const TESTS = {
    // Test pour le module Utilisateurs
    utilisateurs: [
        {
            description: "Création d'un utilisateur",
            action: 'creation',
            entite: 'utilisateur',
            donnees: {
                id: 'user123',
                nom: 'Dupont',
                prenom: 'Jean',
                email: 'jean.dupont@example.com',
                role: 'admin'
            }
        },
        {
            description: "Modification d'un utilisateur",
            action: 'modification',
            entite: 'utilisateur',
            donnees: {
                id: 'user123',
                nom: 'Dupont',
                prenom: 'Jean-Pierre', // Changement de prénom
                email: 'jean-pierre.dupont@example.com',
                role: 'admin'
            },
            anciennesDonnees: {
                prenom: 'Jean',
                email: 'jean.dupont@example.com'
            }
        },
        {
            description: "Suppression d'un utilisateur",
            action: 'suppression',
            entite: 'utilisateur',
            donnees: {
                id: 'user123',
                nom: 'Dupont',
                prenom: 'Jean-Pierre'
            }
        }
    ],
    
    // Test pour le module Véhicules
    vehicules: [
        {
            description: "Ajout d'un véhicule",
            action: 'creation',
            entite: 'vehicule',
            donnees: {
                id: 'v001',
                marque: 'Renault',
                modele: 'Master',
                immatriculation: 'AB-123-CD',
                kilometrage: 50000
            }
        },
        {
            description: "Mise à jour du kilométrage",
            action: 'modification',
            entite: 'vehicule',
            donnees: {
                id: 'v001',
                kilometrage: 52000
            },
            anciennesDonnees: {
                kilometrage: 50000
            }
        }
    ],
    
    // Test pour le module Maintenance
    maintenance: [
        {
            description: "Création d'une intervention",
            action: 'creation',
            entite: 'intervention',
            donnees: {
                id: 'int001',
                vehiculeId: 'v001',
                type: 'vidange',
                date: '2023-06-15',
                cout: 150.50,
                description: 'Vidange complète et remplacement des filtres'
            }
        },
        {
            description: "Clôture d'une intervention",
            action: 'modification',
            entite: 'intervention',
            donnees: {
                id: 'int001',
                statut: 'termine',
                dateFin: '2023-06-15T14:30:00Z'
            },
            anciennesDonnees: {
                statut: 'en_cours'
            }
        }
    ],
    
    // Test pour le module Planning
    planning: [
        {
            description: "Création d'un trajet",
            action: 'creation',
            entite: 'trajet',
            donnees: {
                id: 't001',
                chauffeur: 'user123',
                vehicule: 'v001',
                depart: 'Paris',
                arrivee: 'Lyon',
                dateDepart: '2023-07-01T08:00:00Z',
                dateArrivee: '2023-07-01T12:00:00Z',
                statut: 'planifie'
            }
        },
        {
            description: "Mise à jour du statut d'un trajet",
            action: 'modification',
            entite: 'trajet',
            donnees: {
                id: 't001',
                statut: 'en_cours',
                heureDepartReel: '2023-07-01T08:15:00Z'
            },
            anciennesDonnees: {
                statut: 'planifie'
            }
        }
    ]
};

/**
 * Exécute les tests d'intégration
 */
async function executerTestsIntegration() {
    console.log('=== Début des tests d\'intégration ===\n');
    
    let totalTests = 0;
    let testsReussis = 0;
    
    // Parcourir tous les modules à tester
    for (const [module, tests] of Object.entries(TESTS)) {
        console.log(`\n=== Module ${module.toUpperCase()} ===`);
        
        for (const test of tests) {
            totalTests++;
            console.log(`\nTest: ${test.description}`);
            
            try {
                // Enregistrer l'action dans l'historique
                const id = historiqueManager.enregistrerAction({
                    type: test.action,
                    module: module,
                    entite: test.entite,
                    donnees: test.donnees,
                    anciennesDonnees: test.anciennesDonnees,
                    utilisateur: 'testeur',
                    commentaire: `Test d'intégration: ${test.description}`
                });
                
                // Vérifier que l'ID a bien été généré
                if (!id) {
                    throw new Error('Échec de la génération de l\'ID');
                }
                
                // Vérifier que l'entrée existe dans l'historique
                const entree = historiqueManager.getEntreeParId(id);
                if (!entree) {
                    throw new Error('L\'entrée n\'a pas été trouvée dans l\'historique');
                }
                
                // Vérifier les données enregistrées
                if (entree.type !== test.action) {
                    throw new Error(`Type d'action incorrect: ${entree.type} au lieu de ${test.action}`);
                }
                
                if (entree.entite !== test.entite) {
                    throw new Error(`Entité incorrecte: ${entree.entite} au lieu de ${test.entite}`);
                }
                
                console.log('✅ Succès');
                testsReussis++;
                
            } catch (error) {
                console.error(`❌ Échec: ${error.message}`);
            }
        }
    }
    
    // Afficher le résumé
    console.log('\n=== Résumé des tests ===');
    console.log(`Tests exécutés: ${totalTests}`);
    console.log(`Tests réussis: ${testsReussis}`);
    console.log(`Taux de réussite: ${Math.round((testsReussis / totalTests) * 100)}%`);
    
    if (testsReussis === totalTests) {
        console.log('\n🎉 Tous les tests d\'intégration ont réussi !');
    } else {
        console.log(`\n⚠️ ${totalTests - testsReussis} test(s) ont échoué.`);
    }
}

// Exécuter les tests
executerTestsIntegration().catch(console.error);
