// apps/tenant.controller.ts
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { TenantRepo, TenantCreateInput, TenantUpdateInput } from "./tenant.repo";

const tenantController: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    // List tenants (with optional query/search)
    fastify.get("/", async (req) => {
        const { q, active, limit, offset } = req.query as {
            q?: string;
            active?: string;
            limit?: string;
            offset?: string;
        };

        return TenantRepo.search({
            q,
            active: active === undefined ? undefined : active === "true",
            limit: limit ? Number(limit) : 50,
            offset: offset ? Number(offset) : 0,
        });
    });

    // Count tenants
    fastify.get("/count", async () => {
        const count = await TenantRepo.count();
        return { count };
    });

    // Get tenant by ID
    fastify.get("/:id", async (req, reply) => {
        const { id } = req.params as { id: string };
        const tenant = await TenantRepo.findById(Number(id));
        if (!tenant) return reply.code(404).send({ error: "Tenant not found" });
        return tenant;
    });

    // Create tenant
    fastify.post("/", async (req, reply) => {
        const body = req.body as TenantCreateInput;
        if (!body.slug || !body.name) {
            return reply.code(400).send({ error: "slug and name are required" });
        }
        const tenant = await TenantRepo.create(body);
        return reply.code(201).send(tenant);
    });

    // Update tenant
    fastify.put("/:id", async (req, reply) => {
        const { id } = req.params as { id: string };
        const body = req.body as TenantUpdateInput;
        const tenant = await TenantRepo.update(Number(id), body);
        if (!tenant) return reply.code(404).send({ error: "Tenant not found" });
        return tenant;
    });

    // Soft delete tenant
    fastify.delete("/:id", async (req, reply) => {
        const { id } = req.params as { id: string };
        const ok = await TenantRepo.softDelete(Number(id));
        if (!ok) return reply.code(404).send({ error: "Tenant not found" });
        return { success: true };
    });
};

export default tenantController;
