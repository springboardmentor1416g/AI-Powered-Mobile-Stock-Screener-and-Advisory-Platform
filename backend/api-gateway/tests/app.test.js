const request = require("supertest");
const { createApp } = require("../src/app");

describe("API Gateway", () => {
  const app = createApp();

  test("GET /api/v1/health", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("UP");
    expect(res.body.timestamp).toBeTruthy();
  });

  test("GET /api/v1/metadata/stocks returns array", async () => {
    process.env.USE_MOCK_METADATA = "true";
    const res = await request(app).get("/api/v1/metadata/stocks?limit=2");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
