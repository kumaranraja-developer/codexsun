// cortex/cli/doctor/settings.ts
// Loads env, optionally calls project get_settings, and parses DB config.

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const CWD = process.cwd();

/** Load .env + invoke project get_settings() if present. */
export async function loadEnvAndSettings(): Promise<Record<string, any>> {
    // Load .env/.env.local into process.env (non-destructive)
    const envPaths = [resolve(CWD, ".env.local"), resolve(CWD, ".env")];
    for (const p of envPaths) {
        if (!existsSync(p)) continue;
        try {
            const content = readFileSync(p, "utf8");
            for (const line of content.split(/\r?\n/)) {
                const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
                if (!m) continue;
                const key = m[1];
                let val = m[2];
                if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                    val = val.slice(1, -1);
                }
                if (!(key in process.env)) process.env[key] = val;
            }
        } catch {
            /* ignore */
        }
    }

    // Try project get_settings in common spots
    const candidates = [
        resolve(CWD, "cortex/settings/get_settings.ts"),
        resolve(CWD, "cortex/settings/get_settings.js"),
        resolve(CWD, "get_settings.ts"),
        resolve(CWD, "get_settings.js"),
    ];
    for (const c of candidates) {
        try {
            if (!existsSync(c)) continue;
            const mod = await import(c);
            const get = mod.getSettings || mod.default || mod.load;
            if (typeof get === "function") {
                try {
                    const maybe = await get({ watch: false });
                    if (maybe && typeof maybe === "object") return maybe;
                } catch {/* ignore */}
            }
        } catch {/* ignore */}
    }

    // Fallback to env; default DB → sqlite://data/dev.sqlite3
    return {
        APP_ENV: process.env.APP_ENV,
        APP_URL: process.env.APP_URL,
        DATABASE_URL: process.env.DATABASE_URL || "sqlite://data/dev.sqlite3",
        DB_ENGINE: process.env.DB_ENGINE,
        DB_HOST: process.env.DB_HOST,
        DB_PORT: process.env.DB_PORT,
        DB_USER: process.env.DB_USER,
        DB_PASS: process.env.DB_PASS,
        DB_NAME: process.env.DB_NAME,
        SQLITE_FILE: process.env.SQLITE_FILE,
    };
}

/** Discriminated union for parsed DB */
export type ParsedDb =
    | { engine: "sqlite"; sqliteFile: string }
    | { engine: string; host?: string; port?: number; user?: string; pass?: string; name?: string; raw?: string }
    | { engine?: undefined };

/** Parse DATABASE_URL or DB_* env into a structured shape (with literal "sqlite"). */
export function parseDatabaseUrl(settings: Record<string, any>): ParsedDb {
    const url = String(settings.DATABASE_URL || "");
    if (url) {
        try {
            const u = new URL(url);
            const engine = u.protocol.replace(":", "");
            if (engine === "sqlite" || engine === "file" || engine === "sqlite3") {
                const file = url.startsWith("file:") ? u.pathname : url.replace(/^sqlite:\/\//, "");
                return { engine: "sqlite", sqliteFile: file };
            }
            const host = u.hostname;
            const port = u.port ? Number(u.port)
                : engine.startsWith("postgres") ? 5432
                    : engine.includes("mysql") || engine.includes("mariadb") ? 3306
                        : undefined;
            const name = u.pathname?.replace(/^\//, "") || undefined;
            const user = u.username || undefined;
            const pass = u.password || undefined;
            return { engine, host, port, user, pass, name, raw: url };
        } catch { /* fallthrough */ }
    }

    const engineEnv = (settings.DB_ENGINE || "").toLowerCase();
    if (engineEnv === "sqlite") {
        return { engine: "sqlite", sqliteFile: settings.SQLITE_FILE || "data/dev.sqlite3" };
    }
    if (engineEnv) {
        const host = settings.DB_HOST;
        const port = settings.DB_PORT ? Number(settings.DB_PORT)
            : engineEnv.startsWith("postgres") ? 5432
                : engineEnv.includes("mysql") || engineEnv.includes("mariadb") ? 3306
                    : undefined;
        return { engine: engineEnv, host, port, user: settings.DB_USER, pass: settings.DB_PASS, name: settings.DB_NAME };
    }
    return { engine: undefined };
}
