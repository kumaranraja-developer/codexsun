// apps/cxsun/app.ts
import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import path from "node:path";
import { fileExists, importAbs, listDirs } from "../../cortex/server/mount";
import tenantsApi from "./core/tenants/tenants.api";

const cxsunApp: FastifyPluginAsync = async (app) => {
    // Discover modules: /apps/cxsun/modules/<mod>/<mod>.api.ts
    const modulesRoot = path.join(process.cwd(), "apps", "cxsun", "modules");
    const moduleDirs = await listDirs(modulesRoot);

    for (const m of moduleDirs) {
        const apiEntry = path.join(modulesRoot, m, `${m}.api.ts`);
        if (!(await fileExists(apiEntry))) {
            app.log.warn({ module: m }, `skip: ${apiEntry} missing`);
            continue;
        }
        const mod = await importAbs(apiEntry);
        const modPlugin = mod.default ?? mod.plugin ?? mod.api;
        if (typeof modPlugin !== "function") {
            app.log.warn({ module: m }, "skip: module export is not a Fastify plugin");
            continue;
        }
        // Mount module at root. Routes inside should start with /tenants, /users, ...
        await app.register(modPlugin);
        app.log.info({ module: m }, "module mounted");
    }

    // optional per-app health
    app.get("/cxsun", async () => ({ app: "cxsun", ok: true }));
    // 👇 this ensures /api/tenants works
    app.register(tenantsApi, { prefix: "/api/tenants" });
};

export default fp(cxsunApp);
