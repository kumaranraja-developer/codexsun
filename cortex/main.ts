// cortex/main.ts

import { createFastify } from "./server/create";
import { mountApps } from "./server/mount";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { logger } from "./utils/logger";

const APPS_DIR = join(process.cwd(), "apps");

export function discoverApps(): string[] {
    try {
        return readdirSync(APPS_DIR).filter((n) => {
            const p = join(APPS_DIR, n);
            return statSync(p).isDirectory();
        }).sort();
    } catch {
        return [];
    }
}

export async function createServer() {
    const app = createFastify();

    app.get("/healthz", async () => ({ ok: true, service: "codexsun" }));
    app.get("/version", async () => ({
        name: "codexsun",
        version: process.env.npm_package_version ?? "0.0.0",
        env: process.env.NODE_ENV ?? "development",
    }));

    const apps = discoverApps();
    await mountApps(app, apps);

    app.get("/", async () => ({
        name: "codexsun",
        apps,
        tips: apps.map((n) => `GET /${n}`),
    }));

    logger.info("Framework booted");
    return app;
}
