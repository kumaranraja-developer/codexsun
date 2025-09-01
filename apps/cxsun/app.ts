// apps/blog/app.ts
import { FastifyInstance } from "fastify";
import tenantApi from "./core/tenant/Tenant.api";

export async function registerApp(fastify: FastifyInstance) {
    // Register app modules
    await fastify.register(tenantApi, { prefix: "api/tenant" });
}
