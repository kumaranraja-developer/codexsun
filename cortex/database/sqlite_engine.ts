// root/cortex/database/sqlite_engine.ts

import type { DbConfig } from "./connection";
import { EngineBase } from "./Engine";

type BetterSqliteDB = any;  // better-sqlite3 Database
type Sqlite3DB = any;       // sqlite3 Database

function tryRequire(moduleName: string) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        return require(moduleName);
    } catch {
        return null;
    }
}

function isObject(v: unknown): v is Record<string, unknown> {
    return v !== null && typeof v === "object" && !Array.isArray(v);
}

export class SqliteEngine extends EngineBase {
    private bsql: BetterSqliteDB | null = null; // sync path (better-sqlite3)
    private s3: Sqlite3DB | null = null;        // async path (sqlite3)
    private isSync = false;

    constructor(cfg: DbConfig) {
        super(cfg);
        if (cfg.engine !== "sqlite") {
            throw new Error(`SqliteEngine requires engine="sqlite", got "${cfg.engine}"`);
        }
    }

    // ───────────────────────────────────────────────────────────────────────────
    // Protected impls
    // ───────────────────────────────────────────────────────────────────────────

    protected _connect(): void | Promise<void> {
        if (this.bsql || this.s3) return;

        const file = this.resolveDbFile();

        // Prefer better-sqlite3 (sync)
        const bsql = tryRequire("better-sqlite3");
        if (bsql) {
            this.bsql = new bsql(file, { fileMustExist: false });
            this.isSync = true;
            // Pragmas for sane defaults
            this.bsql.pragma("journal_mode = WAL");
            this.bsql.pragma("synchronous = NORMAL");
            return;
        }

        // Fallback: sqlite3 (async, callback-based; wrap as needed)
        const sqlite3 = tryRequire("sqlite3");
        if (!sqlite3) {
            throw new Error(
                "Neither better-sqlite3 nor sqlite3 is available. Please install one."
            );
        }
        const sqlite3v = sqlite3.verbose();
        return new Promise<void>((resolve, reject) => {
            const db = new sqlite3v.Database(file, (err: any) => {
                if (err) return reject(err);
                this.s3 = db;
                // WAL + sensible sync level
                db.exec("PRAGMA journal_mode=WAL; PRAGMA synchronous=NORMAL;", (e: any) =>
                    e ? reject(e) : resolve()
                );
            });
        });
    }

    protected _close(): void | Promise<void> {
        if (this.bsql) {
            try {
                this.bsql.close();
            } catch {
                /* ignore */
            }
            this.bsql = null;
            return;
        }
        if (this.s3) {
            const db = this.s3;
            this.s3 = null;
            return new Promise<void>((resolve) => {
                db.close(() => resolve());
            });
        }
    }

    protected _execute(sql: string, params?: unknown): number | Promise<number | null> | null {
        if (!this.bsql && !this.s3) this._connect();

        // SYNC path
        if (this.bsql) {
            const stmt = this.bsql.prepare(sql);
            const result = Array.isArray(params) || isObject(params)
                ? stmt.run(params as any)
                : stmt.run();
            return typeof result?.changes === "number" ? result.changes : null;
        }

        // ASYNC path
        return new Promise<number | null>((resolve, reject) => {
            const db = this.s3!;
            const cb = function (this: any, err: any) {
                if (err) return reject(err);
                const changes = typeof this?.changes === "number" ? this.changes : null;
                resolve(changes);
            };
            if (Array.isArray(params)) {
                db.run(sql, params, cb);
            } else if (isObject(params)) {
                db.run(sql, params, cb);
            } else if (params === undefined || params === null) {
                db.run(sql, cb);
            } else {
                db.run(sql, [params], cb);
            }
        });
    }

    protected _fetchone<T = any>(sql: string, params?: unknown): T | null | Promise<T | null> {
        if (!this.bsql && !this.s3) this._connect();

        // SYNC path
        if (this.bsql) {
            const stmt = this.bsql.prepare(sql);
            const row = Array.isArray(params) || isObject(params)
                ? stmt.get(params as any)
                : stmt.get();
            return (row as T) ?? null;
        }

        // ASYNC path
        return new Promise<T | null>((resolve, reject) => {
            const db = this.s3!;
            const handler = (err: any, row: any) => (err ? reject(err) : resolve((row as T) ?? null));
            if (Array.isArray(params)) db.get(sql, params, handler);
            else if (isObject(params)) db.get(sql, params, handler);
            else if (params == null) db.get(sql, handler);
            else db.get(sql, [params], handler);
        });
    }

    protected _fetchall<T = any>(sql: string, params?: unknown): T[] | Promise<T[]> {
        if (!this.bsql && !this.s3) this._connect();

        // SYNC path
        if (this.bsql) {
            const stmt = this.bsql.prepare(sql);
            const rows = Array.isArray(params) || isObject(params)
                ? stmt.all(params as any)
                : stmt.all();
            return (rows as T[]) ?? [];
        }

        // ASYNC path
        return new Promise<T[]>((resolve, reject) => {
            const db = this.s3!;
            const handler = (err: any, rows: any[]) => (err ? reject(err) : resolve((rows as T[]) ?? []));
            if (Array.isArray(params)) db.all(sql, params, handler);
            else if (isObject(params)) db.all(sql, params, handler);
            else if (params == null) db.all(sql, handler);
            else db.all(sql, [params], handler);
        });
    }

    protected _executemany(sql: string, paramSets: unknown[]): number | Promise<number> {
        if (!this.bsql && !this.s3) this._connect();

        // SYNC path
        if (this.bsql) {
            const stmt = this.bsql.prepare(sql);
            let total = 0;
            for (const ps of paramSets ?? []) {
                const r = Array.isArray(ps) || isObject(ps) ? stmt.run(ps as any) : stmt.run();
                total += typeof r?.changes === "number" ? r.changes : 0;
            }
            return total;
        }

        // ASYNC path
        return new Promise<number>(async (resolve, reject) => {
            try {
                await this._begin();
                let total = 0;
                for (const ps of paramSets ?? []) {
                    const changes = await this._execute(sql, ps);
                    total += (changes ?? 0);
                }
                await this._commit();
                resolve(total);
            } catch (err) {
                try { await this._rollback(); } catch { /* ignore */ }
                reject(err);
            }
        });
    }

    protected _begin(): void | Promise<void> {
        if (!this.bsql && !this.s3) this._connect();

        if (this.bsql) {
            this.bsql.exec("BEGIN");
            return;
        }
        return new Promise<void>((resolve, reject) => {
            this.s3!.run("BEGIN", (e: any) => (e ? reject(e) : resolve()));
        });
    }

    protected _commit(): void | Promise<void> {
        if (this.bsql) {
            this.bsql.exec("COMMIT");
            return;
        }
        if (this.s3) {
            return new Promise<void>((resolve, reject) => {
                this.s3!.run("COMMIT", (e: any) => (e ? reject(e) : resolve()));
            });
        }
    }

    protected _rollback(): void | Promise<void> {
        if (this.bsql) {
            this.bsql.exec("ROLLBACK");
            return;
        }
        if (this.s3) {
            return new Promise<void>((resolve, reject) => {
                this.s3!.run("ROLLBACK", (e: any) => (e ? reject(e) : resolve()));
            });
        }
    }

    protected _test_connection(): boolean | Promise<boolean> {
        if (!this.bsql && !this.s3) this._connect();

        if (this.bsql) {
            try {
                const stmt = this.bsql.prepare("SELECT 1 AS ok");
                const row = stmt.get();
                return !!row;
            } catch {
                return false;
            }
        }

        return new Promise<boolean>((resolve) => {
            this.s3!.get("SELECT 1 AS ok", (e: any) => resolve(!e));
        });
    }

    // ───────────────────────────────────────────────────────────────────────────
    // Helpers
    // ───────────────────────────────────────────────────────────────────────────

    private resolveDbFile(): string {
        // Use configured name as file path; default applied by connection.ts
        const file = this.config.name || "./database/dev.sqlite";
        return String(file);
    }
}

export { SqliteEngine as default };
