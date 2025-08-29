import {BaseEngine} from '../Engine';
import type {SQLiteDBConfig} from '../types';
import Database from 'better-sqlite3';

export class SQLiteEngine extends BaseEngine {
    private cfg: SQLiteDBConfig;
    private db: Database.Database | null = null;

    constructor(cfg: SQLiteDBConfig) {
        super({profile: cfg.profile, driver: 'sqlite', cfgKey: cfg.cfgKey});
        this.cfg = cfg;
    }

    protected async _connect(): Promise<void> {
        if (this.db) return;
        this.db = new Database(this.cfg.file, {fileMustExist: false});
    }

    protected async _close(): Promise<void> {
        if (!this.db) return;
        this.db.close();
        this.db = null;
    }

    protected async _get_connection(): Promise<Database.Database> {
        if (!this.db) await this._connect();
        return this.db!;
    }

    protected async _execute(sql: string, params?: unknown): Promise<number | null> {
        const db = await this._get_connection();
        const info = db.prepare(sql).run(params as any);
        return typeof (info as any)?.changes === 'number' ? (info as any).changes : null;
    }

    protected async _fetchone<T = any>(sql: string, params?: unknown): Promise<T | null> {
        const db = await this._get_connection();
        const row = db.prepare(sql).get(params as any);
        return (row ?? null) as T | null;
    }

    protected async _fetchall<T = any>(sql: string, params?: unknown): Promise<T[]> {
        const db = await this._get_connection();
        const rows = db.prepare(sql).all(params as any);
        return rows as T[];
    }

    protected async _executemany(sql: string, paramSets: unknown[]): Promise<number | null> {
        const db = await this._get_connection();
        const stmt = db.prepare(sql);
        let total = 0;

        const runOne = (p: unknown) => {
            if (Array.isArray(p)) {
                const info = stmt.run(p); // array tuple
                total += info?.changes ?? 0;
            } else if (p && typeof p === 'object') {
                const info = stmt.run(p as Record<string, unknown>); // named params
                total += info?.changes ?? 0;
            } else {
                const info = stmt.run(p as any); // scalar
                total += info?.changes ?? 0;
            }
        };

        const tx = db.transaction((sets: unknown[]) => { for (const p of sets) runOne(p); });
        tx(paramSets);
        return total;
    }

    protected async _begin(): Promise<void> {
        await this._execute('BEGIN');
    }

    protected async _commit(): Promise<void> {
        await this._execute('COMMIT');
    }

    protected async _rollback(): Promise<void> {
        await this._execute('ROLLBACK');
    }

    protected async _test_connection(): Promise<boolean> {
        const row = await this._fetchone<{ ok: number }>('SELECT 1 AS ok');
        return !!row && row.ok === 1;
    }
}
