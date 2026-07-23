import type { Express } from "express";
import request from "supertest";
import { beforeAll, describe, expect, it, vi } from "vitest";

// Mock du SDK IA : aucune requête réseau / aucun quota consommé pendant les tests.
vi.mock("ai", () => ({
  generateText: vi.fn(async () => ({ text: "MOCK_AI_RESPONSE" })),
}));

// Mock de Prisma : pas besoin d'une base de données pour tester les endpoints IA.
vi.mock("@viewbeforebuy/database", () => ({
  prisma: {
    property: {
      findMany: vi.fn(async () => [
        {
          id: "p1",
          name: "Appartement Lumineux",
          type: "apartment",
          city: "Oujda",
          neighborhood: "Centre",
          price: 800000,
          superficie: 90,
          rooms: 3,
          bathrooms: 1,
          floor: 2,
          locationScore: 8,
          status: "available",
          description: "Bel appartement",
          imageUrl: null,
        },
      ]),
    },
    bank: {
      findMany: vi.fn(async () => [
        {
          id: "b1",
          name: "CIH Bank",
          rate: 4.3,
          maxDuration: 25,
          minDownPayment: 10,
          logo: "",
          recommended: true,
          features: [],
        },
      ]),
    },
  },
}));

let app: Express;
let token: string;

beforeAll(async () => {
  // Active le provider IA (mocké) avant de charger l'app / la config env.
  process.env.OPENAI_API_KEY = "test-openai-key";
  const appMod = await import("../app.js");
  app = appMod.createApp();
  const authMod = await import("../services/auth.js");
  token = authMod.signToken({ id: "u1", email: "client@test.ma", role: "CLIENT" });
});

const auth = () => ({ Authorization: `Bearer ${token}` });

describe("POST /api/ai/chat", () => {
  it("401 sans token", async () => {
    const res = await request(app).post("/api/ai/chat").send({ message: "Bonjour" });
    expect(res.status).toBe(401);
  });

  it("400 si payload invalide (message vide)", async () => {
    const res = await request(app).post("/api/ai/chat").set(auth()).send({ message: "" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });

  it("200 avec réponse IA + biens RAG", async () => {
    const res = await request(app)
      .post("/api/ai/chat")
      .set(auth())
      .send({ message: "Je cherche un appartement à Oujda", budget: 900000 });
    expect(res.status).toBe(200);
    expect(res.body.text).toBe("MOCK_AI_RESPONSE");
    expect(res.body.source).toBe("ai");
    expect(Array.isArray(res.body.matches)).toBe(true);
    expect(res.body.matches[0]).toMatchObject({ id: "p1", city: "Oujda" });
  });
});

describe("POST /api/ai/score-eligibility", () => {
  it("401 sans token", async () => {
    const res = await request(app)
      .post("/api/ai/score-eligibility")
      .send({ monthlyIncome: 20000, duration: 25 });
    expect(res.status).toBe(401);
  });

  it("400 si données invalides (revenu manquant)", async () => {
    const res = await request(app)
      .post("/api/ai/score-eligibility")
      .set(auth())
      .send({ duration: 25 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });

  it("200 avec score d'éligibilité + recommandations", async () => {
    const res = await request(app)
      .post("/api/ai/score-eligibility")
      .set(auth())
      .send({
        monthlyIncome: 30000,
        existingDebts: 0,
        downPayment: 500000,
        duration: 25,
        loanAmount: 800000,
      });
    expect(res.status).toBe(200);
    expect(res.body.eligibility).toBeTruthy();
    expect(typeof res.body.eligibility.score).toBe("number");
    expect(res.body.eligibility.status).toBe("eligible");
    expect(res.body.recommendations).toBe("MOCK_AI_RESPONSE");
    expect(res.body.source).toBe("ai");
  });
});
