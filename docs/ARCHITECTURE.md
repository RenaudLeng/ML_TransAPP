# Architecture de l'Application ML Transport

## Structure des Dossiers

```
/ML_TransportAPP1
  /public              # Fichiers statiques servis au client
    /assets            # Ressources statiques
      /images          # Images de l'application
      /fonts           # Polices personnalisées
    /css               # Feuilles de style
      /components      # Styles des composants réutilisables
      /pages           # Styles spécifiques aux pages
    /js                # Code JavaScript côté client
      /components      # Composants UI réutilisables
      /services        # Services pour les appels API
      /utils           # Utilitaires et helpers
    /partials          # Partiels HTML réutilisables

  /src                 # Code source du backend
    /config           # Fichiers de configuration
    /controllers      # Contrôleurs pour les routes
    /models           # Modèles de données
    /routes           # Définitions des routes
    /middlewares      # Middlewares personnalisés
    /services         # Logique métier
    /utils            # Utilitaires et helpers

  /tests              # Tests automatisés
    /unit             # Tests unitaires
    /integration      # Tests d'intégration
    /performance      # Tests de performance
    /e2e              # Tests end-to-end

  /docs               # Documentation
  /scripts           # Scripts utilitaires
```

## Technologies Utilisées

- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Bootstrap 5
- **Backend**: Node.js, Express
- **Outils**: ESLint, Prettier, Nodemon

## Conventions de Code

- **Nommage des fichiers**: kebab-case pour les fichiers, PascalCase pour les composants
- **Indentation**: 2 espaces
- **Guillemets**: Simple quote (')
- **Point-virgule**: Oui

## Démarrage du Projet

1. Installer les dépendances : `npm install`
2. Copier `.env.example` vers `.env` et configurer les variables d'environnement
3. Démarrer le serveur de développement : `npm run dev`
4. Accéder à l'application : `http://localhost:3000`

## Tests

- Tests unitaires : `npm test:unit`
- Tests d'intégration : `npm test:integration`
- Tous les tests : `npm test`

## Déploiement

1. Construire l'application : `npm run build`
2. Démarrer en production : `npm start`
