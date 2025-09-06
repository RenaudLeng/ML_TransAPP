// Configuration après la mise en place de l'environnement de test
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

// Avant tous les tests
beforeAll(async () => {
  // Démarrer un serveur MongoDB en mémoire
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Se connecter à la base de données en mémoire
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Avant chaque test
beforeEach(async () => {
  // Nettoyer la base de données avant chaque test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Après tous les tests
afterAll(async () => {
  // Se déconnecter et arrêter le serveur MongoDB en mémoire
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});
