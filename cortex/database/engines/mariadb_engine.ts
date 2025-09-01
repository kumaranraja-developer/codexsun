import { BaseEngine } from '../Engine';
import type { NetworkDBConfig } from '../types';
import mariadb, { Pool, PoolConnection } from 'mariadb';
import { queryAdapter } from '../queryAdapter'; // shared logic

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

    protected async _execute(sql: string, params?: unknown): Promise<any> {
        const { sql: normSql, params: normParams } = queryAdapter("mariadb", sql, params);
        const conn = await this._get_connection();
        try {
            const res: any = await conn.query(normSql, normParams as any);

            // Normalize: mariadb returns insertId + affectedRows
            const rows = Array.isArray(res) ? res : [];
            const insertId = res?.insertId !== undefined ? Number(res.insertId) : undefined;

            return {
                rows,
                rowCount: rows.length,
                affectedRows: res?.affectedRows ?? 0,
                insertId,
                lastID: insertId, // alias for consistency
            };
        } finally {
            conn.release();
        }
    }

    protected async _fetchone<T = any>(sql: string, params?: unknown): Promise<T | null> {
        const result = await this._execute(sql, params);
        return (result.rows?.[0] ?? null) as T | null;
    }

    protected async _fetchall<T = any>(sql: string, params?: unknown): Promise<T[]> {
        const result = await this._execute(sql, params);
        return (result.rows ?? []) as T[];
    }

    protected async _executemany(sql: string, paramSets: unknown[]): Promise<any> {
        const { sql: normSql } = queryAdapter("mariadb", sql);
        const conn = await this._get_connection();
        try {
            let total = 0;
            const insertIds: number[] = [];
            for (const p of paramSets) {
                const { params: normParams } = queryAdapter("mariadb", sql, p);
                const res: any = await conn.query(normSql, normParams as any);
                total += res?.affectedRows ?? 0;
                if (res?.insertId !== undefined) {
                    insertIds.push(Number(res.insertId));
                }
            }
            return { rowCount: total, insertIds, lastID: insertIds[insertIds.length - 1] };
        } finally {
            conn.release();
        }
    }

    protected async _begin(): Promise<void> {
        await this._execute("BEGIN");
    }
    protected async _commit(): Promise<void> {
        await this._execute("COMMIT");
    }
    protected async _rollback(): Promise<void> {
        await this._execute("ROLLBACK");
    }

    protected async _test_connection(): Promise<boolean> {
        const row = await this._fetchone<{ ok: number }>("SELECT 1 AS ok");
        return !!row && row.ok === 1;
    }
}
