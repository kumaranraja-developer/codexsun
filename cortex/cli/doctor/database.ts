// cortex/commands/doctor/database.ts
//
// One-shot Database Doctor (ESM-safe):
// - Imports connection_manager regardless of export shape (named/default)
// - Builds engine, runs fast health, closes pool
// - Returns { ok, engine, code?, detail? } without exiting the process

type DoctorResult = {
    ok: boolean;
    engine?: string;
    code?: string;
    detail?: string;
};

type MaybeEngine = {
    close?: () => Promise<void>;
    healthCheck?: () => Promise<{ ok: boolean; code?: string; detail?: string }>;
    _test_connection?: () => Promise<boolean>;
    fetchall?: <T = any>(sql: string, params?: unknown) => Promise<T[]>;
};

function pickError(err: any): { code?: string; detail?: string } {
    const code = err?.code ?? err?.errno ?? err?.name ?? err?.sqlState;
    const detail =
        err?.detail ??
        err?.sqlMessage ??
        err?.message ??
        (typeof err === "string" ? err : JSON.stringify(err));
    return { code, detail };
}

async function getConnectionManager(): Promise<any> {
    const mod: any = await import("../../database/connection_manager");
    // Accept any of these shapes:
    //   export const connectionManager = { … }
    //   export default { … }
    //   module.exports = { … } (transpiled)
    return mod.connectionManager ?? mod.default ?? mod;
}

async function tryHealth(engine: MaybeEngine): Promise<DoctorResult> {
    if (typeof engine.healthCheck === "function") {
        try {
            const r = await engine.healthCheck();
            return { ok: !!r?.ok, code: r?.code, detail: r?.detail };
        } catch (e: any) {
            return { ok: false, ...pickError(e) };
        }
    }

    if (typeof engine._test_connection === "function") {
        try {
            const ok = await engine._test_connection();
            return { ok: !!ok };
        } catch (e: any) {
            return { ok: false, ...pickError(e) };
        }
    }

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

function withTimeout<T>(p: Promise<T>, ms: number, label = "database health check"): Promise<T> {
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
        const cm = await getConnectionManager();
        if (typeof cm.getEngineFromSettings !== "function") {
            return { ok: false, engine: engineName, detail: "connection_manager.getEngineFromSettings not found" };
        }

        engine = await cm.getEngineFromSettings(settings);

        const res = await withTimeout(tryHealth(engine), 6000, "database health check");
        return { engine: engineName, ...res };
    } catch (e: any) {
        return { ok: false, engine: engineName, ...pickError(e) };
    } finally {
        try { await engine?.close?.(); } catch {}
    }
}

export default doctorDatabase;
