#!/bin/bash

# Script de déploiement pour ML Transport App

# Variables
ENV="production"
APP_NAME="ml-transport-app"
APP_PATH="/var/www/$APP_NAME"
GIT_REPO="https://github.com/votre-utilisateur/$APP_NAME.git"
BRANCH="main"
NODE_VERSION="18.x"
PM2_APP_NAME="$APP_NAME"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages d'information
info() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

# Fonction pour afficher les avertissements
warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

# Fonction pour afficher les erreurs et quitter
error() {
  echo -e "${RED}[ERROR]${NC} $1"
  exit 1
}

# Vérifier les dépendances
check_dependencies() {
  info "Vérification des dépendances..."
  
  # Vérifier Node.js
  if ! command -v node &> /dev/null; then
    error "Node.js n'est pas installé. Veuillez l'installer d'abord."
  fi
  
  # Vérifier npm
  if ! command -v npm &> /dev/null; then
    error "npm n'est pas installé. Veuillez l'installer d'abord."
  fi
  
  # Vérifier PM2
  if ! command -v pm2 &> /dev/null; then
    warn "PM2 n'est pas installé. Installation en cours..."
    npm install -g pm2 || error "Échec de l'installation de PM2"
  fi
  
  # Vérifier Git
  if ! command -v git &> /dev/null; then
    error "Git n'est pas installé. Veuillez l'installer d'abord."
  fi
}

# Installer les dépendances du projet
install_dependencies() {
  info "Installation des dépendances..."
  npm install --production || error "Échec de l'installation des dépendances"
}

# Construire l'application (si nécessaire)
build_app() {
  info "Construction de l'application..."
  npm run build || warn "Aucune commande de build trouvée ou échec du build"
}

# Démarrer/Redémarrer l'application avec PM2
start_app() {
  info "Démarrage de l'application avec PM2..."
  
  # Vérifier si l'application est déjà en cours d'exécution
  if pm2 list | grep -q "$PM2_APP_NAME"; then
    info "Redémarrage de l'application..."
    pm2 restart $PM2_APP_NAME --update-env || error "Échec du redémarrage de l'application"
  else
    info "Démarrage d'une nouvelle instance..."
    NODE_ENV=$ENV pm2 start ./start.js --name "$PM2_APP_NAME" || error "Échec du démarrage de l'application"
  fi
  
  # Sauvegarder la configuration PM2
  pm2 save
  
  # Configurer le démarrage automatique
  pm2 startup
  
  info "Application démarrée avec succès!"
}

# Fonction principale
main() {
  info "Début du déploiement de $APP_NAME en environnement $ENV"
  
  # Vérifier les dépendances
  check_dependencies
  
  # Installer les dépendances
  install_dependencies
  
  # Construire l'application
  build_app
  
  # Démarrer/Redémarrer l'application
  start_app
  
  info "Déploiement terminé avec succès!"
}

# Exécuter la fonction principale
main
