# Structure du Projet ML Transport

Ce document décrit l'organisation des dossiers et fichiers du projet ML Transport.

## 📁 Structure des Dossiers

### 📂 public/
Contient tous les fichiers statiques servis au client.

- **assets/**
  - **images/** - Images de l'application
  - **fonts/** - Polices personnalisées

- **css/**
  - **components/** - Styles des composants réutilisables
  - **pages/** - Styles spécifiques aux pages
  - `style.css` - Feuille de style principale

- **js/**
  - **components/** - Composants UI réutilisables
  - **services/** - Services pour les appels API
  - **utils/** - Utilitaires et helpers
  - **modules/** - Modules spécifiques à l'application

- **partials/** - Partiels HTML réutilisables
- **lib/** - Bibliothèques tierces

### 📂 src/
Code source du backend.

- **config/** - Fichiers de configuration
- **controllers/** - Contrôleurs pour les routes
- **models/** - Modèles de données
- **routes/** - Définitions des routes
- **middlewares/** - Middlewares personnalisés
- **services/** - Logique métier
- **utils/** - Utilitaires et helpers

### 📂 tests/
Tests automatisés.

- **unit/** - Tests unitaires
- **integration/** - Tests d'intégration
- **performance/** - Tests de performance
- **e2e/** - Tests end-to-end

### 📂 docs/
Documentation du projet.

- `ARCHITECTURE.md` - Documentation de l'architecture
- `STRUCTURE.md` - Ce fichier

### 📂 scripts/
Scripts utilitaires.

## 🔄 Workflow de Développement

1. **Créer une branche** pour chaque nouvelle fonctionnalité/correction
2. **Tester localement** avant de pousser les modifications
3. **Créer une Pull Request** pour révision
4. **Faire une revue de code** avant de merger

## 🛠 Outils Recommandés

- **Éditeur de code** : VS Code avec les extensions recommandées
- **Git** : Pour le contrôle de version
- **Node.js** : Pour exécuter le projet
- **Postman** : Pour tester les API

## 🔍 Bonnes Pratiques

- Suivre les conventions de nommage
- Documenter le code
- Écrire des tests
- Garder les commits atomiques
- Utiliser des messages de commit clairs
