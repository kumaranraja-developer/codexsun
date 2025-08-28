// root/cortex/settings/get_settings.ts
import fs from "node:fs";
import path from "node:path";
import { parse } from "dotenv";
import { EventEmitter } from "events";

export type DbEngine = "sqlite" | "postgres" | "mariadb";

export type Settings = {
    // App
    APP_NAME: string;
    APP_ENV: string;
    APP_KEY: string;
    APP_DEBUG: boolean;
    APP_URL: string;

    // Database
    DB_ENGINE: DbEngine;
    DB_HOST: string;
    DB_PORT: number;
    DB_USER: string;
    DB_PASS: string;
    DB_NAME: string;

    // Session
    SESSION_DRIVER: string;
    SESSION_LIFETIME: number;
    SESSION_ENCRYPT: boolean;

    // Generic
    scope: string;
    databaseUrl: string;                   // DATABASE_URL if used
    logLevel: "debug" | "info" | "warn" | "error";
    apiKey: string;

    // Keep any additional env keys accessible
    [key: string]: string | number | boolean;
};

type FilesSet = { files: string[]; existing: string[] };

const emitter = new EventEmitter();
let cachedSettings: Settings | null = null;
let cachedScope: string | null = null;
let lastLoadedKeys = new Set<string>();
let activeWatchers: fs.FSWatcher[] = [];
let debounceTimer: NodeJS.Timeout | null = null;

function envFilesFor(scope: string, root = process.cwd()): FilesSet {
    const files = [
        path.join(root, ".env"),
        path.join(root, ".env.local"),
        path.join(root, `.env.${scope}`),
        path.join(root, `.env.${scope}.local`),
    ];
    const existing = files.filter((f) => fs.existsSync(f));
    return { files, existing };
}

function readEnvFilesInOrder(existingFiles: string[]): Record<string, string> {
    // Precedence: later overrides earlier
    let merged: Record<string, string> = {};
    for (const f of existingFiles) {
        const raw = fs.readFileSync(f, "utf8");
        const parsed = parse(raw);
        merged = { ...merged, ...parsed };
    }
    return merged;
}

function applyToProcessEnv(merged: Record<string, string>) {
    // Remove previously injected keys
    for (const k of lastLoadedKeys) {
        delete (process.env as any)[k];
    }
    lastLoadedKeys.clear();

    // Inject new set
    for (const [k, v] of Object.entries(merged)) {
        process.env[k] = v;
        lastLoadedKeys.add(k);
    }
}

function bool(v: any, def: boolean): boolean {
    if (v === undefined || v === null) return def;
    const s = String(v).trim().toLowerCase();
    return s === "1" || s === "true" || s === "yes" || s === "on";
}

function int(v: any, def: number): number {
    const n = parseInt(String(v ?? ""), 10);
    return Number.isFinite(n) ? n : def;
}

function buildSettings(scope: string): Settings {
    const engine = (process.env.DB_ENGINE as DbEngine) ?? "sqlite";

    const s: Settings = {
        // App
        APP_NAME: process.env.APP_NAME ?? "MyApp",
        APP_ENV: process.env.APP_ENV ?? "local",
        APP_KEY: process.env.APP_KEY ?? "",
        APP_DEBUG: bool(process.env.APP_DEBUG, false),
        APP_URL: process.env.APP_URL ?? "http://localhost",

        // DB
        DB_ENGINE: engine,
        DB_HOST: process.env.DB_HOST ?? "localhost",
        DB_PORT:
            process.env.DB_PORT !== undefined
                ? int(process.env.DB_PORT, 0)
                : engine === "mariadb"
                    ? 3306
                    : engine === "postgres"
                        ? 5432
                        : 0,
        DB_USER: process.env.DB_USER ?? "user",
        DB_PASS: process.env.DB_PASS ?? "",
        DB_NAME: process.env.DB_NAME ?? (engine === "sqlite" ? "./database/dev.sqlite" : "app_db"),

        // Session
        SESSION_DRIVER: process.env.SESSION_DRIVER ?? "file",
        SESSION_LIFETIME: int(process.env.SESSION_LIFETIME, 120),
        SESSION_ENCRYPT: bool(process.env.SESSION_ENCRYPT, false),

        // Generic
        scope,
        databaseUrl: process.env.DATABASE_URL ?? "",
        logLevel: (process.env.LOG_LEVEL as Settings["logLevel"]) ?? "info",
        apiKey: process.env.API_KEY ?? "default_api_key",
    };

    // Add any remaining env keys (non-undefined)
    for (const [k, v] of Object.entries(process.env)) {
        if (!(k in s) && v !== undefined) {
            // keep as string; callers can parse as needed
            (s as any)[k] = v;
        }
    }

    return s;
}

/** Loads env (layered), caches, and returns settings. */
export async function getSettings(scope = "default", forceReload = false): Promise<Settings> {
    if (!forceReload && cachedSettings && cachedScope === scope) return cachedSettings;

    const { existing } = envFilesFor(scope);
    const merged = readEnvFilesInOrder(existing);
    applyToProcessEnv(merged);

    cachedSettings = buildSettings(scope);
    cachedScope = scope;

    return cachedSettings;
}

/** Manual cache clear (and remove injected env keys). */
export function clearSettingsCache() {
    cachedSettings = null;
    cachedScope = null;
    for (const k of lastLoadedKeys) delete (process.env as any)[k];
    lastLoadedKeys.clear();
}

/** Subscribe to settings changes. Returns an unsubscribe. */
export function onSettingsChange(listener: (s: Settings) => void): () => void {
    emitter.on("settings:change", listener);
    return () => emitter.off("settings:change", listener);
}

/** Start watching .env files for a scope. Debounced reload + emit event. */
export function watchSettings(scope = "default") {
    // Close old watchers
    for (const w of activeWatchers) try { w.close(); } catch {}
    activeWatchers = [];

    const { files } = envFilesFor(scope);

    for (const f of files) {
        const dir = path.dirname(f);
        const base = path.basename(f);

        // Watch the directory and filter the file (so late-appearing files are caught)
        if (fs.existsSync(dir)) {
            const watcher = fs.watch(dir, { persistent: true }, async (event, filename) => {
                if (!filename || filename !== base) return;

                // Debounce rapid writes
                if (debounceTimer) clearTimeout(debounceTimer);
                debounceTimer = setTimeout(async () => {
                    const s = await getSettings(scope, true);
                    emitter.emit("settings:change", s);
                }, 150);
            });
            activeWatchers.push(watcher);
        }
    }
}