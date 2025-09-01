// cortex/server/mount.ts
import path from "node:path";
import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";
import type { FastifyInstance, FastifyPluginAsync } from "fastify";

type MountOptions = {
    apps?: string[];
    apiPrefix?: string; // default '/api'
};

async function discoverAppsDirnames(root = path.join(process.cwd(), "apps")): Promise<string[]> {
    try {
        const entries = await fs.readdir(root, { withFileTypes: true });
        return entries.filter((d) => d.isDirectory()).map((d) => d.name).sort();
    } catch {
        return [];
    }
}

function asStringArray(maybe: unknown): string[] | undefined {
    if (!Array.isArray(maybe)) return undefined;
    const arr = maybe.filter((x) => typeof x === "string") as string[];
    return arr.length ? arr : undefined;
}

/**
 * Mount all app plugins found in /apps/<name>/app.ts.
 * Accepts either:
 *   mountApps(app, ["cxsun"])
 * or:
 *   mountApps(app, { apps: ["cxsun"], apiPrefix: "/api" })
 * or:
 *   mountApps(app) -> auto-discover under /apps
 */
export async function mountApps(
    app: FastifyInstance,
    appsOrOpts?: string[] | MountOptions
): Promise<string[]> {
    const envApps = (process.env.APP_LIST || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    const fromArgArray = asStringArray(appsOrOpts);
    const fromArgOpts = !fromArgArray && appsOrOpts && typeof appsOrOpts === "object" ? (appsOrOpts as MountOptions) : undefined;

    const explicit = fromArgArray ?? fromArgOpts?.apps ?? (envApps.length ? envApps : undefined);
    const discovered = explicit ?? (await discoverAppsDirnames());

    // always a string array
    const appNames = Array.isArray(discovered) ? discovered : [];

    const prefix = fromArgOpts?.apiPrefix ?? "/api";

    for (const name of appNames) {
        const modPath = path.join(process.cwd(), "apps", name, "app.ts");
        const exists = await fs.access(modPath).then(() => true).catch(() => false);
        if (!exists) {
            app.log.warn({ app: name }, `Skipping app: missing ${modPath}`);
            continue;
        }

        // ⬇️ convert Windows absolute path -> file:// URL for ESM loader
        const modUrl = pathToFileURL(modPath).href;
        const mod = await import(modUrl);

        const plugin: FastifyPluginAsync<any> = mod.default;
        if (typeof plugin !== "function") {
            app.log.warn({ app: name }, `Skipping app: default export is not a Fastify plugin`);
            continue;
        }

        await app.register(plugin, { prefix });
        app.log.info({ app: name, prefix }, "Mounted app");
    }

    return appNames;
}
