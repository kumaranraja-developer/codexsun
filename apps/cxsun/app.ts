import type { FastifyInstance, FastifyPluginOptions } from "fastify";

/**
 * Fastify plugin for the cxsun app.
 * Will be mounted by the root server with prefix `/cxsun`,
 * so routes here are available at:
 *   GET /cxsun/
 *   GET /cxsun/hello
 *   GET /cxsun/items/:id
 */
export default async function cxsunPlugin(
    app: FastifyInstance,
    _opts: FastifyPluginOptions
) {
    app.get("/", async () => ({
        app: "cxsun",
        feature: "root",
        message: "Welcome from cxsun app plugin"
    }));

    app.get("/hello", async () => ({ app: "cxsun", hello: "world" }));

    app.get<{
        Params: { id: string };
    }>("/items/:id", async (req) => {
        const { id } = req.params;
        return { app: "cxsun", item: id };
    });
}
