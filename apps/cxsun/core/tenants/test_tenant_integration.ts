// cortex/tests/test_tenant_integration.ts
import assert from "node:assert/strict";
import express from "express";
import http from "node:http";
import tenantsRouter from "./tenants.api";
import { TenantRepo } from "./tenant.repo";
import { logger } from "../../../../cortex/utils/log_cx";

/**
 * Starts a lightweight Express app with the tenants API mounted.
 * Returns base URL and a shutdown function.
 */
async function startServer() {
  const app = express();
  app.use(express.json());
  app.use("/api/tenants", tenantsRouter);

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const addr = server.address();
  if (addr == null || typeof addr === "string") throw new Error("No address from server.listen");
  const baseURL = `http://127.0.0.1:${addr.port}`;

  return {
    baseURL,
    close: () => new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve()))),
  };
}

export async function tenantIntegrationTests() {
  logger.info("▶ TenantIntegration: starting with real DB + HTTP");

  const { baseURL, close } = await startServer();
  logger.info("server", { baseURL });

  try {
    // Ensure a clean record for slug 'integ-acme'
    try {
      const existing = await TenantRepo.findBySlug("integ-acme");
      if (existing) {
        await TenantRepo.softDelete(existing.id);
      }
    } catch (e) {
      // ignore if repo throws; tests below will surface issues
    }

    // Create via API (POST)
    {
      const res = await fetch(`${baseURL}/api/tenants`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug: "integ-acme", name: "Integ Acme", email: null, meta: null }),
      });
      const body = await res.json();
      logger.debug("POST /api/tenants", { status: res.status, body });
      assert.equal(res.status, 201);
      assert.ok(body, "POST should return body");
      // extract ID for later
      const id = (body.data?.id ?? body.id) as number | undefined;
      assert.ok(id, "POST should return an id");
    }

    // List via API (GET /)
    {
      const res = await fetch(`${baseURL}/api/tenants?limit=5&offset=0`);
      const body = await res.json();
      logger.debug("GET /api/tenants", { status: res.status, body });
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(body?.data) || Array.isArray(body), "GET list should return an array in data or root");
    }

    // Show by slug
    {
      const res = await fetch(`${baseURL}/api/tenants/by-slug/integ-acme`);
      const body = await res.json();
      logger.debug("GET /api/tenants/by-slug/integ-acme", { status: res.status, body });
      assert.equal(res.status, 200);
      const t = body.data ?? body;
      assert.equal(t.slug, "integ-acme");
    }

    // Update by id (PATCH)
    {
      const bySlug = await TenantRepo.findBySlug("integ-acme");
      assert.ok(bySlug, "precondition: slug should exist");
      const res = await fetch(`${baseURL}/api/tenants/${bySlug!.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "Integ Acme Updated" }),
      });
      const body = await res.json();
      logger.debug("PATCH /api/tenants/:id", { status: res.status, body });
      assert.equal(res.status, 200);
      const t = body.data ?? body;
      assert.equal(t.name, "Integ Acme Updated");
    }

    // Delete (soft) by id
    {
      const bySlug = await TenantRepo.findBySlug("integ-acme");
      assert.ok(bySlug, "precondition: slug should exist before delete");
      const res = await fetch(`${baseURL}/api/tenants/${bySlug!.id}`, { method: "DELETE" });
      logger.debug("DELETE /api/tenants/:id", { status: res.status });
      assert.equal(res.status, 204);

      // Confirm not found
      const res2 = await fetch(`${baseURL}/api/tenants/by-slug/integ-acme`);
      const body2 = await res2.json();
      logger.debug("GET after DELETE", { status: res2.status, body: body2 });
      assert.equal(res2.status, 404);
    }

    logger.info("✔ TenantIntegration: HTTP + DB passed");
  } finally {
    await close();
  }
}
