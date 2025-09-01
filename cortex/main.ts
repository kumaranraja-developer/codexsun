// cortex/server/main.ts
import Fastify from "fastify";
import path from "node:path";
import { fileExists, importAbs, listDirs } from "./server/mount";

export async function bootApp() {
    const app = Fastify({ logger: true });

    // 1) discover apps: /apps/<app>/app.ts
    const appsRoot = path.join(process.cwd(), "apps");
    const appDirs = await listDirs(appsRoot);
    const mounted: string[] = [];

    for (const name of appDirs) {
        const entry = path.join(appsRoot, name, "app.ts");
        if (!(await fileExists(entry))) {
            app.log.warn({ app: name }, `skip: ${entry} missing`);
            continue;
        }
        const mod = await importAbs(entry);
        const plugin = mod.default;
        if (typeof plugin !== "function") {
            app.log.warn({ app: name }, "skip: default export is not a Fastify plugin");
            continue;
        }

        // 👉 mount with NO prefix (your choice). If you want /api, wrap in a scope.
        await app.register(plugin);
        mounted.push(name);
        app.log.info({ app: name }, "mounted");
    }

    // root health
    app.get("/", async () => ({
        name: "codexsun",
        apps: mounted,
    }));

    // print routes for sanity
    app.ready(() => {
        app.log.info("\n=== ROUTES ===");
        app.log.info(app.printRoutes());
    });

    return app;
}
