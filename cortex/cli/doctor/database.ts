// cortex/commands/doctor/database.ts
//
// Database Doctor:
// - Can be used programmatically (doctorDatabase(settings))
// - Or as a CLI (runDoctorDatabase with no args)
// - Prints success or error messages clearly when run via CLI

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

async function tryImportConnectionManager(): Promise<any | null> {
    try {
        const mod: any = await import("../../database/connection_manager");
        return mod?.connectionManager ?? mod?.default ?? mod ?? null;
    } catch {
        return null;
    }
}

async function buildEngineFromManager(cm: any, settings: any): Promise<MaybeEngine | null> {
    if (!cm) return null;
    const candidates = [
        "getEngineFromSettings",
        "createEngineFromSettings",
        "buildEngineFromSettings",
        "fromSettings",
        "getEngine",
        "createEngine",
        "buildEngine",
        "makeEngine",
    ];
    for (const name of candidates) {
        const fn = cm?.[name];
        if (typeof fn === "function") {
            return await fn.call(cm, settings);
        }
    }
    return null;
}

async function buildEngineDirectly(settings: any): Promise<MaybeEngine> {
    const engine = String(settings?.DB_ENGINE ?? "").toLowerCase();
    switch (engine) {
        case "mariadb": {
            const mod: any = await import("../../database/mariadb_engine");
            const MariaDbEngine = mod?.MariaDbEngine ?? mod?.default ?? mod;
            const cfg = {
                engine: "mariadb",
                host: settings.DB_HOST,
                port: Number(settings.DB_PORT ?? 3306),
                user: settings.DB_USER,
                pass: settings.DB_PASS,
                name: settings.DB_NAME,
            };
            return new MariaDbEngine(cfg);
        }
        default:
            throw new Error(`Unsupported DB_ENGINE: ${settings?.DB_ENGINE}`);
    }
}

async function getEngine(settings: any): Promise<MaybeEngine> {
    const cm = await tryImportConnectionManager();
    const fromManager = await buildEngineFromManager(cm, settings);
    if (fromManager) return fromManager;
    return await buildEngineDirectly(settings);
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

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
    let t: NodeJS.Timeout;
    const timeout = new Promise<never>((_, rej) => {
        t = setTimeout(() => rej(new Error(`Database health check timed out after ${ms}ms`)), ms);
    });
    return Promise.race([p, timeout]).finally(() => clearTimeout(t!));
}

// Programmatic API
export async function doctorDatabase(settings: any): Promise<DoctorResult> {
    let engine: MaybeEngine | null = null;
    const engineName = settings?.DB_ENGINE ?? "unknown";

    try {
        engine = await getEngine(settings);
        const res = await withTimeout(tryHealth(engine), 6000);
        return { engine: engineName, ...res };
    } catch (e: any) {
        return { ok: false, engine: engineName, ...pickError(e) };
    } finally {
        try { await engine?.close?.(); } catch {}
    }
}

// CLI entrypoint
export async function runDoctorDatabase(): Promise<void> {
    const mod: any = await import("../../settings/get_settings");
    const getSettings = mod.getSettings ?? mod.default;
    const settings = (await (getSettings as any)({ watch: false })) ?? (await getSettings());

    const res = await doctorDatabase(settings);

    if (res.ok) {
        console.log(`✅ Database (engine=${res.engine ?? settings?.DB_ENGINE ?? "unknown"}) is healthy`);
        process.exit(0);
    } else {
        console.error(`❌ Database failed (engine=${res.engine ?? settings?.DB_ENGINE ?? "unknown"})`);
        if (res.code) console.error(`   code=${res.code}`);
        if (res.detail) console.error(`   detail=${res.detail}`);
        process.exit(1);
    }
}

// Default export for CLI router
export default runDoctorDatabase;
