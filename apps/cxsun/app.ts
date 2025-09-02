// apps/blog/app.ts
import {FastifyInstance} from "fastify";
import tenantController from "./src/tenant/code/tenant.controller";
import registerUserApi from "./src/user/core/user.api";

export async function registerApp(fastify: FastifyInstance) {
    // Register app modules
    await fastify.register(tenantController, {prefix: "api/tenants"});
    await fastify.register(registerUserApi, {prefix: "/api"});
}
