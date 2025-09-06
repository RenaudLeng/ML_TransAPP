# Guide de Déploiement - ML Transport App

Ce document fournit les instructions pour déployer l'application ML Transport en production.

## Prérequis

- Serveur Linux (Ubuntu 20.04/22.04 recommandé)
- Node.js 18.x
- PostgreSQL 14+
- Nginx
- PM2
- Git
- Certificat SSL (Let's Encrypt recommandé)

## 1. Configuration du serveur

### Mise à jour du système
```bash
sudo apt update && sudo apt upgrade -y
```

### Installation des dépendances système
```bash
# Installer les dépendances de base
sudo apt install -y curl wget git build-essential

# Installer Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Installer PM2 globalement
sudo npm install -g pm2

# Installer Nginx
sudo apt install -y nginx

# Installer PostgreSQL
sudo apt install -y postgresql postgresql-contrib
```

### Configuration de la base de données
```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer l'utilisateur et la base de données
CREATE DATABASE ml_transport;
CREATE USER ml_user WITH PASSWORD 'votre_mot_de_passe_securise';
GRANT ALL PRIVILEGES ON DATABASE ml_transport TO ml_user;
\q
```

## 2. Déploiement de l'application

### Récupération du code source
```bash
# Créer le répertoire de l'application
sudo mkdir -p /var/www/ml-transport-app
sudo chown -R $USER:$USER /var/www/ml-transport-app

# Cloner le dépôt Git
cd /var/www/ml-transport-app
git clone https://github.com/votre-utilisateur/ml-transport-app.git .
```

### Configuration de l'environnement
```bash
# Copier le fichier .env d'exemple
cp .env.example .env

# Éditer le fichier .env avec les bonnes valeurs
nano .env
```

### Installation des dépendances
```bash
npm install --production
```

### Construction de l'application (si nécessaire)
```bash
npm run build
```

## 3. Configuration de PM2

### Démarrer l'application avec PM2
```bash
# Se placer dans le répertoire de l'application
cd /var/www/ml-transport-app

# Démarrer l'application
NODE_ENV=production pm2 start start.js --name "ml-transport-app"

# Sauvegarder la configuration PM2
pm2 save

# Configurer le démarrage automatique
pm2 startup
```

## 4. Configuration de Nginx

### Copier la configuration Nginx
```bash
sudo cp nginx.conf /etc/nginx/nginx.conf

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

### Configuration du pare-feu
```bash
# Autoriser les ports nécessaires
sudo ufw allow 'Nginx Full'
sudo ufw allow 'OpenSSH'
sudo ufw enable
```

## 5. Configuration SSL avec Let's Encrypt

### Installer Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Obtenir un certificat SSL
```bash
sudo certbot --nginx -d votredomaine.com -d www.votredomaine.com
```

### Configurer le renouvellement automatique
```bash
# Tester le renouvellement automatique
sudo certbot renew --dry-run

# Ajouter une tâche cron pour le renouvellement automatique
(crontab -l 2>/dev/null; echo "0 0,12 * * * root python -c 'import random; import time; time.sleep(random.random() * 3600)' && certbot renew -q") | sudo crontab -
```

## 6. Mises à jour de l'application

Pour mettre à jour l'application :

```bash
# Se placer dans le répertoire de l'application
cd /var/www/ml-transport-app

# Récupérer les dernières modifications
git pull origin main

# Installer les nouvelles dépendances
npm install --production

# Reconstruire l'application si nécessaire
npm run build

# Redémarrer l'application
pm2 restart ml-transport-app
```

## 7. Surveillance et maintenance

### Commandes PM2 utiles
```bash
# Voir les logs en temps réel
pm2 logs ml-transport-app

# Surveiller les ressources
pm2 monit

# Redémarrer l'application
pm2 restart ml-transport-app

# Arrêter l'application
pm2 stop ml-transport-app

# Démarrer l'application
pm2 start ml-transport-app

# Supprimer l'application de PM2
pm2 delete ml-transport-app
```

### Nettoyage
```bash
# Nettoyer le cache npm
npm cache clean --force

# Nettoyer les anciennes versions des paquets
sudo apt autoremove -y
sudo apt clean
```
## Support

Pour toute question ou problème, veuillez contacter l'équipe de développement.
