// apps/blog/core/tenant/tenant.api.ts
import { FastifyInstance } from "fastify";

interface Tenant {
    id: number;
    name: string;
}

let tenants: Tenant[] = [
    { id: 1, name: "Tenant A" },
    { id: 2, name: "Tenant B" },
];

export default async function masterApi(fastify: FastifyInstance) {
    // List
    fastify.get("/master", async () => tenants);

    // Get by ID
    fastify.get("/master/:id", async (req, reply) => {
        const { id } = req.params as { id: string };
        const tenant = tenants.find((t) => t.id === Number(id));
        if (!tenant) return reply.code(404).send({ error: "Not found" });
        return tenant;
    });

    // Create
    fastify.post("/master", async (req, reply) => {
        const body = req.body as { name: string };
        const tenant: Tenant = { id: tenants.length + 1, name: body.name };
        tenants.push(tenant);
        return tenant;
    });

    // Update
    fastify.put("/master/:id", async (req, reply) => {
        const { id } = req.params as { id: string };
        const body = req.body as { name: string };
        const tenant = tenants.find((t) => t.id === Number(id));
        if (!tenant) return reply.code(404).send({ error: "Not found" });
        tenant.name = body.name;
        return tenant;
    });

    // Delete
    fastify.delete("/master/:id", async (req, reply) => {
        const { id } = req.params as { id: string };
        tenants = tenants.filter((t) => t.id !== Number(id));
        return { success: true };
    });
}
