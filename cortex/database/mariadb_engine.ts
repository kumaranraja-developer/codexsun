// root/cortex/database/mariadb_engine.ts

import type { DbConfig } from "./connection";
import { EngineBase } from "./Engine";
import mariadb, { Pool, PoolConnection } from "mariadb";

type MariadbPool = Pool;
type MariadbConn = PoolConnection;

export class MariaDbEngine extends EngineBase {
    private pool: MariadbPool | null = null;
    private txConn: MariadbConn | null = null;

    constructor(cfg: DbConfig) {
        super(cfg);
        if (cfg.engine !== "mariadb") {
            throw new Error(`MariaDbEngine requires engine="mariadb", got "${cfg.engine}"`);
        }
    }

    // ───────────────────────────────────────────────────────────────────────────
    // Protected impls (async via mariadb promise API)
    // ───────────────────────────────────────────────────────────────────────────

    protected async _connect(): Promise<void> {
        if (this.pool) return;

        const { host, port, user, pass, name } = this.config;

        this.pool = mariadb.createPool({
            host,
            port,
            user,
            password: pass,
            database: name,
            // sensible pool defaults
            connectionLimit: 10,
            acquireTimeout: 5000,
            idleTimeout: 30000,
            // QoL options
            // mariadb driver supports named placeholders like :id when enabled
            namedPlaceholders: true,
            // allow big numbers to be returned as strings when necessary
            bigIntAsNumber: false,
            // date handling (default returns JS Date objects)
            // dateStrings: false, // not a mariadb option; kept here to show intent
        });

        // Eager test of connectivity (fail fast)
        const conn = await this.pool.getConnection();
        try {
            await conn.ping();
        } finally {
            conn.release();
        }
    }

    protected async _close(): Promise<void> {
        // close any ongoing tx connection first
        if (this.txConn) {
            try {
                // best effort: rollback if still in transaction
                await this.txConn.rollback().catch(() => {});
            } catch {}
            try {
                this.txConn.release();
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
        const conn = this.txConn ?? (await this.pool!.getConnection());
        const isBorrowed = !this.txConn;

        try {
            const norm = normalizeParams(params);
            // mariadb returns either rows[] or an OkPacket-like object
            const res: any = await conn.query(sql, norm ?? []);
            // For DML, result has affectedRows (and insertId, warningStatus, etc)
            const affected =
                res && typeof res === "object" && "affectedRows" in res ? (res.affectedRows as number) : null;
            return affected ?? null;
        } finally {
            if (isBorrowed) conn.release();
        }
    }

    protected async _fetchone<T = any>(sql: string, params?: unknown): Promise<T | null> {
        await this._ensurePool();
        const conn = this.txConn ?? (await this.pool!.getConnection());
        const isBorrowed = !this.txConn;

        try {
            const rows = (await conn.query(sql, normalizeParams(params) ?? [])) as any[];
            if (Array.isArray(rows)) {
                return (rows[0] as T) ?? null;
            }
            // If a single row-like object is returned (unlikely), coerce
            return (rows as unknown as T) ?? null;
        } finally {
            if (isBorrowed) conn.release();
        }
    }

    protected async _fetchall<T = any>(sql: string, params?: unknown): Promise<T[]> {
        await this._ensurePool();
        const conn = this.txConn ?? (await this.pool!.getConnection());
        const isBorrowed = !this.txConn;

        try {
            const rows = (await conn.query(sql, normalizeParams(params) ?? [])) as any[];
            return (Array.isArray(rows) ? rows : [rows]) as T[];
        } finally {
            if (isBorrowed) conn.release();
        }
    }

    protected async _executemany(sql: string, paramSets: unknown[]): Promise<number | null> {
        await this._ensurePool();
        const conn = this.txConn ?? (await this.pool!.getConnection());
        const isBorrowed = !this.txConn;

        try {
            // Prefer driver-side batching if available and params are arrays of arrays/objects
            const sets = (paramSets ?? []) as any[];
            if (typeof conn.batch === "function" && sets.length > 0) {
                const res: any = await conn.batch(sql, sets);
                // conn.batch() returns an array of OkPackets or rows; sum affectedRows if present
                if (Array.isArray(res)) {
                    const total = res.reduce((acc, r) => acc + (typeof r === "object" && r?.affectedRows || 0), 0);
                    return total;
                }
            }

            // Fallback: loop
            let total = 0;
            for (const ps of sets) {
                const r: any = await conn.query(sql, normalizeParams(ps) ?? []);
                total += (r && typeof r === "object" && "affectedRows" in r ? (r.affectedRows as number) : 0) || 0;
            }
            return total;
        } finally {
            if (isBorrowed) conn.release();
        }
    }

    protected async _begin(): Promise<void> {
        await this._ensurePool();
        if (this.txConn) {
            throw new Error("Transaction already started");
        }
        const conn = await this.pool!.getConnection();
        await conn.beginTransaction();
        this.txConn = conn;
    }

    protected async _commit(): Promise<void> {
        if (!this.txConn) throw new Error("No active transaction to commit");
        try {
            await this.txConn.commit();
        } finally {
            try {
                this.txConn.release();
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
                this.txConn.release();
            } catch {}
            this.txConn = null;
        }
    }

    protected async _test_connection(): Promise<boolean> {
        try {
            await this._ensurePool();
            const conn = this.txConn ?? (await this.pool!.getConnection());
            const isBorrowed = !this.txConn;
            try {
                // ping is fast; query is a second check
                await conn.ping();
                await conn.query("SELECT 1 AS ok");
                return true;
            } finally {
                if (isBorrowed) conn.release();
            }
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

function normalizeParams(params?: unknown): any[] | Record<string, any> | undefined {
    if (params == null) return undefined;
    if (Array.isArray(params)) return params as any[];
    if (typeof params === "object") {
        // allow named placeholders {id: 1, name: 'x'} with namedPlaceholders: true
        return params as Record<string, any>;
    }
    // single scalar → wrap
    return [params as any];
}

export { MariaDbEngine as default };
