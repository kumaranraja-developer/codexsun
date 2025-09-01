import { BaseEngine } from '../Engine';
import type { NetworkDBConfig } from '../types';
import { Pool, PoolClient } from 'pg';
import { queryAdapter } from '../queryAdapter'; // shared helper

export class PostgresEngine extends BaseEngine {
    private cfg: NetworkDBConfig;
    private pool: Pool | null = null;

    constructor(cfg: NetworkDBConfig) {
        super({ profile: cfg.profile, driver: 'postgres', cfgKey: cfg.cfgKey });
        this.cfg = cfg;
    }

    protected async _connect(): Promise<void> {
        if (this.pool) return;
        this.pool = new Pool({
            host: this.cfg.host,
            port: this.cfg.port,
            user: this.cfg.user,
            password: this.cfg.password,
            database: this.cfg.database,
            ssl: this.cfg.ssl ? { rejectUnauthorized: false } : undefined,
            max: this.cfg.pool?.max ?? 10,
            idleTimeoutMillis: this.cfg.pool?.idleMillis ?? 10000,
            connectionTimeoutMillis: this.cfg.pool?.acquireTimeoutMillis ?? 15000,
        });
        // warm ping
        const c = await this.pool.connect();
        await c.query('SELECT 1');
        c.release();
    }

    protected async _close(): Promise<void> {
        if (!this.pool) return;
        await this.pool.end();
        this.pool = null;
    }

    protected async _get_connection(): Promise<PoolClient> {
        if (!this.pool) await this._connect();
        return this.pool!.connect();
    }

    protected async _execute(sql: string, params?: unknown): Promise<any> {
        let { sql: normSql, params: normParams } = queryAdapter("postgres", sql, params);

        // ✅ Ensure INSERT always returns an id
        if (/^\s*insert/i.test(normSql) && !/returning\s+/i.test(normSql)) {
            normSql = normSql.trim().replace(/;?$/, " RETURNING id;");
        }

        console.log("[DB:_execute] acquiring client...");
        const c = await this._get_connection();
        console.log("[DB:_execute] client acquired, running SQL:", normSql, "params:", normParams);
        try {
            const res = await c.query(normSql, normParams as any[]);
            console.log("[DB:_execute] query finished, rowCount:", res.rowCount);

            let insertId: number | undefined;
            if (/insert/i.test(res.command) && res.rows?.length && res.rows[0].id !== undefined) {
                insertId = Number(res.rows[0].id);
            }

            return {
                rows: res.rows ?? [],
                rowCount: res.rowCount ?? 0,
                command: res.command,
                insertId,
                lastID: insertId, // alias
            };
        } catch (err) {
            console.error("[DB:_execute] query error:", err);
            throw err;
        } finally {
            c.release();
            console.log("[DB:_execute] client released");
        }
    }

    protected async _fetchone<T = any>(sql: string, params?: unknown): Promise<T | null> {
        const { sql: normSql, params: normParams } = queryAdapter("postgres", sql, params);
        const c = await this._get_connection();
        try {
            const res = await c.query(normSql, normParams as any[]);
            return (res.rows?.[0] ?? null) as T | null;
        } finally {
            c.release();
        }
    }

    protected async _fetchall<T = any>(sql: string, params?: unknown): Promise<T[]> {
        const { sql: normSql, params: normParams } = queryAdapter("postgres", sql, params);
        const c = await this._get_connection();
        try {
            const res = await c.query(normSql, normParams as any[]);
            return (res.rows ?? []) as T[];
        } finally {
            c.release();
        }
    }

    protected async _executemany(sql: string, paramSets: unknown[]): Promise<any> {
        let { sql: normSql } = queryAdapter("postgres", sql);

        // ✅ Ensure INSERTs also return IDs
        if (/^\s*insert/i.test(normSql) && !/returning\s+/i.test(normSql)) {
            normSql = normSql.trim().replace(/;?$/, " RETURNING id;");
        }

        const c = await this._get_connection();
        try {
            let total = 0;
            const insertIds: number[] = [];
            for (const p of paramSets) {
                const { params: normParams } = queryAdapter("postgres", sql, p);
                const res = await c.query(normSql, normParams as any[]);
                total += res.rowCount ?? 0;
                if (/insert/i.test(res.command) && res.rows?.length && res.rows[0].id !== undefined) {
                    insertIds.push(Number(res.rows[0].id));
                }
            }
            return { rowCount: total, insertIds, lastID: insertIds[insertIds.length - 1] };
        } finally {
            c.release();
        }
    }

    protected async _begin(): Promise<void>    { await this._execute('BEGIN'); }
    protected async _commit(): Promise<void>   { await this._execute('COMMIT'); }
    protected async _rollback(): Promise<void> { await this._execute('ROLLBACK'); }

    protected async _test_connection(): Promise<boolean> {
        const row = await this._fetchone<{ ok: number }>('SELECT 1 AS ok');
        return !!row && row.ok === 1;
    }
}
