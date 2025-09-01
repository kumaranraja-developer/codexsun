/**
 * apps/cxsun/app.ts
 */
import fp from "fastify-plugin";
import type { FastifyInstance, FastifyPluginAsync } from "fastify";

// If your controller is Express-only, import the repo instead:
// import { TenantRepo } from "../core/tenants/tenant.repo";

const plugin: FastifyPluginAsync = async (app: FastifyInstance) => {
    // sanity route (mounted under /api)
    app.get("/_health", async () => ({ app: "cxsun", ok: true }));

    // --- Tenants CRUD ---
    app.get("/tenants", async (req, reply) => {
        // const rows = await TenantRepo.all(50, 0);
        // reply.send(rows);
        // If you have a framework-agnostic controller method, call it here instead.
        const { TenantRepo } = await import("./core/tenants/tenant.repo");
        const rows = await TenantRepo.all(50, 0);
        return rows;
    });

    app.get("/tenants/:id", async (req, reply) => {
        const { id } = req.params as any;
        const { TenantRepo } = await import("./core/tenants/tenant.repo");
        const row = await TenantRepo.findById(Number(id));
        if (!row) return reply.code(404).send({ error: "Tenant not found" });
        return row;
    });

    app.get("/tenants/by-slug/:slug", async (req, reply) => {
        const { slug } = req.params as any;
        const { TenantRepo } = await import("./core/tenants/tenant.repo");
        const row = await TenantRepo.findBySlug(String(slug));
        if (!row) return reply.code(404).send({ error: "Tenant not found" });
        return row;
    });

    app.post("/tenants", async (req, reply) => {
        const body = req.body as any;
        const { TenantRepo } = await import("./core/tenants/tenant.repo");
        const created = await TenantRepo.create({
            slug: body.slug,
            name: body.name,
            email: body.email ?? null,
            meta: body.meta ?? null,
            is_active: body.is_active ?? true,
        });
        return reply.code(201).send({ data: created });
    });

    app.patch("/tenants/:id", async (req, reply) => {
        const { id } = req.params as any;
        const body = req.body as any;
        const { TenantRepo } = await import("./core/tenants/tenant.repo");
        const updated = await TenantRepo.update(Number(id), {
            name: body.name,
            email: body.email,
            meta: body.meta,
            is_active: body.is_active,
        });
        if (!updated) return reply.code(404).send({ error: "Tenant not found" });
        return { data: updated };
    });

    app.delete("/tenants/:id", async (req, reply) => {
        const { id } = req.params as any;
        const { TenantRepo } = await import("./core/tenants/tenant.repo");
        const ok = await TenantRepo.softDelete(Number(id));
        if (!ok) return reply.code(404).send({ error: "Tenant not found" });
        return reply.code(204).send();
    });
};

export default fp(plugin);
