/**
 * apps/cxsun/app.ts
 * Fastify plugin for cxsun application
 */
import type { FastifyInstance, FastifyPluginOptions } from "fastify";

export default async function cxsunPlugin(
    app: FastifyInstance,
    _opts: FastifyPluginOptions
) {
    // GET /cxsun/
    app.get("/", async () => ({
        app: "cxsun",
        feature: "root",
        message: "Welcome from cxsun app plugin",
    }));

    // GET /cxsun/hello
    app.get("/hello", async (req, reply) => {
        app.log.info("saying hello"); // uses our custom logger because of app.decorate("log", logger)
        return { hello: "world" };
    });
}
