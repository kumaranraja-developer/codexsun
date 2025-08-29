// cortex/database/engines/sqlite_engine.ts
import Database from 'better-sqlite3';
import type { SQLiteDBConfig } from '../types';
import type { Engine, MaybePromise } from '../Engine';

/**
 * Analyze placeholders in a SQL string.
 * - qCount: number of positional '?' placeholders
 * - hasNamed: whether named placeholders like @id, :id, $id exist
 */
function analyzePlaceholders(sql: string) {
    const qCount = (sql.match(/\?/g) || []).length;
    const hasNamed = /[@:$][A-Za-z_][A-Za-z0-9_]*/.test(sql);
    return { qCount, hasNamed };
}

type CallSig =
    | { kind: 'none' }
    | { kind: 'scalar'; value: unknown }
    | { kind: 'object'; value: Record<string, unknown> }
    | { kind: 'spread'; values: unknown[] };

/** Normalize params so we call better-sqlite3 with the correct signature. */
function normalizeForBetterSqlite(sql: string, params: unknown): CallSig {
    const { qCount, hasNamed } = analyzePlaceholders(sql);

    // No placeholders → must call with no args
    if (qCount === 0 && !hasNamed) return { kind: 'none' };

    // Named placeholders → require an object map
    if (hasNamed) {
        if (params && typeof params === 'object' && !Array.isArray(params)) {
            return { kind: 'object', value: params as Record<string, unknown> };
        }
        return { kind: 'object', value: {} }; // safest fallback
    }

    // Positional '?'
    if (qCount === 1) {
        if (Array.isArray(params)) return { kind: 'scalar', value: (params as unknown[])[0] };
        if (params && typeof params === 'object') return { kind: 'none' }; // don't bind objects to single '?'
        return { kind: 'scalar', value: params };
    }

    // 2+ '?' → spread an array
    if (Array.isArray(params)) return { kind: 'spread', values: params as unknown[] };
    if (params && typeof params === 'object') return { kind: 'spread', values: Object.values(params as any) };
    return { kind: 'spread', values: [params] };
}

export class SQLiteEngine implements Engine {
    readonly profile: string;
    readonly driver: 'sqlite' = 'sqlite';
    readonly cfgKey: string;

    private cfg: SQLiteDBConfig;
    private db: Database.Database | null = null;

    constructor(cfg: SQLiteDBConfig) {
        this.cfg = cfg;
        this.profile = cfg.profile;
        this.cfgKey = cfg.cfgKey;
    }

    // Lifecycle
    async connect(): Promise<void> {
        if (this.db) return;
        // fileMustExist:false so it creates if missing
        this.db = new Database(this.cfg.file, { fileMustExist: false });
    }

    async close(): Promise<void> {
        if (!this.db) return;
        this.db.close();
        this.db = null;
    }

    async testConnection(): Promise<boolean> {
        const db = await this._getDb();
        const row = db.prepare('SELECT 1 AS ok').get() as { ok: number } | undefined;
        return !!row && row.ok === 1;
    }

    // Low-level
    async getConnection(): Promise<unknown> {
        return this._getDb();
    }

    // Exec
    async execute(sql: string, params?: unknown): Promise<number | null> {
        const db = await this._getDb();
        const stmt = db.prepare(sql);
        try {
            const call = normalizeForBetterSqlite(sql, params);
            const info =
                call.kind === 'none'   ? stmt.run()
                    : call.kind === 'object' ? stmt.run(call.value)
                        : call.kind === 'scalar' ? stmt.run(call.value)
                            : stmt.run(...call.values);
            return typeof (info as any)?.changes === 'number' ? (info as any).changes : null;
        } catch (err: any) {
            const preview = params && typeof params === 'object' ? JSON.stringify(params) : String(params);
            throw new RangeError(`sqlite execute failed: ${err?.message || err}\nsql: ${sql}\nparams: ${preview}`);
        }
    }

    async fetchOne<T = any>(sql: string, params?: unknown): Promise<T | null> {
        const db = await this._getDb();
        const stmt = db.prepare(sql);
        try {
            const call = normalizeForBetterSqlite(sql, params);
            const row =
                call.kind === 'none'   ? stmt.get()
                    : call.kind === 'object' ? stmt.get(call.value)
                        : call.kind === 'scalar' ? stmt.get(call.value)
                            : stmt.get(...call.values);
            return (row ?? null) as T | null;
        } catch (err: any) {
            const preview = params && typeof params === 'object' ? JSON.stringify(params) : String(params);
            throw new RangeError(`sqlite fetchOne failed: ${err?.message || err}\nsql: ${sql}\nparams: ${preview}`);
        }
    }

    async fetchAll<T = any>(sql: string, params?: unknown): Promise<T[]> {
        const db = await this._getDb();
        const stmt = db.prepare(sql);
        try {
            const call = normalizeForBetterSqlite(sql, params);
            const rows =
                call.kind === 'none'   ? stmt.all()
                    : call.kind === 'object' ? stmt.all(call.value)
                        : call.kind === 'scalar' ? stmt.all(call.value)
                            : stmt.all(...call.values);
            return (rows ?? []) as T[];
        } catch (err: any) {
            const preview = params && typeof params === 'object' ? JSON.stringify(params) : String(params);
            throw new RangeError(`sqlite fetchAll failed: ${err?.message || err}\nsql: ${sql}\nparams: ${preview}`);
        }
    }

    async executeMany(sql: string, paramSets: unknown[]): Promise<number | null> {
        const db = await this._getDb();
        const stmt = db.prepare(sql);
        let total = 0;

        const tx = db.transaction((sets: unknown[]) => {
            for (const raw of sets) {
                const call = normalizeForBetterSqlite(sql, raw);
                const info =
                    call.kind === 'none'   ? stmt.run()
                        : call.kind === 'object' ? stmt.run(call.value)
                            : call.kind === 'scalar' ? stmt.run(call.value)
                                : stmt.run(...call.values);
                total += info?.changes ?? 0;
            }
        });

        try {
            tx(paramSets);
        } catch (err: any) {
            const sample = paramSets.length
                ? (typeof paramSets[0] === 'object' ? JSON.stringify(paramSets[0]) : String(paramSets[0]))
                : '[]';
            throw new RangeError(`sqlite executeMany failed: ${err?.message || err}\nsql: ${sql}\nfirst param: ${sample}`);
        }
        return total;
    }

    // Transactions
    async begin(): Promise<void>    { const db = await this._getDb(); db.prepare('BEGIN').run(); }
    async commit(): Promise<void>   { const db = await this._getDb(); db.prepare('COMMIT').run(); }
    async rollback(): Promise<void> { const db = await this._getDb(); db.prepare('ROLLBACK').run(); }

    // internal
    private async _getDb(): Promise<Database.Database> {
        if (!this.db) await this.connect();
        return this.db!;
    }
}
