// apps/blog/app.ts
import { FastifyInstance } from "fastify";
import tenantController from "./src/tenant/code/tenant.controller";

export async function registerApp(fastify: FastifyInstance) {
    // Register app modules
    await fastify.register(tenantController, { prefix: "api/tenants" });
}
