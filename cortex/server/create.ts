// cortex/server/create.ts
import Fastify from "fastify";
import { discoverApps } from "../apps/discover";
import { mountApps } from "./mount";
import { withConnection } from "../database/connection_manager";

/** Builds the Fastify server, wires DB endpoints, and mounts app plugins. */
export async function createServer() {
    const app = Fastify({
        logger: { level: process.env.LOG_LEVEL || "info" }
    });

    // Tag responses for tracing
    app.addHook("onSend", async (req, reply, payload) => {
        const appName = (req.params as any)?.app ?? "root";
        reply.header("x-codexsun-entry", "root");
        reply.header("x-codexsun-app", appName);
        return payload;
    });

    // Root info + health
    app.get("/", async () => ({
        entry: "codexsun-root",
        apps: discoverApps(),
        time: new Date().toISOString()
    }));
    app.get("/healthz", async () => ({ status: "healthy" }));
    app.get("/readyz", async () => ({ status: "ready" }));

    // DB: ping
    app.get("/db/ping", async () => {
        return withConnection(async (db) => {
            if (db.kind === "sqlite") {
                const r = await db.query<{ now: string }>("SELECT datetime('now') AS now");
                return { db: db.kind, now: r.rows[0]?.now };
            }
            return { db: db.kind, now: new Date().toISOString() };
        }, "default");
    });

    // DB: KV demo
    app.put<{ Params: { key: string }; Body: { value: string } }>("/db/kv/:key", async (req) => {
        return withConnection(async (db) => {
            if (db.kind === "sqlite") {
                await db.execute?.(
                    "INSERT INTO kv_store (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v",
                    [req.params.key, req.body.value]
                );
                return { ok: true, db: db.kind };
            }
            return { ok: false, db: db.kind, note: "only sqlite implemented now" };
        }, "default");
    });

    app.get<{ Params: { key: string } }>("/db/kv/:key", async (req) => {
        return withConnection(async (db) => {
            if (db.kind === "sqlite") {
                const r = await db.query<{ v: string }>(
                    "SELECT v FROM kv_store WHERE k = ?",
                    [req.params.key]
                );
                return { key: req.params.key, value: r.rows[0]?.v ?? null, db: db.kind };
            }
            return { key: req.params.key, value: null, db: db.kind, note: "only sqlite implemented now" };
        }, "default");
    });

    // Mount per-app plugins
    const mounts = await mountApps(app);
    app.log.info(
        {
            mounts: mounts.map((m) => ({
                app: m.name,
                mounted: m.mounted,
                pluginFile: m.pluginFile,
                error: m.error ?? null
            }))
        },
        "App plugins mount summary"
    );

    // Fallback 404 with context
    app.setNotFoundHandler((req, reply) => {
        const p = req.params as any;
        reply.code(404).send({
            error: "not_found",
            app: p?.app ?? null,
            path: req.url
        });
    });

    return app;
}

// Re-export for convenience if your server.ts imports from ./cortex/main
export { discoverApps } from "../apps/discover";
