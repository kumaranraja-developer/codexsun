// apps/cxsun/modules/tenants/tenants.api.ts
import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";

const tenantsApi: FastifyPluginAsync = async (app) => {
    // Import your repo exactly as in your tests
    const { TenantRepo } = await import("../../core/tenants/tenant.repo");

    // LIST -> GET /api/tenants
    app.get("/", async () => {
        return await TenantRepo.all(50, 0);
    });

    // DETAIL (by id) -> GET /api/tenants/:id
    app.get("/:id", async (req, reply) => {
        const { id } = req.params as { id: string };
        const row = await TenantRepo.findById(Number(id));
        if (!row) return reply.code(404).send({ error: "Tenant not found" });
        return row;
    });

    // DETAIL (by slug) -> GET /api/tenants/by-slug/:slug
    app.get("/by-slug/:slug", async (req, reply) => {
        const { slug } = req.params as { slug: string };
        const row = await TenantRepo.findBySlug(slug);
        if (!row) return reply.code(404).send({ error: "Tenant not found" });
        return row;
    });

    // CREATE -> POST /api/tenants
    app.post("/", async (req, reply) => {
        const body = req.body as any;
        const created = await TenantRepo.create({
            slug: body.slug,
            name: body.name,
            email: body.email ?? null,
            meta: body.meta ?? null,
            is_active: body.is_active ?? true,
        });
        return reply.code(201).send({ data: created });
    });

    // UPDATE -> PATCH /api/tenants/:id
    app.patch("/:id", async (req, reply) => {
        const { id } = req.params as { id: string };
        const body = req.body as any;
        const updated = await TenantRepo.update(Number(id), {
            name: body.name,
            email: body.email,
            meta: body.meta,
            is_active: body.is_active,
        });
        if (!updated) return reply.code(404).send({ error: "Tenant not found" });
        return { data: updated };
    });

    // DELETE -> DELETE /api/tenants/:id
    app.delete("/:id", async (req, reply) => {
        const { id } = req.params as { id: string };
        const ok = await TenantRepo.softDelete(Number(id));
        if (!ok) return reply.code(404).send({ error: "Tenant not found" });
        return reply.code(204).send();
    });
};

export default fp(tenantsApi);
