import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

const app = createApp();

describe("API Express", () => {
  it("GET /health => 200", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: "ok" });
  });

  it("route inconnue => 404", async () => {
    const res = await request(app).get("/route-inexistante");
    expect(res.status).toBe(404);
  });

  it("GET /api/auth/me sans token => 401", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("POST /api/auth/register avec données invalides => 400", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "pas-un-email", password: "123" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });

  it("POST /api/payments/checkout sans token => 401", async () => {
    const res = await request(app).post("/api/payments/checkout").send({ propertyId: "1" });
    expect(res.status).toBe(401);
  });
});
