import { BaseEngine } from '../Engine';
import type { NetworkDBConfig } from '../types';
import { Pool, PoolClient } from 'pg';

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

    protected async _execute(sql: string, params?: unknown): Promise<number | null> {
        const c = await this._get_connection();
        try {
            const res = await c.query(sql, params as any[]);
            return typeof res.rowCount === 'number' ? res.rowCount : null;
        } finally {
            c.release();
        }
    }

    protected async _fetchone<T = any>(sql: string, params?: unknown): Promise<T | null> {
        const c = await this._get_connection();
        try {
            const res = await c.query(sql, params as any[]);
            return (res.rows?.[0] ?? null) as T | null;
        } finally {
            c.release();
        }
    }

    protected async _fetchall<T = any>(sql: string, params?: unknown): Promise<T[]> {
        const c = await this._get_connection();
        try {
            const res = await c.query(sql, params as any[]);
            return (res.rows ?? []) as T[];
        } finally {
            c.release();
        }
    }

    protected async _executemany(sql: string, paramSets: unknown[]): Promise<number | null> {
        const c = await this._get_connection();
        try {
            let total = 0;
            for (const p of paramSets) {
                const res = await c.query(sql, p as any[]);
                total += res.rowCount ?? 0;
            }
            return total;
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
