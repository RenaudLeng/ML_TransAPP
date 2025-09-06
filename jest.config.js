module.exports = {
  // Environnement de test
  testEnvironment: 'node',
  
  // Fichiers de test à exécuter
  testMatch: ['**/tests/**/*.test.js'],
  
  // Configuration de la couverture de code
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  
  // Fichiers de configuration
  setupFiles: ['./test/setup.js'],
  setupFilesAfterEnv: ['./test/setupAfterEnv.js'],
  
  // Alias pour les imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // Dossiers à ignorer
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  
  // Timeout pour les tests (30 secondes)
  testTimeout: 30000
};
