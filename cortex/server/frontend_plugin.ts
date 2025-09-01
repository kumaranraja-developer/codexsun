// cortex/server/frontend_plugin.ts
import fp from "fastify-plugin";
import fastifyStatic from "@fastify/static";
import { join } from "node:path";

export const frontendPlugin = fp<{ root: string }>(async (app, opts) => {
    // serve static assets from Vite build
    await app.register(fastifyStatic, {
        root: opts.root,
        prefix: "/", // serve at /
        // cache: true, // enable if you want
    });

    // Any non-API route falls back to index.html (for React Router)
    app.setNotFoundHandler((req, reply) => {
        const url = req.raw.url || "/";
        if (url.startsWith("/api")) {
            reply.code(404).send({ error: "Not found" });
        } else {
            reply.sendFile("index.html"); // from opts.root
        }
    });
});
