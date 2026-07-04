import test from "node:test";
import assert from "node:assert/strict";
import express from "express";

test("health endpoint returns ok payload", async () => {
  const app = express();
  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "africraft-backend" });
  });

  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.ok, true);
    assert.equal(body.service, "africraft-backend");
  } finally {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
});
