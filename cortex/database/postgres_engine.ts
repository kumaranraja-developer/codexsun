// root/cortex/database/postgres_engine.ts

import type { DbConfig } from "./connection";
import { EngineBase } from "./Engine";

// Types from pg (kept as any to avoid hard dependency on @types/pg)
type PgPool = any;
type PgClient = any;

async function loadPg() {
    // Works for both ESM/CJS pg builds
    const mod = await import("pg");
    return (mod as any).Pool ? mod : (mod as any).default || mod;
}

type NormalizedQuery = { text: string; values?: any[] };

// Convert either positional params ([]) or named params ({ key: val }) into
// a text + values pair suitable for node-postgres ($1, $2, …).
function normalizeQuery(sql: string, params?: unknown): NormalizedQuery {
    if (params == null) return { text: sql };
    if (Array.isArray(params)) return { text: sql, values: params as any[] };

    if (typeof params === "object") {
        const seen: string[] = [];
        const values: any[] = [];
        const text = String(sql).replace(
            /:([a-zA-Z_][a-zA-Z0-9_]*)/g,
            (_m, key: string) => {
                let idx = seen.indexOf(key);
                if (idx === -1) {
                    seen.push(key);
                    values.push((params as any)[key]);
                    idx = values.length - 1;
                }
                return `$${idx + 1}`;
            }
        );
        return { text, values };
    }

    // scalar → single $1
    return { text: sql.replace(/\?/g, "$1"), values: [params] };
}

export class PostgresEngine extends EngineBase {
    private pool: PgPool | null = null;
    private txClient: PgClient | null = null;

    constructor(cfg: DbConfig) {
        super(cfg);
        if (cfg.engine !== "postgres") {
            throw new Error(`PostgresEngine requires engine="postgres", got "${cfg.engine}"`);
        }
    }

    // ───────────────────────────────────────────────────────────────────────────
    // Protected impls
    // ───────────────────────────────────────────────────────────────────────────




    protected async _connect(): Promise<void> {
        if (this.pool) return;

        const pg = await loadPg();
        const { Pool } = pg;
        this.pool = new Pool({
            host,
            port,
            user,
            password: pass,
            database: name,
            max: 10,
            idleTimeoutMillis: 10000,
            connectionTimeoutMillis: 5000,
        });
    }

    protected async _close(): Promise<void> {
        if (this.txClient) {
            try {
                await this.txClient.query("ROLLBACK");
            } catch {}
            try {
                this.txClient.release?.();
            } catch {}
            this.txClient = null;
        }
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
        const { text, values } = normalizeQuery(sql, params);
        const client = this.txClient ?? this.pool!;
        const res = await client.query(text, values);
        // res.rowCount is available for INSERT/UPDATE/DELETE in pg
        return typeof res?.rowCount === "number" ? res.rowCount : null;
    }

    protected async _fetchone<T = any>(sql: string, params?: unknown): Promise<T | null> {
        await this._ensurePool();
        const { text, values } = normalizeQuery(sql, params);
        const client = this.txClient ?? this.pool!;
        const res = await client.query(text, values);
        return (res?.rows?.[0] as T) ?? null;
    }

    protected async _fetchall<T = any>(sql: string, params?: unknown): Promise<T[]> {
        await this._ensurePool();
        const { text, values } = normalizeQuery(sql, params);
        const client = this.txClient ?? this.pool!;
        const res = await client.query(text, values);
        return (res?.rows as T[]) ?? [];
    }

    protected async _executemany(sql: string, paramSets: unknown[]): Promise<number | null> {
        await this._ensurePool();
        const client = this.txClient ?? this.pool!;
        let total = 0;

        // If not already in a transaction, batch inside one for atomicity/perf
        let startedLocalTx = false;
        if (!this.txClient) {
            await client.query("BEGIN");
            startedLocalTx = true;
        }

        try {
            for (const params of paramSets ?? []) {
                const { text, values } = normalizeQuery(sql, params);
                const res = await client.query(text, values);
                total += res?.rowCount ?? 0;
            }
            if (startedLocalTx) await client.query("COMMIT");
            return total;
        } catch (err) {
            if (startedLocalTx) {
                try { await client.query("ROLLBACK"); } catch {}
            }
            throw err;
        }
    }

    protected async _begin(): Promise<void> {
        await this._ensurePool();
        if (this.txClient) throw new Error("Transaction already started");
        this.txClient = await this.pool!.connect();
        await this.txClient.query("BEGIN");
    }

    protected async _commit(): Promise<void> {
        if (!this.txClient) throw new Error("No active transaction to commit");
        try {
            await this.txClient.query("COMMIT");
        } finally {
            try { this.txClient.release?.(); } catch {}
            this.txClient = null;
        }
    }

    protected async _rollback(): Promise<void> {
        if (!this.txClient) throw new Error("No active transaction to rollback");
        try {
            await this.txClient.query("ROLLBACK");
        } finally {
            try { this.txClient.release?.(); } catch {}
            this.txClient = null;
        }
    }

    protected async _test_connection(): Promise<boolean> {
        try {
            await this._ensurePool();
            const client = this.txClient ?? this.pool!;
            await client.query("SELECT 1");
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

export { PostgresEngine as default };
