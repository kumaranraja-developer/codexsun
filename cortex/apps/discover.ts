// cortex/apps/discover.ts
import { readdirSync, existsSync } from "node:fs";
import path from "node:path";

export const PLUGIN_CANDIDATES = [
    "app.ts",
    "app.tsx",
    "app.mts",
    "app.js",
    "app.mjs",
    "dist/app.js",
    "dist/app.mjs"
];

export function repoRootDir() {
    return process.cwd();
}

export function appsDir() {
    return path.join(repoRootDir(), "apps");
}

/** First matching plugin file for an app folder (absolute path) or null. */
export function findPluginFile(appName: string): string | null {
    const base = path.join(appsDir(), appName);
    for (const rel of PLUGIN_CANDIDATES) {
        const file = path.join(base, rel);
        if (existsSync(file)) return file;
    }
    return null;
}

/** Only returns app folders that actually have a plugin file. */
export function discoverApps(): string[] {
    let names: string[] = [];
    try {
        names = readdirSync(appsDir(), { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => d.name);
    } catch {
        return [];
    }
    return names.filter((name) => !!findPluginFile(name));
}
