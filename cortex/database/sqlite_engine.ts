/**
 *  cortex/database/sqlite_engine.ts
 */

import type { Engine } from "./Engine";
import { mkdirSync } from "node:fs";
import path from "node:path";

/** Options to create a SQLite engine. */
export type SqliteEngineOptions = {
    file: string;                 // e.g. ./data/dev.sqlite
    applyDefaultPragmas?: boolean; // default true
};

/** SQLite Engine using better-sqlite3 (sync driver, async API).  pnpm add better-sqlite3 */
export async function createSqliteEngine(opts: SqliteEngineOptions): Promise<Engine> {
    let BetterSqlite3: any;
    try { BetterSqlite3 = (await import("better-sqlite3")).default; }
    catch { throw new Error('Install "better-sqlite3": pnpm add better-sqlite3'); }

    const dbFile = path.resolve(opts.file);
    mkdirSync(path.dirname(dbFile), { recursive: true });
    const dbh = new BetterSqlite3(dbFile);

    if (opts.applyDefaultPragmas !== false) {
        dbh.pragma("journal_mode = WAL");
        dbh.pragma("synchronous = NORMAL");
    }

    const engine: Engine = {
        kind: "sqlite",
        async query<T = unknown>(sql: string, params: unknown[] = []) {
            const stmt = dbh.prepare(sql);
            if (/^\s*select\b/i.test(sql)) {
                return { rows: stmt.all(...params) as T[] };
            }
            stmt.run(...params);
            return { rows: [] as T[] };
        },
        async execute(sql: string, params: unknown[] = []) {
            const info = dbh.prepare(sql).run(...params);
            return {
                changes: typeof info.changes === "number" ? info.changes : undefined,
                lastInsertId: info.lastInsertRowid ?? undefined
            };
        },
        async close() { dbh.close(); }
    };

    // tiny table for smoke tests
    await engine.execute?.(`CREATE TABLE IF NOT EXISTS kv_store (k TEXT PRIMARY KEY, v TEXT NOT NULL)`);
    return engine;
}

export default createSqliteEngine;

