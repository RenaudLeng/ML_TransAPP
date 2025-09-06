@echo off
echo Démarrage de l'application en mode développement...

REM Vérifier si nodemon est installé
npm list -g nodemon || npm install -g nodemon

REM Installer les dépendances si nécessaire
if not exist "node_modules" (
    echo Installation des dépendances...
    npm install
)

echo Démarrage du serveur...
nodemon server.js
