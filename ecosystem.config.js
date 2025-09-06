module.exports = {
  apps: [
    {
      name: 'ml-transport-app',
      script: './start.js',
      instances: 'max',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
  ],

  // Configuration du déploiement
  deploy: {
    production: {
      user: 'votre_utilisateur',
      host: 'votre_serveur',
      ref: 'origin/main',
      repo: 'https://github.com/votre-utilisateur/ml-transport-app.git',
      path: '/var/www/ml-transport-app',
      'post-deploy':
        'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
    },
  },
};
