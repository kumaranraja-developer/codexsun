// root/cortex/database/mariadb_engine.ts

import type { DbConfig } from "./connection";
import { EngineBase } from "./Engine";

// We prefer mysql2/promise; if not available, try mysql2 and wrap.
type MySqlPool = any;
type MySqlConn = any;

function requireMysqlPromise() {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        return require("mysql2/promise");
    } catch {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mysql2 = require("mysql2");
        // very light wrapper to emulate the promise API we need
        return {
            createPool: (opts: any) => {
                const pool = mysql2.createPool(opts);
                return {
                    execute: (sql: string, params?: any[]) =>
                        new Promise((resolve, reject) =>
                            pool.execute(sql, params ?? [], (err: any, rows: any, fields: any) =>
                                err ? reject(err) : resolve([rows, fields])
                            )
                        ),
                    query: (sql: string, params?: any[]) =>
                        new Promise((resolve, reject) =>
                            pool.query(sql, params ?? [], (err: any, rows: any, fields: any) =>
                                err ? reject(err) : resolve([rows, fields])
                            )
                        ),
                    getConnection: async () =>
                        new Promise((resolve, reject) =>
                            pool.getConnection((err: any, conn: any) => (err ? reject(err) : resolve(conn)))
                        ),
                    end: async () =>
                        new Promise((resolve, reject) => pool.end((err: any) => (err ? reject(err) : resolve(null)))),
                };
            },
        };
    }
}

export class MariaDbEngine extends EngineBase {
    private pool: MySqlPool | null = null;
    private txConn: MySqlConn | null = null;

    constructor(cfg: DbConfig) {
        super(cfg);
        if (cfg.engine !== "mariadb") {
            throw new Error(`MariaDbEngine requires engine="mariadb", got "${cfg.engine}"`);
        }
    }

    // ───────────────────────────────────────────────────────────────────────────
    // Protected impls (async via promise API)
    // ───────────────────────────────────────────────────────────────────────────

    protected async _connect(): Promise<void> {
        if (this.pool) return;

        const mysql = requireMysqlPromise();
        const { host, port, user, pass, name } = this.config;

        this.pool = mysql.createPool({
            host,
            port,
            user,
            password: pass,
            database: name,
            // sensible pool defaults
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            // useful options
            namedPlaceholders: true,
            dateStrings: false,
        });
    }

    protected async _close(): Promise<void> {
        // close any ongoing tx connection first
        if (this.txConn) {
            try {
                // best effort: rollback if still in transaction
                await this.txConn.rollback().catch(() => {});
            } catch {}
            try {
                this.txConn.release?.();
            } catch {}
            this.txConn = null;
        }
        // then end pool
        if (this.pool) {
            const p = this.pool;
            this.pool = null;
            try {
                await p.end();
            } catch {
                /* swallow */
            }
        }
    }

    protected async _execute(sql: string, params?: unknown): Promise<number | null> {
        await this._ensurePool();
        const conn = this.txConn ?? this.pool!;
        const [result] = await conn.execute(sql, normalizeParams(params));
        // INSERT/UPDATE/DELETE → mysql2 returns a ResultSetHeader
        // Try to extract affectedRows; if absent, return null.
        const affected =
            result && typeof result === "object" && "affectedRows" in result ? (result.affectedRows as number) : null;
        return affected ?? null;
    }

    protected async _fetchone<T = any>(sql: string, params?: unknown): Promise<T | null> {
        await this._ensurePool();
        const conn = this.txConn ?? this.pool!;
        const [rows] = await conn.execute(sql, normalizeParams(params));
        if (Array.isArray(rows)) {
            return (rows[0] as T) ?? null;
        }
        return (rows as T) ?? null;
    }

    protected async _fetchall<T = any>(sql: string, params?: unknown): Promise<T[]> {
        await this._ensurePool();
        const conn = this.txConn ?? this.pool!;
        const [rows] = await conn.execute(sql, normalizeParams(params));
        return (Array.isArray(rows) ? rows : [rows]) as T[];
    }

    protected async _executemany(sql: string, paramSets: unknown[]): Promise<number | null> {
        await this._ensurePool();
        const conn = this.txConn ?? this.pool!;
        let total = 0;
        for (const ps of paramSets ?? []) {
            const [result] = await conn.execute(sql, normalizeParams(ps));
            const affected =
                result && typeof result === "object" && "affectedRows" in result ? (result.affectedRows as number) : 0;
            total += affected || 0;
        }
        return total;
    }

    protected async _begin(): Promise<void> {
        await this._ensurePool();
        if (this.txConn) {
            throw new Error("Transaction already started");
        }
        this.txConn = await this.pool!.getConnection();
        await this.txConn.beginTransaction();
    }

    protected async _commit(): Promise<void> {
        if (!this.txConn) throw new Error("No active transaction to commit");
        try {
            await this.txConn.commit();
        } finally {
            try {
                this.txConn.release?.();
            } catch {}
            this.txConn = null;
        }
    }

    protected async _rollback(): Promise<void> {
        if (!this.txConn) throw new Error("No active transaction to rollback");
        try {
            await this.txConn.rollback();
        } finally {
            try {
                this.txConn.release?.();
            } catch {}
            this.txConn = null;
        }
    }

    protected async _test_connection(): Promise<boolean> {
        try {
            await this._ensurePool();
            const [rows] = await (this.txConn ?? this.pool!).query("SELECT 1 AS ok");
            // If query returned without throwing, consider it healthy.
            return true;
        } catch {
            return false;
        }
    }

    // ───────────────────────────────────────────────────────────────────────────
    // Helpers
    // ───────────────────────────────────────────────────────────────────────────

    private async _ensurePool() {
        if (!this.pool) await this._connect();
    }
}

function normalizeParams(params?: unknown): any[] | undefined {
    if (params == null) return undefined;
    if (Array.isArray(params)) return params as any[];
    if (typeof params === "object") {
        // allow named placeholders {id: 1, name: 'x'}
        return params as any;
    }
    // single scalar → wrap
    return [params as any];
}

export { MariaDbEngine as default };
