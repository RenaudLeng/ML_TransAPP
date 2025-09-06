const path = require('path');

module.exports = {
  // Environnement de test
  testEnvironment: 'node',
  
  // Fichiers de test à exécuter
  testMatch: [path.join(__dirname, 'tests', '**', '*.test.js')],
  
  // Configuration de la couverture de code
  collectCoverage: true,
  coverageDirectory: path.join(__dirname, 'coverage'),
  coverageReporters: ['text', 'lcov'],
  collectCoverageFrom: [
    path.join('src', '**', '*.js'),
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  
  // Fichiers de configuration
  setupFiles: [path.join(__dirname, 'tests', 'setup.js')],
  setupFilesAfterEnv: [path.join(__dirname, 'tests', 'setupAfterEnv.js')],
  
  // Alias pour les imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // Dossiers à ignorer
  testPathIgnorePatterns: [
    path.join(__dirname, 'node_modules'),
    path.join(__dirname, 'dist')
  ],
  
  // Timeout pour les tests (30 secondes)
  testTimeout: 30000
};
