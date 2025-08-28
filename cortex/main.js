// cortex/main.ts
import Fastify from "fastify";
import { readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
/**
 * Candidate filenames for an app's entry plugin.
 * Primary goal: app.ts inside each app folder (e.g., apps/cxsun/app.ts).
 * We also accept a few common alternatives and built outputs.
 */
const PLUGIN_CANDIDATES = [
    "app.ts",
    "app.tsx",
    "app.mts",
    "app.js",
    "app.mjs",
    // built outputs (if someone compiles per-app)
    "dist/app.js",
    "dist/app.mjs",
];
function repoRootDir() {
    return process.cwd();
}
function appsDir() {
    return path.join(repoRootDir(), "apps");
}
/**
 * Find the first matching plugin file for a given app folder.
 * Returns an absolute path or null.
 */
function findPluginFile(appName) {
    const base = path.join(appsDir(), appName);
    for (const rel of PLUGIN_CANDIDATES) {
        const file = path.join(base, rel);
        if (existsSync(file))
            return file;
    }
    return null;
}
/**
 * Discover app folders that have a valid plugin file (e.g., apps/<name>/app.ts).
 * Only apps with a plugin are returned.
 */
export function discoverApps() {
    let names = [];
    try {
        names = readdirSync(appsDir(), { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => d.name);
    }
    catch {
        return [];
    }
    return names.filter((name) => !!findPluginFile(name));
}
async function mountApps(fastify) {
    const apps = discoverApps();
    const results = [];
    for (const name of apps) {
        const pluginFile = findPluginFile(name);
        if (!pluginFile) {
            results.push({ name, pluginFile: null, mounted: false, error: "plugin not found" });
            continue;
        }
        try {
            const mod = await import(pathToFileURL(pluginFile).href);
            const plugin = mod?.default;
            if (typeof plugin !== "function") {
                results.push({
                    name,
                    pluginFile,
                    mounted: false,
                    error: "default export is not a Fastify plugin function",
                });
                continue;
            }
            // Mount the plugin under its own prefix, e.g. /cxsun, /erp, /ecart
            await fastify.register(plugin, { prefix: `/${name}` });
            results.push({ name, pluginFile, mounted: true, error: null });
        }
        catch (err) {
            results.push({
                name,
                pluginFile,
                mounted: false,
                error: err?.message || String(err),
            });
        }
    }
    return results;
}
/**
 * Factory that sets up the Fastify server and mounts all discovered apps.
 */
export async function createServer() {
    const app = Fastify({
        logger: { level: process.env.LOG_LEVEL || "info" },
    });
    // Global response tagging for easy tracing at the edge
    app.addHook("onSend", async (req, reply, payload) => {
        const appName = req.params?.app ?? "root";
        reply.header("x-codexsun-entry", "root");
        reply.header("x-codexsun-app", appName);
        return payload;
    });
    // Root info + health
    app.get("/", async () => ({
        entry: "codexsun-root",
        apps: discoverApps(),
        time: new Date().toISOString(),
    }));
    app.get("/healthz", async () => ({ status: "healthy" }));
    app.get("/readyz", async () => ({ status: "ready" }));
    // Mount per-app plugins (apps/cxsun/app.ts, apps/erp/app.ts, apps/ecart/app.ts, ...)
    const mounts = await mountApps(app);
    app.log.info({
        mounts: mounts.map((m) => ({
            app: m.name,
            mounted: m.mounted,
            pluginFile: m.pluginFile,
            error: m.error ?? null,
        })),
    }, "App plugins mount summary");
    // Fallback 404 with context
    app.setNotFoundHandler((req, reply) => {
        const p = req.params;
        reply.code(404).send({
            error: "not_found",
            app: p?.app ?? null,
            path: req.url,
        });
    });
    return app;
}
