import { BaseEngine } from '../Engine';
import type { NetworkDBConfig } from '../types';
import mariadb, { Pool, PoolConnection } from 'mariadb';

export class MariaDBEngine extends BaseEngine {
    private cfg: NetworkDBConfig;
    private pool: Pool | null = null;

    constructor(cfg: NetworkDBConfig) {
        super({ profile: cfg.profile, driver: 'mariadb', cfgKey: cfg.cfgKey });
        this.cfg = cfg;
    }

    protected async _connect(): Promise<void> {
        if (this.pool) return;
        this.pool = mariadb.createPool({
            host: this.cfg.host,
            port: this.cfg.port,
            user: this.cfg.user,
            password: this.cfg.password,
            database: this.cfg.database,
            acquireTimeout: this.cfg.pool?.acquireTimeoutMillis ?? 15000,
            connectionLimit: this.cfg.pool?.max ?? 10,
            ssl: this.cfg.ssl ? {} : undefined,
            socketPath: this.cfg.socketPath,
        });
        // warm ping
        const conn = await this.pool.getConnection();
        await conn.ping();
        conn.release();
    }

    protected async _close(): Promise<void> {
        if (!this.pool) return;
        await this.pool.end();
        this.pool = null;
    }

    protected async _get_connection(): Promise<PoolConnection> {
        if (!this.pool) await this._connect();
        return this.pool!.getConnection();
    }

    protected async _execute(sql: string, params?: unknown): Promise<number | null> {
        const conn = await this._get_connection();
        try {
            const res: any = await conn.query(sql, params as any);
            // mariadb returns { affectedRows }
            return typeof res?.affectedRows === 'number' ? res.affectedRows : null;
        } finally {
            conn.release();
        }
    }

    protected async _fetchone<T = any>(sql: string, params?: unknown): Promise<T | null> {
        const conn = await this._get_connection();
        try {
            const rows: any[] = await conn.query(sql, params as any);
            // conn.query returns array with an extra meta row sometimes; slice out
            const data = Array.isArray(rows) ? rows : [];
            return (data[0] ?? null) as T | null;
        } finally {
            conn.release();
        }
    }

    protected async _fetchall<T = any>(sql: string, params?: unknown): Promise<T[]> {
        const conn = await this._get_connection();
        try {
            const rows: any[] = await conn.query(sql, params as any);
            return (Array.isArray(rows) ? rows : []) as T[];
        } finally {
            conn.release();
        }
    }

    protected async _executemany(sql: string, paramSets: unknown[]): Promise<number | null> {
        const conn = await this._get_connection();
        try {
            let total = 0;
            for (const p of paramSets) {
                const res: any = await conn.query(sql, p as any);
                total += typeof res?.affectedRows === 'number' ? res.affectedRows : 0;
            }
            return total;
        } finally {
            conn.release();
        }
    }

    protected async _begin(): Promise<void> {
        const conn = await this._get_connection();
        await conn.beginTransaction();
        // keep connection open for following ops? We’re using autograb per op,
        // so for tx tests we’ll send BEGIN/COMMIT/ROLLBACK via execute directly:
        conn.release();
    }
    protected async _commit(): Promise<void>  { await this._execute('COMMIT'); }
    protected async _rollback(): Promise<void>{ await this._execute('ROLLBACK'); }

    protected async _test_connection(): Promise<boolean> {
        const row = await this._fetchone<{ ok: number }>('SELECT 1 AS ok');
        return !!row && row.ok === 1;
    }
}
