// cortex/server/mount.ts
import type { FastifyInstance } from "fastify";
import { pathToFileURL } from "node:url";
import { discoverApps, findPluginFile } from "../apps/discover";

export type AppMountInfo = {
    name: string;
    pluginFile: string | null;
    mounted: boolean;
    error?: string | null;
};

/** Registers each discovered app plugin under /:app prefix. */
export async function mountApps(fastify: FastifyInstance): Promise<AppMountInfo[]> {
    const apps = discoverApps();
    const results: AppMountInfo[] = [];

    for (const name of apps) {
        const pluginFile = findPluginFile(name);
        if (!pluginFile) {
            results.push({ name, pluginFile: null, mounted: false, error: "plugin not found" });
            continue;
        }

        try {
            const mod = await import(pathToFileURL(pluginFile).href);
            const plugin = (mod as any)?.default;

            if (typeof plugin !== "function") {
                results.push({
                    name,
                    pluginFile,
                    mounted: false,
                    error: "default export is not a Fastify plugin function"
                });
                continue;
            }

            await fastify.register(plugin as any, { prefix: `/${name}` });
            results.push({ name, pluginFile, mounted: true, error: null });
        } catch (err: any) {
            results.push({
                name,
                pluginFile,
                mounted: false,
                error: err?.message || String(err)
            });
        }
    }

    return results;
}
