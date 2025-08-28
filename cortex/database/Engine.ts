// root/cortex/database/Engine.ts

import type { DbConfig } from "./connection";

/** Utility: a value that may be sync or async */
export type MaybePromise<T> = T | Promise<T>;

export type ExecuteStage = "before_execute" | "after_execute";

export type ExecutePayload = {
    sql: string;
    params?: unknown;
    startedAt?: number;
    endedAt?: number;
    durationMs?: number;
    rowsAffected?: number | null;
    resultSample?: unknown; // engine may attach a small preview if desired
    error?: unknown;
    engine: EngineBase;
};

export type ExecuteHook = (payload: ExecutePayload) => MaybePromise<void>;

/** Convert any sync/async return into a Promise without double-await pitfalls */
function toPromise<T>(fn: () => MaybePromise<T>): Promise<T> {
    try {
        const r = fn();
        return r instanceof Promise ? r : Promise.resolve(r);
    } catch (e) {
        return Promise.reject(e);
    }
}

/**
 * Abstract base for all database engines.
 * Implements hook registration and public wrappers that call
 * engine-specific protected methods you must implement.
 */
export abstract class EngineBase {
    protected readonly config: DbConfig;

    private beforeExecuteHooks: ExecuteHook[] = [];
    private afterExecuteHooks: ExecuteHook[] = [];

    constructor(cfg: DbConfig) {
        this.config = cfg;
    }

    // ───────────────────────────────────────────────────────────────────────────
    // Hook API
    // ───────────────────────────────────────────────────────────────────────────

    /** Replace the list of "before execute" hooks (set to empty to clear). */
    set_before_execute_hook(...hooks: ExecuteHook[]) {
        this.beforeExecuteHooks = [...hooks];
    }

    /** Replace the list of "after execute" hooks (set to empty to clear). */
    set_after_execute_hook(...hooks: ExecuteHook[]) {
        this.afterExecuteHooks = [...hooks];
    }

    /** Run registered hooks for a stage, ignoring individual hook failures. */
    protected async run_hooks(stage: ExecuteStage, payload: ExecutePayload): Promise<void> {
        const list = stage === "before_execute" ? this.beforeExecuteHooks : this.afterExecuteHooks;
        for (const hook of list) {
            try {
                const r = hook(payload);
                if (r instanceof Promise) await r;
            } catch {
                // swallow hook errors by design; engines should not fail due to hooks
            }
        }
    }

    // ───────────────────────────────────────────────────────────────────────────
    // Lifecycle (public)
    // ───────────────────────────────────────────────────────────────────────────

    /** Establish a database connection (pool or handle). */
    async connect(): Promise<void> {
        await toPromise(() => this._connect());
    }

    /** Close the active connection/pool. Best-effort; should be idempotent. */
    async close(): Promise<void> {
        await toPromise(() => this._close());
    }

    /** Health check — true if the DB is reachable and ready. */
    async test_connection(): Promise<boolean> {
        return await toPromise(() => this._test_connection());
    }

    // ───────────────────────────────────────────────────────────────────────────
    // Execution (public, hook-aware)
    // ───────────────────────────────────────────────────────────────────────────

    /** Execute a write operation (INSERT/UPDATE/DELETE). Returns rows affected if available. */
    async execute(sql: string, params?: unknown): Promise<number | null> {
        const payload: ExecutePayload = { sql, params, engine: this, rowsAffected: null };
        const start = Date.now();

        await this.run_hooks("before_execute", payload);

        try {
            const rows = await toPromise(() => this._execute(sql, params));
            payload.rowsAffected = rows ?? null;
            return rows ?? null;
        } catch (err) {
            payload.error = err;
            throw err;
        } finally {
            payload.startedAt = start;
            payload.endedAt = Date.now();
            payload.durationMs = payload.endedAt - start;
            await this.run_hooks("after_execute", payload);
        }
    }

    /** Execute a SELECT and return a single row (or null if none). */
    async fetchone<T = any>(sql: string, params?: unknown): Promise<T | null> {
        const payload: ExecutePayload = { sql, params, engine: this };
        const start = Date.now();
        await this.run_hooks("before_execute", payload);

        try {
            const row = await toPromise(() => this._fetchone<T>(sql, params));
            payload.resultSample = row ?? null;
            return (row as T) ?? null;
        } catch (err) {
            payload.error = err;
            throw err;
        } finally {
            payload.startedAt = start;
            payload.endedAt = Date.now();
            payload.durationMs = payload.endedAt - start;
            await this.run_hooks("after_execute", payload);
        }
    }

    /** Execute a SELECT and return all rows (possibly empty array). */
    async fetchall<T = any>(sql: string, params?: unknown): Promise<T[]> {
        const payload: ExecutePayload = { sql, params, engine: this };
        const start = Date.now();
        await this.run_hooks("before_execute", payload);

        try {
            const rows = await toPromise(() => this._fetchall<T>(sql, params));
            payload.resultSample = Array.isArray(rows) ? rows.slice(0, 1) : rows;
            return (rows as T[]) ?? [];
        } catch (err) {
            payload.error = err;
            throw err;
        } finally {
            payload.startedAt = start;
            payload.endedAt = Date.now();
            payload.durationMs = payload.endedAt - start;
            await this.run_hooks("after_execute", payload);
        }
    }

    /** Execute a bulk write with multiple param sets. Returns total rows affected if known. */
    async executemany(sql: string, paramSets: unknown[]): Promise<number | null> {
        const payload: ExecutePayload = { sql, params: paramSets, engine: this, rowsAffected: null };
        const start = Date.now();
        await this.run_hooks("before_execute", payload);

        try {
            const rows = await toPromise(() => this._executemany(sql, paramSets));
            payload.rowsAffected = rows ?? null;
            return rows ?? null;
        } catch (err) {
            payload.error = err;
            throw err;
        } finally {
            payload.startedAt = start;
            payload.endedAt = Date.now();
            payload.durationMs = payload.endedAt - start;
            await this.run_hooks("after_execute", payload);
        }
    }

    // ───────────────────────────────────────────────────────────────────────────
    // Transactions (public)
    // These delegate to engine-specific primitives. Engines that do not support
    // transactions should throw a descriptive error in their implementations.
    // ───────────────────────────────────────────────────────────────────────────

    async begin(): Promise<void> {
        await toPromise(() => this._begin());
    }

    async commit(): Promise<void> {
        await toPromise(() => this._commit());
    }

    async rollback(): Promise<void> {
        await toPromise(() => this._rollback());
    }

    /**
     * Optional high-level transaction helper that concrete engines may override
     * to offer native context-managed semantics. The ConnectionManager will
     * auto-detect and delegate to this when present.
     */
    async transaction<T>(fn: (eng: this) => MaybePromise<T>): Promise<T> {
        await this.begin();
        try {
            const out = await toPromise(() => fn(this));
            await this.commit();
            return out;
        } catch (e) {
            try { await this.rollback(); } catch { /* ignore */ }
            throw e;
        }
    }

    // ───────────────────────────────────────────────────────────────────────────
    // Protected engine-specific implementations (sync OR async allowed)
    // ───────────────────────────────────────────────────────────────────────────

    protected abstract _connect(): MaybePromise<void>;
    protected abstract _close(): MaybePromise<void>;

    protected abstract _execute(sql: string, params?: unknown): MaybePromise<number | null>;
    protected abstract _fetchone<T = any>(sql: string, params?: unknown): MaybePromise<T | null>;
    protected abstract _fetchall<T = any>(sql: string, params?: unknown): MaybePromise<T[]>;
    protected abstract _executemany(sql: string, paramSets: unknown[]): MaybePromise<number | null>;

    protected abstract _begin(): MaybePromise<void>;
    protected abstract _commit(): MaybePromise<void>;
    protected abstract _rollback(): MaybePromise<void>;

    protected abstract _test_connection(): MaybePromise<boolean>;
}
