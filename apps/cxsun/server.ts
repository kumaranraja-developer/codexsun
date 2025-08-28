import Fastify from "fastify";

export async function createServer() {
    const app = Fastify({
        logger: { level: process.env.LOG_LEVEL || "info" }
    });

    app.get("/", async () => ({
        app: "cxsun",
        status: "ok",
        time: new Date().toISOString()
    }));

    app.get("/healthz", async () => ({ status: "healthy" }));
    app.get("/readyz", async () => ({ status: "ready" }));

    // Tag responses to identify the app
    app.addHook("onSend", async (_req, reply, payload) => {
        reply.header("x-codexsun-app", "cxsun");
        return payload;
    });

    // Expose close for external shutdown (e.g., from a CLI)
    (app as any).close = app.close.bind(app);

    return app;
}

// Allow direct dev run: `pnpm --filter @codexsun/app-cxsun dev` (after we update scripts)
if (import.meta.url === `file://${process.argv[1]}`) {
    (async () => {
        const server = await createServer();
        const port = Number(process.env.PORT || 3000);
        await server.listen({ port, host: "0.0.0.0" });
        console.log(`cxsun server running on http://localhost:${port}`);
    })().catch((err) => {
        console.error(err);
        process.exit(1);
    });
}
