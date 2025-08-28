/**
 *  cortex/connection_manager.ts
 *
 * Connection manager: returns cached engine per (driver, scope).
 * Current implementation: SQLite (others can be added later).
 */

import type { Engine } from "./Engine";
import { getSettings, type Settings } from "../settings/get_settings";
import { createSqliteEngine } from "./sqlite_engine";
// Future:
// import { createPostgresEngine } from "./database/postgres_engine";
// import { createMariaDbEngine } from "./database/mariadb_engine";

type CacheKey = string; // `${driver}:${scope}`

class ConnectionManager {
    private engines = new Map<CacheKey, Engine>();

    async get(scope = "default"): Promise<Engine> {
        const settings = await getSettings(scope);
        const key = this.keyOf(settings);
        const cached = this.engines.get(key);
        if (cached) return cached;

        const engine = await this.createEngine(settings);
        this.engines.set(key, engine);
        return engine;
    }

    async close(scope?: string) {
        if (!scope) return this.closeAll();
        const settings = await getSettings(scope);
        const key = this.keyOf(settings);
        const e = this.engines.get(key);
        if (e) { await e.close(); this.engines.delete(key); }
    }

    async closeAll() {
        await Promise.all([...this.engines.values()].map((e) => e.close()));
        this.engines.clear();
    }

    private keyOf(s: Settings): CacheKey {
        return `${s.driver}:${s.scope}`;
    }

    private async createEngine(s: Settings): Promise<Engine> {
        switch (s.driver) {
            case "sqlite":   return createSqliteEngine({ file: s.sqlite.file });
            // case "postgres": return createPostgresEngine(s.postgres);
            // case "mariadb":  return createMariaDbEngine(s.mariadb);
            default:         return createSqliteEngine({ file: s.sqlite.file }); // safe default
        }
    }
}

export const connectionManager = new ConnectionManager();

/** Helper to use a connection in a scope. Keeps it cached (no close). */
export async function withConnection<T>(fn: (engine: Engine) => Promise<T>, scope = "default") {
    const engine = await connectionManager.get(scope);
    return fn(engine);
}