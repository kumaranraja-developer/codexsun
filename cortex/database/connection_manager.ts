// root/cortex/database/connection_manager.ts

import type { Engine, DbConfig } from "./connection";
import {
    getDefaultEngine,
    reloadDefaultEngine,
    hotSwapDefault,
    getNamedEngine,
    hotSwapNamed,
    dropNamed,
} from "./connection";

// Small utility: detect promise-likes
function isPromise<T = any>(v: any): v is Promise<T> {
    return !!v && typeof v.then === "function";
}

// Convert any (sync|async) call into a promise (without double-await issues)
function toPromise<T>(fn: () => T | Promise<T>): Promise<T> {
    try {
        const r = fn();
        return isPromise<T>(r) ? r : Promise.resolve(r);
    } catch (e) {
        return Promise.reject(e);
    }
}

// Best-effort close (sync or async)
async function bestEffortClose(engine: Engine | null | undefined) {
    if (!engine || typeof engine.close !== "function") return;
    try {
        const r = engine.close();
        if (isPromise(r)) await r;
    } catch {
        // swallow
    }
}

// Engine has a high-level transaction handler?
function hasHighLevelTx(engine: Engine): engine is Engine & {
    transaction: <T>(fn: (e: Engine) => T | Promise<T>) => T | Promise<T>;
} {
    return typeof (engine as any).transaction === "function";
}

// Identify available low-level exec method
function pickExec(engine: Engine): ((sql: string, params?: any) => any) | null {
    const anyEng = engine as any;
    if (typeof anyEng.exec === "function") return anyEng.exec.bind(anyEng);
    if (typeof anyEng.query === "function") return anyEng.query.bind(anyEng);
    if (typeof anyEng.execute === "function") return anyEng.execute.bind(anyEng);
    return null;
}

// Identify explicit begin/commit/rollback, if present
function pickTxPrimitives(engine: Engine): {
    begin: ((name?: string) => any) | null;
    commit: (() => any) | null;
    rollback: (() => any) | null;
} {
    const anyEng = engine as any;
    return {
        begin: typeof anyEng.begin === "function" ? anyEng.begin.bind(anyEng) : null,
        commit: typeof anyEng.commit === "function" ? anyEng.commit.bind(anyEng) : null,
        rollback: typeof anyEng.rollback === "function" ? anyEng.rollback.bind(anyEng) : null,
    };
}

export class ConnectionManager {
    private readonly name?: string;
    private _engine: Engine | null = null;

    constructor(name?: string) {
        this.name = name?.trim() || undefined;
    }

    /** Resolve and cache the underlying engine (default or named). */
    private resolve(): Engine {
        if (this._engine) return this._engine;
        this._engine = this.name ? getNamedEngine(this.name) : getDefaultEngine();
        return this._engine;
    }

    /** Access the current engine instance (lazy). */
    getEngine(): Engine {
        return this.resolve();
    }

    /** Optional convenience: execute a raw statement (sync or async engines). */
    async execute(sql: string, params?: any): Promise<any> {
        const eng = this.resolve();
        const exec = pickExec(eng);
        if (!exec) {
            throw new Error("Engine does not expose exec/query/execute");
        }
        const r = exec(sql, params);
        return isPromise(r) ? await r : r;
    }

    /** Close the underlying engine/pool if supported (works for sync or async engines). */
    async close(): Promise<void> {
        await bestEffortClose(this._engine);
        this._engine = null;
    }

    /** Reload from process.env: default uses reloadDefaultEngine; named drops & re-resolves. */
    async reload(): Promise<void> {
        if (this.name) {
            // drop only this named instance and reacquire
            await bestEffortClose(this._engine);
            this._engine = null;
            dropNamed(this.name);
            // re-resolve on next use
            return;
        }
        // default
        await bestEffortClose(this._engine);
        this._engine = await reloadDefaultEngine();
    }

    /** Programmatic hot-swap. Updates env and rebuilds the bound engine. */
    async hotSwap(partial: Partial<DbConfig>): Promise<void> {
        if (this.name) {
            await hotSwapNamed(this.name, partial);
            // refresh local handle
            this._engine = null;
            return;
        }
        await hotSwapDefault(partial);
        this._engine = null;
    }

    /**
     * Synchronous transaction context.
     * - If engine exposes a sync-capable transaction(fn), delegates.
     * - Else emulates with BEGIN/COMMIT/ROLLBACK using a sync exec path.
     * - If the engine only supports async IO, throws an error advising to use transactionAsync.
     */
    transactionSync<T>(fn: (engine: Engine) => T): T {
        const eng = this.resolve();

        // Delegate to engine.transaction if it behaves synchronously
        if (hasHighLevelTx(eng)) {
            const result = (eng as any).transaction(fn);
            if (isPromise(result)) {
                throw new Error(
                    "Engine transaction is async; use transactionAsync instead for this engine."
                );
            }
            return result;
        }

        // Fallback to manual BEGIN/COMMIT/ROLLBACK using a sync exec
        const exec = pickExec(eng);
        if (!exec) throw new Error("Engine does not support exec/query/execute");

        // Probe whether exec is synchronous
        const maybeBegin = exec("BEGIN");
        if (isPromise(maybeBegin)) {
            throw new Error(
                "Engine exec/query is async; transactionSync is not supported. Use transactionAsync."
            );
        }

        try {
            const out = fn(eng);
            const maybeCommit = exec("COMMIT");
            if (isPromise(maybeCommit)) {
                throw new Error(
                    "Engine exec/query changed behavior during tx; expected sync commit."
                );
            }
            return out;
        } catch (err) {
            try {
                const maybeRollback = exec("ROLLBACK");
                if (isPromise(maybeRollback)) {
                    // ignore inconsistent async rollback in sync path
                }
            } catch {
                /* swallow rollback errors */
            }
            throw err;
        }
    }

    /**
     * Asynchronous transaction context.
     * - If engine exposes transaction(fn), delegates and awaits it.
     * - Else emulates with BEGIN/COMMIT/ROLLBACK using async exec path.
     * - For strictly sync engines, throws NotImplementedError.
     */
    async transactionAsync<T>(fn: (engine: Engine) => Promise<T>): Promise<T> {
        const eng = this.resolve();

        // Delegate to engine.transaction if present (assume async-capable)
        if (hasHighLevelTx(eng)) {
            const r = (eng as any).transaction(fn);
            return await toPromise(() => r);
        }

        // Fallback to manual transaction using async exec/query
        const exec = pickExec(eng);
        if (!exec) {
            throw new Error("Engine does not support exec/query/execute");
        }

        // BEGIN (must be async-capable)
        const rBegin = exec("BEGIN");
        if (!isPromise(rBegin)) {
            // If it's sync-only, we can't reliably provide async semantics
            throw Object.assign(
                new Error(
                    "NotImplementedError: Engine appears to be synchronous-only; use transactionSync instead."
                ),
                { name: "NotImplementedError" }
            );
        }
        await rBegin;

        try {
            const out = await fn(eng);
            await exec("COMMIT");
            return out;
        } catch (err) {
            try {
                await exec("ROLLBACK");
            } catch {
                /* swallow rollback errors */
            }
            throw err;
        }
    }
}

// Example usage:
// const connection_manager = new ConnectionManager();
// const dev_connection_manager = new ConnectionManager("DEV");
// const analytics_connection_manager = new ConnectionManager("ANALYTICS");
