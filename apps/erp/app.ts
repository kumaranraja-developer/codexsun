// apps/blog/app.ts
import { FastifyInstance } from "fastify";
import masterApi from "./core/master/Master.api";

export async function registerApp(fastify: FastifyInstance) {
    // Register app modules
    await fastify.register(masterApi, { prefix: "/" });
}
