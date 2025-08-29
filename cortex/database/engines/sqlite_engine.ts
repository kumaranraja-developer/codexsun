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

    protected async _execute(sql: string, params?: unknown): Promise<number | null> {
        const db = await this._get_connection();
        const stmt = db.prepare(sql);
        const norm = normalizeParamsForSqlite(sql, params);
        const info = norm.kind === 'none'
            ? stmt.run()
            : norm.kind === 'array'
                ? stmt.run(norm.value)
                : norm.kind === 'object'
                    ? stmt.run(norm.value)
                    : stmt.run(norm.value); // scalar
        return typeof (info as any)?.changes === 'number' ? (info as any).changes : null;
    }

    protected async _executemany(sql: string, paramSets: unknown[]): Promise<number | null> {
        const db = await this._get_connection();
        const stmt = db.prepare(sql);
        let total = 0;

        const tx = db.transaction((sets: unknown[]) => {
            for (const raw of sets) {
                const norm = normalizeParamsForSqlite(sql, raw);
                const info =
                    norm.kind === 'none' ? stmt.run() :
                        norm.kind === 'array' ? stmt.run(norm.value) :
                            norm.kind === 'object' ? stmt.run(norm.value) :
                                stmt.run(norm.value); // scalar
                total += info?.changes ?? 0;
            }
        });
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

function analyzePlaceholders(sql: string) {
    // NOTE: does not handle strings/comments; fine for simple smoke SQL.
    const qCount = (sql.match(/\?/g) || []).length;
    const hasNamed = /[@:$][A-Za-z_][A-Za-z0-9_]*/.test(sql);
    return {qCount, hasNamed};
}

type Norm =
    | { kind: 'none' }
    | { kind: 'scalar'; value: unknown }
    | { kind: 'array'; value: unknown[] }
    | { kind: 'object'; value: Record<string, unknown> };

function normalizeParamsForSqlite(sql: string, params: unknown): Norm {
    const {qCount, hasNamed} = analyzePlaceholders(sql);

    // No placeholders: ignore any provided params.
    if (qCount === 0 && !hasNamed) return {kind: 'none'};

    // Named params mode
    if (hasNamed) {
        if (params && typeof params === 'object' && !Array.isArray(params)) {
            return {kind: 'object', value: params as Record<string, unknown>};
        }
        // If caller sent a scalar/array to a named statement, coerce to {} so we don't error.
        return {kind: 'object', value: {}};
    }

    // Positional '?' mode
    if (qCount === 1) {
        // Single '?': pass scalar. If array given, use its first element.
        if (Array.isArray(params)) return {kind: 'scalar', value: (params as any[])[0]};
        if (params && typeof params === 'object') {
            // object to single '?': ignore (or choose a value); safest is no param
            return {kind: 'none'};
        }
        return {kind: 'scalar', value: params};
    }

    // Multiple '?': expect array length >= qCount; if scalar/object given, wrap or noop.
    if (Array.isArray(params)) return {kind: 'array', value: params as any[]};
    if (params && typeof params === 'object') return {kind: 'array', value: Object.values(params as any)};
    return {kind: 'array', value: [params]};
}