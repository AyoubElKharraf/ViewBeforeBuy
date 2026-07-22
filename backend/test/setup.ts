// Variables d'environnement pour un contexte de test isolé (sans services externes)
process.env.NODE_ENV = "test";
process.env.REDIS_URL = ""; // désactive Redis (client null)
process.env.JWT_SECRET = "test-secret";
process.env.FRONTEND_URL = "http://localhost:3000";
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@127.0.0.1:5433/viewbeforebuy?schema=public";
