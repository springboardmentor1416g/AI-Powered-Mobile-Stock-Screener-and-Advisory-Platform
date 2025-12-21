const request = require("supertest");
const express = require("express");
const healthRoutes = require("../src/routes/health.routes");

const app = express();
app.use("/api/v1/health", healthRoutes);

test("Health API should return UP", async () => {
  const res = await request(app).get("/api/v1/health");
  expect(res.statusCode).toBe(200);
  expect(res.body.status).toBe("UP");
});
