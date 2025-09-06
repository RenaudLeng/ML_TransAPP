const request = require('supertest');
const app = require('../../server');
const User = require('../../src/models/User');
const { createTestUser, getAuthHeader } = require('../utils/testUtils');

describe('Auth Controller', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const userData = {
        nom: 'John',
        prenom: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!',
        role: 'user'
      };

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(userData.email);
      expect(res.body.user.role).toBe('user'); // Le rôle par défaut
      
      // Vérifier que l'utilisateur existe dans la base de données
      const user = await User.findOne({ email: userData.email });
      expect(user).not.toBeNull();
      expect(user.nom).toBe(userData.nom);
      expect(user.prenom).toBe(userData.prenom);
    });

    it('should not register a user with an existing email', async () => {
      const userData = {
        nom: 'Jane',
        prenom: 'Doe',
        email: 'jane.doe@example.com',
        password: 'Password123!'
      };

      // Créer un utilisateur avec le même email
      await createTestUser({ ...userData });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    const testUser = {
      nom: 'Login',
      prenom: 'Test',
      email: 'login.test@example.com',
      password: 'Password123!',
      role: 'user'
    };

    beforeEach(async () => {
      // Créer un utilisateur de test avant chaque test
      await createTestUser(testUser);
    });

    it('should login a user with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('should not login with invalid password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Identifiants invalides');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return user data for authenticated user', async () => {
      // Créer un utilisateur de test
      const user = await createTestUser({
        email: 'me.test@example.com',
        nom: 'Me',
        prenom: 'Test'
      });

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set(getAuthHeader(user));

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(user.email);
      expect(res.body.data.nom).toBe(user.nom);
      expect(res.body.data.prenom).toBe(user.prenom);
      // Le mot de passe ne doit pas être renvoyé
      expect(res.body.data.password).toBeUndefined();
    });

    it('should return 401 for unauthenticated user', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me');

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
    });
  });
});
