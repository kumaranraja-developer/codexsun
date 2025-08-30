// cortex/mount.ts
import type { FastifyInstance, FastifyPluginCallback } from "fastify";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Mount a single app given its name (folder) under ./apps/<name>/app.ts
 */
async function mountOneApp(root: FastifyInstance, appName: string) {
    const appPath = join(process.cwd(), "apps", appName, "app.ts");
    const url = pathToFileURL(appPath).href;

    let plugin: FastifyPluginCallback | ((...args: any[]) => any);
    try {
        const mod = await import(url);
        plugin = mod.default;
        if (!plugin) throw new Error(`No default export in ${appPath}`);
    } catch (err) {
        root.log.error({ err }, `Failed to load app: ${appName}`);
        return { name: appName, mounted: false, error: String(err) };
    }

    try {
        await root.register(plugin as any, { prefix: `/${appName}` });
        root.log.info(`Mounted app: ${appName} at /${appName}`);
        return { name: appName, mounted: true };
    } catch (err) {
        root.log.error({ err }, `Failed to mount app: ${appName}`);
        return { name: appName, mounted: false, error: String(err) };
    }
}

/**
 * Mount many apps discovered by framework.
 */
export async function mountApps(root: FastifyInstance, appNames: string[]) {
    const results = [];
    for (const name of appNames) {
        // protect against weird names
        if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
            root.log.warn(`Skipping suspicious app folder: ${name}`);
            continue;
        }
        results.push(await mountOneApp(root, name));
    }
    return results;
}
