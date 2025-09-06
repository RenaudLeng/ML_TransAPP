// Configuration de l'environnement de test avant l'exécution des tests
process.env.NODE_ENV = 'test';

// Configuration des variables d'environnement pour les tests
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRE = '1d';
process.env.JWT_COOKIE_EXPIRE = '30';

// Mock des appels console pour des logs plus propres pendant les tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

console.log = (...args) => {
  // Ne rien afficher pendant les tests
};

console.error = (...args) => {
  // Ne pas afficher les erreurs réelles pendant les tests
  // pour éviter le bruit dans la sortie des tests
  if (!args[0].includes('DeprecationWarning')) {
    originalConsoleError(...args);
  }
};
