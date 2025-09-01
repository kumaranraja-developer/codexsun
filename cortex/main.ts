// cortex/main.ts
import Fastify from "fastify";
import { mountApps } from "./server/mount";
import { join } from "node:path";

export async function bootApp() {
    const app = Fastify({ logger: true });

    // mount apps (auto-discover, or use APP_LIST=cxsun,admin)
    const apps = await mountApps(app);

    // health/root
    app.get("/", async () => ({
        name: "codexsun",
        apps,
        tips: apps.map((n) => `App '${n}' mounted under /api`),
    }));

    // In production, serve the built frontend (optional, only if you want one-port prod)
    if (process.env.NODE_ENV === "production") {
        const fastifyStatic = (await import("@fastify/static")).default;
        await app.register(fastifyStatic, {
            root: join(process.cwd(), "apps", "cxsun", "dist"),
            prefix: "/",
        });
        app.setNotFoundHandler((req, reply) => {
            if (req.raw.url?.startsWith("/api")) {
                reply.code(404).send({ error: "Not found" });
            } else {
                reply.sendFile("index.html");
            }
        });
    }

    return app;
}
