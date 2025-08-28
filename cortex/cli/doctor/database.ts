// cortex/commands/doctor/database.ts
//
// One-shot Database Doctor
// - No watchers, no globals that keep the event loop alive
// - Returns a normalized result shape for boot.ts to print
//
// Exported API:
//   - doctorDatabase(settings)
//   - default export doctorDatabase

import { connectionManager } from "../../database/connection_manager";

type DoctorResult = {
    ok: boolean;
    engine?: string;
    code?: string;
    detail?: string;
};

type MaybeEngine = {
    close?: () => Promise<void>;
    // optional health methods across engines
    healthCheck?: () => Promise<{ ok: boolean; code?: string; detail?: string }>;
    _test_connection?: () => Promise<boolean>;
    fetchall?: <T = any>(sql: string, params?: unknown) => Promise<T[]>;
};

function pickError(err: any): { code?: string; detail?: string } {
    // Normalize common MariaDB/mysql2/Postgres error shapes
    const code = err?.code ?? err?.errno ?? err?.name ?? err?.sqlState;
    const detail =
        err?.detail ??
        err?.sqlMessage ??
        err?.message ??
        (typeof err === "string" ? err : JSON.stringify(err));
    return { code, detail };
}

async function tryHealth(engine: MaybeEngine): Promise<DoctorResult> {
    // Prefer explicit healthCheck if present
    if (typeof engine.healthCheck === "function") {
        try {
            const r = await engine.healthCheck();
            return { ok: !!r?.ok, code: r?.code, detail: r?.detail };
        } catch (e: any) {
            return { ok: false, ...pickError(e) };
        }
    }

    // Fallback to _test_connection if available
    if (typeof engine._test_connection === "function") {
        try {
            const ok = await engine._test_connection();
            return { ok: !!ok };
        } catch (e: any) {
            return { ok: false, ...pickError(e) };
        }
    }

    // Last resort: SELECT 1
    if (typeof engine.fetchall === "function") {
        try {
            await engine.fetchall("SELECT 1");
            return { ok: true };
        } catch (e: any) {
            return { ok: false, ...pickError(e) };
        }
    }

    return { ok: false, detail: "No supported health method on engine" };
}

/** Optional: guard against drivers that hang on connect */
function withTimeout<T>(p: Promise<T>, ms: number, label = "database check"): Promise<T> {
    let t: NodeJS.Timeout;
    const timeout = new Promise<never>((_, rej) => {
        t = setTimeout(() => rej(new Error(`${label} timed out after ${ms}ms`)), ms);
    });
    return Promise.race([p, timeout]).finally(() => clearTimeout(t!));
}

export async function doctorDatabase(settings: any): Promise<DoctorResult> {
    let engine: MaybeEngine | null = null;
    const engineName = settings?.DB_ENGINE ?? "unknown";

    try {
        // Build engine *without* starting any watchers
        engine = await (connectionManager as any).getEngineFromSettings(settings);

        // Run the health check with a short timeout (e.g., 6s)
        const res = await withTimeout(tryHealth(engine), 6000, "database health check");
        return { engine: engineName, ...res };
    } catch (e: any) {
        return { ok: false, engine: engineName, ...pickError(e) };
    } finally {
        try {
            await engine?.close?.();
        } catch {
            /* ignore */
        }
    }
}

export default doctorDatabase;
