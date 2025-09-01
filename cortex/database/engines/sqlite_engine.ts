// cortex/database/engines/sqlite_engine.ts
import Database from 'better-sqlite3';
import type { SQLiteDBConfig } from '../types';
import type { Engine } from '../Engine';
import { queryAdapter, rowsAdapter } from '../queryAdapter'; // shared helpers

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

function normalizeForBetterSqlite(sql: string, params: unknown): CallSig {
    const { qCount, hasNamed } = analyzePlaceholders(sql);
    if (qCount === 0 && !hasNamed) return { kind: 'none' };

    if (hasNamed) {
        if (params && typeof params === 'object' && !Array.isArray(params)) {
            return { kind: 'object', value: params as Record<string, unknown> };
        }
        return { kind: 'object', value: {} };
    }

    if (qCount === 1) {
        if (Array.isArray(params)) return { kind: 'scalar', value: (params as unknown[])[0] };
        if (params && typeof params === 'object') return { kind: 'none' };
        return { kind: 'scalar', value: params };
    }

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

    async connect(): Promise<void> {
        if (this.db) return;
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

    async getConnection(): Promise<unknown> {
        return this._getDb();
    }

    async fetchOne<T = any>(sql: string, params?: unknown): Promise<T | null> {
        const { sql: normSql, params: normParams } = queryAdapter("sqlite", sql, params);
        const db = await this._getDb();
        const stmt = db.prepare(normSql);
        try {
            const call = normalizeForBetterSqlite(normSql, normParams);
            const row =
                call.kind === 'none'   ? stmt.get()
                    : call.kind === 'object' ? stmt.get(call.value)
                        : call.kind === 'scalar' ? stmt.get(call.value)
                            : stmt.get(...call.values);

            const rows = rowsAdapter("sqlite", (row ? [row] : []) as Record<string, any>[]);
            return (rows[0] ?? null) as T | null;
        } catch (err: any) {
            const preview = normParams && typeof normParams === 'object' ? JSON.stringify(normParams) : String(normParams);
            throw new RangeError(`sqlite fetchOne failed: ${err?.message || err}\nsql: ${normSql}\nparams: ${preview}`);
        }
    }

    async fetchAll<T = any>(sql: string, params?: unknown): Promise<T[]> {
        const { sql: normSql, params: normParams } = queryAdapter("sqlite", sql, params);
        const db = await this._getDb();
        const stmt = db.prepare(normSql);
        try {
            const call = normalizeForBetterSqlite(normSql, normParams);
            const rows =
                call.kind === 'none'   ? stmt.all()
                    : call.kind === 'object' ? stmt.all(call.value)
                        : call.kind === 'scalar' ? stmt.all(call.value)
                            : stmt.all(...call.values);

            return rowsAdapter("sqlite", (rows ?? []) as Record<string, any>[]) as T[];
        } catch (err: any) {
            const preview = normParams && typeof normParams === 'object' ? JSON.stringify(normParams) : String(normParams);
            throw new RangeError(`sqlite fetchAll failed: ${err?.message || err}\nsql: ${normSql}\nparams: ${preview}`);
        }
    }

    async execute(sql: string, params?: unknown): Promise<any> {
        const { sql: normSql, params: normParams } = queryAdapter("sqlite", sql, params);
        const db = await this._getDb();
        const stmt = db.prepare(normSql);

        try {
            const call = normalizeForBetterSqlite(normSql, normParams);

            // 🔑 Detect SELECT queries
            if (/^\s*select/i.test(normSql)) {
                const rows =
                    call.kind === 'none'   ? stmt.all()
                        : call.kind === 'object' ? stmt.all(call.value)
                            : call.kind === 'scalar' ? stmt.all(call.value)
                                : stmt.all(...call.values);

                const adapted = rowsAdapter("sqlite", (rows ?? []) as Record<string, any>[]);
                return { rows: adapted, rowCount: adapted.length };
            }

            // Non-SELECT → run()
            const info =
                call.kind === 'none'   ? stmt.run()
                    : call.kind === 'object' ? stmt.run(call.value)
                        : call.kind === 'scalar' ? stmt.run(call.value)
                            : stmt.run(...call.values);

            return {
                rows: [],
                rowCount: typeof (info as any)?.changes === 'number' ? info.changes : 0,
                changes: (info as any)?.changes ?? 0,
                lastID: info?.lastInsertRowid !== undefined ? Number(info.lastInsertRowid) : undefined,
                insertId: info?.lastInsertRowid !== undefined ? Number(info.lastInsertRowid) : undefined, // alias
            };
        } catch (err: any) {
            const preview = normParams && typeof normParams === 'object'
                ? JSON.stringify(normParams)
                : String(normParams);
            throw new RangeError(
                `sqlite execute failed: ${err?.message || err}\nsql: ${normSql}\nparams: ${preview}`
            );
        }
    }

    async executeMany(sql: string, paramSets: unknown[]): Promise<any> {
        const { sql: normSql } = queryAdapter("sqlite", sql);
        const db = await this._getDb();
        const stmt = db.prepare(normSql);

        // 🔑 Detect SELECT queries
        if (/^\s*select/i.test(normSql)) {
            const allRows: any[] = [];
            for (const raw of paramSets) {
                const { params: normParams } = queryAdapter("sqlite", sql, raw);
                const call = normalizeForBetterSqlite(normSql, normParams);
                const rows =
                    call.kind === 'none'   ? stmt.all()
                        : call.kind === 'object' ? stmt.all(call.value)
                            : call.kind === 'scalar' ? stmt.all(call.value)
                                : stmt.all(...call.values);
                allRows.push(...rows);
            }
            const adapted = rowsAdapter("sqlite", allRows as Record<string, any>[]);
            return { rows: adapted, rowCount: adapted.length };
        }

        // Non-SELECT → batch run() inside a transaction
        let total = 0;
        let lastID: number | undefined = undefined;

        const tx = db.transaction((sets: unknown[]) => {
            for (const raw of sets) {
                const { params: normParams } = queryAdapter("sqlite", sql, raw);
                const call = normalizeForBetterSqlite(normSql, normParams);
                const info =
                    call.kind === 'none'   ? stmt.run()
                        : call.kind === 'object' ? stmt.run(call.value)
                            : call.kind === 'scalar' ? stmt.run(call.value)
                                : stmt.run(...call.values);
                total += info?.changes ?? 0;
                if ((info as any)?.lastInsertRowid !== undefined) {
                    lastID = Number((info as any).lastInsertRowid);
                }
            }
        });

        try {
            tx(paramSets);
        } catch (err: any) {
            const sample = paramSets.length
                ? (typeof paramSets[0] === 'object' ? JSON.stringify(paramSets[0]) : String(paramSets[0]))
                : '[]';
            throw new RangeError(
                `sqlite executeMany failed: ${err?.message || err}\nsql: ${normSql}\nfirst param: ${sample}`
            );
        }

        return {
            rows: [],
            rowCount: total,
            changes: total,
            lastID,
            insertId: lastID, // alias
        };
    }



    async begin(): Promise<void>    { const db = await this._getDb(); db.prepare('BEGIN').run(); }
    async commit(): Promise<void>   { const db = await this._getDb(); db.prepare('COMMIT').run(); }
    async rollback(): Promise<void> { const db = await this._getDb(); db.prepare('ROLLBACK').run(); }

    private async _getDb(): Promise<Database.Database> {
        if (!this.db) await this.connect();
        return this.db!;
    }
}
