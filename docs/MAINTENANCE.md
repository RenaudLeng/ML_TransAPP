# Module de Gestion de la Maintenance

Ce document fournit une documentation complète du module de gestion de la maintenance de l'application ML Transport.

## Vue d'ensemble

Le module de maintenance permet de gérer les opérations de maintenance des véhicules de l'entreprise, y compris :

- L'enregistrement des interventions de maintenance
- Le suivi de l'état des véhicules
- La planification des maintenances préventives
- La génération de rapports et statistiques
- Le suivi kilométrique des véhicules
- La gestion des coûts de maintenance

## Structure des Fichiers

```text
js/
  maintenance.js          # Logique principale du module
  maintenance-config.js   # Configuration et constantes
  maintenance-utils.js    # Fonctions utilitaires
  maintenance-api.js      # Communication avec le backend
  maintenance-tracking.js # Gestion du suivi kilométrique
  maintenance-charts.js   # Gestion des graphiques et statistiques
css/
  maintenance.css         # Styles spécifiques au module
  maintenance-styles.css  # Styles additionnels pour les composants
```

## Fonctionnalités Principales

### 1. Gestion des Maintenances

- Enregistrement des interventions de maintenance
- Suivi de l'état des réparations
- Historique complet des interventions par véhicule
- Système de notifications pour les échéances

### 2. Planification

- Alertes pour les maintenances préventives
- Calendrier des interventions planifiées
- Gestion des priorités et statuts
- Rappels automatiques par email

### 3. Suivi Kilométrique

- Enregistrement des kilométrages
- Alertes pour les révisions programmées
- Suivi de la consommation de carburant
- Prévision des coûts de maintenance

### 4. Rapports et Statistiques

- Tableaux de bord interactifs avec Chart.js
- Graphiques de suivi des coûts
- Analyse des pannes récurrentes
- Indicateurs de performance clés (KPI)
- Export des données (PDF, Excel, CSV)

## Configuration

Le fichier `maintenance-config.js` contient tous les paramètres configurables :

```javascript
{
  PAGINATION: {
    ITEMS_PER_PAGE: 10,
    VISIBLE_PAGES: 5
  },
  STATUS: {
    PLANNED: 'planifiée',
    IN_PROGRESS: 'en cours'
    // ...
  }
  // ...
}
```

## API

Le module expose les méthodes suivantes :

### `new MaintenanceManager()`
Initialise une nouvelle instance du gestionnaire de maintenance.

### Méthodes Principales

#### `addMaintenance(data)`
Ajoute une nouvelle intervention de maintenance.

**Paramètres :**
- `data` (Object) : Données de la maintenance

**Retourne :**
- (Promise) Résultat de l'opération

#### `getMaintenance(id)`
Récupère une intervention par son ID.

**Paramètres :**
- `id` (String) : ID de la maintenance

**Retourne :**
- (Object) Données de la maintenance

#### `updateMaintenance(id, data)`
Met à jour une intervention existante.

**Paramètres :**
- `id` (String) : ID de la maintenance
- `data` (Object) : Données à mettre à jour

**Retourne :**
- (Promise) Résultat de l'opération

#### `deleteMaintenance(id)`
Supprime une intervention.

**Paramètres :**
- `id` (String) : ID de la maintenance

**Retourne :**
- (Promise) Résultat de l'opération

## Intégration

Pour intégrer le module dans une page :

1. Inclure les dépendances requises dans le HTML :
   ```html
   <!-- Styles CSS -->
   <link href="css/maintenance.css" rel="stylesheet">
   <link href="css/maintenance-styles.css" rel="stylesheet">
   
   <!-- Dépendances JavaScript -->
   <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
   <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
   <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
   <script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/fr.js"></script>
   
   <!-- Scripts du module -->
   <script type="module" src="js/maintenance.js"></script>
   <script type="module" src="js/maintenance-tracking.js"></script>
   <script src="js/maintenance-charts.js"></script>
   ```

2. Initialiser les composants dans votre JavaScript :
   ```javascript
   document.addEventListener('DOMContentLoaded', () => {
     // Initialiser les sélecteurs de date
     flatpickr("[data-toggle='datepicker']", {
       locale: 'fr',
       dateFormat: 'd/m/Y',
       allowInput: true,
       disableMobile: true
     });
     
     // Initialiser les tooltips Bootstrap
     const tooltipTriggerList = [].slice.call(
       document.querySelectorAll('[data-bs-toggle="tooltip"]')
     );
     tooltipTriggerList.map(tooltipTriggerEl => 
       new bootstrap.Tooltip(tooltipTriggerEl)
     );
     
     // Initialiser le gestionnaire de maintenance
     if (window.maintenanceManager) {
       window.maintenanceManager.init();
     }
   });
   ```

## Bonnes Pratiques

1. **Validation des Données**
   - Valider systématiquement les entrées utilisateur côté client et serveur
   - Utiliser les constantes de statut définies dans la configuration
   - Implémenter une validation en temps réel pour une meilleure UX

2. **Gestion des Erreurs**
   - Envelopper les appels API dans des blocs try/catch
   - Fournir des messages d'erreur clairs et exploitables
   - Journaliser les erreurs pour le débogage

3. **Performance**
   - Utiliser le chargement paresseux pour les données volumineuses
   - Mettre en cache les données fréquemment utilisées
   - Minimiser les re-rendus inutiles
   - Optimiser les requêtes de base de données

4. **Sécurité**
   - Valider et assainir toutes les entrées utilisateur
   - Implémenter une authentification et une autorisation appropriées
   - Protéger contre les attaques XSS et CSRF

5. **Maintenabilité**
   - Documenter le code avec des commentaires clairs
   - Suivre les conventions de nommage cohérentes
   - Décomposer le code en petits composants réutilisables
   - Écrire des tests unitaires et d'intégration

## Dépannage

### Problèmes Courants

1. **Les données ne se chargent pas**
   - Vérifier la connexion au serveur
   - Vérifier les erreurs dans la console du navigateur

2. **Problèmes d'affichage**
   - Vérifier que tous les fichiers CSS sont chargés
   - Vérifier les erreurs JavaScript dans la console

## Licence

Ce module est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
